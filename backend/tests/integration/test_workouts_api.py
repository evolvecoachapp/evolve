"""Integration test for the Workout template read API (``/api/v1/workouts``).

Runs against the real PostgreSQL instance (see ``tests/conftest.py`` for the
transaction-rollback isolation strategy) through FastAPI's ``TestClient``,
exercising the real router -> service -> repository -> database stack.
Fixtures build ``Workout``/``WorkoutExercise`` rows directly against the
database, mirroring ``test_workout_resolution_api.py``'s pattern (there is
no authoring HTTP API for workout templates yet — Sprint 6.3 scopes the
public API to this read surface).
"""

import uuid

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.equipment import Equipment
from app.models.exercise import DifficultyLevel, Exercise, ExerciseCategory
from app.models.exercise import ExerciseEquipment as ExerciseEquipmentLink
from app.models.exercise import ExerciseMuscleGroup as ExerciseMuscleGroupLink
from app.models.muscle_group import MuscleGroup
from app.models.program import Program
from app.models.workout import Workout, WorkoutExercise

API_PREFIX = "/api/v1/workouts"


@pytest.fixture()
def squat(db_session: Session) -> Exercise:
    """Persist a catalog exercise with a primary muscle group and required equipment."""
    muscle_group = MuscleGroup(
        name=f"Quadriceps {uuid.uuid4().hex[:8]}", slug=f"quadriceps-{uuid.uuid4().hex[:8]}"
    )
    equipment = Equipment(
        name=f"Barbell {uuid.uuid4().hex[:8]}", slug=f"barbell-{uuid.uuid4().hex[:8]}"
    )
    exercise = Exercise(
        name=f"Back Squat {uuid.uuid4().hex[:8]}",
        slug=f"back-squat-{uuid.uuid4().hex[:8]}",
        difficulty_level=DifficultyLevel.INTERMEDIATE,
        category=ExerciseCategory.COMPOUND,
    )
    db_session.add_all([muscle_group, equipment, exercise])
    db_session.flush()
    db_session.add(
        ExerciseMuscleGroupLink(
            exercise_id=exercise.id, muscle_group_id=muscle_group.id, is_primary=True
        )
    )
    db_session.add(
        ExerciseEquipmentLink(
            exercise_id=exercise.id, equipment_id=equipment.id, is_required=True
        )
    )
    db_session.commit()
    db_session.refresh(exercise)
    return exercise


@pytest.fixture()
def leg_day(db_session: Session, squat: Exercise) -> Workout:
    workout = Workout(
        name=f"Leg Day {uuid.uuid4().hex[:8]}",
        slug=f"leg-day-{uuid.uuid4().hex[:8]}",
        estimated_duration_minutes=60,
    )
    db_session.add(workout)
    db_session.flush()
    db_session.add(
        WorkoutExercise(
            workout_id=workout.id,
            exercise_id=squat.id,
            order_index=0,
            target_sets=4,
            target_reps_min=6,
            target_reps_max=10,
            rest_seconds=120,
        )
    )
    db_session.commit()
    db_session.refresh(workout)
    return workout


def test_get_workout_by_id_embeds_exercise_catalog_ref(
    client: TestClient, auth_headers: dict[str, str], leg_day: Workout, squat: Exercise
) -> None:
    response = client.get(f"{API_PREFIX}/{leg_day.id}", headers=auth_headers)
    assert response.status_code == 200, response.text
    body = response.json()

    assert body["id"] == str(leg_day.id)
    assert body["is_active"] is True
    assert len(body["exercises"]) == 1

    line_item = body["exercises"][0]
    assert line_item["target_sets"] == 4
    assert line_item["exercise"]["id"] == str(squat.id)
    assert line_item["exercise"]["primary_muscle_group"] is not None
    assert len(line_item["exercise"]["equipment_slugs"]) == 1


def test_get_workout_by_slug(
    client: TestClient, auth_headers: dict[str, str], leg_day: Workout
) -> None:
    response = client.get(f"{API_PREFIX}/{leg_day.slug}", headers=auth_headers)
    assert response.status_code == 200, response.text
    assert response.json()["id"] == str(leg_day.id)


def test_get_workout_not_found(client: TestClient, auth_headers: dict[str, str]) -> None:
    response = client.get(f"{API_PREFIX}/{uuid.uuid4()}", headers=auth_headers)
    assert response.status_code == 404


def test_list_workouts_is_paginated_and_searchable(
    client: TestClient, auth_headers: dict[str, str], leg_day: Workout
) -> None:
    response = client.get(f"{API_PREFIX}?q={leg_day.name}", headers=auth_headers)
    assert response.status_code == 200, response.text
    body = response.json()
    assert body["total"] >= 1
    assert any(item["id"] == str(leg_day.id) for item in body["items"])


def test_workouts_unauthenticated_request_is_rejected(client: TestClient) -> None:
    response = client.get(API_PREFIX)
    assert response.status_code in (401, 403)


def test_get_current_workout_returns_resolution_preview(
    client: TestClient, auth_headers: dict[str, str], default_program: Program
) -> None:
    response = client.get(f"{API_PREFIX}/current", headers=auth_headers)
    assert response.status_code == 200, response.text
    body = response.json()
    assert body["state"] == "training_day"


def test_start_workout_session_alias(
    client: TestClient, auth_headers: dict[str, str], leg_day: Workout
) -> None:
    start_response = client.post(
        f"{API_PREFIX}/session",
        json={"workout_id": str(leg_day.id)},
        headers=auth_headers,
    )
    assert start_response.status_code == 201, start_response.text
    session = start_response.json()
    assert session["status"] == "in_progress"
    assert len(session["exercises"]) == 1

    finish_response = client.patch(
        f"{API_PREFIX}/session/{session['id']}",
        json={"action": "finish", "notes": "Solid session"},
        headers=auth_headers,
    )
    assert finish_response.status_code == 200, finish_response.text
    assert finish_response.json()["status"] == "completed"
    assert finish_response.json()["notes"] == "Solid session"


def test_patch_workout_session_notes_only(
    client: TestClient, auth_headers: dict[str, str]
) -> None:
    start_response = client.post(f"{API_PREFIX}/session", json={}, headers=auth_headers)
    session_id = start_response.json()["id"]

    patch_response = client.patch(
        f"{API_PREFIX}/session/{session_id}",
        json={"notes": "Feeling strong today"},
        headers=auth_headers,
    )
    assert patch_response.status_code == 200, patch_response.text
    assert patch_response.json()["notes"] == "Feeling strong today"
    assert patch_response.json()["status"] == "in_progress"

    client.patch(
        f"{API_PREFIX}/session/{session_id}",
        json={"action": "skip"},
        headers=auth_headers,
    )
