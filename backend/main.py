from fastapi import FastAPI
import uvicorn
from backend.src.api import register_modules
from backend.src.core.middleware import log_request
from backend.src.core.exception_handler import app_exception_handler, app_unexpected_handler
from backend.src.exceptions.exceptions import AppError

def create_app():
    app = FastAPI(title = "Research Job API", version = "1.0.0")

    app.add_exception_handler(AppError, app_exception_handler)
    app.add_exception_handler(Exception, app_unexpected_handler)

    app.middleware("http")(log_request)

    register_modules(app)

    return app

app = create_app()

if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="localhost", port=8000, reload = True)