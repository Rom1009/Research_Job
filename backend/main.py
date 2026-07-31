import os
from fastapi import FastAPI
import uvicorn
from backend.src.api import register_modules
from backend.src.core.middleware import log_request
from backend.src.core.exception_handler import app_exception_handler, app_unexpected_handler
from backend.src.exceptions.exceptions import AppError
from backend.utils.logger import setup_logger
from fastapi.middleware.cors import CORSMiddleware


logger = setup_logger("Main Application")

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")


def create_app():
    logger.info("Creating FastAPI application instance")
    app = FastAPI(title="Research Job API", version="1.0.0")

    logger.info("Registering exception handlers")
    app.add_exception_handler(AppError, app_exception_handler)
    app.add_exception_handler(Exception, app_unexpected_handler)

    logger.info("Registering middleware for logging requests")
    app.middleware("http")(log_request)

    logger.info(f"CORS allowed origins: {FRONTEND_URL}, http://localhost:3000")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            FRONTEND_URL,
            "http://localhost:3000",
        ],
        allow_origin_regex=r"https://research-job-znp.*\.vercel\.app",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/health")
    async def health():
        return {"status": "ok"}

    logger.info("Registering API modules")
    register_modules(app)

    return app


app = create_app()


if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
