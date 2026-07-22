from sqlmodel import Session, select
from uuid import UUID
from backend.src.schema.model import LinkedInJobs
from backend.utils.logger import setup_logger

logger = setup_logger("Job Repository")

class JobRepository:
    def __init__(self, session: Session):
        self.session = session

    def create_job_profile(self, job_data):
        logger.info(f"Creating job profile with data: {job_data}")

        new_job = LinkedInJobs(**job_data)
        self.session.add(new_job)
        self.session.commit()
        self.session.refresh(new_job)
        return new_job
   
    def get_by_url_and_owner(self, job_url: str, owner_id: UUID):
        """Dedupe theo (owner, url) — tránh scrape trùng."""
        stmt = select(LinkedInJobs).where(
            LinkedInJobs.job_url == job_url,
            LinkedInJobs.owner_id == owner_id,
        )
        return self.session.exec(stmt).first()

    def get_all_jobs_by_owner(self, owner_id: UUID) -> list[LinkedInJobs]:
        stmt = (
            select(LinkedInJobs)
            .where(LinkedInJobs.owner_id == owner_id)
            .order_by(LinkedInJobs.created_at.desc())
        )
        return self.session.exec(stmt).all()

    def get_job_by_id_and_owner(self, job_id: UUID, owner_id: UUID):
        stmt = select(LinkedInJobs).where(
            LinkedInJobs.job_id == job_id,
            LinkedInJobs.owner_id == owner_id,
        )
        return self.session.exec(stmt).first()