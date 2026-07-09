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


settings = Settings()
