"""Unit tests for the beginner-foundation 4-week program expansion seed.

Repositories are faked in memory — no PostgreSQL. See
``tests/integration/test_seed_default_program.py`` for the same scenarios
against a real database when one is available.
"""

from __future__ import annotations

import sys
import uuid
from pathlib import Path

from app.models.program import AssignmentStatus, Program, ProgramAssignment, ProgramDay
from app.models.workout import Workout
from app.models.workout_log import WorkoutLog, WorkoutLogStatus
from app.repositories.workout_log_repository import WorkoutLogRepository
from app.repositories.workout_repository import WorkoutRepository
from app.schemas.workout_resolution import WorkoutResolutionState
from app.services.workout_resolution_service import WorkoutResolutionService

_SEEDS_DIR = Path(__file__).resolve().parents[3] / "database" / "seeds"
if str(_SEEDS_DIR) not in sys.path:
    sys.path.insert(0, str(_SEEDS_DIR))

from seed_default_program import (  # noqa: E402
    BEGINNER_FOUNDATION_SCHEDULE,
    DEFAULT_PROGRAM_SLUG,
    DURATION_WEEKS,
    WORKOUT_A_SLUG,
    WORKOUT_B_SLUG,
    ensure_default_program,
    reconcile_program_days,
)

USER_ID = uuid.uuid4()
PROGRAM_ID = uuid.uuid4()
WORKOUT_A_ID = uuid.uuid4()
WORKOUT_B_ID = uuid.uuid4()


class FakeProgramRepository:
    """In-memory stand-in matching ``ProgramRepository`` day uniqueness + cursor traversal."""

    def __init__(self) -> None:
        self.days: list[ProgramDay] = []
        self.assignments: list[ProgramAssignment] = []
        self.programs: dict[str, Program] = {}
        self.removed_day_ids: list[uuid.UUID] = []
        self.updated_assignments: list[ProgramAssignment] = []

    def exists_day(self, program_id: uuid.UUID, week_number: int, day_number: int) -> bool:
        return any(
            day.program_id == program_id
            and day.week_number == week_number
            and day.day_number == day_number
            for day in self.days
        )

    def add_day(self, program_day: ProgramDay) -> ProgramDay:
        if self.exists_day(program_day.program_id, program_day.week_number, program_day.day_number):
            raise AssertionError(
                f"duplicate ProgramDay ({program_day.week_number}, {program_day.day_number})"
            )
        if program_day.id is None:
            program_day.id = uuid.uuid4()
        self.days.append(program_day)
        return program_day

    def list_days(self, program_id: uuid.UUID) -> list[ProgramDay]:
        return sorted(
            [day for day in self.days if day.program_id == program_id],
            key=lambda day: (day.week_number, day.day_number),
        )

    def get_day(self, program_day_id: uuid.UUID) -> ProgramDay | None:
        return next((day for day in self.days if day.id == program_day_id), None)

    def get_day_at(
        self, program_id: uuid.UUID, week_number: int, day_number: int
    ) -> ProgramDay | None:
        return next(
            (
                day
                for day in self.days
                if day.program_id == program_id
                and day.week_number == week_number
                and day.day_number == day_number
            ),
            None,
        )

    def get_first_day(self, program_id: uuid.UUID) -> ProgramDay | None:
        days = self.list_days(program_id)
        return days[0] if days else None

    def get_next_day_after(
        self,
        program_id: uuid.UUID,
        week_number: int,
        day_number: int,
        *,
        max_week: int,
    ) -> ProgramDay | None:
        later = [
            day
            for day in self.list_days(program_id)
            if day.week_number <= max_week
            and (day.week_number, day.day_number) > (week_number, day_number)
        ]
        return later[0] if later else None

    def remove_day(self, program_day_id: uuid.UUID) -> bool:
        self.removed_day_ids.append(program_day_id)
        raise AssertionError("expansion must never delete ProgramDay rows")

    def get_by_slug(self, slug: str) -> Program | None:
        return self.programs.get(slug)

    def get_by_id(self, program_id: uuid.UUID) -> Program | None:
        return next((program for program in self.programs.values() if program.id == program_id), None)

    def create(self, program: Program) -> Program:
        if program.id is None:
            program.id = uuid.uuid4()
        self.programs[program.slug] = program
        return program

    def update(self, program: Program) -> Program:
        self.programs[program.slug] = program
        return program

    def create_assignment(self, assignment: ProgramAssignment) -> ProgramAssignment:
        raise AssertionError("expansion must never create ProgramAssignment rows")

    def update_assignment(self, assignment: ProgramAssignment) -> ProgramAssignment:
        self.updated_assignments.append(assignment)
        return assignment

    def get_active_assignment_for_user(self, user_id: uuid.UUID) -> ProgramAssignment | None:
        return next(
            (
                assignment
                for assignment in self.assignments
                if assignment.user_id == user_id and assignment.status == AssignmentStatus.ACTIVE
            ),
            None,
        )

    def get_assignment_by_id(self, assignment_id: uuid.UUID) -> ProgramAssignment | None:
        return next((item for item in self.assignments if item.id == assignment_id), None)


