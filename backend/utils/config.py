from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import SecretStr, EmailStr
from enum import Enum
import tempfile
from pathlib import Path

class EnvMode(str, Enum):
    DEV: str = "development"
    PROD: str = "production"
    STAGING: str = "staging"
    TEST: str = "test"

class Settings(BaseSettings):
    DEBUG: bool = True
    MODEL_NAME: str = "llama-3.1-8b-instant"
    MODEL_GIT: str = "llama-3.3-70b-versatile"
    LOG_LEVEL: str = "INFO"
    ENV_MODE: EnvMode = EnvMode.DEV
    CONFIG_PATH : str = "config/input.yml"
    MAX_JOBS_PER_SCRAPE: int = 5

    DATABASE_URL: SecretStr

    BASE_SEARCH_URL: str = "https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search"
    DETAIL_SEARCH_URL: str = "https://www.linkedin.com/jobs-guest/jobs/api/jobPosting"

    GROQ_API_KEY: SecretStr

    UPLOAD_DIR: str = str(Path(tempfile.gettempdir()) / "cv_uploads")
    MAX_CV_SIZE_MB: int = 10
    ALLOWED_CV_EXTENSIONS: set[str] = {".pdf", ".md", ".txt"}

    JWT_SECRET: SecretStr
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_MINUTES: int = 60 * 24  # 1 day

    GITHUB_TOKEN: SecretStr

    model_config = SettingsConfigDict(
        env_file = ".env",
        env_file_encoding = "utf-8",
        extra = "ignore",
    )


settings = Settings()
