"""Unit tests for :class:`~app.services.workout_log_service.WorkoutLogService`.

Every repository dependency is mocked — these tests exercise business
rules (state transitions, ownership checks, the edit-window rule, snapshot
copying) in isolation, with no database involved. See
``tests/integration/test_workout_logs_api.py`` for a full end-to-end
lifecycle against a real PostgreSQL instance.
"""

import uuid
from datetime import datetime, timedelta, timezone

import pytest

from app.models.exercise import Exercise
from app.models.program import AssignmentStatus, ProgramAssignment
from app.models.workout import Workout, WorkoutExercise
from app.models.workout_log import WorkoutLog, WorkoutLogExercise, WorkoutLogStatus, WorkoutSetLog
from app.schemas.workout_log import (
    WorkoutLogExerciseCreate,
    WorkoutLogFinish,
    WorkoutLogStart,
    WorkoutSetLogCreate,
    WorkoutSetLogUpdate,
)
from app.services.workout_log_service import (
    ActiveSessionExistsError,
    EditWindowExpiredError,
    InvalidExerciseReferenceError,
    InvalidProgramAssignmentReferenceError,
    InvalidWorkoutLogStateError,
    InvalidWorkoutReferenceError,
    LogExerciseNotFoundError,
    SetLogNotFoundError,
    WorkoutLogNotFoundError,
    WorkoutLogService,
)

USER_ID = uuid.uuid4()
OTHER_USER_ID = uuid.uuid4()


@pytest.fixture()
def workout_log_repository(mocker):
    return mocker.Mock()


@pytest.fixture()
def workout_repository(mocker):
    return mocker.Mock()


@pytest.fixture()
def exercise_repository(mocker):
    return mocker.Mock()


@pytest.fixture()
def program_repository(mocker):
    return mocker.Mock()


@pytest.fixture()
def service(workout_log_repository, workout_repository, exercise_repository, program_repository):
    return WorkoutLogService(
        workout_log_repository, workout_repository, exercise_repository, program_repository
    )


def _make_log(
    *,
    user_id: uuid.UUID = USER_ID,
    status: WorkoutLogStatus = WorkoutLogStatus.IN_PROGRESS,
    started_at: datetime | None = None,
    completed_at: datetime | None = None,
    log_exercises: list[WorkoutLogExercise] | None = None,
) -> WorkoutLog:
    log = WorkoutLog(
        id=uuid.uuid4(),
        user_id=user_id,
        status=status,
        started_at=started_at,
        completed_at=completed_at,
    )
    log.log_exercises = log_exercises if log_exercises is not None else []
    return log


def _make_log_exercise(
    *, workout_log_id: uuid.UUID, set_logs: list[WorkoutSetLog] | None = None
) -> WorkoutLogExercise:
    entry = WorkoutLogExercise(
        id=uuid.uuid4(),
        workout_log_id=workout_log_id,
        exercise_id=uuid.uuid4(),
        order_index=0,
        exercise_name_snapshot="Bench Press",
    )
    entry.set_logs = set_logs if set_logs is not None else []
    return entry


def _make_set_log(*, workout_log_exercise_id: uuid.UUID, set_number: int = 1) -> WorkoutSetLog:
    return WorkoutSetLog(
        id=uuid.uuid4(),
        workout_log_exercise_id=workout_log_exercise_id,
        set_number=set_number,
        reps=10,
        weight_kg=None,
        duration_seconds=None,
        is_warmup=False,
    )


# -- start_workout -------------------------------------------------------------


def test_start_workout_creates_ad_hoc_session_in_progress(service, workout_log_repository):
    workout_log_repository.get_active_for_user.return_value = None

    created = None

    def fake_create(log):
        nonlocal created
        log.id = uuid.uuid4()
        created = log
        return log

    workout_log_repository.create.side_effect = fake_create
    workout_log_repository.get_by_id.side_effect = lambda log_id: created

    result = service.start_workout(USER_ID, WorkoutLogStart())

    assert result.status == WorkoutLogStatus.IN_PROGRESS
    assert result.started_at is not None
    assert result.user_id == USER_ID
    workout_log_repository.db.commit.assert_called_once()


