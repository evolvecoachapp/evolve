"""Unit tests for environment-driven application settings."""

from app.core.config import Settings


def test_cors_origin_list_parses_comma_separated_origins():
    settings = Settings(
        database_url="postgresql+psycopg://evolve:evolve@localhost:5432/evolve",
        jwt_secret_key="test-secret",
        cors_origins="https://admin.example.com, http://localhost:5173",
    )

    assert settings.cors_origin_list == [
        "https://admin.example.com",
        "http://localhost:5173",
    ]


def test_cors_origin_list_ignores_blank_entries():
    settings = Settings(
        database_url="postgresql+psycopg://evolve:evolve@localhost:5432/evolve",
        jwt_secret_key="test-secret",
        cors_origins="https://admin.example.com, ,",
    )

    assert settings.cors_origin_list == ["https://admin.example.com"]


def test_app_env_default_is_development():
    assert Settings.model_fields["app_env"].default == "development"


def test_app_env_accepts_docker_and_production():
    docker = Settings(
        database_url="postgresql+psycopg://evolve:evolve@localhost:5432/evolve",
        jwt_secret_key="test-secret",
        app_env="docker",
    )
    production = Settings(
        database_url="postgresql+psycopg://evolve:evolve@localhost:5432/evolve",
        jwt_secret_key="test-secret",
        app_env="production",
    )

    assert docker.app_env == "docker"
    assert production.app_env == "production"
