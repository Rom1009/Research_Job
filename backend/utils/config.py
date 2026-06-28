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
    MODEL_NAME: str = "meta-llama/llama-4-scout-17b-16e-instruct"
    LOG_LEVEL: str = "INFO"
    ENV_MODE: EnvMode = EnvMode.DEV
    CONFIG_PATH : str = "config/input.yml"

    GROQ_API_KEY: SecretStr

    model_config = SettingsConfigDict(
        env_title = ".env",
        env_file_encoding = "urf-8",
        extra = "ignore",
    )

settings = Settings()