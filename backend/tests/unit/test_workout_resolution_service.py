"""Unit tests for :class:`~app.services.workout_resolution_service.WorkoutResolutionService`.

Every repository dependency is mocked — these tests exercise the
resolution/advance rules (state selection, cursor advancement,
exhaustion, guards) in isolation, with no database involved. See
``tests/integration/test_workout_resolution_api.py`` for a full
end-to-end flow against a real PostgreSQL instance.
"""

import uuid

import pytest

from app.models.program import AssignmentStatus, Program, ProgramAssignment, ProgramDay
from app.models.workout import Workout
from app.models.workout_log import WorkoutLog, WorkoutLogStatus
from app.schemas.workout_resolution import TodayLogStatus, WorkoutResolutionState
from app.services.workout_resolution_service import (
    NoActiveAssignmentError,
    NotARestDayError,
    WorkoutResolutionService,
)

USER_ID = uuid.uuid4()
OTHER_USER_ID = uuid.uuid4()


@pytest.fixture()
def program_repository(mocker):
    return mocker.Mock()


@pytest.fixture()
def workout_repository(mocker):
    return mocker.Mock()


@pytest.fixture()
def workout_log_repository(mocker):
    repo = mocker.Mock()
    repo.get_active_for_user.return_value = None
    repo.list_for_user.return_value = []
    return repo


@pytest.fixture()
def service(program_repository, workout_repository, workout_log_repository):
    return WorkoutResolutionService(program_repository, workout_repository, workout_log_repository)


def _make_program(*, duration_weeks: int = 4) -> Program:
    return Program(id=uuid.uuid4(), name="PPL", slug="ppl", duration_weeks=duration_weeks)


def _make_assignment(
    *,
    program: Program,
    user_id: uuid.UUID = USER_ID,
    status: AssignmentStatus = AssignmentStatus.ACTIVE,
    current_week_number: int = 1,
    current_day_number: int = 1,
    cursor_exhausted: bool = False,
) -> ProgramAssignment:
    return ProgramAssignment(
        id=uuid.uuid4(),
        program_id=program.id,
        user_id=user_id,
        status=status,
        current_week_number=current_week_number,
        current_day_number=current_day_number,
        cursor_exhausted=cursor_exhausted,
    )


def _make_day(
    *, program: Program, week_number: int = 1, day_number: int = 1, workout_id=None, label=None
) -> ProgramDay:
    return ProgramDay(
        id=uuid.uuid4(),
        program_id=program.id,
        week_number=week_number,
        day_number=day_number,
        workout_id=workout_id,
        label=label,
    )


# -- resolve_current --------------------------------------------------------------


def test_resolve_current_returns_no_active_program_when_no_assignment(
    service, program_repository
):
    program_repository.get_active_assignment_for_user.return_value = None

    result = service.resolve_current(USER_ID)

    assert result.state == WorkoutResolutionState.NO_ACTIVE_PROGRAM


def test_resolve_current_returns_program_complete_when_cursor_exhausted(
    service, program_repository
):
    program = _make_program()
    assignment = _make_assignment(program=program, cursor_exhausted=True)
    program_repository.get_active_assignment_for_user.return_value = assignment
    program_repository.get_by_id.return_value = program

    result = service.resolve_current(USER_ID)

    assert result.state == WorkoutResolutionState.PROGRAM_COMPLETE


def test_resolve_current_returns_rest_day_when_slot_has_no_workout(
    service, program_repository
):
    program = _make_program()
    assignment = _make_assignment(program=program)
    day = _make_day(program=program, workout_id=None, label="Rest")
    program_repository.get_active_assignment_for_user.return_value = assignment
    program_repository.get_by_id.return_value = program
    program_repository.get_day_at.return_value = day

    result = service.resolve_current(USER_ID)

    assert result.state == WorkoutResolutionState.REST_DAY
    assert result.program_day is day
    assert result.today_log_status == TodayLogStatus.NONE


def test_resolve_current_reports_completed_today_log_status_on_rest_day(
    service, program_repository, workout_log_repository
):
    """Finishing a training day advances the cursor onto rest; today's log stays visible."""
    program = _make_program()
    assignment = _make_assignment(program=program, current_week_number=1, current_day_number=2)
    day = _make_day(program=program, day_number=2, workout_id=None, label="Rest")
    completed_log = WorkoutLog(
        id=uuid.uuid4(),
        user_id=USER_ID,
        program_assignment_id=assignment.id,
        status=WorkoutLogStatus.COMPLETED,
    )
    program_repository.get_active_assignment_for_user.return_value = assignment
    program_repository.get_by_id.return_value = program
    program_repository.get_day_at.return_value = day
    workout_log_repository.get_active_for_user.return_value = None
    workout_log_repository.list_for_user.return_value = [completed_log]

    result = service.resolve_current(USER_ID)

    assert result.state == WorkoutResolutionState.REST_DAY
    assert result.today_log_status == TodayLogStatus.COMPLETED
    assert result.active_workout_log_id == completed_log.id
    workout_log_repository.list_for_user.assert_called_once()
    kwargs = workout_log_repository.list_for_user.call_args.kwargs
    assert kwargs["program_assignment_id"] == assignment.id


def test_resolve_current_returns_training_day_with_workout_loaded(
    service, program_repository, workout_repository
):
    program = _make_program()
    workout = Workout(id=uuid.uuid4(), name="Push Day", slug="push-day")
    day = _make_day(program=program, workout_id=workout.id)
    assignment = _make_assignment(program=program)
    program_repository.get_active_assignment_for_user.return_value = assignment
    program_repository.get_by_id.return_value = program
    program_repository.get_day_at.return_value = day
    workout_repository.get_by_id.return_value = workout

    result = service.resolve_current(USER_ID)

    assert result.state == WorkoutResolutionState.TRAINING_DAY
    assert result.workout is workout
    assert result.today_log_status == TodayLogStatus.NONE


