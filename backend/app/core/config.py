from pydantic import Field, SecretStr
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
    app_env: str = Field(
        default="development",
        description=(
            "Deployment environment selector: 'development' (host uvicorn), "
            "'docker' (local Compose stack), or 'production'. Does not change "
            "domain behavior; used for logging and environment separation."
        ),
    )

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

    cors_origins: str = Field(
        default="http://localhost:5173",
        description=(
            "Comma-separated list of allowed CORS origins for the Admin web "
            "app. Native mobile clients do not use CORS."
        ),
    )

    workout_log_edit_window_hours: int = Field(
        default=24,
        description=(
            "Hours after a WorkoutLog's completed_at during which its logged "
            "sets remain editable/deletable. After this window, the log is "
            "immutable."
        ),
    )

    default_program_slug: str = Field(
        default="beginner-foundation",
        description=(
            "Slug of the published program auto-assigned when an authenticated "
            "user has no active ProgramAssignment on first workout access "
            "(Sprint 6.3.1)."
        ),
    )

    ai_provider: str = Field(
        default="mock",
        description=(
            "LLM provider implementation selector for the AI Orchestrator. "
            "'mock' (default) or 'openai_compatible' — a generic "
            "OpenAI-compatible HTTP endpoint (OpenAI itself, Azure OpenAI, "
            "OpenRouter, or a local OpenAI-compatible server), selected via "
            "the ai_llm_* settings below. See Decision 020 in docs/DECISIONS.md."
        ),
    )
    ai_memory_max_turns: int = Field(
        default=20,
        description=(
            "Maximum number of recent chat turns loaded as context by the "
            "Memory Engine for a single Orchestrator request."
        ),
    )
    ai_llm_base_url: str | None = Field(
        default=None,
        description=(
            "Base URL for the 'openai_compatible' LLMProvider. Leave unset "
            "to use the SDK's default (OpenAI's own API); set to point at "
            "Azure OpenAI, OpenRouter, or a local OpenAI-compatible server."
        ),
    )
    ai_llm_api_key: SecretStr | None = Field(
        default=None,
        description=(
            "API key for the 'openai_compatible' LLMProvider. Required only "
            "when ai_provider='openai_compatible'; a SecretStr to avoid "
            "accidental leakage in logs/reprs."
        ),
    )
    ai_llm_model: str = Field(
        default="gpt-4o-mini",
        description="Model name passed to the 'openai_compatible' LLMProvider's completion calls.",
    )
    ai_llm_timeout_seconds: float = Field(
        default=30.0,
        description="Per-request timeout for the 'openai_compatible' LLMProvider.",
    )
    ai_llm_max_output_tokens: int = Field(
        default=500,
        description="Maximum output tokens requested per completion — a basic cost control.",
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

    recovery_training_load_window_days: int = Field(
        default=7,
        description=(
            "Trailing window (in days, inclusive of the target date) the "
            "Recovery Engine looks back over WorkoutLog history to derive "
            "training load. See Decision 014 in docs/DECISIONS.md."
        ),
    )
    recovery_sleep_target_hours: float = Field(
        default=8.0,
        description="Nightly sleep hours a check-in's sleep_hours is compared against.",
    )
    recovery_score_weight_sleep: float = Field(
        default=0.4,
        description=(
            "Weight applied to the sleep component of the composite "
            "readiness score. Together with "
            "recovery_score_weight_soreness_fatigue and "
            "recovery_score_weight_training_load, these should sum to 1.0."
        ),
    )
    recovery_score_weight_soreness_fatigue: float = Field(
        default=0.35,
        description="Weight applied to the soreness/fatigue component of the readiness score.",
    )
    recovery_score_weight_training_load: float = Field(
        default=0.25,
        description="Weight applied to the derived training-load component of the readiness score.",
    )

    progress_min_data_points_for_trend: int = Field(
        default=3,
        description=(
            "Minimum number of Progress entries required within the "
            "analysis window before the Progress Analyzer will compute a "
            "trend; fewer raises InsufficientProgressDataError."
        ),
    )
    progress_plateau_window_days: int = Field(
        default=14,
        description=(
            "Length (in days) of each of the two trailing windows compared "
            "against each other to detect a plateau."
        ),
    )
    progress_plateau_threshold_pct: float = Field(
        default=2.0,
        description=(
            "Maximum relative change (percent) between the two trailing "
            "plateau-detection windows' averages still classified as a "
            "plateau rather than a meaningful trend."
        ),
    )


    @property
    def cors_origin_list(self) -> list[str]:
        """Parse ``cors_origins`` into a list of stripped origin URLs."""
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


settings = Settings()
