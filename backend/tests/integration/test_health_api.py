"""Integration tests for the public deployment health probe and CORS."""

from fastapi.testclient import TestClient

from app.core.config import settings

from app.main import app


def test_health_returns_ok_when_database_is_reachable(client: TestClient) -> None:
    response = client.get("/health")
    assert response.status_code == 200, response.text

    payload = response.json()
    assert payload["status"] == "ok"
    assert payload["api"] == "online"
    assert payload["database"] == "connected"
    assert "version" in payload
    assert "traceback" not in payload
    assert "exception" not in str(payload)
    assert "secret" not in str(payload).lower()
    assert "jwt" not in str(payload).lower()
    assert "password" not in str(payload).lower()


def test_health_does_not_require_authentication(client: TestClient) -> None:
    response = client.get("/health")
    assert response.status_code == 200


def test_health_returns_503_when_database_is_unavailable(mocker) -> None:
    mocker.patch("app.api.health.check_system_health", return_value=mocker.Mock(
        status="degraded",
        api="online",
        database="unavailable",
        version="1.0.0",
        is_ok=False,
    ))
    with TestClient(app) as isolated:
        response = isolated.get("/health")

    assert response.status_code == 503
    payload = response.json()
    assert payload["status"] == "degraded"
    assert payload["database"] == "unavailable"
    assert "traceback" not in payload
    assert "exception" not in str(payload)


def test_cors_preflight_allows_configured_origin(client: TestClient) -> None:
    origin = settings.cors_origin_list[0]
    response = client.options(
        "/health",
        headers={
            "Origin": origin,
            "Access-Control-Request-Method": "GET",
        },
    )
    assert response.headers.get("access-control-allow-origin") == origin