def test_start_workout_raises_when_active_session_exists(service, workout_log_repository):
    workout_log_repository.get_active_for_user.return_value = _make_log()

    with pytest.raises(ActiveSessionExistsError):
        service.start_workout(USER_ID, WorkoutLogStart())


def test_start_workout_seeds_exercises_from_template(
    service, workout_log_repository, workout_repository
):
    workout_log_repository.get_active_for_user.return_value = None

    exercise = Exercise(id=uuid.uuid4(), name="Squat", slug="squat")
    line_item = WorkoutExercise(
        id=uuid.uuid4(),
        workout_id=uuid.uuid4(),
        exercise_id=exercise.id,
        order_index=0,
        target_sets=3,
        target_reps_min=5,
        target_reps_max=8,
        rest_seconds=90,
    )
    line_item.exercise = exercise
    template = Workout(id=uuid.uuid4(), name="Leg Day", slug="leg-day")
    template.exercise_links = [line_item]
    workout_repository.get_by_id.return_value = template

    created_log = None

    def fake_create(log):
        nonlocal created_log
        log.id = uuid.uuid4()
        created_log = log
        return log

    workout_log_repository.create.side_effect = fake_create
    workout_log_repository.get_by_id.side_effect = lambda log_id: created_log
    added_exercises = []
    workout_log_repository.add_exercise.side_effect = lambda entry: added_exercises.append(entry) or entry

    service.start_workout(USER_ID, WorkoutLogStart(workout_id=template.id))

    assert len(added_exercises) == 1
    seeded = added_exercises[0]
    assert seeded.exercise_id == exercise.id
    assert seeded.exercise_name_snapshot == "Squat"
    assert seeded.target_sets == 3
    assert seeded.rest_seconds == 90


def test_start_workout_raises_for_invalid_workout_reference(
    service, workout_log_repository, workout_repository
):
    workout_log_repository.get_active_for_user.return_value = None
    workout_repository.get_by_id.return_value = None

    with pytest.raises(InvalidWorkoutReferenceError):
        service.start_workout(USER_ID, WorkoutLogStart(workout_id=uuid.uuid4()))


def test_start_workout_raises_for_program_assignment_not_owned(
    service, workout_log_repository, program_repository
):
    workout_log_repository.get_active_for_user.return_value = None
    assignment = ProgramAssignment(
        id=uuid.uuid4(),
        user_id=OTHER_USER_ID,
        program_id=uuid.uuid4(),
        status=AssignmentStatus.ACTIVE,
    )
    program_repository.get_assignment_by_id.return_value = assignment

    with pytest.raises(InvalidProgramAssignmentReferenceError):
        service.start_workout(USER_ID, WorkoutLogStart(program_assignment_id=assignment.id))


# -- finish_workout -------------------------------------------------------------


def test_finish_workout_computes_duration_from_started_at(service, workout_log_repository):
    started_at = datetime.now(timezone.utc) - timedelta(minutes=45)
    log = _make_log(started_at=started_at)
    workout_log_repository.get_by_id.return_value = log
    workout_log_repository.update.side_effect = lambda x: x

    result = service.finish_workout(USER_ID, log.id, WorkoutLogFinish())

    assert result.status == WorkoutLogStatus.COMPLETED
    assert result.duration_actual_minutes == 45
    assert result.completed_at is not None


def test_finish_workout_uses_explicit_duration_override(service, workout_log_repository):
    log = _make_log(started_at=datetime.now(timezone.utc) - timedelta(minutes=45))
    workout_log_repository.get_by_id.return_value = log
    workout_log_repository.update.side_effect = lambda x: x

    result = service.finish_workout(USER_ID, log.id, WorkoutLogFinish(duration_actual_minutes=30))

    assert result.duration_actual_minutes == 30


def test_finish_workout_raises_when_not_in_progress(service, workout_log_repository):
    log = _make_log(status=WorkoutLogStatus.COMPLETED)
    workout_log_repository.get_by_id.return_value = log

    with pytest.raises(InvalidWorkoutLogStateError):
        service.finish_workout(USER_ID, log.id, WorkoutLogFinish())


# -- skip_workout ---------------------------------------------------------------


