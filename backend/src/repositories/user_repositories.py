from typing import Optional
from sqlmodel import UUID, Session, select
from backend.src.schema.model import CandidateProfile
from backend.utils.logger import setup_logger
logger = setup_logger("User Repository")

class UserRepository:
    def __init__(self, session: Session):
        self.session = session

    def create_user_profile(self, user_data):
        logger.info(f"Creating user profile with data: {user_data}")

        new_user = CandidateProfile(**user_data)
        self.session.add(new_user)
        self.session.commit()
        self.session.refresh(new_user)

        logger.info(f"User profile created with ID: {new_user.candidate_id}")
        return new_user

    def get_user_id(self, user_id: UUID) -> Optional[CandidateProfile]:
        statement = select(CandidateProfile).where(CandidateProfile.candidate_id == user_id)
        return self.session.exec(statement).first()

    def get_all_users(self, owner_id: UUID):
        logger.info("Fetching all user profiles")
       
        statement = select(CandidateProfile).where(CandidateProfile.owner_id == owner_id)
        results = self.session.exec(statement).all()

        logger.info(f"Total user profiles found: {len(results)}")
        return results

    def find_by_hash_and_github(self, cv_hash: str, github_url: str | None, owner_id: UUID):
        statement = select(CandidateProfile).where(
            CandidateProfile.cv_hash == cv_hash,
            CandidateProfile.owner_id == owner_id
        )
        if github_url:
            statement = statement.where(CandidateProfile.github_url == github_url)
        return self.session.exec(statement).first()


    def find_latest_by_github(self, github_url: str | None):
        if not github_url:
            return None
        statement = (
            select(CandidateProfile)
            .where(CandidateProfile.github_url == github_url)
            .order_by(CandidateProfile.version.desc())
        )
        return self.session.exec(statement).first()