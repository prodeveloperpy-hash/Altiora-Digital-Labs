"""Application configuration, loaded from environment variables.

All settings have sensible defaults so the service runs out of the box, while
remaining fully configurable via environment variables (or a `.env` file).
"""

from __future__ import annotations

from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # --- General ---------------------------------------------------------
    app_name: str = "CardWise API"
    app_version: str = "1.0.0"
    environment: str = Field(default="development")
    # Avoid colliding with generic DEBUG variables injected by shells/CI tools.
    debug: bool = Field(default=False, validation_alias="CARDWISE_DEBUG")

    # --- API -------------------------------------------------------------
    api_prefix: str = "/api"
    # Optional key protecting administrative mutation endpoints. Set this in
    # every deployed environment; reads remain public.
    admin_api_key: str | None = None

    # --- Database --------------------------------------------------------
    # Default to a file-based SQLite database in the working directory.
    database_url: str = "sqlite:///./cardwise.db"
    # Create any missing tables on startup (idempotent; complements Alembic).
    auto_create_tables: bool = True
    # Seed reference data on startup when the database is empty.
    auto_seed: bool = True

    # --- CORS ------------------------------------------------------------
    # Origins allowed to call the API (the frontend dev server by default).
    cors_origins: list[str] = Field(
        default_factory=lambda: [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
        ]
    )

    # --- Rate limiting ---------------------------------------------------
    rate_limit_enabled: bool = True
    rate_limit_requests: int = 100
    rate_limit_window_seconds: int = 60
    # Only honor X-Forwarded-For when the service is behind a trusted proxy.
    trust_proxy_headers: bool = False

    # --- Recommendation engine ------------------------------------------
    # Maximum number of recommendations returned from a single request.
    recommendation_result_limit: int = 12
    # Minimum raw score a card must reach to be recommended at all.
    recommendation_min_raw_score: float = 0.0

    # --- Logging ---------------------------------------------------------
    log_level: str = "INFO"

    @property
    def is_sqlite(self) -> bool:
        return self.database_url.startswith("sqlite")


@lru_cache
def get_settings() -> Settings:
    """Return a cached Settings instance."""
    return Settings()


settings = get_settings()
