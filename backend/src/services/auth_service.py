from sqlmodel import Session
from fastapi import HTTPException, status
from backend.src.schema.model import (
    User, RegisterRequest, LoginRequest, TokenResponse, UserPublic
)

from backend.src.repositories.auth_repositories import AuthRepository
from backend.src.core.security import (
    hash_password, verify_password, create_access_token
)
from backend.utils.logger import setup_logger
from uuid import UUID


logger = setup_logger("Auth Service")

class AuthService:
    def __init__(self, session: Session):
        self.repository = AuthRepository(session)
   
    def register(self, req: RegisterRequest) -> TokenResponse:
        logger.info(f"Registering new user with email: {req.email}")

        email = req.email.lower().strip()
        if self.repository.get_by_email(email):
            logger.warning(f"Registration failed: Email {email} already exists")
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered"
            )

        user = User(
            email = email,
            hashed_password = hash_password(req.password),
            full_name = req.full_name,
        )
        user = self.repository.create(user)
        return self._make_token_response(user)
   
    def login(self, req: LoginRequest) -> TokenResponse:
        logger.info(f"User login attempt with email: {req.email}")

        user = self.repository.get_by_email(req.email.lower().strip())
        if not user or not verify_password(req.password, user.hashed_password):
            logger.warning(f"Login failed for email: {req.email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
       
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is inactive"
            )
        return self._make_token_response(user)
       
    def _make_token_response(self, user: User) -> TokenResponse:
        access_token = create_access_token(user.user_id)
        return TokenResponse(
            access_token=access_token,
            user=UserPublic(
                user_id=user.user_id,
                email=user.email,
                full_name=user.full_name,
                role = user.role
            )
        )

    def change_password(
        self, user_id: UUID, current: str, new: str,
    ) -> dict:
        user = self.repository.get_by_id(user_id)
        if not user:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found")


        if not verify_password(current, user.hashed_password):
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                "Current password is incorrect",
            )

        if verify_password(new, user.hashed_password):
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                "New password must be different from current",
            )

        user.hashed_password = hash_password(new)
        self.repository.update(user)
        logger.info(f"Password changed for user {user_id}")
        return {"message": "Password updated successfully"}

