from uuid import UUID
from fastapi import HTTPException, status
from sqlmodel import Session


from backend.src.repositories.job_action_repositories import JobActionRepository
from backend.src.repositories.job_repositories import JobRepository
from backend.src.schema.model import JobAction, JobActionUpdate
from backend.utils.logger import setup_logger

logger = setup_logger("JobAction Service")

VALID_STATUSES = {
    "not_applied", "applied", "interviewed", "offered", "rejected",
}

class JobActionService:
    def __init__(self, session: Session):
        self.session = session
        self.repo = JobActionRepository(session=session)
        self.job_repo = JobRepository(session=session)


    def _assert_owns_job(self, job_id: UUID, user_id: UUID) -> None:
        """Đảm bảo job thuộc về user (owner_id) trước khi action."""
        job = self.job_repo.get_job_by_id_and_owner(job_id, user_id)
        if not job:
            raise HTTPException(
                status.HTTP_404_NOT_FOUND,
                "Job không tồn tại hoặc không có quyền truy cập",
            )


    def upsert_action(
        self, user_id: UUID, job_id: UUID, payload: JobActionUpdate,
    ) -> JobAction:
        self._assert_owns_job(job_id, user_id)


        patch = payload.model_dump(exclude_unset=True)


        # Validate apply_status
        if "apply_status" in patch and patch["apply_status"] not in VALID_STATUSES:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                f"Invalid apply_status. Must be one of {VALID_STATUSES}",
            )


        if not patch:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                "No fields to update",
            )


        logger.info(f"[user={user_id}] Upsert action for job={job_id}: {patch}")
        return self.repo.upsert(user_id, job_id, patch)


    def get_action(self, user_id: UUID, job_id: UUID) -> JobAction | None:
        return self.repo.find_by_user_and_job(user_id, job_id)


    def list_actions(
        self, user_id: UUID, saved_only: bool = False, hide_hidden: bool = True,
    ) -> list[JobAction]:
        return self.repo.list_by_user(user_id, saved_only, hide_hidden)


    def delete_action(self, user_id: UUID, job_id: UUID) -> dict:
        self._assert_owns_job(job_id, user_id)
        deleted = self.repo.delete(user_id, job_id)
        return {"deleted": deleted}