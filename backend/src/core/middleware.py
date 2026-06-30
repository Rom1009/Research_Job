import time
from fastapi import Request
from backend.utils.logger import setup_logger

logger = setup_logger("Check Request Time")

async def log_request(request: Request, call_next):

    start_time = time.time()

    response = await call_next(request)

    process_time = time.time() - start_time

    logger.info(
        f"{request.method} {request.url.path}"
        f"status = {response.status_code}"
        f"process_time = {process_time:.3f}s"
    )

    return response