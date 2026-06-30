from fastapi import Request
from fastapi.responses import JSONResponse
from backend.src.exceptions.exceptions import AppError

async def app_exception_handler(request: Request, exc: AppError):
    return JSONResponse(
        status_code = exc.status_code,
        content = {
            "error": {
                "error_code": exc.error_code,
                "message": exc.message,
                "details": exc.details
            }
        }
    )


async def app_unexpected_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code = 500, 
        content = {
            "error":{
                "error_code": "internal_server_error",
                "message": "An unexpected error occurred",
            }
        }
    )
