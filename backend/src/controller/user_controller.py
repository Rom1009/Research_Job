from sqlmodel import Session
from fastapi import Depends, HTTPException, status
from fastapi import UploadFile, File, Form
from backend.src.schema.model import UserRequest, UserResponse, User, CandidateProfile
from backend.db.db import get_session
from backend.utils.logger import setup_logger
from backend.src.services.user_service import UserService
from backend.src.core.deps import get_current_user

logger = setup_logger("User Controller")

class UserController:

    async def upload_cv(
        self,
        cv_file: UploadFile = File(...),
        github_url: str | None = Form(None),
        session: Session = Depends(get_session),
        curent_user: User = Depends(get_current_user),
    ) -> UserResponse:
        logger.info(f"Upload CV: {cv_file.filename}, github={github_url}")
        service = UserService(session)
        return await service.process_user_data(cv_file, github_url, owner_id=curent_user.user_id)


    def process_user_data(self, user_request: UserRequest, session: Session = Depends(get_current_user),current_user: User = Depends(get_current_user)) -> UserResponse:
        if not user_request.github_url or not user_request.cv_url:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cả GitHub URL và CV URL đều là bắt buộc và không được để trống."
            )

        logger.info(f"processing user data for GitHub URL: {user_request.github_url} and CV URL: {user_request.cv_url}")

        user_data = user_request.model_dump()
        user_data["owner_id"] = current_user.user_id            # ← gán owner
        user_service = UserService(session)
        user_response = user_service.process_user_data(user_data)
        return user_response

    def get_all_user_info(self, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)) -> list[CandidateProfile]:
        user_service = UserService(session)
        all_user_info = user_service.get_all_user_info(owner_id=current_user.user_id)  # ← truyền owner_id
        return all_user_info