from sqlmodel import Session 
from groq import Groq

from backend.src.schema.model import ScoreCV, ScoreResponse
from backend.src.repositories.score_repositories import ScoreRepository
from backend.src.repositories.user_repositories import UserRepository
from backend.src.repositories.job_repositories import JobRepository
from backend.utils.logger import setup_logger
from backend.utils.config import settings

logger = setup_logger("Score Service")

class ScoreService:
    def __init__(self, session: Session):
        self.score_repository = ScoreRepository(session = session)
        self.user_repository = UserRepository(session = session)
        self.job_repository = JobRepository(session = session)
        self.client = Groq(
            api_key = settings.GROQ_API_KEY.get_secret_value(),
        )
    
    def calculate_score(self) -> ScoreResponse:
        all_users = self.user_repository.get_all_users()
        all_jobs = self.job_repository.get_all_jobs()

        print(f"Total users: {len(all_users)}, Total jobs: {len(all_jobs)}")

        return all_jobs