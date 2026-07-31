import json
from sqlmodel import Session
from groq import Groq, BadRequestError
from fastapi import UploadFile
from backend.utils.utils import _sha256_of
from backend.utils.storage import save_uploaded_file
from uuid import UUID

from backend.src.schema.model import SchemaCVResponse, UserResponse, CandidateProfile
from backend.src.repositories.user_repositories import UserRepository
from backend.utils.logger import setup_logger
from backend.utils.config import settings
from backend.src.repositories.score_repositories import ScoreRepository

from backend.ai.github import GitHubService, GitHubAPIError


logger = setup_logger("User Service")


class UserService:
    def __init__(self, session: Session):
        self.client = Groq(
            api_key=settings.GROQ_API_KEY.get_secret_value(),
        )
        self.user_repository = UserRepository(session=session)
        self.score_repository = ScoreRepository(session=session)

    # ─────────────────────────────────────────────────────────────
    #  CV markdown → SchemaCVResponse  (có retry để tránh JSON lỗi)
    # ─────────────────────────────────────────────────────────────
    def _parse_cv(self, markdown_data: str) -> SchemaCVResponse:
        tools = [
            {
                "type": "function",
                "function": {
                    "name": "take_content_from_markdown",
                    "description": "Extract structured information from a CV markdown text",
                    "parameters": SchemaCVResponse.model_json_schema(),
                },
            }
        ]

        system_prompt = (
            "You are a strict CV parser. Extract structured information from "
            "the candidate's CV markdown by CALLING the tool "
            "`take_content_from_markdown` with well-formed arguments.\n\n"
            "CRITICAL: The tool arguments MUST be VALID JSON. Every opened "
            "bracket `[` `{` must be closed. Every string must be properly "
            "quoted. Double-check bracket balance before finalizing.\n\n"
            "PARSING RULES:\n"
            "1. `skills`: flat list of individual skill tokens or short phrases. "
            "   Never merge multiple skills into one string. Never include "
            "   category labels (e.g. 'AI & Generative AI: ...').\n"
            "2. `education`: one object PER school/degree. Each object must "
            "   fully separate its fields:\n"
            "   - institution: full name of the school\n"
            "   - degree: full degree title\n"
            "   - location: city / country\n"
            "   - period: full period (e.g. 'Sep 2020 - Sep 2025')\n"
            "   - coursework: comma-separated list of relevant courses, or null\n"
            "   - gpa: GPA string (e.g. '7.3/10'), or null\n"
            "   Do NOT put dates, GPA, or coursework into institution or degree.\n"
            "3. `work_experience`: one object PER job. Each object must separate:\n"
            "   - company: company name only (no dates, no title)\n"
            "   - title: role title only\n"
            "   - location: city / country\n"
            "   - period: full period (e.g. 'Aug 2024 - Nov 2024')\n"
            "   - achievements: list of concrete bullet-point strings, one bullet "
            "     per string. Do NOT include company/title/period inside achievements.\n"
            "4. `project`: one object PER project. Each object must separate:\n"
            "   - name: project name only\n"
            "   - technologies: list of tools, languages, or frameworks used\n"
            "   - period: period or date range (e.g. 'Jan 2024 - Mar 2024')\n"
            "   - description: list of concrete bullet-point strings describing the project, key features, or outcomes. Do NOT include name or technologies inside description.\n"
            "5. `additional_info`: self-contained one-line facts (awards, "
            "   certifications, side projects, language scores). Combine related "
            "   fragments — e.g. 'IELTS 5.5 (Sep 2024 - Sep 2026)' as ONE item.\n"
            "6. Use plain characters. Never emit HTML entities like `&amp;` — "
            "   use `&` directly.\n"
            "7. Discard fragments shorter than 3 characters or containing no "
            "   letters/digits.\n"
            "8. ALL fields in the schema are required — if truly unknown, use "
            "   null for scalars or empty list [] for arrays."
        )

        user_prompt = (
            "Parse the following CV markdown into the structured schema. "
            "Ensure the tool call arguments are VALID, well-formed JSON with "
            "all brackets balanced.\n\n"
            f"===== CV MARKDOWN =====\n{markdown_data}\n===== END CV ====="
        )

        MAX_ATTEMPTS = 3
        last_err: Exception | None = None

        for attempt in range(MAX_ATTEMPTS):
            try:
                response = self.client.chat.completions.create(
                    model=settings.MODEL_NAME,
                    temperature=0.0 if attempt == 0 else 0.3,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt},
                    ],
                    tools=tools,
                    tool_choice={
                        "type": "function",
                        "function": {"name": "take_content_from_markdown"},
                    },
                )

                tool_calls = response.choices[0].message.tool_calls
                if not tool_calls:
                    raise ValueError("Groq did not return a tool call")


                arguments = tool_calls[0].function.arguments
                return SchemaCVResponse.model_validate(json.loads(arguments))

            except (BadRequestError, ValueError, KeyError, json.JSONDecodeError) as e:
                last_err = e
                logger.warning(
                    f"CV parse attempt {attempt + 1}/{MAX_ATTEMPTS} failed: {e}"
                )


        raise RuntimeError(
            f"Failed to parse CV after {MAX_ATTEMPTS} attempts: {last_err}"
        )

    # ─────────────────────────────────────────────────────────────
    #  Endpoint chính
    # ─────────────────────────────────────────────────────────────
    async def process_user_data(
        self,
        cv_file: UploadFile,
        github_url: str | None,
        owner_id: UUID,
    ) -> UserResponse:
        # 1) Lưu file CV
        save_path = await save_uploaded_file(cv_file, subdir="cv")
        logger.info(f"Uploaded CV saved to: {save_path}")

        # 2) Convert sang markdown
        # ext = save_path.suffix.lower()
        # if ext in {".md", ".txt"}:
        #     markdown_data = save_path.read_text(encoding="utf-8")
        # else:
        #     try:
                
        #         import pymupdf4llm
        #         markdown_data = pymupdf4llm.to_markdown(str(save_path))
    
        #         if not markdown_data.strip():
        #             raise ValueError("Empty PDF text")
        #     except Exception as e:
        #         save_path.unlink(missing_ok=True)
        #         logger.error(f"Error converting CV to markdown: {e}")
        #         raise RuntimeError("Failed to convert CV to markdown")
        try:
            ext = save_path.suffix.lower()
            if ext in {".md", ".txt"}:
                markdown_data = save_path.read_text(encoding="utf-8")
            else:
                import pymupdf4llm
                markdown_data = pymupdf4llm.to_markdown(str(save_path))
                if not markdown_data.strip():
                    raise ValueError("PDF empty or image-only")

        except Exception as e:
            logger.error(f"CV extraction failed: {e}")
            raise RuntimeError(f"Failed to extract CV: {e}")
        finally:
            save_path.unlink(missing_ok=True)   # ⭐ always cleanup
            logger.info(f"Cleaned up temp file: {save_path}")

        # 3) Hash
        cv_hash = _sha256_of(markdown_data)

        # 4) Check profile hiện có của user này
        existing = self.user_repository.find_by_owner(owner_id)

        # 4a. Nếu không có gì đổi → trả về ngay
        if (
            existing
            and existing.cv_hash == cv_hash
            and existing.github_url == github_url
        ):
            logger.info(f"No change for owner {owner_id} — returning existing")
            # save_path.unlink(missing_ok=True)  # Already cleaned up in the extraction step
            return UserResponse(
                candidate_id=existing.candidate_id,
                cv_markdown=existing.cv_markdown,
                github_summary=existing.github_summary,
            )

        # 5) Parse CV — chỉ khi CV đổi hoặc chưa có
        if existing and existing.cv_hash == cv_hash:
            cv_structured_dict = existing.cv_structured
            cv_markdown_to_save = existing.cv_markdown
        else:
            cv_structured = self._parse_cv(markdown_data)
            cv_structured_dict = cv_structured.model_dump()
            cv_markdown_to_save = markdown_data

        # 6) GitHub — chỉ analyze khi github đổi
        if existing and existing.github_url == github_url:
            github_summary = existing.github_summary
        else:
            github_summary = None
            if github_url:
                try:
                    async with GitHubService() as gh:
                        gh_result = await gh.analyze(github_url)
                    github_summary = json.dumps(gh_result, ensure_ascii=False)
                    logger.info(
                        f"GitHub analyzed: @{gh_result['profile']['profile']['login']} — "
                        f"{len(gh_result['profile']['top_repos'])} repos"
                    )
                except (GitHubAPIError, ValueError) as e:
                    logger.warning(f"GitHub analyze failed for {github_url}: {e}")
                    github_summary = json.dumps({"error": str(e)})

        # 7) Build payload DICT
        payload = {
            "owner_id": owner_id,
            "cv_url": None,
            "cv_hash": cv_hash,
            "github_url": github_url,
            "cv_markdown": cv_markdown_to_save,
            "cv_structured": cv_structured_dict,
            "github_summary": github_summary,
        }

        # 8) UPSERT
        if existing:
            # CV đổi thật → clear score cache
            if existing.cv_hash != cv_hash:
                deleted = self.score_repository.delete_by_profile(existing.candidate_id)
                logger.info(f"Cleared {deleted} stale scores")

            # Xoá file CV cũ
            if existing.cv_url and existing.cv_url != str(save_path):
                from pathlib import Path
                Path(existing.cv_url).unlink(missing_ok=True)

            updated = self.user_repository.update_profile(existing.candidate_id, payload)
            logger.info(f"Updated profile {updated.candidate_id}")
            return UserResponse(
                candidate_id=updated.candidate_id,
                cv_markdown=updated.cv_markdown,
                github_summary=updated.github_summary,
            )
        else:
            created = self.user_repository.create_user_profile(payload)
            logger.info(f"Created profile {created.candidate_id}")
            return UserResponse(
                candidate_id=created.candidate_id,
                cv_markdown=created.cv_markdown,
                github_summary=created.github_summary,
            )
    def get_all_user_info(self, owner_id: UUID) -> list[CandidateProfile]:


        profiles = self.user_repository.get_all_users(owner_id)
        return [CandidateProfile.model_validate(p.model_dump()) for p in profiles]
