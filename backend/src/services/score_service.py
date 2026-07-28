import json
import re
import time
from uuid import UUID
from fastapi import HTTPException, status
from sqlmodel import Session
from groq import Groq, BadRequestError, RateLimitError
from concurrent.futures import ThreadPoolExecutor, as_completed


from backend.src.schema.model import (
    ScoreCV, ScoreResponse, CandidateProfile, User, LinkedInJobs,
)
from backend.src.repositories.score_repositories import ScoreRepository
from backend.src.repositories.user_repositories import UserRepository
from backend.src.repositories.job_repositories import JobRepository
from backend.utils.logger import setup_logger
from backend.utils.config import settings
from backend.src.services.notification_service import NotificationService

logger = setup_logger("Score Service")

class ScoreService:
    def __init__(self, session: Session):
        self.session = session
        self.score_repository = ScoreRepository(session=session)
        self.user_repository = UserRepository(session=session)
        self.job_repository = JobRepository(session=session)
        self.client = Groq(api_key=settings.GROQ_API_KEY.get_secret_value())
        self.notification_service = NotificationService(session=session)
    # ─────────────────────────────────────────────────────────────
    #  Ownership guards
    # ─────────────────────────────────────────────────────────────
    def _assert_owns_profile(
        self, profile_id: UUID, owner_id: UUID,
    ) -> CandidateProfile:
        profile = self.session.get(CandidateProfile, profile_id)
        if not profile:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Profile không tồn tại")
        if profile.owner_id != owner_id:
            raise HTTPException(
                status.HTTP_403_FORBIDDEN, "Không có quyền truy cập profile"
            )
        return profile

    def _assert_owns_job(self, job_id: UUID, owner_id: UUID) -> LinkedInJobs:
        job = self.session.get(LinkedInJobs, job_id)
        if not job:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Job không tồn tại")
        if job.owner_id != owner_id:
            raise HTTPException(
                status.HTTP_403_FORBIDDEN, "Không có quyền truy cập job"
            )
        return job

    # ─────────────────────────────────────────────────────────────
    #  Helpers
    # ─────────────────────────────────────────────────────────────
    def _serialize_match(self, m, job: LinkedInJobs | None = None) -> dict:
        return {
            "match_id": m.match_id,
            "job_id": m.job_id,
            "profile_id": m.profile_id,
            "skill_score": m.skill_score,
            "education_score": m.education_score,
            "work_experience_score": m.work_experience_score,
            "project_score": m.project_score,
            "total_score": m.total_score,
            "ai_analysis_details": m.ai_analysis_details,
            "job_title": job.title if job else None,
            "job_company": job.company if job else None,
            "job_location": job.location if job else None,
            "job_url": job.job_url if job else None,   # ← THÊM
        }

    def _sleep_from_rate_limit_error(self, err: RateLimitError) -> float:
        """Đọc thời gian chờ Groq báo trong message; fallback 10s."""
        m = re.search(r"try again in ([\d.]+)s", str(err))
        return float(m.group(1)) + 0.5 if m else 10.0

    # ─────────────────────────────────────────────────────────────
    #  Score 1 (candidate, job) via LLM
    # ─────────────────────────────────────────────────────────────
    def _score_one(
        self, profile: CandidateProfile, job: LinkedInJobs, tools: list,
    ) -> ScoreCV:
        cv = profile.cv_structured or {}
        work_experience = json.dumps(
            cv.get("work_experience", []), ensure_ascii=False, indent=2
        )
        skills = json.dumps(cv.get("skills", []), ensure_ascii=False)
        education = json.dumps(
            cv.get("education", []), ensure_ascii=False, indent=2
        )

        # Truncate để giảm token/request → tránh 429
        github_summary = (profile.github_summary or "")[:6000]
        jd = (job.description or "")[:4000]

        system_prompt = (
            "You are a friendly and encouraging Career Coach. Your task is to help "
            "the candidate understand how they match a job in a WARM and MOTIVATING "
            "tone, by CALLING the tool `score_cv` with well-reasoned arguments.\n\n"


            "TONE & VOICE:\n"
            "- Address the candidate as 'you' — direct and personal.\n"
            "- Frame feedback as growth opportunities, not deficiencies.\n"
            "- Be specific and encouraging, never generic.\n\n"


            "CONTENT RULES:\n"
            "1. `evaluation_summary`: 2-3 sentences starting with what's exciting "
            "   about this match. Example: 'You'd shine at this role because your "
            "   PyTorch expertise directly matches their AI stack, and your "
            "   Speech-to-IPA project shows exactly the kind of applied research "
            "   they need.'\n"
            "2. `matched_skills`: list every CV skill that appears in the JD, "
            "   framed as strengths. Minimum 3 items.\n"
            "3. `gap_analysis`: 2-3 GROWTH OPPORTUNITIES. Example: 'Add Kubernetes "
            "   to your toolkit — they use it heavily' NOT 'Missing Kubernetes'.\n"
            "4. `actionable_advice`: 3+ concrete next steps this week — specific "
            "   courses, side projects, or experiments. Achievable and encouraging.\n"
            "5. `project_impact`: 2+ items highlighting real outcomes from CV projects.\n"
            "6. `technical_complexity`: 2+ items on architectural sophistication.\n\n"


            "SCORING RUBRIC (integer 0-100, be strict but fair):\n"
            "- skill_score: % of required JD keywords found in CV.\n"
            "- education_score: degree/major relevance + certifications.\n"
            "- work_experience_score: years + title progression + domain fit.\n"
            "- project_score: README depth, architecture, problem-solving evidence.\n\n"


            "GROUND RULES:\n"
            "- Every claim must be based on the provided text — do NOT hallucinate skills.\n"
            "- NEVER return empty lists for any field.\n"
            "- Keep JSON well-formed: all brackets balanced, strings properly quoted."
        )

        user_prompt = f"""
        Please evaluate how well the candidate's CV and their practical projects match the Job Description below.

        📝 [CANDIDATE CV - work experience]
        {work_experience}

        📝 [CANDIDATE CV - skills]
        {skills}

        📝 [CANDIDATE CV - education]
        {education}

        💻 [PRACTICAL PROJECT EVIDENCE (README)]
        {github_summary}

        🎯 [JOB DESCRIPTION (JD)]
        {jd}

        Now call the `score_cv` tool. Every list field must have the minimum items specified. Never return empty lists.
        """.strip()


        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ]


        MIN_ITEMS = {
            "matched_skills": 3,
            "gap_analysis": 2,
            "actionable_advice": 3,
            "project_impact": 2,
            "technical_complexity": 2,
        }

        MAX_ATTEMPTS = 3
        last_err: Exception | None = None
        attempt = 0

        while attempt < MAX_ATTEMPTS:
            try:
                response = self.client.chat.completions.create(
                    model=settings.MODEL_NAME,
                    temperature=0.0 if attempt == 0 else 0.4,
                    messages=messages,
                    tools=tools,
                    tool_choice={
                        "type": "function",
                        "function": {"name": "score_cv"},
                    },
                )


                tool_calls = response.choices[0].message.tool_calls
                if not tool_calls:
                    raise ValueError("Groq did not return a tool call")


                arguments = tool_calls[0].function.arguments
                content_score = ScoreCV.model_validate(json.loads(arguments))


                missing = [
                    name for name, need in MIN_ITEMS.items()
                    if len(getattr(content_score, name) or []) < need
                ]
                if missing and attempt < MAX_ATTEMPTS - 1:
                    logger.warning(
                        f"Attempt {attempt+1} for job_id={job.job_id} "
                        f"has thin fields: {missing}, retrying..."
                    )
                    messages.append({
                        "role": "user",
                        "content": (
                            f"Your previous tool call had too few items in: {missing}. "
                            f"Please call `score_cv` AGAIN. Ensure: "
                            + "; ".join(
                                f"`{k}` has at least {v} items"
                                for k, v in MIN_ITEMS.items() if k in missing
                            )
                            + ". Do NOT return empty lists."
                        ),
                    })
                    attempt += 1
                    continue

                return content_score

            except RateLimitError as e:
                wait = self._sleep_from_rate_limit_error(e)
                logger.warning(
                    f"Rate limit hit for job_id={job.job_id}, sleeping {wait:.1f}s..."
                )
                time.sleep(wait)
                # KHÔNG tăng attempt — retry lại lần này

            except (BadRequestError, ValueError, KeyError, json.JSONDecodeError) as e:
                last_err = e
                logger.warning(
                    f"Score attempt {attempt+1}/{MAX_ATTEMPTS} "
                    f"failed for job_id={job.job_id}: {e}"
                )
                attempt += 1

        raise RuntimeError(
            f"Failed to score job_id={job.job_id} "
            f"after {MAX_ATTEMPTS} attempts: {last_err}"
        )


    # ─────────────────────────────────────────────────────────────
    #  Public API — mọi hàm đều yêu cầu owner_id
    # ─────────────────────────────────────────────────────────────
    def calculate_score(
        self, profile_id: UUID, owner_id: UUID,
        *, force_rescore: bool = False, max_workers: int = 5,
    ) -> list[dict]:
        logger.info(
            f"[owner={owner_id}] Calculating scores for profile_id={profile_id}"
        )


        # 1. Verify profile
        profile = self._assert_owns_profile(profile_id, owner_id)


        # 2. Load jobs
        all_jobs = self.job_repository.get_all_jobs_by_owner(owner_id)
        if not all_jobs:
            raise HTTPException(
                status.HTTP_404_NOT_FOUND,
                "Chưa có job nào để chấm. Hãy scrape trước.",
            )
        logger.info(f"Total jobs: {len(all_jobs)}")


        tools = [{
            "type": "function",
            "function": {
                "name": "score_cv",
                "description": "Score a candidate's CV against a Job Description",
                "parameters": ScoreCV.model_json_schema(),
            },
        }]


        # ─── 3. Cache lookup: phân loại ───
        cached_matches: list[dict] = []
        to_score: list[LinkedInJobs] = []


        if force_rescore:
            to_score = list(all_jobs)
        else:
            for job in all_jobs:
                existing = self.score_repository.find_by_profile_and_job(
                    profile.candidate_id, job.job_id,
                )
                if existing:
                    cached_matches.append(self._serialize_match(existing, job))
                else:
                    to_score.append(job)


        logger.info(
            f"Cache hit: {len(cached_matches)} · To score: {len(to_score)}"
        )


        if not to_score:
            return cached_matches


        # ─── 4. GIAI ĐOẠN 1: gọi LLM song song (KHÔNG DB) ───
        def _score_only(job: LinkedInJobs) -> tuple[LinkedInJobs, ScoreCV] | None:
            try:
                cs = self._score_one(profile, job, tools)
                return job, cs
            except RuntimeError as e:
                logger.error(str(e))
                return None


        scored_pairs: list[tuple[LinkedInJobs, ScoreCV]] = []
        with ThreadPoolExecutor(max_workers=max_workers) as ex:
            futures = [ex.submit(_score_only, j) for j in to_score]
            for f in as_completed(futures):
                r = f.result()
                if r is not None:
                    scored_pairs.append(r)


        # ─── 5. GIAI ĐOẠN 2: persist tuần tự trên main thread ───
        new_matches: list[dict] = []
        for job, cs in scored_pairs:
            total_score = (
                cs.skill_score * 0.4
                + cs.education_score * 0.15
                + cs.work_experience_score * 0.05
                + cs.project_score * 0.4
            )
            match = self.score_repository.create_match_result({
                "profile_id": profile.candidate_id,
                "job_id": job.job_id,
                "skill_score": cs.skill_score,
                "education_score": cs.education_score,
                "work_experience_score": cs.work_experience_score,
                "project_score": cs.project_score,
                "total_score": total_score,
                "ai_analysis_details": {
                    "matched_skills": cs.matched_skills,
                    "gap_analysis": cs.gap_analysis,
                    "actionable_advice": cs.actionable_advice,
                    "evaluation_summary": cs.evaluation_summary,
                    "project_impact": cs.project_impact,
                    "technical_complexity": cs.technical_complexity,
                },
            })
            new_matches.append(self._serialize_match(match, job))

        all_matches = cached_matches + new_matches
        if all_matches:
            top = max(all_matches, key=lambda m: m.get("total_score") or 0)
            top_score = top.get("total_score") or 0
            try:
                self.notification_service.create(
                    user_id=owner_id,
                    title=f"Scored {len(all_matches)} jobs",
                    description=(
                        f"Top match: {top.get('job_title', 'Unknown')} — "
                        f"{round(top_score)}%"
                    ),
                    link="/dashboard/ai-analysis",
                )
            except Exception as e:
                logger.warning(f"Failed to create notification: {e}")

        return all_matches

    def score_one_pair(
        self, profile_id: UUID, job_id: UUID, owner_id: UUID,
    ) -> dict:
        """Chấm điểm 1 (profile, job) cụ thể — dùng cho tool của AI Agent."""
        profile = self._assert_owns_profile(profile_id, owner_id)
        job = self._assert_owns_job(job_id, owner_id)

        tools = [{
            "type": "function",
            "function": {
                "name": "score_cv",
                "description": "Score a candidate's CV against a Job Description",
                "parameters": ScoreCV.model_json_schema(),
            },
        }]

        content_score = self._score_one(profile, job, tools)

        total_score = (
            content_score.skill_score * 0.4
            + content_score.education_score * 0.15
            + content_score.work_experience_score * 0.05
            + content_score.project_score * 0.4
        )

        match = self.score_repository.create_match_result({
            "profile_id": profile.candidate_id,
            "job_id": job.job_id,
            "skill_score": content_score.skill_score,
            "education_score": content_score.education_score,
            "work_experience_score": content_score.work_experience_score,
            "project_score": content_score.project_score,
            "total_score": total_score,
            "ai_analysis_details": {
                "matched_skills": content_score.matched_skills,
                "gap_analysis": content_score.gap_analysis,
                "actionable_advice": content_score.actionable_advice,
                "evaluation_summary": content_score.evaluation_summary,
                "project_impact": content_score.project_impact,
                "technical_complexity": content_score.technical_complexity,
            },
        })
        return self._serialize_match(match, job)


    def list_scores(self, owner_id: UUID) -> list[dict]:
        """List toàn bộ match của recruiter — 1 query có JOIN."""
        rows = self.score_repository.get_scores_with_jobs_by_owner(owner_id)
        return [self._serialize_match(m, job) for m, job in rows]


    def get_scores_by_profile(
        self, profile_id: UUID, owner_id: UUID,
    ) -> list[dict]:
        self._assert_owns_profile(profile_id, owner_id)
        matches = self.score_repository.get_scores_by_profile(profile_id, owner_id)

        # Batch-load jobs 1 lần để tránh N+1
        job_map = {
            j.job_id: j
            for j in self.job_repository.get_all_jobs_by_owner(owner_id)
        }
        return [self._serialize_match(m, job_map.get(m.job_id)) for m in matches]