def test_resolve_current_reports_in_progress_today_log_status(
    service, program_repository, workout_repository, workout_log_repository
):
    program = _make_program()
    workout = Workout(id=uuid.uuid4(), name="Push Day", slug="push-day")
    day = _make_day(program=program, workout_id=workout.id)
    assignment = _make_assignment(program=program)
    program_repository.get_active_assignment_for_user.return_value = assignment
    program_repository.get_by_id.return_value = program
    program_repository.get_day_at.return_value = day
    workout_repository.get_by_id.return_value = workout
    active_log = WorkoutLog(id=uuid.uuid4(), user_id=USER_ID, status=WorkoutLogStatus.IN_PROGRESS)
    workout_log_repository.get_active_for_user.return_value = active_log

    result = service.resolve_current(USER_ID)

    assert result.today_log_status == TodayLogStatus.IN_PROGRESS
    assert result.active_workout_log_id == active_log.id


def test_resolve_current_treats_missing_day_as_program_complete(
    service, program_repository
):
    program = _make_program()
    assignment = _make_assignment(program=program)
    program_repository.get_active_assignment_for_user.return_value = assignment
    program_repository.get_by_id.return_value = program
    program_repository.get_day_at.return_value = None

    result = service.resolve_current(USER_ID)

    assert result.state == WorkoutResolutionState.PROGRAM_COMPLETE


# -- advance_after_action ----------------------------------------------------------


def test_advance_after_action_moves_cursor_to_next_day(service, program_repository):
    program = _make_program()
    assignment = _make_assignment(program=program, current_week_number=1, current_day_number=1)
    next_day = _make_day(program=program, week_number=1, day_number=2)
    program_repository.get_assignment_by_id.return_value = assignment
    program_repository.get_by_id.return_value = program
    program_repository.get_next_day_after.return_value = next_day
    program_repository.update_assignment.side_effect = lambda a: a

    service.advance_after_action(USER_ID, assignment.id)

    assert assignment.current_week_number == 1
    assert assignment.current_day_number == 2
    assert assignment.current_program_day_id == next_day.id
    assert assignment.cursor_exhausted is False
    program_repository.db.commit.assert_called_once()


def test_advance_after_action_marks_exhausted_when_no_next_day(service, program_repository):
    program = _make_program()
    assignment = _make_assignment(program=program)
    program_repository.get_assignment_by_id.return_value = assignment
    program_repository.get_by_id.return_value = program
    program_repository.get_next_day_after.return_value = None
    program_repository.update_assignment.side_effect = lambda a: a

    service.advance_after_action(USER_ID, assignment.id)

    assert assignment.cursor_exhausted is True


def test_advance_after_action_is_noop_for_another_users_assignment(
    service, program_repository
):
    program = _make_program()
    assignment = _make_assignment(program=program, user_id=OTHER_USER_ID)
    program_repository.get_assignment_by_id.return_value = assignment

    service.advance_after_action(USER_ID, assignment.id)

    program_repository.get_next_day_after.assert_not_called()
    program_repository.db.commit.assert_not_called()


def test_advance_after_action_is_noop_for_inactive_assignment(service, program_repository):
    program = _make_program()
    assignment = _make_assignment(program=program, status=AssignmentStatus.COMPLETED)
    program_repository.get_assignment_by_id.return_value = assignment

    service.advance_after_action(USER_ID, assignment.id)

    program_repository.get_next_day_after.assert_not_called()


def test_advance_after_action_is_noop_when_already_exhausted(service, program_repository):
    program = _make_program()
    assignment = _make_assignment(program=program, cursor_exhausted=True)
    program_repository.get_assignment_by_id.return_value = assignment

    service.advance_after_action(USER_ID, assignment.id)

    program_repository.get_next_day_after.assert_not_called()


def test_advance_after_action_is_noop_when_assignment_missing(service, program_repository):
    program_repository.get_assignment_by_id.return_value = None

    service.advance_after_action(USER_ID, uuid.uuid4())

    program_repository.db.commit.assert_not_called()


# -- advance_past_rest_day ---------------------------------------------------------


def test_advance_past_rest_day_moves_cursor(service, program_repository):
    program = _make_program()
    assignment = _make_assignment(program=program)
    rest_day = _make_day(program=program, workout_id=None)
    next_day = _make_day(program=program, week_number=1, day_number=2)
    program_repository.get_active_assignment_for_user.return_value = assignment
    program_repository.get_by_id.return_value = program
    program_repository.get_day_at.return_value = rest_day
    program_repository.get_next_day_after.return_value = next_day
    program_repository.update_assignment.side_effect = lambda a: a

    result = service.advance_past_rest_day(USER_ID)

    assert result.current_day_number == 2
    program_repository.db.commit.assert_called_once()


def test_advance_past_rest_day_raises_when_no_active_assignment(service, program_repository):
    program_repository.get_active_assignment_for_user.return_value = None

    with pytest.raises(NoActiveAssignmentError):
        service.advance_past_rest_day(USER_ID)


def test_advance_past_rest_day_raises_when_current_slot_is_training_day(
    service, program_repository, workout_repository
):
    program = _make_program()
    assignment = _make_assignment(program=program)
    workout = Workout(id=uuid.uuid4(), name="Push Day", slug="push-day")
    training_day = _make_day(program=program, workout_id=workout.id)
    program_repository.get_active_assignment_for_user.return_value = assignment
    program_repository.get_by_id.return_value = program
    program_repository.get_day_at.return_value = training_day
    workout_repository.get_by_id.return_value = workout

    with pytest.raises(NotARestDayError):
        service.advance_past_rest_day(USER_ID)
