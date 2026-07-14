"""Integration test for the Users API profile endpoints.

Runs against the real PostgreSQL instance (see ``tests/conftest.py`` for the
transaction-rollback isolation strategy) through FastAPI's ``TestClient``,
exercising the actual router -> service -> repository -> database stack end
to end for ``GET /users/me`` and ``PATCH /users/me``.
"""

from fastapi.testclient import TestClient

from app.models.user import User

API_PREFIX = "/api/v1/users"


def test_get_me_returns_authenticated_profile(client: TestClient, test_user: User, auth_headers: dict[str, str]) -> None:
    response = client.get(f"{API_PREFIX}/me", headers=auth_headers)
    assert response.status_code == 200, response.text

    payload = response.json()
    assert payload["id"] == str(test_user.id)
    assert payload["email"] == test_user.email
    assert payload["username"] == test_user.username


def test_get_me_requires_authentication(client: TestClient) -> None:
    response = client.get(f"{API_PREFIX}/me")
    assert response.status_code == 403


def test_patch_me_updates_profile_fields(client: TestClient, test_user: User, auth_headers: dict[str, str]) -> None:
    response = client.patch(
        f"{API_PREFIX}/me",
        json={
            "first_name": "Jordan",
            "last_name": "Lee",
            "height_cm": "180.0",
            "goal": "general_fitness",
        },
        headers=auth_headers,
    )
    assert response.status_code == 200, response.text

    payload = response.json()
    assert payload["first_name"] == "Jordan"
    assert payload["last_name"] == "Lee"
    assert payload["height_cm"] == "180.00"
    assert payload["goal"] == "general_fitness"

    get_response = client.get(f"{API_PREFIX}/me", headers=auth_headers)
    assert get_response.json()["first_name"] == "Jordan"


def test_patch_me_rejects_duplicate_email(
    client: TestClient,
    test_user: User,
    other_user: User,
    auth_headers: dict[str, str],
) -> None:
    response = client.patch(
        f"{API_PREFIX}/me",
        json={"email": other_user.email},
        headers=auth_headers,
    )
    assert response.status_code == 409


def test_patch_me_rejects_duplicate_username(
    client: TestClient,
    test_user: User,
    other_user: User,
    auth_headers: dict[str, str],
) -> None:
    response = client.patch(
        f"{API_PREFIX}/me",
        json={"username": other_user.username},
        headers=auth_headers,
    )
    assert response.status_code == 409


def test_patch_me_requires_authentication(client: TestClient) -> None:
    response = client.patch(f"{API_PREFIX}/me", json={"first_name": "Jordan"})
    assert response.status_code == 403


def test_patch_me_allows_empty_optional_fields(client: TestClient, auth_headers: dict[str, str]) -> None:
    response = client.patch(
        f"{API_PREFIX}/me",
        json={"first_name": "Jordan", "last_name": None},
        headers=auth_headers,
    )
    assert response.status_code == 200, response.text
    assert response.json()["first_name"] == "Jordan"
    assert response.json()["last_name"] is None


def test_patch_me_rejects_invalid_token(client: TestClient) -> None:
    headers = {"Authorization": "Bearer invalid.token.value"}
    response = client.patch(f"{API_PREFIX}/me", json={"first_name": "Jordan"}, headers=headers)
    assert response.status_code == 401
