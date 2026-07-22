import json
from sqlmodel import Session
from docling.document_converter import DocumentConverter
from groq import Groq, BadRequestError
import requests
from fastapi import UploadFile
from backend.utils.utils import _sha256_of
from backend.utils.storage import save_uploaded_file
from uuid import UUID

from backend.src.schema.model import SchemaCVResponse, UserResponse, CandidateProfile
from backend.src.repositories.user_repositories import UserRepository
from backend.utils.logger import setup_logger
from backend.utils.config import settings


logger = setup_logger("User Service")


class UserService:
    def __init__(self, session: Session):
        self.client = Groq(
            api_key=settings.GROQ_API_KEY.get_secret_value(),
        )
        self.user_repository = UserRepository(session=session)


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
    async def process_user_data(self, cv_file: UploadFile, github_url: str | None, owner_id: UUID) -> UserResponse:
        save_path = await save_uploaded_file(cv_file, subdir="cv")
        logger.info(f"Uploaded CV saved to: {save_path}")

        ext = save_path.suffix.lower()
        if ext in {".md", ".txt"}:
            markdown_data = save_path.read_text(encoding="utf-8")
        else:
            try:
                # doc = DocumentConverter().convert(str(save_path))
                # markdown_data = doc.document.export_to_markdown()
                with open("/home/thomas/Desktop/AI/Research_Job/docs/data.md", "r", encoding="utf-8") as f:
                    markdown_data = f.read()
            except Exception as e:
                save_path.unlink(missing_ok=True)
                logger.error(f"Error converting CV to markdown: {e}")
                raise RuntimeError("Failed to convert CV to markdown")
           
            cv_hash = _sha256_of(markdown_data)
           
            exsiting = self.user_repository.find_by_hash_and_github(cv_hash, github_url, owner_id)
            if exsiting:
                logger.info(f"Found existing user profile with ID: {exsiting.candidate_id}")
                save_path.unlink(missing_ok=True)  # Delete the uploaded file since it's a duplicate
                return UserResponse(
                    user_id=exsiting.candidate_id,
                    cv_markdown=exsiting.cv_markdown,
                    github_summary=exsiting.github_summary,
                )


            latest = self.user_repository.find_latest_by_github(github_url)
            next_version = (latest.version + 1) if latest else 1

            cv_structured = self._parse_cv(markdown_data)
            github_summary = None
            if github_url:
                try:
                    page = requests.get(github_url, timeout=15)
                    if page.status_code == 200:
                        logger.info(f"Successfully fetched GitHub page for URL: {github_url}")
                        page.encoding = "utf-8"
                        github_summary = page.text
                except requests.RequestException as e:
                    logger.error(f"GitHub fetch error for {github_url}: {e}")
           
        # 7) Lưu DB
        created = self.user_repository.create_user_profile({
            "owner_id": owner_id,
            "cv_url": str(save_path),
            "cv_hash": cv_hash,
            "version": next_version,
            "github_url": github_url,
            "cv_markdown": markdown_data,
            "cv_structured": cv_structured.model_dump(),
            "github_summary": github_summary,
        })
        logger.info(f"Created user {created.candidate_id} (v{next_version})")

        return UserResponse(
            candidate_id=created.candidate_id,
            cv_markdown=created.cv_markdown,
            github_summary=created.github_summary,
        )

    def get_all_user_info(self, owner_id: UUID) -> list[CandidateProfile]:


        profiles = self.user_repository.get_all_users(owner_id)
        return [CandidateProfile.model_validate(p.model_dump()) for p in profiles]
