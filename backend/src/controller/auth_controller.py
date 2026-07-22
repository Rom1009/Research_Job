from fastapi import Depends
from sqlmodel import Session
from backend.db.db import get_session
from backend.src.schema.model import (
    RegisterRequest,
    LoginRequest,
    TokenResponse,
    UserPublic,
)

from backend.src.services.auth_service import AuthService
from backend.src.core.deps import get_current_user
from backend.utils.logger import setup_logger

logger = setup_logger("Auth Controller")


class AuthController:
    def register(
        self,
        payload: RegisterRequest,
        session: Session = Depends(get_session),
    ) -> TokenResponse:
        logger.info(f"Registering new user with email: {payload.email}")
        auth_service = AuthService(session)
        return auth_service.register(payload)

    def login (
        self,
        payload: LoginRequest,
        session: Session = Depends(get_session),
    ) -> TokenResponse:
        logger.info(f"User login attempt with email: {payload.email}")
        auth_service = AuthService(session)
        return auth_service.login(payload)
   
    def me(
        self,
        current_user: Session = Depends(get_current_user),
    ) -> UserPublic:
        logger.info(f"Fetching current user info")
        return UserPublic(
            user_id=current_user.user_id,
            email=current_user.email,
            full_name=current_user.full_name,
            role=current_user.role,
        )