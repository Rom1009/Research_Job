import json 
from sqlmodel import Session
from docling.document_converter import DocumentConverter
from groq import Groq
import requests

from backend.src.schema.model import SchemaCVResponse, UserResponse
from backend.src.repositories.user_repositories import UserRepository
from backend.utils.logger import setup_logger
from backend.utils.config import settings

logger = setup_logger("User Service")

class UserService:
    def __init__(self, session: Session):
        self.client = Groq(
            api_key = settings.GROQ_API_KEY.get_secret_value(),
        )
        self.user_repository = UserRepository(session = session)

    def process_user_data(self, user_data) -> UserResponse:
        logger.info(f"Processing user data: {user_data}")

        if self.user_repository.get_user_id(user_data.get("user_id")):
            logger.info(f"User profile already exists for user_id: {user_data.get('user_id')}")

        cv_url = user_data.get("cv_url")
        github_url = user_data.get("github_url")

        converter = DocumentConverter()
        doc = converter.convert("/home/thomas/Desktop/AI/Research_Job/docs/data.pdf")

        markdown_data = doc.document.export_to_markdown()
        # with open("/home/thomas/Desktop/AI/Research_Job/docs/data.pdf", "r", encoding = "utf-8") as f:
        #     markdown_data = f.read()

        response = self.client.chat.completions.create(
            model = settings.MODEL_NAME,
            messages = [
                {
                "role": "system",
                "content": "You are a CV checker expert. Validate the CV carefully and syntax validation and metadata."
                },
                {
                    "role": "user",
                    "content": f"Base on the {markdown_data}. Extract the skills, educations, work_experience, additional_info and validate syntax of format"
                }
            ],
            response_format = {
                "type": "json_schema",
                "json_schema": {
                    "name": "SchemaCVResponse",
                    "schema": SchemaCVResponse.model_json_schema()
                }
            }
        )

        cv_structured = SchemaCVResponse.model_validate(json.loads(response.choices[0].message.content))

        page = requests.get(github_url)
        if page.status_code == 200:
            logger.info(f"Successfully fetched GitHub page for URL: {github_url}")
            page.encoding = 'utf-8'

            github_summary = page.text

        else:
            logger.error(f"Failed to fetch GitHub page for URL: {github_url}. Status code: {page.status_code}")
            github_summary = None

        user_profile_data = {
            "cv_url": cv_url,
            "github_url": github_url,
            "cv_markdown": markdown_data,
            "cv_structured": cv_structured.model_dump(),
            "github_summary": github_summary
        }


        created_profile = self.user_repository.create_user_profile(user_profile_data)

        return UserResponse(
            user_id = created_profile.user_id,
            cv_markdown = created_profile.cv_markdown,
            github_summary = created_profile.github_summary
        )

    def get_all_user(self):
        all_user = self.user_repository.get_all_users()

        return all_user
