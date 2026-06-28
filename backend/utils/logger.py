import logging
import sys
from pathlib import Path 
from backend.utils.config import settings

LOG_DIR = Path("logs")
LOG_DIR.mkdir(exist_ok = True)

def setup_logger(name: str):
    logger = logging.getLogger(name)
    logger.setLevel(getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO))

    formatter = logging.Formatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        datefmt = "%Y-%m-%d %H:%M:%S", 
    )

    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)

    file_handler = logging.FileHandler(LOG_DIR / f"{name}.log", encoding = "utf-8")
    file_handler.setFormatter(formatter)

    if not logger.handlers():
        logger.addHandler(console_handler)
        logger.addHandler(file_handler)

    return logger