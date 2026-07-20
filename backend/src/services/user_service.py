import json
from sqlmodel import Session
from docling.document_converter import DocumentConverter
from groq import Groq, BadRequestError
import requests


from backend.src.schema.model import SchemaCVResponse, UserResponse
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
            "4. `additional_info`: self-contained one-line facts (awards, "
            "   certifications, side projects, language scores). Combine related "
            "   fragments — e.g. 'IELTS 5.5 (Sep 2024 - Sep 2026)' as ONE item.\n"
            "5. Use plain characters. Never emit HTML entities like `&amp;` — "
            "   use `&` directly.\n"
            "6. Discard fragments shorter than 3 characters or containing no "
            "   letters/digits.\n"
            "7. ALL fields in the schema are required — if truly unknown, use "
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
    def process_user_data(self, user_data) -> UserResponse:
        logger.info(f"Processing user data: {user_data}")


        if self.user_repository.get_user_id(user_data.get("user_id")):
            logger.info(
                f"User profile already exists for user_id: {user_data.get('user_id')}"
            )


        cv_url = user_data.get("cv_url")
        github_url = user_data.get("github_url")


        # converter = DocumentConverter()
        # doc = converter.convert("/home/thomas/Desktop/AI/Research_Job/docs/data.pdf")
        # markdown_data = doc.document.export_to_markdown()
        with open("docs/data.md", "r", encoding="utf-8") as f:
            markdown_data = f.read()


        # Parse CV với retry
        cv_structured = self._parse_cv(markdown_data)


        # Fetch GitHub page
        github_summary = None
        if github_url:
            try:
                page = requests.get(github_url, timeout=15)
                if page.status_code == 200:
                    logger.info(f"Successfully fetched GitHub page for URL: {github_url}")
                    page.encoding = "utf-8"
                    github_summary = page.text
                else:
                    logger.error(
                        f"Failed to fetch GitHub page for URL: {github_url}. "
                        f"Status code: {page.status_code}"
                    )
            except requests.RequestException as e:
                logger.error(f"GitHub fetch error for {github_url}: {e}")


        user_profile_data = {
            "cv_url": cv_url,
            "github_url": github_url,
            "cv_markdown": markdown_data,
            "cv_structured": cv_structured.model_dump(),
            "github_summary": github_summary,
        }


        created_profile = self.user_repository.create_user_profile(user_profile_data)


        return UserResponse(
            user_id=created_profile.user_id,
            cv_markdown=created_profile.cv_markdown,
            github_summary=created_profile.github_summary,
        )


    def get_all_user_info(self):
        return self.user_repository.get_all_users()



