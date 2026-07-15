"""Integration test for the full Workout Execution API lifecycle.

Runs against the real PostgreSQL instance (see ``tests/conftest.py`` for
the transaction-rollback isolation strategy) through FastAPI's
``TestClient``, exercising the actual router -> service -> repository ->
database stack end to end: start -> log exercises/sets -> edit/delete a
set -> finish -> review history/detail -> skip a second session ->
ownership enforcement across users.
"""

import uuid

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.exercise import DifficultyLevel, Exercise, ExerciseCategory
from app.models.user import User
from app.security.jwt import create_access_token

API_PREFIX = "/api/v1/workout-logs"


@pytest.fixture()
def bench_press(db_session: Session) -> Exercise:
    """Persist a single catalog exercise for use as a logging target."""
    exercise = Exercise(
        name=f"Bench Press {uuid.uuid4().hex[:8]}",
        slug=f"bench-press-{uuid.uuid4().hex[:8]}",
        difficulty_level=DifficultyLevel.INTERMEDIATE,
        category=ExerciseCategory.COMPOUND,
    )
    db_session.add(exercise)
    db_session.commit()
    db_session.refresh(exercise)
    return exercise


def test_full_workout_log_lifecycle(
    client: TestClient, auth_headers: dict[str, str], bench_press: Exercise
) -> None:
    # 1. Start an ad-hoc session -> IN_PROGRESS, no exercises yet.
    start_response = client.post(f"{API_PREFIX}/start", json={}, headers=auth_headers)
    assert start_response.status_code == 201, start_response.text
    workout_log = start_response.json()
    assert workout_log["status"] == "in_progress"
    assert workout_log["started_at"] is not None
    assert workout_log["exercises"] == []
    workout_log_id = workout_log["id"]

    # 2. Starting a second session while one is active is a conflict.
    conflict_response = client.post(f"{API_PREFIX}/start", json={}, headers=auth_headers)
    assert conflict_response.status_code == 409

    # 3. The active-session lookup finds it.
    active_response = client.get(f"{API_PREFIX}/active", headers=auth_headers)
    assert active_response.status_code == 200
    assert active_response.json()["id"] == workout_log_id

    # 4. Add an ad-hoc exercise instance.
    add_exercise_response = client.post(
        f"{API_PREFIX}/{workout_log_id}/exercises",
        json={"exercise_id": str(bench_press.id)},
        headers=auth_headers,
    )
    assert add_exercise_response.status_code == 201, add_exercise_response.text
    log_exercise = add_exercise_response.json()
    assert log_exercise["exercise_name_snapshot"] == bench_press.name
    assert log_exercise["order_index"] == 0
    log_exercise_id = log_exercise["id"]

    # 5. Log two sets; set_number is server-assigned and sequential.
    sets_url = f"{API_PREFIX}/{workout_log_id}/exercises/{log_exercise_id}/sets"
    first_set = client.post(
        sets_url, json={"weight_kg": "60.00", "reps": 10}, headers=auth_headers
    )
    assert first_set.status_code == 201, first_set.text
    assert first_set.json()["set_number"] == 1

    second_set = client.post(
        sets_url, json={"weight_kg": "65.00", "reps": 8, "is_warmup": False}, headers=auth_headers
    )
    assert second_set.status_code == 201
    assert second_set.json()["set_number"] == 2
    second_set_id = second_set.json()["id"]

    # A set with no weight/reps/duration is rejected at the schema boundary.
    invalid_set = client.post(sets_url, json={"is_warmup": True}, headers=auth_headers)
    assert invalid_set.status_code == 422

    # 6. Edit the second set while still in progress.
    set_url = f"{sets_url}/{second_set_id}"
    update_response = client.patch(set_url, json={"reps": 9}, headers=auth_headers)
    assert update_response.status_code == 200
    assert update_response.json()["reps"] == 9

    # 7. Delete the second set.
    delete_response = client.delete(set_url, headers=auth_headers)
    assert delete_response.status_code == 204

    # 8. Finish the session; duration is derived from started_at/completed_at.
    finish_response = client.post(f"{API_PREFIX}/{workout_log_id}/finish", json={}, headers=auth_headers)
    assert finish_response.status_code == 200, finish_response.text
    finished = finish_response.json()
    assert finished["status"] == "completed"
    assert finished["completed_at"] is not None
    assert finished["duration_actual_minutes"] is not None
    assert len(finished["exercises"][0]["sets"]) == 1

    # Finishing again is a conflict (no longer IN_PROGRESS).
    already_finished_response = client.post(
        f"{API_PREFIX}/{workout_log_id}/finish", json={}, headers=auth_headers
    )
    assert already_finished_response.status_code == 409

    # 9. Still within the default 24h edit window: corrections are allowed.
    remaining_set_id = finished["exercises"][0]["sets"][0]["id"]
    post_completion_edit = client.patch(
        f"{sets_url}/{remaining_set_id}", json={"reps": 11}, headers=auth_headers
    )
    assert post_completion_edit.status_code == 200
    assert post_completion_edit.json()["reps"] == 11

    # 10. No longer possible to add exercises or sets once completed.
    locked_add_exercise = client.post(
        f"{API_PREFIX}/{workout_log_id}/exercises",
        json={"exercise_id": str(bench_press.id)},
        headers=auth_headers,
    )
    assert locked_add_exercise.status_code == 409

    # 11. History includes the finished session.
    history_response = client.get(f"{API_PREFIX}?status=completed", headers=auth_headers)
    assert history_response.status_code == 200
    history = history_response.json()
    assert history["total"] >= 1
    assert any(item["id"] == workout_log_id for item in history["items"])

    # 12. Detail view still reflects the finished session with its exercise.
    detail_response = client.get(f"{API_PREFIX}/{workout_log_id}", headers=auth_headers)
    assert detail_response.status_code == 200
    assert detail_response.json()["status"] == "completed"


