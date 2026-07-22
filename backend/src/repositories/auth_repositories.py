from typing import Optional
from uuid import UUID
from sqlmodel import Session, select
from backend.src.schema.model import User
from backend.utils.logger import setup_logger

logger = setup_logger("Auth Repository")

class AuthRepository:
    def __init__(self, session: Session):
        self.session = session

    def get_by_email(self, email: str) -> Optional[User]:
        logger.info(f"Fetching user by email: {email}")
        statement = select(User).where(User.email == email.lower())
        return self.session.exec(statement).first()


    def get_by_id(self, user_id: UUID) -> Optional[User]:
        return self.session.get(User, user_id)
   
    def create(self, user: User) -> User:
        logger.info(f"Creating new user with email: {user.email}")
        self.session.add(user)
        self.session.commit()
        self.session.refresh(user)
        logger.info(f"User created with ID: {user.user_id}")
        return user