from fastapi import APIRouter
from backend.src.controller.job_action_controller import JobActionController

def get_job_action_router() -> APIRouter:
    router = APIRouter(prefix="/job", tags=["job-actions"])
    controller = JobActionController()

    router.add_api_route(
        "/{job_id}/action",
        controller.upsert,
        methods=["PATCH"],
        summary="Create or update job action (save, hide, status, notes)",
    )

    router.add_api_route(
        "/{job_id}/action",
        controller.get,
        methods=["GET"],
        summary="Get job action for current user",
    )

    router.add_api_route(
        "/actions/",
        controller.list,
        methods=["GET"],
        summary="List all job actions for current user",
    )

    router.add_api_route(
        "/{job_id}/action",
        controller.delete,
        methods=["DELETE"],
        summary="Delete job action",
    )

    return router
   