from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    APP_NAME: str = "Smart Budget Tracker"
    DEBUG: bool = False

    DATABASE_URL: str = "sqlite:///./budget_tracker.db"
    FRONTEND_URL: str = "http://localhost:3000"

    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # OTP & Reset
    OTP_EXPIRE_MINUTES: int = 10
    OTP_LENGTH: int = 6
    RESET_TOKEN_EXPIRE_MINUTES: int = 15

    # Password
    MIN_PASSWORD_LENGTH: int = 8

    # CORS
    ALLOWED_ORIGINS: list[str] = [
        "http://localhost:3000",
        "https://expense-tracker-ten-zeta-78.vercel.app",
    ]

    # Brevo (Email)
    BREVO_API_KEY: str
    MAIL_FROM: str

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()