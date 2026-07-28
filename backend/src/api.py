from fastapi import APIRouter, FastAPI
from backend.src.module.user_module import UserModule
from backend.src.module.job_module import JobModule
from backend.src.module.score_module import ScoreModule
from backend.src.module.auth_module import AuthModule
from backend.src.module.job_action_module import get_job_action_router
from backend.src.module.notification_module import get_notification_router

def register_modules(app: FastAPI):
    api_router = APIRouter(prefix = "/api")

    modules = [
        AuthModule(),
        UserModule(),
        JobModule(),
        ScoreModule(),
        get_job_action_router(),
        get_notification_router()
    ]
    for module in modules:
        if hasattr(module, "setup_router"):
            module.setup_router()
            api_router.include_router(module.router, prefix = module.prefix, tags = module.tags)
        else:
            api_router.include_router(module)

    app.include_router(api_router)