def _seed_production_week1(repository: FakeProgramRepository) -> tuple[ProgramDay, ProgramDay, ProgramDay]:
    day_1 = ProgramDay(
        id=uuid.uuid4(),
        program_id=PROGRAM_ID,
        week_number=1,
        day_number=1,
        label="Full Body A",
        workout_id=WORKOUT_A_ID,
    )
    day_2 = ProgramDay(
        id=uuid.uuid4(),
        program_id=PROGRAM_ID,
        week_number=1,
        day_number=2,
        label="Rest",
        workout_id=None,
    )
    day_3 = ProgramDay(
        id=uuid.uuid4(),
        program_id=PROGRAM_ID,
        week_number=1,
        day_number=3,
        label="Full Body B",
        workout_id=WORKOUT_B_ID,
    )
    repository.add_day(day_1)
    repository.add_day(day_2)
    repository.add_day(day_3)
    return day_1, day_2, day_3


def _assert_schedule(days: list[ProgramDay]) -> None:
    by_slot = {(day.week_number, day.day_number): day for day in days}
    assert len(by_slot) == len(days)
    for week, day_number, label, workout_key in BEGINNER_FOUNDATION_SCHEDULE:
        day = by_slot[(week, day_number)]
        assert day.label == label
        if workout_key == "A":
            assert day.workout_id == WORKOUT_A_ID
        elif workout_key == "B":
            assert day.workout_id == WORKOUT_B_ID
        else:
            assert day.workout_id is None


def test_schedule_is_four_weeks_matching_production_week1() -> None:
    slots = [(week, day) for week, day, _, _ in BEGINNER_FOUNDATION_SCHEDULE]
    assert len(BEGINNER_FOUNDATION_SCHEDULE) == 28
    assert len(set(slots)) == 28
    assert set(slots) == {(week, day) for week in range(1, 5) for day in range(1, 8)}
    week1 = {day: key for week, day, _, key in BEGINNER_FOUNDATION_SCHEDULE if week == 1}
    assert week1 == {1: "A", 2: None, 3: "B", 4: None, 5: "A", 6: None, 7: None}


def test_fresh_program_gets_all_expected_days() -> None:
    repository = FakeProgramRepository()

    added = reconcile_program_days(
        repository,
        program_id=PROGRAM_ID,
        workout_a_id=WORKOUT_A_ID,
        workout_b_id=WORKOUT_B_ID,
    )

    days = repository.list_days(PROGRAM_ID)
    assert added == 28
    assert len(days) == 28
    _assert_schedule(days)


def test_production_like_program_gets_missing_days_added() -> None:
    repository = FakeProgramRepository()
    day_1, day_2, day_3 = _seed_production_week1(repository)

    added = reconcile_program_days(
        repository,
        program_id=PROGRAM_ID,
        workout_a_id=WORKOUT_A_ID,
        workout_b_id=WORKOUT_B_ID,
    )

    days = repository.list_days(PROGRAM_ID)
    assert added == 25
    assert len(days) == 28
    assert repository.get_day(day_1.id) is day_1
    assert day_1.workout_id == WORKOUT_A_ID
    assert day_2.workout_id is None
    assert day_3.workout_id == WORKOUT_B_ID
    _assert_schedule(days)


def test_rerun_creates_no_duplicate_program_days() -> None:
    repository = FakeProgramRepository()
    _seed_production_week1(repository)

    first = reconcile_program_days(
        repository,
        program_id=PROGRAM_ID,
        workout_a_id=WORKOUT_A_ID,
        workout_b_id=WORKOUT_B_ID,
    )
    day_ids = {day.id for day in repository.list_days(PROGRAM_ID)}
    second = reconcile_program_days(
        repository,
        program_id=PROGRAM_ID,
        workout_a_id=WORKOUT_A_ID,
        workout_b_id=WORKOUT_B_ID,
    )

    days = repository.list_days(PROGRAM_ID)
    assert first == 25
    assert second == 0
    assert {day.id for day in days} == day_ids
    assert len(days) == 28


def test_existing_assignment_cursor_remains_valid() -> None:
    repository = FakeProgramRepository()
    day_1, _, _ = _seed_production_week1(repository)
    assignment = ProgramAssignment(
        id=uuid.uuid4(),
        program_id=PROGRAM_ID,
        user_id=USER_ID,
        status=AssignmentStatus.ACTIVE,
        current_week_number=1,
        current_day_number=1,
        current_program_day_id=day_1.id,
        cursor_exhausted=False,
    )
    repository.assignments.append(assignment)

    reconcile_program_days(
        repository,
        program_id=PROGRAM_ID,
        workout_a_id=WORKOUT_A_ID,
        workout_b_id=WORKOUT_B_ID,
    )

    assert assignment.current_week_number == 1
    assert assignment.current_day_number == 1
    assert assignment.current_program_day_id == day_1.id
    assert assignment.status == AssignmentStatus.ACTIVE
    assert assignment.cursor_exhausted is False
    assert repository.updated_assignments == []
    assert repository.get_day(day_1.id) is day_1


