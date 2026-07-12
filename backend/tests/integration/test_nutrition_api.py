"""Integration test for the full Nutrition API lifecycle.

Runs against the real PostgreSQL instance (see ``tests/conftest.py`` for
the transaction-rollback isolation strategy) through FastAPI's
``TestClient``, exercising the actual router -> service -> repository ->
database stack end to end: create a meal template -> log it (template mode)
-> log an ad-hoc entry -> list/update/delete logs -> daily targets
(including the incomplete-profile 422 path) -> deactivate the template ->
visibility/ownership enforcement across users.
"""

from datetime import date, datetime, timezone
from decimal import Decimal

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.user import ActivityLevel, Gender, Goal, User
from app.security.jwt import create_access_token

API_PREFIX = "/api/v1/nutrition"


@pytest.fixture()
def complete_profile(test_user: User, db_session: Session) -> User:
    """Fill in every profile field :meth:`NutritionService.get_daily_nutrition` requires."""
    test_user.birth_date = date(1996, 1, 1)
    test_user.gender = Gender.MALE
    test_user.height_cm = Decimal("175")
    test_user.current_weight_kg = Decimal("70")
    test_user.activity_level = ActivityLevel.SEDENTARY
    test_user.goal = Goal.MAINTAIN_WEIGHT
    db_session.commit()
    db_session.refresh(test_user)
    return test_user


def _meal_payload(**overrides) -> dict:
    payload = {
        "name": "Chicken and rice",
        "meal_type": "lunch",
        "calories": "600.00",
        "protein_g": "50.00",
        "carbs_g": "70.00",
        "fat_g": "10.00",
    }
    payload.update(overrides)
    return payload


def test_full_meal_and_logging_lifecycle(client: TestClient, auth_headers: dict[str, str]) -> None:
    # 1. Create a private meal template.
    create_response = client.post(
        f"{API_PREFIX}/meals", json=_meal_payload(), headers=auth_headers
    )
    assert create_response.status_code == 201, create_response.text
    meal = create_response.json()
    assert meal["is_public"] is False
    assert meal["is_active"] is True
    meal_id = meal["id"]

    # 2. It shows up in the caller's meal list.
    list_response = client.get(f"{API_PREFIX}/meals", headers=auth_headers)
    assert list_response.status_code == 200
    assert any(item["id"] == meal_id for item in list_response.json()["items"])

    # 3. Fetch it directly.
    get_response = client.get(f"{API_PREFIX}/meals/{meal_id}", headers=auth_headers)
    assert get_response.status_code == 200
    assert get_response.json()["name"] == "Chicken and rice"

    # 4. Update it.
    update_response = client.patch(
        f"{API_PREFIX}/meals/{meal_id}", json={"name": "Chicken and brown rice"}, headers=auth_headers
    )
    assert update_response.status_code == 200
    assert update_response.json()["name"] == "Chicken and brown rice"

    # 5. Log it (template mode) — macros are snapshotted from the template.
    log_response = client.post(
        f"{API_PREFIX}/logs",
        json={"meal_id": meal_id, "consumed_at": "2026-01-01T12:00:00Z"},
        headers=auth_headers,
    )
    assert log_response.status_code == 201, log_response.text
    template_log = log_response.json()
    assert template_log["meal_id"] == meal_id
    assert template_log["name_snapshot"] == "Chicken and brown rice"
    assert template_log["calories"] == "600.00"

    # 6. Log an ad-hoc entry — no meal_id, macros supplied directly.
    ad_hoc_response = client.post(
        f"{API_PREFIX}/logs",
        json={
            "name": "Protein shake",
            "meal_type": "snack",
            "calories": "200.00",
            "protein_g": "30.00",
            "carbs_g": "10.00",
            "fat_g": "2.00",
            "consumed_at": "2026-01-01T09:00:00Z",
        },
        headers=auth_headers,
    )
    assert ad_hoc_response.status_code == 201, ad_hoc_response.text
    ad_hoc_log = ad_hoc_response.json()
    assert ad_hoc_log["meal_id"] is None
    ad_hoc_log_id = ad_hoc_log["id"]

    # A log payload mixing both modes is rejected at the schema boundary.
    invalid_log = client.post(
        f"{API_PREFIX}/logs",
        json={
            "meal_id": meal_id,
            "name": "Should not be allowed alongside meal_id",
            "consumed_at": "2026-01-01T12:00:00Z",
        },
        headers=auth_headers,
    )
    assert invalid_log.status_code == 422

    # 7. Both entries show up when listing that day's logs.
    logs_response = client.get(
        f"{API_PREFIX}/logs",
        params={"date_from": "2026-01-01", "date_to": "2026-01-01"},
        headers=auth_headers,
    )
    assert logs_response.status_code == 200
    logs_page = logs_response.json()
    assert logs_page["total"] == 2

    # 8. Update the ad-hoc entry's notes.
    patch_log_response = client.patch(
        f"{API_PREFIX}/logs/{ad_hoc_log_id}", json={"notes": "post-workout"}, headers=auth_headers
    )
    assert patch_log_response.status_code == 200
    assert patch_log_response.json()["notes"] == "post-workout"

    # 9. Delete the ad-hoc entry.
    delete_log_response = client.delete(f"{API_PREFIX}/logs/{ad_hoc_log_id}", headers=auth_headers)
    assert delete_log_response.status_code == 204

    # It no longer resolves.
    get_deleted_log = client.get(f"{API_PREFIX}/logs/{ad_hoc_log_id}", headers=auth_headers)
    assert get_deleted_log.status_code == 404

    # 10. Deactivate the meal template.
    deactivate_response = client.delete(f"{API_PREFIX}/meals/{meal_id}", headers=auth_headers)
    assert deactivate_response.status_code == 200
    assert deactivate_response.json()["is_active"] is False


