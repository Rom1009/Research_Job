from uuid import UUID
from fastapi import Depends, Query
from sqlmodel import Session


from backend.db.db import get_session
from backend.src.schema.model import (
    JobAction, JobActionUpdate, JobActionResponse, User,
)
from backend.src.services.job_action_service import JobActionService
from backend.src.core.deps import get_current_user
from backend.utils.logger import setup_logger


logger = setup_logger("JobAction Controller")




class JobActionController:
    def upsert(
        self,
        job_id: UUID,
        payload: JobActionUpdate,
        session: Session = Depends(get_session),
        user: User = Depends(get_current_user),
    ) -> JobActionResponse:
        logger.info(f"[{user.email}] Upsert action for job {job_id}")
        return JobActionService(session).upsert_action(
            user.user_id, job_id, payload,
        )


    def get(
        self,
        job_id: UUID,
        session: Session = Depends(get_session),
        user: User = Depends(get_current_user),
    ) -> JobActionResponse | None:
        return JobActionService(session).get_action(user.user_id, job_id)


    def list(
        self,
        saved_only: bool = Query(False),
        hide_hidden: bool = Query(True),
        session: Session = Depends(get_session),
        user: User = Depends(get_current_user),
    ) -> list[JobActionResponse]:
        return JobActionService(session).list_actions(
            user.user_id, saved_only=saved_only, hide_hidden=hide_hidden,
        )


    def delete(
        self,
        job_id: UUID,
        session: Session = Depends(get_session),
        user: User = Depends(get_current_user),
    ) -> dict:
        return JobActionService(session).delete_action(user.user_id, job_id)

