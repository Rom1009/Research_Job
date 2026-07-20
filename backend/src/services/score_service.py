import json
import re
import time
from uuid import UUID


from sqlmodel import Session
from groq import Groq, BadRequestError, RateLimitError


from backend.src.schema.model import ScoreCV, ScoreResponse
from backend.src.repositories.score_repositories import ScoreRepository
from backend.src.repositories.user_repositories import UserRepository
from backend.src.repositories.job_repositories import JobRepository
from backend.utils.logger import setup_logger
from backend.utils.config import settings


logger = setup_logger("Score Service")




class ScoreService:
    def __init__(self, session: Session):
        self.score_repository = ScoreRepository(session=session)
        self.user_repository = UserRepository(session=session)
        self.job_repository = JobRepository(session=session)
        self.client = Groq(
            api_key=settings.GROQ_API_KEY.get_secret_value(),
        )


    # ─────────────────────────────────────────────────────────────
    #  Helpers
    # ─────────────────────────────────────────────────────────────
    def _serialize_match(self, m, job=None) -> dict:
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
        }


    def _sleep_from_rate_limit_error(self, err: RateLimitError) -> float:
        """Đọc thời gian chờ Groq báo trong message; fallback 10s."""
        m = re.search(r"try again in ([\d.]+)s", str(err))
        return float(m.group(1)) + 0.5 if m else 10.0


    # ─────────────────────────────────────────────────────────────
    #  Score 1 (user, job)
    # ─────────────────────────────────────────────────────────────
    def _score_one(self, user, job, tools) -> ScoreCV:
        cv = user.cv_structured or {}
        work_experience = json.dumps(cv.get("work_experience", []), ensure_ascii=False, indent=2)
        skills = json.dumps(cv.get("skills", []), ensure_ascii=False)
        education = json.dumps(cv.get("education", []), ensure_ascii=False, indent=2)


        # Truncate để giảm token/request → tránh 429
        github_summary = (user.github_summary or "")[:6000]
        jd = (job.description or "")[:4000]


        system_prompt = (
            "You are a strict and objective Technical Recruiter expert. "
            "Your task is to match a candidate's CV against a Job Description (JD) "
            "by CALLING the tool `score_cv` with well-reasoned arguments.\n\n"
            "GENERAL RULES:\n"
            "1. Every judgment in `gap_analysis` and `matched_skills` must be based "
            "   strictly on the provided text. Do not hallucinate skills.\n"
            "2. `evaluation_summary`: a professional, holistic critique from a "
            "   recruiter's perspective (2-4 sentences). Never empty.\n"
            "3. Scoring rubric (integer 0-100):\n"
            "   - skill_score: % of mandatory technical keywords in the JD present in the CV.\n"
            "   - education_score: relevance of degree, major, and certifications.\n"
            "   - work_experience_score: years of relevant exp, titles, career progression.\n"
            "   - project_score: README complexity, architectural decisions, problem-solving.\n\n"
            "MANDATORY CONTENT RULES (do NOT return empty lists for these):\n"
            "4. `matched_skills`: list every skill in the CV that appears in the JD. "
            "   Minimum 3 items.\n"
            "5. `gap_analysis`: ALWAYS list at least 2-3 specific gaps.\n"
            "6. `actionable_advice`: ALWAYS at least 3 concrete recommendations. NEVER empty.\n"
            "7. `project_impact`: at least 2 items.\n"
            "8. `technical_complexity`: at least 2 items."
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
                        f"Attempt {attempt+1} for job_id={job.job_id} has thin fields: {missing}, retrying..."
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
                    f"Score attempt {attempt+1}/{MAX_ATTEMPTS} failed for job_id={job.job_id}: {e}"
                )
                attempt += 1


        raise RuntimeError(
            f"Failed to score job_id={job.job_id} after {MAX_ATTEMPTS} attempts: {last_err}"
        )


    # ─────────────────────────────────────────────────────────────
    #  Public
    # ─────────────────────────────────────────────────────────────
    def calculate_score(self, profile_id: UUID) -> list[dict]:
        logger.info(f"Calculating scores for profile_id={profile_id}")


        user = self.user_repository.get_user_id(profile_id)
        if not user:
            raise ValueError(f"Profile {profile_id} not found")


        all_jobs = self.job_repository.get_all_jobs()
        logger.info(f"Total jobs to score: {len(all_jobs)}")


        tools = [
            {
                "type": "function",
                "function": {
                    "name": "score_cv",
                    "description": "Score a candidate's CV against a Job Description",
                    "parameters": ScoreCV.model_json_schema(),
                },
            }
        ]


        all_match = []
        for idx, job in enumerate(all_jobs):
            try:
                content_score = self._score_one(user, job, tools)
            except RuntimeError as e:
                logger.error(str(e))
                continue


            total_score = (
                content_score.skill_score * 0.4
                + content_score.education_score * 0.15
                + content_score.work_experience_score * 0.05
                + content_score.project_score * 0.4
            )


            match_content = {
                "profile_id": user.user_id,
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
            }


            match_results = self.score_repository.create_match_result(match_content)
            all_match.append(self._serialize_match(match_results, job))


            # Throttle nhẹ giữa các job để không burst quá TPM
            if idx < len(all_jobs) - 1:
                time.sleep(3)


        return all_match


    def list_scores(self):
        scores = self.score_repository.get_all_scores()
        jobs_by_id = {j.job_id: j for j in self.job_repository.get_all_jobs()}
        return [self._serialize_match(s, jobs_by_id.get(s.job_id)) for s in scores]


    def get_scores_by_profile(self, profile_id):
        scores = self.score_repository.get_scores_by_profile(profile_id)
        jobs_by_id = {j.job_id: j for j in self.job_repository.get_all_jobs()}
        return [self._serialize_match(s, jobs_by_id.get(s.job_id)) for s in scores]



