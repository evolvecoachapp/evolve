"""Unit tests for :class:`~app.services.workout_service.WorkoutService`.

Scoped to this sprint's change to :meth:`WorkoutService.assign_program` —
Workout Resolution Engine progress-cursor initialization and the "program
must have at least one scheduled day" validation. Every repository
dependency is mocked; see ``tests/integration/test_workout_resolution_api.py``
for the full assignment -> resolution flow against a real database.
"""

import uuid

import pytest

from app.models.program import Program, ProgramDay, ProgramStatus
from app.services.workout_service import ProgramNotAssignableError, WorkoutService

USER_ID = uuid.uuid4()


@pytest.fixture()
def program_repository(mocker):
    return mocker.Mock()


@pytest.fixture()
def workout_repository(mocker):
    return mocker.Mock()


@pytest.fixture()
def service(program_repository, workout_repository):
    return WorkoutService(program_repository, workout_repository)


def _make_program(*, status: ProgramStatus = ProgramStatus.PUBLISHED) -> Program:
    return Program(
        id=uuid.uuid4(),
        name="PPL",
        slug="ppl",
        duration_weeks=4,
        status=status,
    )


def test_assign_program_initializes_cursor_to_first_scheduled_day(
    service, program_repository
):
    program = _make_program()
    first_day = ProgramDay(
        id=uuid.uuid4(), program_id=program.id, week_number=2, day_number=3
    )
    program_repository.get_by_id.return_value = program
    program_repository.get_first_day.return_value = first_day
    program_repository.get_active_assignment_for_user.return_value = None
    program_repository.create_assignment.side_effect = lambda a: a

    created = service.assign_program(USER_ID, program.id)

    assert created.current_week_number == 2
    assert created.current_day_number == 3
    assert created.current_program_day_id == first_day.id
    program_repository.db.commit.assert_called_once()


def test_assign_program_raises_when_program_has_no_scheduled_days(
    service, program_repository
):
    program = _make_program()
    program_repository.get_by_id.return_value = program
    program_repository.get_first_day.return_value = None

    with pytest.raises(ProgramNotAssignableError):
        service.assign_program(USER_ID, program.id)

    program_repository.create_assignment.assert_not_called()


def test_assign_program_raises_when_program_not_published(service, program_repository):
    program = _make_program(status=ProgramStatus.DRAFT)
    program_repository.get_by_id.return_value = program

    with pytest.raises(ProgramNotAssignableError):
        service.assign_program(USER_ID, program.id)

    program_repository.get_first_day.assert_not_called()