def test_skip_workout_transitions_to_skipped(service, workout_log_repository):
    log = _make_log()
    workout_log_repository.get_by_id.return_value = log
    workout_log_repository.update.side_effect = lambda x: x

    result = service.skip_workout(USER_ID, log.id)

    assert result.status == WorkoutLogStatus.SKIPPED
    assert result.completed_at is not None


def test_skip_workout_raises_when_not_in_progress(service, workout_log_repository):
    log = _make_log(status=WorkoutLogStatus.SKIPPED)
    workout_log_repository.get_by_id.return_value = log

    with pytest.raises(InvalidWorkoutLogStateError):
        service.skip_workout(USER_ID, log.id)


# -- ownership -------------------------------------------------------------------


def test_get_workout_log_raises_not_found_for_another_users_log(service, workout_log_repository):
    log = _make_log(user_id=OTHER_USER_ID)
    workout_log_repository.get_by_id.return_value = log

    with pytest.raises(WorkoutLogNotFoundError):
        service.get_workout_log(USER_ID, log.id)


def test_get_workout_log_raises_not_found_when_missing(service, workout_log_repository):
    workout_log_repository.get_by_id.return_value = None

    with pytest.raises(WorkoutLogNotFoundError):
        service.get_workout_log(USER_ID, uuid.uuid4())


# -- add_exercise ----------------------------------------------------------------


def test_add_exercise_copies_name_snapshot(service, workout_log_repository, exercise_repository):
    log = _make_log()
    workout_log_repository.get_by_id.return_value = log
    exercise = Exercise(id=uuid.uuid4(), name="Deadlift", slug="deadlift")
    exercise_repository.get_by_id.return_value = exercise
    workout_log_repository.next_exercise_order_index.return_value = 2
    workout_log_repository.add_exercise.side_effect = lambda entry: entry

    result = service.add_exercise(
        USER_ID, log.id, WorkoutLogExerciseCreate(exercise_id=exercise.id)
    )

    assert result.exercise_name_snapshot == "Deadlift"
    assert result.order_index == 2


def test_add_exercise_raises_for_invalid_exercise_reference(
    service, workout_log_repository, exercise_repository
):
    log = _make_log()
    workout_log_repository.get_by_id.return_value = log
    exercise_repository.get_by_id.return_value = None

    with pytest.raises(InvalidExerciseReferenceError):
        service.add_exercise(USER_ID, log.id, WorkoutLogExerciseCreate(exercise_id=uuid.uuid4()))


def test_add_exercise_raises_when_session_not_in_progress(service, workout_log_repository):
    log = _make_log(status=WorkoutLogStatus.COMPLETED)
    workout_log_repository.get_by_id.return_value = log

    with pytest.raises(InvalidWorkoutLogStateError):
        service.add_exercise(USER_ID, log.id, WorkoutLogExerciseCreate(exercise_id=uuid.uuid4()))


# -- log_set ----------------------------------------------------------------------


def test_log_set_assigns_server_side_set_number(service, workout_log_repository):
    log = _make_log()
    log_exercise = _make_log_exercise(workout_log_id=log.id)
    workout_log_repository.get_by_id.return_value = log
    workout_log_repository.get_exercise_by_id.return_value = log_exercise
    workout_log_repository.next_set_number.return_value = 3
    workout_log_repository.add_set.side_effect = lambda set_log: set_log

    result = service.log_set(
        USER_ID, log.id, log_exercise.id, WorkoutSetLogCreate(reps=10, weight_kg=60)
    )

    assert result.set_number == 3
    assert result.reps == 10


def test_log_set_raises_when_exercise_belongs_to_another_log(service, workout_log_repository):
    log = _make_log()
    mismatched_exercise = _make_log_exercise(workout_log_id=uuid.uuid4())
    workout_log_repository.get_by_id.return_value = log
    workout_log_repository.get_exercise_by_id.return_value = mismatched_exercise

    with pytest.raises(LogExerciseNotFoundError):
        service.log_set(USER_ID, log.id, mismatched_exercise.id, WorkoutSetLogCreate(reps=10))


# -- update_set / delete_set: edit window -----------------------------------------


