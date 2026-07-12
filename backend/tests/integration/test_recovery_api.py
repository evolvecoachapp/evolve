"""Integration test for the full Recovery API lifecycle.

Runs against the real PostgreSQL instance (see ``tests/conftest.py`` for the
transaction-rollback isolation strategy) through FastAPI's ``TestClient``,
exercising the actual router -> service -> repository -> database stack end
to end: create a check-in -> duplicate-date conflict -> list/get/update ->
readiness scoring (including the no-check-in-yet 404 path) -> delete ->
ownership enforcement across users. Mirrors ``test_nutrition_api.py``.
"""

from datetime import date

import pytest
from fastapi.testclient import TestClient

from app.models.user import User
from app.security.jwt import create_access_token

API_PREFIX = "/api/v1/recovery"


def _check_in_payload(**overrides) -> dict:
    payload = {
        "checkin_date": "2026-01-01",
        "sleep_hours": "7.50",
        "sleep_quality": 4,
        "soreness": 2,
        "fatigue": 2,
    }
    payload.update(overrides)
    return payload


def test_full_check_in_and_readiness_lifecycle(
    client: TestClient, auth_headers: dict[str, str]
) -> None:
    # 1. Readiness for a date with no check-in yet is a 404.
    missing_response = client.get(
        f"{API_PREFIX}/readiness", params={"for_date": "2026-01-01"}, headers=auth_headers
    )
    assert missing_response.status_code == 404

    # 2. Create a check-in.
    create_response = client.post(
        f"{API_PREFIX}/check-ins", json=_check_in_payload(), headers=auth_headers
    )
    assert create_response.status_code == 201, create_response.text
    check_in = create_response.json()
    assert check_in["checkin_date"] == "2026-01-01"
    check_in_id = check_in["id"]

    # 3. A second check-in for the same date is a conflict.
    conflict_response = client.post(
        f"{API_PREFIX}/check-ins", json=_check_in_payload(), headers=auth_headers
    )
    assert conflict_response.status_code == 409

    # 4. It shows up in the caller's check-in list.
    list_response = client.get(f"{API_PREFIX}/check-ins", headers=auth_headers)
    assert list_response.status_code == 200
    assert any(item["id"] == check_in_id for item in list_response.json()["items"])

    # 5. Fetch it directly.
    get_response = client.get(f"{API_PREFIX}/check-ins/{check_in_id}", headers=auth_headers)
    assert get_response.status_code == 200
    assert get_response.json()["sleep_quality"] == 4

    # 6. Update it.
    update_response = client.patch(
        f"{API_PREFIX}/check-ins/{check_in_id}",
        json={"soreness": 5, "notes": "sore from leg day"},
        headers=auth_headers,
    )
    assert update_response.status_code == 200
    assert update_response.json()["soreness"] == 5
    assert update_response.json()["notes"] == "sore from leg day"

    # An empty patch is rejected at the schema boundary.
    empty_patch = client.patch(
        f"{API_PREFIX}/check-ins/{check_in_id}", json={}, headers=auth_headers
    )
    assert empty_patch.status_code == 422

    # 7. Readiness now resolves.
    readiness_response = client.get(
        f"{API_PREFIX}/readiness", params={"for_date": "2026-01-01"}, headers=auth_headers
    )
    assert readiness_response.status_code == 200, readiness_response.text
    readiness = readiness_response.json()
    assert readiness["for_date"] == "2026-01-01"
    assert 0 <= float(readiness["readiness_score"]) <= 100
    assert readiness["readiness_level"] in ("low", "moderate", "high")
    assert readiness["protocols"]

    # 8. Delete the check-in.
    delete_response = client.delete(f"{API_PREFIX}/check-ins/{check_in_id}", headers=auth_headers)
    assert delete_response.status_code == 204

    # It no longer resolves.
    get_deleted_response = client.get(
        f"{API_PREFIX}/check-ins/{check_in_id}", headers=auth_headers
    )
    assert get_deleted_response.status_code == 404

    # Nor does readiness for that date.
    readiness_after_delete = client.get(
        f"{API_PREFIX}/readiness", params={"for_date": "2026-01-01"}, headers=auth_headers
    )
    assert readiness_after_delete.status_code == 404


def test_check_in_not_visible_to_other_users(
    client: TestClient, auth_headers: dict[str, str], other_user: User
) -> None:
    create_response = client.post(
        f"{API_PREFIX}/check-ins", json=_check_in_payload(), headers=auth_headers
    )
    check_in_id = create_response.json()["id"]

    other_headers = {"Authorization": f"Bearer {create_access_token(other_user.id)}"}
    forbidden_response = client.get(f"{API_PREFIX}/check-ins/{check_in_id}", headers=other_headers)
    assert forbidden_response.status_code == 404

    forbidden_update = client.patch(
        f"{API_PREFIX}/check-ins/{check_in_id}", json={"notes": "hijacked"}, headers=other_headers
    )
    assert forbidden_update.status_code == 404

    # Each user has their own independent one-check-in-per-day scope.
    other_create = client.post(
        f"{API_PREFIX}/check-ins", json=_check_in_payload(), headers=other_headers
    )
    assert other_create.status_code == 201


@pytest.mark.parametrize(
    "invalid_field",
    [{"sleep_hours": "25.00"}, {"sleep_quality": 6}, {"soreness": 0}, {"fatigue": 6}],
)
def test_check_in_rejects_out_of_range_values(
    client: TestClient, auth_headers: dict[str, str], invalid_field: dict
) -> None:
    response = client.post(
        f"{API_PREFIX}/check-ins", json=_check_in_payload(**invalid_field), headers=auth_headers
    )
    assert response.status_code == 422


def test_unauthenticated_request_is_rejected(client: TestClient) -> None:
    response = client.get(f"{API_PREFIX}/check-ins")
    assert response.status_code in (401, 403)
