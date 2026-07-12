"""Integration test for the full Workout Resolution Engine API flow.

Runs against the real PostgreSQL instance (see ``tests/conftest.py`` for
the transaction-rollback isolation strategy) through FastAPI's
``TestClient``. There is no HTTP endpoint yet for program authoring or
assignment (Sprint 3.2 scope), so the program/workout/assignment fixtures
are built directly against the database, mirroring how
``test_workout_logs_api.py``'s ``bench_press`` fixture seeds catalog data.
The resolution engine itself, and its interaction with the Workout
Execution API (``/workout-logs``), are exercised end to end through
FastAPI's real router -> service -> repository -> database stack:

resolve (training day) -> start -> resolve (in_progress) -> finish
    -> resolve (rest day) -> advance-rest-day
    -> resolve (training day, week 2) -> start -> skip
    -> resolve (program_complete) -> advance-rest-day rejected (409)
"""

import uuid

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.exercise import DifficultyLevel, Exercise, ExerciseCategory
from app.models.program import AssignmentStatus, Program, ProgramAssignment, ProgramDay, ProgramGoal, ProgramStatus
from app.models.user import User
from app.models.workout import Workout, WorkoutExercise
from app.security.jwt import create_access_token

RESOLUTION_PREFIX = "/api/v1/workout-resolution"
LOGS_PREFIX = "/api/v1/workout-logs"


@pytest.fixture()
def catalog_exercise(db_session: Session) -> Exercise:
    exercise = Exercise(
        name=f"Squat {uuid.uuid4().hex[:8]}",
        slug=f"squat-{uuid.uuid4().hex[:8]}",
        difficulty_level=DifficultyLevel.INTERMEDIATE,
        category=ExerciseCategory.COMPOUND,
    )
    db_session.add(exercise)
    db_session.commit()
    db_session.refresh(exercise)
    return exercise


def _make_workout(db_session: Session, catalog_exercise: Exercise, name: str) -> Workout:
    workout = Workout(name=name, slug=f"{name.lower().replace(' ', '-')}-{uuid.uuid4().hex[:8]}")
    db_session.add(workout)
    db_session.flush()
    db_session.add(
        WorkoutExercise(
            workout_id=workout.id,
            exercise_id=catalog_exercise.id,
            order_index=0,
            target_sets=3,
            target_reps_min=5,
            target_reps_max=8,
        )
    )
    db_session.commit()
    db_session.refresh(workout)
    return workout


@pytest.fixture()
def resolution_fixture(db_session: Session, test_user: User, catalog_exercise: Exercise):
    """Build a 2-week program (training/rest/training) with an active assignment.

    Week 1 day 1: training (``workout_a``). Week 1 day 2: rest (no
    workout). Week 2 day 1: training (``workout_b``) — the program's last
    scheduled day. The assignment's cursor starts at week 1, day 1.
    """
    workout_a = _make_workout(db_session, catalog_exercise, "Push Day A")
    workout_b = _make_workout(db_session, catalog_exercise, "Push Day B")

    program = Program(
        name=f"Resolution Test Program {uuid.uuid4().hex[:8]}",
        slug=f"resolution-test-{uuid.uuid4().hex[:8]}",
        duration_weeks=2,
        goal=ProgramGoal.HYPERTROPHY,
        difficulty_level=DifficultyLevel.INTERMEDIATE,
        status=ProgramStatus.PUBLISHED,
    )
    db_session.add(program)
    db_session.flush()

    day_1_1 = ProgramDay(
        program_id=program.id, week_number=1, day_number=1, workout_id=workout_a.id
    )
    day_1_2 = ProgramDay(program_id=program.id, week_number=1, day_number=2, workout_id=None)
    day_2_1 = ProgramDay(
        program_id=program.id, week_number=2, day_number=1, workout_id=workout_b.id
    )
    db_session.add_all([day_1_1, day_1_2, day_2_1])
    db_session.flush()

    assignment = ProgramAssignment(
        program_id=program.id,
        user_id=test_user.id,
        status=AssignmentStatus.ACTIVE,
        current_week_number=1,
        current_day_number=1,
        current_program_day_id=day_1_1.id,
    )
    db_session.add(assignment)
    db_session.commit()
    db_session.refresh(assignment)

    return {
        "program": program,
        "workout_a": workout_a,
        "workout_b": workout_b,
        "assignment": assignment,
    }