def test_targets_requires_a_complete_profile(client: TestClient, auth_headers: dict[str, str]) -> None:
    response = client.get(f"{API_PREFIX}/targets", headers=auth_headers)
    assert response.status_code == 422


def test_targets_returns_calculated_macros_once_profile_is_complete(
    client: TestClient, auth_headers: dict[str, str], complete_profile: User
) -> None:
    log_response = client.post(
        f"{API_PREFIX}/logs",
        json={
            "name": "Breakfast",
            "meal_type": "breakfast",
            "calories": "500.00",
            "protein_g": "30.00",
            "carbs_g": "50.00",
            "fat_g": "15.00",
            "consumed_at": datetime.now(timezone.utc).isoformat(),
        },
        headers=auth_headers,
    )
    assert log_response.status_code == 201

    response = client.get(f"{API_PREFIX}/targets", headers=auth_headers)
    assert response.status_code == 200, response.text
    body = response.json()
    assert Decimal(body["targets"]["calories"]) > 0
    assert Decimal(body["actual"]["calories"]) == Decimal("500.00")
    assert set(body["adherence"].keys()) == {"calories", "protein_g", "carbs_g", "fat_g"}
    assert body["summary_text"]


def test_private_meal_not_visible_to_other_users(
    client: TestClient, auth_headers: dict[str, str], other_user: User
) -> None:
    create_response = client.post(
        f"{API_PREFIX}/meals", json=_meal_payload(), headers=auth_headers
    )
    meal_id = create_response.json()["id"]

    other_headers = {"Authorization": f"Bearer {create_access_token(other_user.id)}"}
    forbidden_response = client.get(f"{API_PREFIX}/meals/{meal_id}", headers=other_headers)
    assert forbidden_response.status_code == 404

    forbidden_update = client.patch(
        f"{API_PREFIX}/meals/{meal_id}", json={"name": "hijacked"}, headers=other_headers
    )
    assert forbidden_update.status_code == 404


def test_meal_log_not_visible_to_other_users(
    client: TestClient, auth_headers: dict[str, str], other_user: User
) -> None:
    log_response = client.post(
        f"{API_PREFIX}/logs",
        json={
            "name": "Ad-hoc snack",
            "meal_type": "snack",
            "calories": "150.00",
            "protein_g": "10.00",
            "carbs_g": "15.00",
            "fat_g": "5.00",
            "consumed_at": "2026-01-01T09:00:00Z",
        },
        headers=auth_headers,
    )
    log_id = log_response.json()["id"]

    other_headers = {"Authorization": f"Bearer {create_access_token(other_user.id)}"}
    forbidden_response = client.get(f"{API_PREFIX}/logs/{log_id}", headers=other_headers)
    assert forbidden_response.status_code == 404


def test_unauthenticated_request_is_rejected(client: TestClient) -> None:
    response = client.get(f"{API_PREFIX}/meals")
    assert response.status_code in (401, 403)
