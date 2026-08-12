"""Integration tests for Admin feature-management endpoints (Sprint 39.2).

Covers superuser authorization, happy paths, validation failures, not-found,
and destructive deactivate/archive protection for catalog mutations.
User-owned domains (nutrition, recovery, goals, progress, coach, workout
logs) are exercised as read-only admin operations over existing services.
"""

from datetime import date, datetime, timezone
from decimal import Decimal

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.user import ActivityLevel, Gender, Goal, User

API_PREFIX = "/api/v1/admin"
UNKNOWN_ID = "00000000-0000-0000-0000-000000000000"


def _auth_denied(client: TestClient, method: str, path: str, auth_headers: dict[str, str]) -> None:
    unauthenticated = getattr(client, method)(path)
    assert unauthenticated.status_code == 403
    denied = getattr(client, method)(path, headers=auth_headers)
    assert denied.status_code == 403
    assert denied.json()["detail"] == "Administrator access required."


def _create_muscle_group(client: TestClient, headers: dict[str, str], suffix: str) -> dict:
    response = client.post(
        f"{API_PREFIX}/muscle-groups",
        json={
            "name": f"Quads {suffix}",
            "slug": f"quads-{suffix.lower()}",
            "description": "Primary movers",
        },
        headers=headers,
    )
    assert response.status_code == 201, response.text
    return response.json()


def _create_exercise(client: TestClient, headers: dict[str, str], muscle_group_id: str, name: str) -> dict:
    response = client.post(
        f"{API_PREFIX}/exercises",
        json={
            "name": name,
            "difficulty_level": "beginner",
            "category": "compound",
            "muscle_groups": [{"muscle_group_id": muscle_group_id, "is_primary": True}],
            "equipment": [],
        },
        headers=headers,
    )
    assert response.status_code == 201, response.text
    return response.json()


def test_admin_exercises_require_superuser(
    client: TestClient, auth_headers: dict[str, str]
) -> None:
    _auth_denied(client, "get", f"{API_PREFIX}/exercises", auth_headers)


def test_admin_exercise_crud_happy_path_and_validation(
    client: TestClient, superuser_headers: dict[str, str]
) -> None:
    muscle = _create_muscle_group(client, superuser_headers, "ex01")
    created = _create_exercise(
        client, superuser_headers, muscle["id"], "Admin Goblet Squat"
    )
    assert created["is_active"] is True
    assert created["muscle_groups"][0]["is_primary"] is True

    listed = client.get(
        f"{API_PREFIX}/exercises",
        params={"q": "Admin Goblet"},
        headers=superuser_headers,
    )
    assert listed.status_code == 200
    assert any(item["id"] == created["id"] for item in listed.json()["items"])

    detail = client.get(f"{API_PREFIX}/exercises/{created['id']}", headers=superuser_headers)
    assert detail.status_code == 200
    assert detail.json()["name"] == "Admin Goblet Squat"

    updated = client.patch(
        f"{API_PREFIX}/exercises/{created['id']}",
        json={"description": "A goblet squat for beginners."},
        headers=superuser_headers,
    )
    assert updated.status_code == 200
    assert updated.json()["description"] == "A goblet squat for beginners."

    invalid = client.post(
        f"{API_PREFIX}/exercises",
        json={
            "name": "Broken",
            "difficulty_level": "beginner",
            "category": "compound",
            "muscle_groups": [],
            "equipment": [],
        },
        headers=superuser_headers,
    )
    assert invalid.status_code == 422

    missing = client.get(f"{API_PREFIX}/exercises/{UNKNOWN_ID}", headers=superuser_headers)
    assert missing.status_code == 404
    assert missing.json()["detail"] == "Exercise not found."

    deactivated = client.post(
        f"{API_PREFIX}/exercises/{created['id']}/deactivate",
        headers=superuser_headers,
    )
    assert deactivated.status_code == 200
    assert deactivated.json()["is_active"] is False

    still_visible = client.get(
        f"{API_PREFIX}/exercises/{created['id']}", headers=superuser_headers
    )
    assert still_visible.json()["is_active"] is False