def test_cursor_advances_through_all_four_weeks(mocker) -> None:
    repository = FakeProgramRepository()
    reconcile_program_days(
        repository,
        program_id=PROGRAM_ID,
        workout_a_id=WORKOUT_A_ID,
        workout_b_id=WORKOUT_B_ID,
    )
    program = Program(id=PROGRAM_ID, name="Beginner", slug="beginner-foundation", duration_weeks=4)
    repository.programs[program.slug] = program
    first_day = repository.get_first_day(PROGRAM_ID)
    assert first_day is not None
    assignment = ProgramAssignment(
        id=uuid.uuid4(),
        program_id=PROGRAM_ID,
        user_id=USER_ID,
        status=AssignmentStatus.ACTIVE,
        current_week_number=first_day.week_number,
        current_day_number=first_day.day_number,
        current_program_day_id=first_day.id,
        cursor_exhausted=False,
    )
    repository.assignments.append(assignment)
    repository.db = mocker.Mock()
    workout_repository = mocker.Mock(spec=WorkoutRepository)
    workout_repository.get_by_id.side_effect = lambda workout_id: Workout(
        id=workout_id, name="Full Body", slug=str(workout_id)
    )
    log_repository = mocker.Mock(spec=WorkoutLogRepository)
    log_repository.get_active_for_user.return_value = None
    log_repository.list_for_user.return_value = []
    service = WorkoutResolutionService(repository, workout_repository, log_repository)

    visited: list[tuple[int, int, WorkoutResolutionState]] = []
    for _ in range(len(BEGINNER_FOUNDATION_SCHEDULE)):
        result = service.resolve_current(USER_ID)
        assert result.state in (
            WorkoutResolutionState.TRAINING_DAY,
            WorkoutResolutionState.REST_DAY,
        )
        assert result.program_day is not None
        visited.append(
            (result.program_day.week_number, result.program_day.day_number, result.state)
        )
        if result.state == WorkoutResolutionState.REST_DAY:
            service.advance_past_rest_day(USER_ID)
        else:
            service.advance_after_action(USER_ID, assignment.id)

    assert visited[0] == (1, 1, WorkoutResolutionState.TRAINING_DAY)
    assert visited[-1] == (4, 7, WorkoutResolutionState.REST_DAY)
    assert {(week, day) for week, day, _ in visited} == {
        (week, day) for week, day, _, _ in BEGINNER_FOUNDATION_SCHEDULE
    }
    assert service.resolve_current(USER_ID).state == WorkoutResolutionState.PROGRAM_COMPLETE
    assert assignment.cursor_exhausted is True
    assert assignment.status == AssignmentStatus.ACTIVE


def test_existing_workout_logs_are_not_referenced_or_changed() -> None:
    repository = FakeProgramRepository()
    _seed_production_week1(repository)
    log = WorkoutLog(
        id=uuid.uuid4(),
        user_id=USER_ID,
        program_assignment_id=uuid.uuid4(),
        workout_id=WORKOUT_A_ID,
        status=WorkoutLogStatus.COMPLETED,
        notes="keep this production log",
    )
    snapshot = (log.id, log.status, log.notes, log.workout_id, log.program_assignment_id)

    reconcile_program_days(
        repository,
        program_id=PROGRAM_ID,
        workout_a_id=WORKOUT_A_ID,
        workout_b_id=WORKOUT_B_ID,
    )

    assert (
        log.id,
        log.status,
        log.notes,
        log.workout_id,
        log.program_assignment_id,
    ) == snapshot
    assert repository.removed_day_ids == []


def test_ensure_reuses_existing_workouts_and_program_and_adds_missing_days(mocker) -> None:
    repository = FakeProgramRepository()
    program = Program(
        id=PROGRAM_ID,
        name="EVOLVE Beginner Foundation",
        slug=DEFAULT_PROGRAM_SLUG,
        duration_weeks=DURATION_WEEKS,
    )
    repository.programs[DEFAULT_PROGRAM_SLUG] = program
    _seed_production_week1(repository)
    workout_a = Workout(id=WORKOUT_A_ID, name="Beginner Full Body A", slug=WORKOUT_A_SLUG)
    workout_b = Workout(id=WORKOUT_B_ID, name="Beginner Full Body B", slug=WORKOUT_B_SLUG)
    workout_repository = mocker.Mock()
    workout_repository.get_by_slug.side_effect = lambda slug: {
        WORKOUT_A_SLUG: workout_a,
        WORKOUT_B_SLUG: workout_b,
    }[slug]
    mocker.patch("seed_default_program.ProgramRepository", return_value=repository)
    mocker.patch("seed_default_program.WorkoutRepository", return_value=workout_repository)
    mocker.patch("seed_default_program.ExerciseRepository", return_value=mocker.Mock())

    report = ensure_default_program(mocker.Mock())
    rerun = ensure_default_program(mocker.Mock())

    assert report.program_created is False
    assert report.workout_a_created is False
    assert report.workout_b_created is False
    assert report.days_added == 25
    assert report.days_total == 28
    assert rerun.days_added == 0
    assert rerun.program_id == PROGRAM_ID
    workout_repository.create.assert_not_called()
    _assert_schedule(repository.list_days(PROGRAM_ID))
