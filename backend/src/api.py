from fastapi import APIRouter, FastAPI
from backend.src.module.user_module import UserModule
from backend.src.module.job_module import JobModule

def register_modules(app: FastAPI):

    api_router = APIRouter(prefix = "/api")

    modules = [
        UserModule(),
        JobModule()
    ]

    for module in modules:
        module.setup_router()
        api_router.include_router(module.router, prefix = module.prefix, tags = module.tags)

    app.include_router(api_router)