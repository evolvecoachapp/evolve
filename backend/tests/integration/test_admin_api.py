"""Integration tests for the Admin control-plane API.

Runs against the real PostgreSQL instance (see ``tests/conftest.py``) through
FastAPI's ``TestClient``. Covers superuser authorization, user list/detail,
dashboard summary, system health, and account-status mutation.
"""

from fastapi.testclient import TestClient

from app.models.user import User

API_PREFIX = "/api/v1/admin"


def test_admin_dashboard_requires_authentication(client: TestClient) -> None:
    response = client.get(f"{API_PREFIX}/dashboard")
    assert response.status_code == 403


def test_admin_dashboard_denies_normal_user(
    client: TestClient, auth_headers: dict[str, str]
) -> None:
    response = client.get(f"{API_PREFIX}/dashboard", headers=auth_headers)
    assert response.status_code == 403
    assert response.json()["detail"] == "Administrator access required."


def test_admin_dashboard_allows_superuser(
    client: TestClient, superuser_headers: dict[str, str]
) -> None:
    response = client.get(f"{API_PREFIX}/dashboard", headers=superuser_headers)
    assert response.status_code == 200, response.text

    payload = response.json()
    assert "users" in payload
    assert "activity" in payload
    assert payload["users"]["total"] >= 1
    assert payload["users"]["superusers"] >= 1
    assert payload["activity"]["workout_logs"] >= 0
    assert "hashed_password" not in payload


def test_admin_users_list_requires_authentication(client: TestClient) -> None:
    response = client.get(f"{API_PREFIX}/users")
    assert response.status_code == 403


def test_admin_users_list_denies_normal_user(
    client: TestClient, auth_headers: dict[str, str]
) -> None:
    response = client.get(f"{API_PREFIX}/users", headers=auth_headers)
    assert response.status_code == 403


def test_admin_users_list_returns_page_for_superuser(
    client: TestClient,
    superuser: User,
    test_user: User,
    superuser_headers: dict[str, str],
) -> None:
    response = client.get(f"{API_PREFIX}/users", headers=superuser_headers)
    assert response.status_code == 200, response.text

    payload = response.json()
    assert payload["total"] >= 2
    assert payload["limit"] == 20
    assert payload["offset"] == 0
    ids = {item["id"] for item in payload["items"]}
    assert str(superuser.id) in ids
    assert str(test_user.id) in ids
    for item in payload["items"]:
        assert "hashed_password" not in item
        assert "is_superuser" in item


def test_admin_user_detail_requires_authentication(
    client: TestClient, test_user: User
) -> None:
    response = client.get(f"{API_PREFIX}/users/{test_user.id}")
    assert response.status_code == 403


def test_admin_user_detail_denies_normal_user(
    client: TestClient, test_user: User, auth_headers: dict[str, str]
) -> None:
    response = client.get(f"{API_PREFIX}/users/{test_user.id}", headers=auth_headers)
    assert response.status_code == 403


def test_admin_user_detail_returns_user_for_superuser(
    client: TestClient, test_user: User, superuser_headers: dict[str, str]
) -> None:
    response = client.get(f"{API_PREFIX}/users/{test_user.id}", headers=superuser_headers)
    assert response.status_code == 200, response.text

    payload = response.json()
    assert payload["id"] == str(test_user.id)
    assert payload["email"] == test_user.email
    assert payload["is_superuser"] is False
    assert "hashed_password" not in payload


def test_admin_user_detail_returns_404_for_unknown_user(
    client: TestClient, superuser_headers: dict[str, str]
) -> None:
    response = client.get(
        f"{API_PREFIX}/users/00000000-0000-0000-0000-000000000000",
        headers=superuser_headers,
    )
    assert response.status_code == 404
    assert response.json()["detail"] == "User not found."


def test_admin_health_requires_authentication(client: TestClient) -> None:
    response = client.get(f"{API_PREFIX}/health")
    assert response.status_code == 403


def test_admin_health_denies_normal_user(
    client: TestClient, auth_headers: dict[str, str]
) -> None:
    response = client.get(f"{API_PREFIX}/health", headers=auth_headers)
    assert response.status_code == 403


def test_admin_health_returns_sanitized_status_for_superuser(
    client: TestClient, superuser_headers: dict[str, str]
) -> None:
    response = client.get(f"{API_PREFIX}/health", headers=superuser_headers)
    assert response.status_code == 200, response.text

    payload = response.json()
    assert payload["status"] == "ok"
    assert payload["api"] == "online"
    assert payload["database"] == "connected"
    assert "version" in payload
    assert "traceback" not in payload
    assert "exception" not in payload


def test_admin_session_start_denies_normal_user(
    client: TestClient, auth_headers: dict[str, str]
) -> None:
    response = client.post(f"{API_PREFIX}/session", headers=auth_headers)
    assert response.status_code == 403


def test_admin_session_start_allows_superuser(
    client: TestClient, superuser: User, superuser_headers: dict[str, str]
) -> None:
    response = client.post(f"{API_PREFIX}/session", headers=superuser_headers)
    assert response.status_code == 200, response.text

    payload = response.json()
    assert payload["id"] == str(superuser.id)
    assert payload["is_superuser"] is True
    assert "hashed_password" not in payload


def test_admin_set_status_denies_normal_user(
    client: TestClient, test_user: User, auth_headers: dict[str, str]
) -> None:
    response = client.patch(
        f"{API_PREFIX}/users/{test_user.id}/status",
        json={"is_active": False},
        headers=auth_headers,
    )
    assert response.status_code == 403


def test_admin_set_status_deactivates_user(
    client: TestClient, test_user: User, superuser_headers: dict[str, str]
) -> None:
    response = client.patch(
        f"{API_PREFIX}/users/{test_user.id}/status",
        json={"is_active": False},
        headers=superuser_headers,
    )
    assert response.status_code == 200, response.text
    assert response.json()["is_active"] is False

    detail = client.get(f"{API_PREFIX}/users/{test_user.id}", headers=superuser_headers)
    assert detail.json()["is_active"] is False


def test_admin_cannot_deactivate_own_account(
    client: TestClient, superuser: User, superuser_headers: dict[str, str]
) -> None:
    response = client.patch(
        f"{API_PREFIX}/users/{superuser.id}/status",
        json={"is_active": False},
        headers=superuser_headers,
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Cannot deactivate your own account."
