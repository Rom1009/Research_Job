from fastapi import APIRouter
from backend.src.controller.notification_controller import NotificationController

def get_notification_router() -> APIRouter:
    router = APIRouter(prefix="/notifications", tags=["notifications"])
    controller = NotificationController()

    router.add_api_route(
        "/",
        controller.list,
        methods=["GET"],
        summary="List notifications for current user",
    )

    router.add_api_route(
        "/count",
        controller.count_unread,
        methods=["GET"],
        summary="Get count of unread notifications",
    )

    router.add_api_route(
        "/{notification_id}/read",
        controller.mark_read,
        methods=["POST"],
        summary="Mark a notification as read",
    )

    router.add_api_route(
        "/read-all",
        controller.mark_all_read,
        methods=["POST"],
        summary="Mark all notifications as read",
    )

    router.add_api_route(
        "/{notification_id}",
        controller.delete,
        methods=["DELETE"],
        summary="Delete a notification",
    )

    return router