def test_admin_programs_and_workouts_happy_path(
    client: TestClient, superuser_headers: dict[str, str]
) -> None:
    muscle = _create_muscle_group(client, superuser_headers, "pw01")
    exercise = _create_exercise(client, superuser_headers, muscle["id"], "Admin Press")

    workout = client.post(
        f"{API_PREFIX}/workouts",
        json={
            "name": "Admin Full Body",
            "estimated_duration_minutes": 45,
            "exercises": [
                {
                    "exercise_id": exercise["id"],
                    "order_index": 0,
                    "target_sets": 3,
                    "target_reps_min": 8,
                    "target_reps_max": 12,
                    "rest_seconds": 90,
                }
            ],
        },
        headers=superuser_headers,
    )
    assert workout.status_code == 201, workout.text
    workout_id = workout.json()["id"]

    listed_workouts = client.get(f"{API_PREFIX}/workouts", headers=superuser_headers)
    assert listed_workouts.status_code == 200
    assert any(item["id"] == workout_id for item in listed_workouts.json()["items"])

    program = client.post(
        f"{API_PREFIX}/programs",
        json={
            "name": "Admin Beginner Block",
            "duration_weeks": 4,
            "goal": "general_fitness",
            "difficulty_level": "beginner",
        },
        headers=superuser_headers,
    )
    assert program.status_code == 201, program.text
    program_id = program.json()["id"]
    assert program.json()["status"] == "draft"

    day = client.post(
        f"{API_PREFIX}/programs/{program_id}/days",
        json={"week_number": 1, "day_number": 1, "label": "Day A", "workout_id": workout_id},
        headers=superuser_headers,
    )
    assert day.status_code == 201, day.text

    published = client.post(
        f"{API_PREFIX}/programs/{program_id}/publish", headers=superuser_headers
    )
    assert published.status_code == 200
    assert published.json()["status"] == "published"

    detail = client.get(f"{API_PREFIX}/programs/{program_id}", headers=superuser_headers)
    assert detail.status_code == 200
    payload = detail.json()
    assert payload["program"]["id"] == program_id
    assert len(payload["days"]) == 1
    assert payload["assignments"] == []

    invalid_program = client.post(
        f"{API_PREFIX}/programs",
        json={"name": "X", "duration_weeks": 4, "goal": "general_fitness", "difficulty_level": "beginner"},
        headers=superuser_headers,
    )
    assert invalid_program.status_code == 422

    missing_program = client.get(f"{API_PREFIX}/programs/{UNKNOWN_ID}", headers=superuser_headers)
    assert missing_program.status_code == 404

    archived = client.post(
        f"{API_PREFIX}/programs/{program_id}/archive", headers=superuser_headers
    )
    assert archived.status_code == 200
    assert archived.json()["status"] == "archived"

    deactivated_workout = client.post(
        f"{API_PREFIX}/workouts/{workout_id}/deactivate", headers=superuser_headers
    )
    assert deactivated_workout.status_code == 200
    assert deactivated_workout.json()["is_active"] is False


def test_admin_workout_logs_read_only(
    client: TestClient,
    test_user: User,
    auth_headers: dict[str, str],
    superuser_headers: dict[str, str],
) -> None:
    started = client.post("/api/v1/workout-logs/start", json={}, headers=auth_headers)
    assert started.status_code == 201, started.text
    log_id = started.json()["id"]

    listed = client.get(
        f"{API_PREFIX}/workout-logs",
        params={"user_id": str(test_user.id)},
        headers=superuser_headers,
    )
    assert listed.status_code == 200
    assert any(item["id"] == log_id for item in listed.json()["items"])
    assert all("user_id" in item for item in listed.json()["items"])

    detail = client.get(f"{API_PREFIX}/workout-logs/{log_id}", headers=superuser_headers)
    assert detail.status_code == 200
    assert detail.json()["user_id"] == str(test_user.id)
    assert detail.json()["status"] == "in_progress"

    missing = client.get(f"{API_PREFIX}/workout-logs/{UNKNOWN_ID}", headers=superuser_headers)
    assert missing.status_code == 404


