from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application configuration loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    database_url: str = Field(
        ...,
        description="PostgreSQL connection URL using the psycopg driver.",
    )
    app_name: str = Field(default="EVOLVE API")
    debug: bool = Field(default=False)
    api_version: str = Field(default="1.0.0")

    jwt_secret_key: str = Field(
        ...,
        description="Symmetric secret used to sign and verify JWTs.",
    )
    jwt_algorithm: str = Field(
        default="HS256",
        description="Signing algorithm passed explicitly to PyJWT encode/decode.",
    )
    access_token_expire_minutes: int = Field(
        default=15,
        description="Access token lifetime, in minutes.",
    )
    refresh_token_expire_days: int = Field(
        default=7,
        description="Refresh token lifetime, in days.",
    )
    jwt_issuer: str | None = Field(
        default="evolve-api",
        description="Value embedded as the 'iss' claim and verified on decode.",
    )

    workout_log_edit_window_hours: int = Field(
        default=24,
        description=(
            "Hours after a WorkoutLog's completed_at during which its logged "
            "sets remain editable/deletable. After this window, the log is "
            "immutable."
        ),
    )

    ai_provider: str = Field(
        default="mock",
        description=(
            "LLM provider implementation selector for the AI Orchestrator. "
            "Only 'mock' is supported until a real provider is integrated "
            "in a later sprint."
        ),
    )
    ai_memory_max_turns: int = Field(
        default=20,
        description=(
            "Maximum number of recent chat turns loaded as context by the "
            "Memory Engine for a single Orchestrator request."
        ),
    )


settings = Settings()
