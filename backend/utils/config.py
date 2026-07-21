from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import SecretStr, EmailStr
from enum import Enum


class EnvMode(str, Enum):
    DEV: str = "development"
    PROD: str = "production"
    STAGING: str = "staging"
    TEST: str = "test"


class Settings(BaseSettings):
    DEBUG: bool = True
    MODEL_NAME: str = "llama-3.1-8b-instant"
    LOG_LEVEL: str = "INFO"
    ENV_MODE: EnvMode = EnvMode.DEV
    CONFIG_PATH : str = "config/input.yml"


    DATABASE_URL: str = "sqlite:///./test.db"


    BASE_SEARCH_URL: str = "https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search"
    DETAIL_SEARCH_URL: str = "https://www.linkedin.com/jobs-guest/jobs/api/jobPosting"


    GROQ_API_KEY: SecretStr


    UPLOAD_DIR: str = "uploads"
    MAX_CV_SIZE_MB: int = 10
    ALLOWED_CV_EXTENSIONS: set[str] = {".pdf", ".md", ".txt"}


    model_config = SettingsConfigDict(
        env_file = ".env",
        env_file_encoding = "utf-8",
        extra = "ignore",
    )


settings = Settings()