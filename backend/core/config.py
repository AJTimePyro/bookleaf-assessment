from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent
DEFAULT_DB_FILE = BASE_DIR / "database" / "bookleaf.db"
DEFAULT_SAMPLE_DATA = BASE_DIR.parent / "bookleaf_sample_data.json"


class Settings(BaseSettings):
    DATABASE_URL: str = f"sqlite:///{DEFAULT_DB_FILE}"
    SECRET_KEY: str = "bookleaf-super-secret-assessment-key-change-in-prod"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

    LLM_BASE_URL: str = "http://localhost:11434/v1"
    LLM_API_KEY: str = "ollama"
    LLM_MODEL: str = "qwen2.5"
    LLM_TIMEOUT: float = 15.0

    SAMPLE_DATA_PATH: str = str(DEFAULT_SAMPLE_DATA)

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
