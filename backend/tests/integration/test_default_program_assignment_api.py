"""Integration tests for Sprint 6.3.1 default program auto-assignment.

Exercises the ``GET /workout-resolution/today`` and ``GET /workouts/current``
first-access path: users without an active ``ProgramAssignment`` receive the
configured default beginner program automatically via
:meth:`~app.services.workout_service.WorkoutService.ensure_active_assignment`.
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.program import AssignmentStatus, Program, ProgramAssignment

RESOLUTION_PREFIX = "/api/v1/workout-resolution"
WORKOUTS_PREFIX = "/api/v1/workouts"


def test_today_auto_assigns_default_program_when_user_has_none(
    client: TestClient,
    auth_headers: dict[str, str],
    db_session: Session,
    test_user,
    default_program: Program,
) -> None:
    assert (
        db_session.query(ProgramAssignment)
        .filter(
            ProgramAssignment.user_id == test_user.id,
            ProgramAssignment.status == AssignmentStatus.ACTIVE,
        )
        .first()
        is None
    )

    response = client.get(f"{RESOLUTION_PREFIX}/today", headers=auth_headers)
    assert response.status_code == 200, response.text
    body = response.json()
    assert body["state"] == "training_day"
    assert body["assignment_id"] is not None
    assert body["workout"] is not None

    assignment = (
        db_session.query(ProgramAssignment)
        .filter(
            ProgramAssignment.user_id == test_user.id,
            ProgramAssignment.status == AssignmentStatus.ACTIVE,
        )
        .first()
    )
    assert assignment is not None
    assert assignment.program_id == default_program.id


def test_workouts_current_alias_auto_assigns_default_program(
    client: TestClient,
    auth_headers: dict[str, str],
    default_program: Program,
) -> None:
    response = client.get(f"{WORKOUTS_PREFIX}/current", headers=auth_headers)
    assert response.status_code == 200, response.text
    assert response.json()["state"] == "training_day"
    assert response.json()["program"]["id"] == str(default_program.id)


def test_today_returns_503_when_default_program_missing(
    client: TestClient,
    auth_headers: dict[str, str],
) -> None:
    response = client.get(f"{RESOLUTION_PREFIX}/today", headers=auth_headers)
    assert response.status_code == 503, response.text
    assert settings.default_program_slug in response.json()["detail"]