def test_update_set_allowed_while_in_progress(service, workout_log_repository):
    log = _make_log(status=WorkoutLogStatus.IN_PROGRESS)
    log_exercise = _make_log_exercise(workout_log_id=log.id)
    set_log = _make_set_log(workout_log_exercise_id=log_exercise.id)
    workout_log_repository.get_by_id.return_value = log
    workout_log_repository.get_exercise_by_id.return_value = log_exercise
    workout_log_repository.get_set_by_id.return_value = set_log
    workout_log_repository.update_set.side_effect = lambda x: x

    result = service.update_set(
        USER_ID, log.id, log_exercise.id, set_log.id, WorkoutSetLogUpdate(reps=12)
    )

    assert result.reps == 12


def test_update_set_allowed_within_edit_window_after_completed(
    service, workout_log_repository, mocker
):
    completed_at = datetime.now(timezone.utc) - timedelta(hours=1)
    log = _make_log(status=WorkoutLogStatus.COMPLETED, completed_at=completed_at)
    log_exercise = _make_log_exercise(workout_log_id=log.id)
    set_log = _make_set_log(workout_log_exercise_id=log_exercise.id)
    workout_log_repository.get_by_id.return_value = log
    workout_log_repository.get_exercise_by_id.return_value = log_exercise
    workout_log_repository.get_set_by_id.return_value = set_log
    workout_log_repository.update_set.side_effect = lambda x: x

    result = service.update_set(
        USER_ID, log.id, log_exercise.id, set_log.id, WorkoutSetLogUpdate(reps=8)
    )

    assert result.reps == 8


def test_update_set_raises_after_edit_window_expired(service, workout_log_repository):
    completed_at = datetime.now(timezone.utc) - timedelta(hours=48)
    log = _make_log(status=WorkoutLogStatus.COMPLETED, completed_at=completed_at)
    log_exercise = _make_log_exercise(workout_log_id=log.id)
    set_log = _make_set_log(workout_log_exercise_id=log_exercise.id)
    workout_log_repository.get_by_id.return_value = log
    workout_log_repository.get_exercise_by_id.return_value = log_exercise
    workout_log_repository.get_set_by_id.return_value = set_log

    with pytest.raises(EditWindowExpiredError):
        service.update_set(USER_ID, log.id, log_exercise.id, set_log.id, WorkoutSetLogUpdate(reps=8))


def test_update_set_raises_when_session_skipped(service, workout_log_repository):
    log = _make_log(status=WorkoutLogStatus.SKIPPED, completed_at=datetime.now(timezone.utc))
    log_exercise = _make_log_exercise(workout_log_id=log.id)
    set_log = _make_set_log(workout_log_exercise_id=log_exercise.id)
    workout_log_repository.get_by_id.return_value = log
    workout_log_repository.get_exercise_by_id.return_value = log_exercise
    workout_log_repository.get_set_by_id.return_value = set_log

    with pytest.raises(EditWindowExpiredError):
        service.update_set(USER_ID, log.id, log_exercise.id, set_log.id, WorkoutSetLogUpdate(reps=8))


def test_delete_set_raises_not_found_when_set_belongs_to_another_exercise(
    service, workout_log_repository
):
    log = _make_log()
    log_exercise = _make_log_exercise(workout_log_id=log.id)
    mismatched_set_log = _make_set_log(workout_log_exercise_id=uuid.uuid4())
    workout_log_repository.get_by_id.return_value = log
    workout_log_repository.get_exercise_by_id.return_value = log_exercise
    workout_log_repository.get_set_by_id.return_value = mismatched_set_log

    with pytest.raises(SetLogNotFoundError):
        service.delete_set(USER_ID, log.id, log_exercise.id, mismatched_set_log.id)


def test_delete_set_succeeds_while_in_progress(service, workout_log_repository):
    log = _make_log()
    log_exercise = _make_log_exercise(workout_log_id=log.id)
    set_log = _make_set_log(workout_log_exercise_id=log_exercise.id)
    workout_log_repository.get_by_id.return_value = log
    workout_log_repository.get_exercise_by_id.return_value = log_exercise
    workout_log_repository.get_set_by_id.return_value = set_log
    workout_log_repository.delete_set.return_value = True

    service.delete_set(USER_ID, log.id, log_exercise.id, set_log.id)

    workout_log_repository.delete_set.assert_called_once_with(set_log.id)
    workout_log_repository.db.commit.assert_called_once()
