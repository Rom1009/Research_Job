from typing import Optional




from sqlmodel import UUID, Session, select




from backend.src.schema.model import UserProfile
from backend.utils.logger import setup_logger




logger = setup_logger("User Repository")




class UserRepository:




    def __init__(self, session: Session):
        self.session = session




    def create_user_profile(self, user_data):
        logger.info(f"Creating user profile with data: {user_data}")




        new_user = UserProfile(**user_data)
        self.session.add(new_user)
        self.session.commit()
        self.session.refresh(new_user)




        logger.info(f"User profile created with ID: {new_user.user_id}")
        return new_user




    def get_user_id(self, user_id: UUID) -> Optional[UserProfile]:
        statement = select(UserProfile).where(UserProfile.user_id == user_id)
        return self.session.exec(statement).first()




    def get_all_users(self):
        logger.info("Fetching all user profiles")
       
        statement = select(UserProfile)
        results = self.session.exec(statement).all()




        logger.info(f"Total user profiles found: {len(results)}")
        return results


    def find_by_hash_and_github(self, cv_hash: str, github_url: str | None):
        statement = select(UserProfile).where(
            UserProfile.cv_hash == cv_hash,
        )
        if github_url:
            statement = statement.where(UserProfile.github_url == github_url)
        return self.session.exec(statement).first()


    def find_latest_by_github(self, github_url: str | None):
        if not github_url:
            return None
        statement = (
            select(UserProfile)
            .where(UserProfile.github_url == github_url)
            .order_by(UserProfile.version.desc())
        )


        return self.session.exec(statement).first()