def test_admin_nutrition_recovery_goals_progress_coach_reads(
    client: TestClient,
    test_user: User,
    auth_headers: dict[str, str],
    superuser_headers: dict[str, str],
    db_session: Session,
) -> None:
    meal = client.post(
        "/api/v1/nutrition/meals",
        json={
            "name": "Admin Oats",
            "meal_type": "breakfast",
            "calories": "400.00",
            "protein_g": "20.00",
            "carbs_g": "50.00",
            "fat_g": "10.00",
        },
        headers=auth_headers,
    )
    assert meal.status_code == 201, meal.text
    meal_id = meal.json()["id"]

    meal_log = client.post(
        "/api/v1/nutrition/logs",
        json={"meal_id": meal_id, "consumed_at": datetime.now(timezone.utc).isoformat()},
        headers=auth_headers,
    )
    assert meal_log.status_code == 201, meal_log.text

    check_in = client.post(
        "/api/v1/recovery/check-ins",
        json={
            "checkin_date": "2026-01-02",
            "sleep_hours": "8.00",
            "sleep_quality": 4,
            "soreness": 2,
            "fatigue": 2,
        },
        headers=auth_headers,
    )
    assert check_in.status_code == 201, check_in.text

    goal = client.post(
        "/api/v1/goals",
        json={
            "goal_type": "weight_target",
            "description": "Admin-visible goal",
            "target_metric_type": "body_weight",
            "target_value": "75.0",
            "target_unit": "kg",
            "start_date": "2026-01-01",
        },
        headers=auth_headers,
    )
    assert goal.status_code == 201, goal.text

    progress = client.post(
        "/api/v1/progress",
        json={
            "metric_type": "body_weight",
            "value": "80.0",
            "unit": "kg",
            "recorded_date": "2026-01-01",
        },
        headers=auth_headers,
    )
    assert progress.status_code == 201, progress.text

    coach = client.post(
        "/api/v1/coach/messages",
        json={"message": "How's it going?"},
        headers=auth_headers,
    )
    assert coach.status_code == 200, coach.text
    conversation_id = coach.json()["conversation_id"]

    meals = client.get(f"{API_PREFIX}/meals", headers=superuser_headers)
    assert meals.status_code == 200
    assert any(item["id"] == meal_id for item in meals.json()["items"])

    meal_detail = client.get(f"{API_PREFIX}/meals/{meal_id}", headers=superuser_headers)
    assert meal_detail.status_code == 200

    logs = client.get(
        f"{API_PREFIX}/meal-logs",
        params={"user_id": str(test_user.id)},
        headers=superuser_headers,
    )
    assert logs.status_code == 200
    assert logs.json()["total"] >= 1

    test_user.birth_date = date(1996, 1, 1)
    test_user.gender = Gender.MALE
    test_user.height_cm = Decimal("175")
    test_user.current_weight_kg = Decimal("70")
    test_user.activity_level = ActivityLevel.SEDENTARY
    test_user.goal = Goal.MAINTAIN_WEIGHT
    db_session.commit()

    targets = client.get(
        f"{API_PREFIX}/nutrition/targets",
        params={"user_id": str(test_user.id), "for_date": "2026-01-02"},
        headers=superuser_headers,
    )
    assert targets.status_code == 200, targets.text
    assert "targets" in targets.json()

    check_ins = client.get(f"{API_PREFIX}/recovery/check-ins", headers=superuser_headers)
    assert check_ins.status_code == 200
    assert any(item["id"] == check_in.json()["id"] for item in check_ins.json()["items"])

    readiness = client.get(
        f"{API_PREFIX}/recovery/readiness",
        params={"user_id": str(test_user.id), "for_date": "2026-01-02"},
        headers=superuser_headers,
    )
    assert readiness.status_code == 200, readiness.text

    goals = client.get(f"{API_PREFIX}/goals", headers=superuser_headers)
    assert goals.status_code == 200
    assert any(item["id"] == goal.json()["id"] for item in goals.json()["items"])
    assert goals.json()["items"][0]["status"] in {"active", "paused", "achieved", "abandoned"}

    progress_list = client.get(f"{API_PREFIX}/progress", headers=superuser_headers)
    assert progress_list.status_code == 200
    assert any(item["id"] == progress.json()["id"] for item in progress_list.json()["items"])

    conversations = client.get(f"{API_PREFIX}/conversations", headers=superuser_headers)
    assert conversations.status_code == 200
    assert any(item["id"] == conversation_id for item in conversations.json()["items"])

    messages = client.get(
        f"{API_PREFIX}/conversations/{conversation_id}/messages",
        headers=superuser_headers,
    )
    assert messages.status_code == 200
    assert messages.json()["total"] >= 1

    missing_meal = client.get(f"{API_PREFIX}/meals/{UNKNOWN_ID}", headers=superuser_headers)
    assert missing_meal.status_code == 404

    missing_goal = client.get(f"{API_PREFIX}/goals/{UNKNOWN_ID}", headers=superuser_headers)
    assert missing_goal.status_code == 404

    missing_conversation = client.get(
        f"{API_PREFIX}/conversations/{UNKNOWN_ID}", headers=superuser_headers
    )
    assert missing_conversation.status_code == 404


def test_admin_feature_endpoints_deny_normal_user(
    client: TestClient, auth_headers: dict[str, str]
) -> None:
    for path in (
        "/programs",
        "/workouts",
        "/workout-logs",
        "/meals",
        "/meal-logs",
        "/recovery/check-ins",
        "/goals",
        "/progress",
        "/conversations",
        "/muscle-groups",
        "/equipment",
    ):
        response = client.get(f"{API_PREFIX}{path}", headers=auth_headers)
        assert response.status_code == 403, path
