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

    nutrition_bmr_formula: str = Field(
        default="mifflin_st_jeor",
        description=(
            "BMRStrategy implementation selector for the Nutrition Engine. "
            "Only 'mifflin_st_jeor' is supported until a later sprint adds "
            "a formula needing profile data (e.g. body-fat %) that "
            "NutritionProfile doesn't carry yet."
        ),
    )
    nutrition_calorie_deficit_kcal: int = Field(
        default=500,
        description=(
            "Daily calorie deficit subtracted from TDEE for users with a "
            "'lose_weight' goal."
        ),
    )
    nutrition_calorie_surplus_kcal: int = Field(
        default=300,
        description=(
            "Daily calorie surplus added to TDEE for users with a "
            "'gain_muscle' goal."
        ),
    )
    nutrition_fat_pct_of_calories: float = Field(
        default=0.25,
        description="Fraction of target daily calories allocated to fat.",
    )
    nutrition_min_calories_floor: int = Field(
        default=1200,
        description=(
            "Safety floor: computed calorie targets are never clamped below "
            "this value, regardless of goal adjustment."
        ),
    )
    nutrition_adherence_tolerance_pct: int = Field(
        default=10,
        description=(
            "Percentage tolerance band around each macro target used to "
            "classify logged intake as 'under'/'on_track'/'over'."
        ),
    )


settings = Settings()
