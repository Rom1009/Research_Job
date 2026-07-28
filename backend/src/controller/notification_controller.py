from uuid import UUID
from fastapi import Depends, Query
from sqlmodel import Session


from backend.db.db import get_session
from backend.src.schema.model import NotificationResponse, User
from backend.src.services.notification_service import NotificationService
from backend.src.core.deps import get_current_user
from backend.utils.logger import setup_logger


logger = setup_logger("Notification Controller")




class NotificationController:
    def list(
        self,
        limit: int = Query(50, ge=1, le=100),
        unread_only: bool = Query(False),
        session: Session = Depends(get_session),
        user: User = Depends(get_current_user),
    ) -> list[NotificationResponse]:
        return NotificationService(session).list_for_user(
            user.user_id, limit=limit, unread_only=unread_only,
        )


    def count_unread(
        self,
        session: Session = Depends(get_session),
        user: User = Depends(get_current_user),
    ) -> dict:
        count = NotificationService(session).count_unread(user.user_id)
        return {"unread": count}


    def mark_read(
        self,
        notification_id: UUID,
        session: Session = Depends(get_session),
        user: User = Depends(get_current_user),
    ) -> NotificationResponse:
        return NotificationService(session).mark_read(
            notification_id, user.user_id,
        )


    def mark_all_read(
        self,
        session: Session = Depends(get_session),
        user: User = Depends(get_current_user),
    ) -> dict:
        return NotificationService(session).mark_all_read(user.user_id)


    def delete(
        self,
        notification_id: UUID,
        session: Session = Depends(get_session),
        user: User = Depends(get_current_user),
    ) -> dict:
        return NotificationService(session).delete(
            notification_id, user.user_id,
        )

