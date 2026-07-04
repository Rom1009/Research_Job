from sqlmodel import Session
from fastapi import Depends 
import asyncio

from backend.src.schema.model import JobRequest, JobResponse 
from backend.db.db import get_session
from backend.utils.logger import setup_logger
from backend.src.services.job_service import JobService

logger = setup_logger("Job Controller")

class JobController:

    async def scraping_job_data(self, job_request: JobRequest, session: Session = Depends(get_session)) -> list[JobResponse]:
        logger.info(f"Scraping job data for keyword: {job_request.keywords} and location: {job_request.location_search}")

        job_data = job_request.model_dump()
        job_service = JobService(session)

        all_jobs = await job_service.scrape_linkedin_job(job_data)
        return all_jobs
