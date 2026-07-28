from typing import Optional
from uuid import UUID
from sqlmodel import Session, select, func


from backend.src.schema.model import Notification
from backend.utils.logger import setup_logger

logger = setup_logger("Notification Repository")

class NotificationRepository:
    def __init__(self, session: Session):
        self.session = session


    def create(self, notification: Notification) -> Notification:
        self.session.add(notification)
        self.session.commit()
        self.session.refresh(notification)
        return notification


    def list_by_user(
        self, user_id: UUID, limit: int = 50, unread_only: bool = False,
    ) -> list[Notification]:
        stmt = (
            select(Notification)
            .where(Notification.user_id == user_id)
            .order_by(Notification.created_at.desc())
            .limit(limit)
        )
        if unread_only:
            stmt = stmt.where(Notification.read == False)  # noqa
        return list(self.session.exec(stmt).all())


    def get_by_id(self, notification_id: UUID) -> Optional[Notification]:
        return self.session.get(Notification, notification_id)


    def count_unread(self, user_id: UUID) -> int:
        stmt = (
            select(func.count(Notification.id))
            .where(Notification.user_id == user_id)
            .where(Notification.read == False)  # noqa
        )
        return self.session.exec(stmt).one()


    def mark_read(self, notification: Notification) -> Notification:
        notification.read = True
        self.session.add(notification)
        self.session.commit()
        self.session.refresh(notification)
        return notification


    def mark_all_read(self, user_id: UUID) -> int:
        stmt = (
            select(Notification)
            .where(Notification.user_id == user_id)
            .where(Notification.read == False)  # noqa
        )
        notifications = list(self.session.exec(stmt).all())
        for n in notifications:
            n.read = True
            self.session.add(n)
        self.session.commit()
        return len(notifications)


    def delete(self, notification: Notification) -> None:
        self.session.delete(notification)
        self.session.commit()