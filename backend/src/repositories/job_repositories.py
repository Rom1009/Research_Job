from sqlmodel import Session, select

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
    
    def get_job_id(self, job_id):
        logger.info(f"Fetching job profile with ID: {job_id}")
        
        statement = select(LinkedInJobs).where(LinkedInJobs.job_id == job_id)
        result = self.session.exec(statement).first()

        if result:
            logger.info(f"Job profile found: {result}")
        else:
            logger.warning(f"No job profile found with ID: {job_id}")

        return result

    def get_all_jobs(self):
        logger.info("Fetching all job profiles")
        
        statement = select(LinkedInJobs)
        results = self.session.exec(statement).all()

        logger.info(f"Total job profiles found: {len(results)}")
        return results
        