def test_skip_workout(client: TestClient, auth_headers: dict[str, str]) -> None:
    start_response = client.post(f"{API_PREFIX}/start", json={}, headers=auth_headers)
    workout_log_id = start_response.json()["id"]

    skip_response = client.post(f"{API_PREFIX}/{workout_log_id}/skip", headers=auth_headers)
    assert skip_response.status_code == 200
    assert skip_response.json()["status"] == "skipped"

    # A brand-new session can now be started (no active session remains).
    second_start = client.post(f"{API_PREFIX}/start", json={}, headers=auth_headers)
    assert second_start.status_code == 201


def test_skip_exercise(
    client: TestClient, auth_headers: dict[str, str], bench_press: Exercise
) -> None:
    start_response = client.post(f"{API_PREFIX}/start", json={}, headers=auth_headers)
    workout_log_id = start_response.json()["id"]

    add_exercise_response = client.post(
        f"{API_PREFIX}/{workout_log_id}/exercises",
        json={"exercise_id": str(bench_press.id)},
        headers=auth_headers,
    )
    log_exercise_id = add_exercise_response.json()["id"]
    assert add_exercise_response.json()["skipped"] is False
    assert add_exercise_response.json()["exercise"]["id"] == str(bench_press.id)

    skip_response = client.post(
        f"{API_PREFIX}/{workout_log_id}/exercises/{log_exercise_id}/skip", headers=auth_headers
    )
    assert skip_response.status_code == 200, skip_response.text
    assert skip_response.json()["skipped"] is True

    # Reflected in the session detail view too.
    detail_response = client.get(f"{API_PREFIX}/{workout_log_id}", headers=auth_headers)
    assert detail_response.json()["exercises"][0]["skipped"] is True


def test_skip_exercise_not_found_for_mismatched_log(
    client: TestClient, auth_headers: dict[str, str], bench_press: Exercise
) -> None:
    first_start = client.post(f"{API_PREFIX}/start", json={}, headers=auth_headers)
    first_log_id = first_start.json()["id"]
    add_exercise_response = client.post(
        f"{API_PREFIX}/{first_log_id}/exercises",
        json={"exercise_id": str(bench_press.id)},
        headers=auth_headers,
    )
    log_exercise_id = add_exercise_response.json()["id"]
    client.post(f"{API_PREFIX}/{first_log_id}/skip", headers=auth_headers)

    second_start = client.post(f"{API_PREFIX}/start", json={}, headers=auth_headers)
    second_log_id = second_start.json()["id"]

    response = client.post(
        f"{API_PREFIX}/{second_log_id}/exercises/{log_exercise_id}/skip", headers=auth_headers
    )
    assert response.status_code == 404


def test_workout_log_not_visible_to_other_users(
    client: TestClient, auth_headers: dict[str, str], other_user: User
) -> None:
    start_response = client.post(f"{API_PREFIX}/start", json={}, headers=auth_headers)
    workout_log_id = start_response.json()["id"]

    other_headers = {"Authorization": f"Bearer {create_access_token(other_user.id)}"}
    forbidden_response = client.get(f"{API_PREFIX}/{workout_log_id}", headers=other_headers)
    assert forbidden_response.status_code == 404


def test_unauthenticated_request_is_rejected(client: TestClient) -> None:
    response = client.post(f"{API_PREFIX}/start", json={})
    assert response.status_code in (401, 403)
