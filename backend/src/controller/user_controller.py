from sqlmodel import Session
from fastapi import Depends

from backend.src.schema.model import UserRequest, UserResponse
from backend.db.db import get_session
from backend.utils.logger import setup_logger
from backend.src.services.user_service import UserService

logger = setup_logger("User Controller")

class UserController:
    def process_user_data(self, user_request: UserRequest, session: Session = Depends(get_session)) -> UserResponse:
        logger.info(f"processing user data for GitHub URL: {user_request.github_url} and CV URL: {user_request.cv_url}")

        user_data = user_request.model_dump()
        user_service = UserService(session)

        user_response = user_service.process_user_data(user_data)
        return user_response

    def get_user_info(self, user_id):
        pass