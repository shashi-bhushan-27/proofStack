"""Application configuration using pydantic-settings.

Reads from environment variables and .env files.
All sensitive values should be set via environment variables in production.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Global application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── Application ──────────────────────────────────────────────────────
    APP_NAME: str = "proofStack"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    BACKEND_URL: str = "http://localhost:8000"
    FRONTEND_URL: str = "http://localhost:3000"
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    # ── Database ─────────────────────────────────────────────────────────
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/proofstack"

    # ── Authentication / JWT ─────────────────────────────────────────────
    SECRET_KEY: str = "CHANGE-ME-IN-PRODUCTION-use-openssl-rand-hex-64"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    GUEST_TOKEN_EXPIRE_HOURS: int = 24
    FIREBASE_PROJECT_ID: str | None = "proofstack-b606d"
    FIREBASE_CREDENTIALS_PATH: str | None = "/app/firebase-credentials.json"

    # ── Cashfree Billing & Subscriptions ─────────────────────────────────
    CASHFREE_APP_ID: str = ""
    CASHFREE_SECRET_KEY: str = ""
    CASHFREE_ENVIRONMENT: str = "Production"  # "Sandbox" or "Production"
    CASHFREE_WEBHOOK_SECRET: str = ""





    # ── LLM / AI ─────────────────────────────────────────────────────────
    GROQ_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    LLM_PROVIDER: str = "groq"
    LLM_MODEL: str = "llama-3.1-70b-versatile"

    # ── S3 / Object Storage ──────────────────────────────────────────────
    S3_BUCKET_NAME: str = "proofstack-uploads"
    S3_REGION: str = "us-east-1"
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    S3_ENDPOINT_URL: str | None = None

    # ── File Handling ────────────────────────────────────────────────────
    MAX_FILE_SIZE_MB: int = 10
    UPLOAD_DIR: str = "uploads"
    STORAGE_BACKEND: str = "local"  # "local" or "s3"

    # ── Scoring Weights (must sum to 1.0) ────────────────────────────────
    required_skill_coverage_weight: float = 0.35
    evidence_strength_weight: float = 0.35
    preferred_skill_coverage_weight: float = 0.10
    experience_relevance_weight: float = 0.10
    resume_communication_weight: float = 0.10

    @property
    def max_file_size_bytes(self) -> int:
        """Maximum upload file size in bytes."""
        return self.MAX_FILE_SIZE_MB * 1024 * 1024


settings = Settings()
