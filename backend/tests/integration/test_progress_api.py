"""Integration test for the full Progress API lifecycle, including the AI-driven summary.

Runs against the real PostgreSQL instance (see ``tests/conftest.py`` for the
transaction-rollback isolation strategy) through FastAPI's ``TestClient``,
exercising the actual router -> service -> repository -> database stack, and
-- for ``/progress/summary`` -- the ``ProgressAnalyzer`` -> (mock, per the
default test environment's ``AI_PROVIDER=mock``) ``LLMProvider`` as well:
create a goal, log several progress entries linked to it, then request a
summary end to end. Mirrors ``test_recovery_api.py``/``test_goals_api.py``.
"""

from fastapi.testclient import TestClient

from app.models.user import User
from app.security.jwt import create_access_token

GOALS_PREFIX = "/api/v1/goals"
PROGRESS_PREFIX = "/api/v1/progress"


def _goal_payload(**overrides) -> dict:
    payload = {
        "goal_type": "weight_target",
        "description": "Lose 5kg",
        "target_metric_type": "body_weight",
        "target_value": "75.0",
        "target_unit": "kg",
        "start_date": "2026-01-01",
    }
    payload.update(overrides)
    return payload


def _entry_payload(**overrides) -> dict:
    payload = {
        "metric_type": "body_weight",
        "value": "80.0",
        "unit": "kg",
        "recorded_date": "2026-01-01",
    }
    payload.update(overrides)
    return payload


def test_full_progress_lifecycle_with_ai_summary(
    client: TestClient, auth_headers: dict[str, str]
) -> None:
    # 1. Create a goal to link entries to.
    goal_response = client.post(GOALS_PREFIX, json=_goal_payload(), headers=auth_headers)
    assert goal_response.status_code == 201, goal_response.text
    goal_id = goal_response.json()["id"]

    # 2. Log a decreasing weekly weight series, linked to the goal.
    weights_by_date = [
        ("2026-01-01", "88.0"),
        ("2026-01-08", "86.5"),
        ("2026-01-15", "85.0"),
        ("2026-01-22", "83.5"),
    ]
    entry_ids = []
    for recorded_date, value in weights_by_date:
        entry_response = client.post(
            PROGRESS_PREFIX,
            json=_entry_payload(recorded_date=recorded_date, value=value, goal_id=goal_id),
            headers=auth_headers,
        )
        assert entry_response.status_code == 201, entry_response.text
        entry_ids.append(entry_response.json()["id"])

    # 3. Entries show up in the caller's list, most recent first.
    list_response = client.get(PROGRESS_PREFIX, headers=auth_headers)
    assert list_response.status_code == 200
    items = list_response.json()["items"]
    assert [item["id"] for item in items[:4]] == list(reversed(entry_ids))

    # 4. Filtering by metric_type/goal_id works.
    filtered_response = client.get(
        PROGRESS_PREFIX,
        params={"metric_type": "body_weight", "goal_id": goal_id},
        headers=auth_headers,
    )
    assert filtered_response.json()["total"] == 4

    # 5. The AI-driven summary computes a real trend and an LLM-narrated insight.
    summary_response = client.get(
        f"{PROGRESS_PREFIX}/summary",
        params={
            "metric_type": "body_weight",
            "goal_id": goal_id,
            "date_from": "2026-01-01",
            "date_to": "2026-01-22",
        },
        headers=auth_headers,
    )
    assert summary_response.status_code == 200, summary_response.text
    summary = summary_response.json()
    assert summary["metric_type"] == "body_weight"
    assert summary["unit"] == "kg"
    assert summary["stats"]["trend_direction"] == "decreasing"
    assert float(summary["stats"]["slope_per_week"]) < 0
    assert summary["narrative_text"]  # non-empty, even under the mock provider
    assert summary["window_start"] == "2026-01-01"
    assert summary["window_end"] == "2026-01-22"


def test_progress_summary_requires_a_minimum_number_of_data_points(
    client: TestClient, auth_headers: dict[str, str]
) -> None:
    client.post(
        PROGRESS_PREFIX,
        json=_entry_payload(recorded_date="2026-01-01", value="80.0"),
        headers=auth_headers,
    )

    response = client.get(
        f"{PROGRESS_PREFIX}/summary",
        params={"metric_type": "body_weight", "date_from": "2026-01-01", "date_to": "2026-01-02"},
        headers=auth_headers,
    )
    assert response.status_code == 422


def test_progress_summary_rejects_a_goal_id_not_owned_by_the_caller(
    client: TestClient, auth_headers: dict[str, str], other_user: User
) -> None:
    other_headers = {"Authorization": f"Bearer {create_access_token(other_user.id)}"}
    other_goal_response = client.post(GOALS_PREFIX, json=_goal_payload(), headers=other_headers)
    other_goal_id = other_goal_response.json()["id"]

    response = client.get(
        f"{PROGRESS_PREFIX}/summary",
        params={"metric_type": "body_weight", "goal_id": other_goal_id},
        headers=auth_headers,
    )
    assert response.status_code == 400


def test_log_progress_entry_rejects_a_goal_id_not_owned_by_the_caller(
    client: TestClient, auth_headers: dict[str, str], other_user: User
) -> None:
    other_headers = {"Authorization": f"Bearer {create_access_token(other_user.id)}"}
    other_goal_response = client.post(GOALS_PREFIX, json=_goal_payload(), headers=other_headers)
    other_goal_id = other_goal_response.json()["id"]

    response = client.post(
        PROGRESS_PREFIX,
        json=_entry_payload(goal_id=other_goal_id),
        headers=auth_headers,
    )
    assert response.status_code == 400


def test_lift_pr_requires_an_exercise_id(client: TestClient, auth_headers: dict[str, str]) -> None:
    response = client.post(
        PROGRESS_PREFIX,
        json=_entry_payload(metric_type="lift_pr", unit="kg"),
        headers=auth_headers,
    )
    assert response.status_code == 422


def test_progress_entry_not_visible_to_other_users(
    client: TestClient, auth_headers: dict[str, str], other_user: User
) -> None:
    create_response = client.post(PROGRESS_PREFIX, json=_entry_payload(), headers=auth_headers)
    assert create_response.status_code == 201

    other_headers = {"Authorization": f"Bearer {create_access_token(other_user.id)}"}
    other_list_response = client.get(PROGRESS_PREFIX, headers=other_headers)
    assert other_list_response.json()["total"] == 0


def test_unauthenticated_request_is_rejected(client: TestClient) -> None:
    response = client.get(PROGRESS_PREFIX)
    assert response.status_code in (401, 403)