def test_full_resolution_lifecycle(
    client: TestClient, auth_headers: dict[str, str], resolution_fixture: dict
) -> None:
    workout_a = resolution_fixture["workout_a"]
    workout_b = resolution_fixture["workout_b"]
    assignment = resolution_fixture["assignment"]

    # 1. Resolves to week 1 day 1 — a training day for workout_a.
    preview = client.get(f"{RESOLUTION_PREFIX}/today", headers=auth_headers)
    assert preview.status_code == 200, preview.text
    body = preview.json()
    assert body["state"] == "training_day"
    assert body["week_number"] == 1
    assert body["day_number"] == 1
    assert body["workout"]["id"] == str(workout_a.id)
    assert body["today_log_status"] == "none"

    # 2. Start today's resolved workout, tied to the active assignment.
    start_response = client.post(
        f"{LOGS_PREFIX}/start",
        json={"workout_id": str(workout_a.id), "program_assignment_id": str(assignment.id)},
        headers=auth_headers,
    )
    assert start_response.status_code == 201, start_response.text
    workout_log_id = start_response.json()["id"]

    # 3. Preview now reports an in-progress session for today's slot.
    preview_in_progress = client.get(f"{RESOLUTION_PREFIX}/today", headers=auth_headers)
    assert preview_in_progress.json()["today_log_status"] == "in_progress"
    assert preview_in_progress.json()["active_workout_log_id"] == workout_log_id
    assert preview_in_progress.json()["week_number"] == 1
    assert preview_in_progress.json()["day_number"] == 1

    # 4. Finishing the session automatically advances the cursor to the
    #    next scheduled day — week 1 day 2, a rest day.
    finish_response = client.post(f"{LOGS_PREFIX}/{workout_log_id}/finish", json={}, headers=auth_headers)
    assert finish_response.status_code == 200, finish_response.text

    preview_rest = client.get(f"{RESOLUTION_PREFIX}/today", headers=auth_headers)
    assert preview_rest.status_code == 200
    rest_body = preview_rest.json()
    assert rest_body["state"] == "rest_day"
    assert rest_body["week_number"] == 1
    assert rest_body["day_number"] == 2
    assert rest_body["workout"] is None

    # A rest day has no WorkoutLog to finish/skip — the client-facing
    # advance action is the only way past it.
    advance_response = client.post(f"{RESOLUTION_PREFIX}/advance-rest-day", headers=auth_headers)
    assert advance_response.status_code == 200, advance_response.text
    advanced_body = advance_response.json()
    assert advanced_body["state"] == "training_day"
    assert advanced_body["week_number"] == 2
    assert advanced_body["day_number"] == 1
    assert advanced_body["workout"]["id"] == str(workout_b.id)

    # 5. Start and skip the program's final scheduled day — the cursor
    #    should become exhausted since there is nothing left to advance to.
    start_second_response = client.post(
        f"{LOGS_PREFIX}/start",
        json={"workout_id": str(workout_b.id), "program_assignment_id": str(assignment.id)},
        headers=auth_headers,
    )
    assert start_second_response.status_code == 201, start_second_response.text
    second_log_id = start_second_response.json()["id"]

    skip_response = client.post(f"{LOGS_PREFIX}/{second_log_id}/skip", headers=auth_headers)
    assert skip_response.status_code == 200, skip_response.text

    preview_complete = client.get(f"{RESOLUTION_PREFIX}/today", headers=auth_headers)
    assert preview_complete.status_code == 200
    assert preview_complete.json()["state"] == "program_complete"

    # advance-rest-day is rejected once the program is complete — there is
    # no rest day to advance past.
    rejected_advance = client.post(f"{RESOLUTION_PREFIX}/advance-rest-day", headers=auth_headers)
    assert rejected_advance.status_code == 409


def test_resolution_returns_no_active_program_state(
    client: TestClient, auth_headers: dict[str, str]
) -> None:
    response = client.get(f"{RESOLUTION_PREFIX}/today", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["state"] == "no_active_program"


def test_advance_rest_day_without_active_assignment_is_not_found(
    client: TestClient, auth_headers: dict[str, str]
) -> None:
    response = client.post(f"{RESOLUTION_PREFIX}/advance-rest-day", headers=auth_headers)
    assert response.status_code == 404


def test_resolution_unauthenticated_request_is_rejected(client: TestClient) -> None:
    response = client.get(f"{RESOLUTION_PREFIX}/today")
    assert response.status_code in (401, 403)
