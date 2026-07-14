from sqlmodel import Session
from fastapi import Depends, HTTPException, status

from backend.src.schema.model import UserRequest, UserResponse
from backend.db.db import get_session
from backend.utils.logger import setup_logger
from backend.src.services.user_service import UserService

logger = setup_logger("User Controller")

class UserController:
    def process_user_data(self, user_request: UserRequest, session: Session = Depends(get_session)) -> UserResponse:
        if not user_request.github_url or not user_request.cv_url:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cả GitHub URL và CV URL đều là bắt buộc và không được để trống."
            )

        logger.info(f"processing user data for GitHub URL: {user_request.github_url} and CV URL: {user_request.cv_url}")

        user_data = user_request.model_dump()
        user_service = UserService(session)

        user_response = user_service.process_user_data(user_data)
        return user_response

    def get_user_info(self, user_id):
        pass