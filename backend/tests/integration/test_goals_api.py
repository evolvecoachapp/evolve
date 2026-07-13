"""Integration test for the full Goals API lifecycle.

Runs against the real PostgreSQL instance (see ``tests/conftest.py`` for the
transaction-rollback isolation strategy) through FastAPI's ``TestClient``,
exercising the actual router -> service -> repository -> database stack end
to end: create -> list/get/update (status + priority transitions) ->
delete -> ownership enforcement across users. Mirrors ``test_recovery_api.py``.
"""

from fastapi.testclient import TestClient

from app.models.user import User
from app.security.jwt import create_access_token

API_PREFIX = "/api/v1/goals"


def _goal_payload(**overrides) -> dict:
    payload = {
        "goal_type": "weight_target",
        "description": "Lose 5kg by summer",
        "target_metric_type": "body_weight",
        "target_value": "75.0",
        "target_unit": "kg",
        "start_date": "2026-01-01",
        "target_date": "2026-06-01",
    }
    payload.update(overrides)
    return payload


def test_full_goal_lifecycle(client: TestClient, auth_headers: dict[str, str]) -> None:
    # 1. Create a goal.
    create_response = client.post(API_PREFIX, json=_goal_payload(), headers=auth_headers)
    assert create_response.status_code == 201, create_response.text
    goal = create_response.json()
    assert goal["status"] == "active"
    assert goal["priority"] == "medium"
    goal_id = goal["id"]

    # 2. It shows up in the caller's goal list.
    list_response = client.get(API_PREFIX, headers=auth_headers)
    assert list_response.status_code == 200
    assert any(item["id"] == goal_id for item in list_response.json()["items"])

    # 3. Filtering by status works.
    filtered_response = client.get(API_PREFIX, params={"status": "active"}, headers=auth_headers)
    assert any(item["id"] == goal_id for item in filtered_response.json()["items"])
    achieved_response = client.get(API_PREFIX, params={"status": "achieved"}, headers=auth_headers)
    assert not any(item["id"] == goal_id for item in achieved_response.json()["items"])

    # 4. Fetch it directly.
    get_response = client.get(f"{API_PREFIX}/{goal_id}", headers=auth_headers)
    assert get_response.status_code == 200
    assert get_response.json()["description"] == "Lose 5kg by summer"

    # 5. Update priority.
    update_response = client.patch(
        f"{API_PREFIX}/{goal_id}", json={"priority": "high"}, headers=auth_headers
    )
    assert update_response.status_code == 200
    assert update_response.json()["priority"] == "high"

    # An empty patch is rejected at the schema boundary.
    empty_patch = client.patch(f"{API_PREFIX}/{goal_id}", json={}, headers=auth_headers)
    assert empty_patch.status_code == 422

    # 6. Transition status to achieved.
    achieve_response = client.patch(
        f"{API_PREFIX}/{goal_id}", json={"status": "achieved"}, headers=auth_headers
    )
    assert achieve_response.status_code == 200
    assert achieve_response.json()["status"] == "achieved"

    # 7. Delete the goal.
    delete_response = client.delete(f"{API_PREFIX}/{goal_id}", headers=auth_headers)
    assert delete_response.status_code == 204

    # It no longer resolves.
    get_deleted_response = client.get(f"{API_PREFIX}/{goal_id}", headers=auth_headers)
    assert get_deleted_response.status_code == 404


def test_goal_target_fields_must_be_all_or_nothing(
    client: TestClient, auth_headers: dict[str, str]
) -> None:
    response = client.post(
        API_PREFIX,
        json=_goal_payload(target_metric_type=None, target_unit=None),
        headers=auth_headers,
    )
    assert response.status_code == 422


def test_goal_target_date_cannot_precede_start_date(
    client: TestClient, auth_headers: dict[str, str]
) -> None:
    response = client.post(
        API_PREFIX,
        json=_goal_payload(start_date="2026-06-01", target_date="2026-01-01"),
        headers=auth_headers,
    )
    assert response.status_code == 422


def test_goal_not_visible_to_other_users(
    client: TestClient, auth_headers: dict[str, str], other_user: User
) -> None:
    create_response = client.post(API_PREFIX, json=_goal_payload(), headers=auth_headers)
    goal_id = create_response.json()["id"]

    other_headers = {"Authorization": f"Bearer {create_access_token(other_user.id)}"}
    forbidden_get = client.get(f"{API_PREFIX}/{goal_id}", headers=other_headers)
    assert forbidden_get.status_code == 404

    forbidden_update = client.patch(
        f"{API_PREFIX}/{goal_id}", json={"priority": "high"}, headers=other_headers
    )
    assert forbidden_update.status_code == 404

    forbidden_delete = client.delete(f"{API_PREFIX}/{goal_id}", headers=other_headers)
    assert forbidden_delete.status_code == 404


def test_unauthenticated_request_is_rejected(client: TestClient) -> None:
    response = client.get(API_PREFIX)
    assert response.status_code in (401, 403)
