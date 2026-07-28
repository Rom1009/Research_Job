from uuid import UUID
from fastapi import HTTPException, status
from sqlmodel import Session

from backend.src.repositories.notification_repositories import (
    NotificationRepository,
)
from backend.src.schema.model import Notification
from backend.utils.logger import setup_logger

logger = setup_logger("Notification Service")

class NotificationService:
    def __init__(self, session: Session):
        self.session = session
        self.repo = NotificationRepository(session=session)


    def create(
        self,
        user_id: UUID,
        title: str,
        description: str | None = None,
        link: str | None = None,
    ) -> Notification:
        """Tạo notification mới cho user."""
        notification = Notification(
            user_id=user_id,
            title=title,
            description=description,
            link=link,
        )
        created = self.repo.create(notification)
        logger.info(f"Notification created for user={user_id}: {title}")
        return created


    def list_for_user(
        self, user_id: UUID, limit: int = 50, unread_only: bool = False,
    ) -> list[Notification]:
        return self.repo.list_by_user(user_id, limit, unread_only)


    def count_unread(self, user_id: UUID) -> int:
        return self.repo.count_unread(user_id)


    def mark_read(self, notification_id: UUID, user_id: UUID) -> Notification:
        notification = self.repo.get_by_id(notification_id)
        if not notification:
            raise HTTPException(
                status.HTTP_404_NOT_FOUND, "Notification not found",
            )
        if notification.user_id != user_id:
            raise HTTPException(
                status.HTTP_403_FORBIDDEN, "Not your notification",
            )
        return self.repo.mark_read(notification)


    def mark_all_read(self, user_id: UUID) -> dict:
        count = self.repo.mark_all_read(user_id)
        logger.info(f"Marked {count} notifications as read for user={user_id}")
        return {"marked": count}


    def delete(self, notification_id: UUID, user_id: UUID) -> dict:
        notification = self.repo.get_by_id(notification_id)
        if not notification:
            return {"deleted": False}
        if notification.user_id != user_id:
            raise HTTPException(
                status.HTTP_403_FORBIDDEN, "Not your notification",
            )
        self.repo.delete(notification)
        return {"deleted": True}
