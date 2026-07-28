from typing import Optional
from uuid import UUID
from datetime import datetime
from sqlmodel import Session, select

from backend.src.schema.model import JobAction
from backend.utils.logger import setup_logger
from sqlmodel import delete as sql_delete

logger = setup_logger("JobAction Repository")

class JobActionRepository:
    def __init__(self, session: Session):
        self.session = session

    def find_by_user_and_job(
        self, user_id: UUID, job_id: UUID,
    ) -> Optional[JobAction]:
        stmt = select(JobAction).where(
            JobAction.user_id == user_id,
            JobAction.job_id == job_id,
        )
        return self.session.exec(stmt).first()

    def list_by_user(
        self, user_id: UUID, saved_only: bool = False, hide_hidden: bool = True,
    ) -> list[JobAction]:
        stmt = select(JobAction).where(JobAction.user_id == user_id)
        if saved_only:
            stmt = stmt.where(JobAction.saved == True)  # noqa
        if hide_hidden:
            stmt = stmt.where(JobAction.hidden == False)  # noqa
        return list(self.session.exec(stmt).all())

    def upsert(
        self, user_id: UUID, job_id: UUID, patch: dict,
    ) -> JobAction:
        action = self.find_by_user_and_job(user_id, job_id)

        if not action:
            action = JobAction(user_id=user_id, job_id=job_id)
            logger.info(f"Creating new action for user={user_id}, job={job_id}")

        for k, v in patch.items():
            if k in {"saved", "hidden", "apply_status", "notes"}:
                setattr(action, k, v)

        action.updated_at = datetime.utcnow()
        self.session.add(action)
        self.session.commit()
        self.session.refresh(action)
        return action

    def delete(self, user_id: UUID, job_id: UUID) -> bool:
        action = self.find_by_user_and_job(user_id, job_id)
        if not action:
            return False
        self.session.delete(action)
        self.session.commit()
        return True

    def delete_by_job_ids(self, job_ids: list[UUID]) -> int:
        stmt = sql_delete(JobAction).where(JobAction.job_id.in_(job_ids))
        result = self.session.exec(stmt)
        self.session.commit()
        return result.rowcount or 0
