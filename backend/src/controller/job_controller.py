from sqlmodel import Session
from fastapi import Depends
from uuid import UUID


from backend.src.schema.model import JobRequest, JobResponse, User
from backend.db.db import get_session
from backend.src.core.deps import get_current_user
from backend.src.services.job_service import JobService
from backend.utils.logger import setup_logger


logger = setup_logger("Job Controller")



class JobController:


    async def scraping_job_data(
        self,
        job_request: JobRequest,
        session: Session = Depends(get_session),
        current_user: User = Depends(get_current_user),
    ) -> list[JobResponse]:
        logger.info(
            f"[{current_user.email}] Scraping kw={job_request.keywords} "
            f"loc={job_request.location_search}"
        )
        return await JobService(session).scrape_linkedin_job(
            job_data=job_request.model_dump(),
            owner_id=current_user.user_id,
        )


    def list_jobs(
        self,
        session: Session = Depends(get_session),
        current_user: User = Depends(get_current_user),
    ) -> list[JobResponse]:
        logger.info(f"[{current_user.email}] List jobs")
        return JobService(session).list_jobs(owner_id=current_user.user_id)


    def get_job(
        self,
        job_id: UUID,
        session: Session = Depends(get_session),
        current_user: User = Depends(get_current_user),
    ) -> JobResponse:
        from fastapi import HTTPException, status
        job = JobService(session).job_repository.get_job_by_id_and_owner(
            job_id, current_user.user_id,
        )
        if not job:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Job không tồn tại")
        return job

