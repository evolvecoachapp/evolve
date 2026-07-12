"""Business logic for the Workout Resolution Engine.

``WorkoutResolutionService`` answers "what should this user do right now
in their active program?" by resolving a user's active
:class:`~app.models.program.ProgramAssignment` progress cursor to one of
four mutually exclusive states — training day, rest day, program
complete, or no active program — and decorating it with same-day
``WorkoutLog`` status. This closes out Phase 3 Sprint 3.3's outstanding
"rule-based Workout Engine (pre-AI, template-driven)" deliverable.

Deliberately plain, deterministic business logic living in ``services/``
rather than ``app/ai/``: there is no AI/ML content here, only rule-based
traversal of ``Program``/``ProgramDay``/``ProgramAssignment`` structure. A
future AI Orchestrator/Workout Engine can call this service as ground
truth for "what's scheduled next" and layer adaptive changes on top,
without this service ever depending on AI — dependencies flow inward, per
``EVOLVE_ARCHITECTURE.md`` §4 ("AI is isolated").

:meth:`WorkoutResolutionService.resolve_current` never mutates the
database. The progress cursor only ever advances via
:meth:`advance_after_action` (an internal, silent-no-op primitive called
by :class:`~app.services.workout_log_service.WorkoutLogService` when a
session tied to the active assignment finishes/is skipped) or
:meth:`advance_past_rest_day` (the explicit, client-facing action for a
rest day, which has no ``WorkoutLog`` of its own to finish/skip).
"""

import uuid
from dataclasses import dataclass
from datetime import date

from app.models.program import AssignmentStatus, Program, ProgramAssignment, ProgramDay
from app.models.workout import Workout
from app.models.workout_log import WorkoutLogStatus
from app.repositories.program_repository import ProgramRepository
from app.repositories.workout_log_repository import WorkoutLogRepository
from app.repositories.workout_repository import WorkoutRepository
from app.schemas.workout_resolution import (
    TodayLogStatus,
    WorkoutResolutionState as ResolutionState,
)


class WorkoutResolutionServiceError(Exception):
    """Base class for all errors raised by :class:`WorkoutResolutionService`."""


class NoActiveAssignmentError(WorkoutResolutionServiceError):
    """Raised when a resolution action is attempted but the user has no ``ACTIVE`` program assignment."""


class NotARestDayError(WorkoutResolutionServiceError):
    """Raised by :meth:`WorkoutResolutionService.advance_past_rest_day` when the resolved slot is not a rest day."""


@dataclass(frozen=True)
class ResolutionResult:
    """The outcome of resolving a user's current position in their active program.

    ``program``/``assignment``/``program_day``/``workout`` are populated
    only as relevant to ``state`` — callers should branch on ``state``
    first rather than infer it from which fields are set.
    """

    state: ResolutionState
    program: Program | None = None
    assignment: ProgramAssignment | None = None
    program_day: ProgramDay | None = None
    workout: Workout | None = None
    today_log_status: TodayLogStatus = TodayLogStatus.NONE
    active_workout_log_id: uuid.UUID | None = None


class WorkoutResolutionService:
    """Resolves a user's current program position and advances its progress cursor.

    Depends on read-mostly repositories directly, matching
    :class:`~app.services.workout_service.WorkoutService` and
    :class:`~app.services.workout_log_service.WorkoutLogService` — no
    service-to-service composition, so each stays independently
    unit-testable with mocked repositories.
    """

    def __init__(
        self,
        program_repository: ProgramRepository,
        workout_repository: WorkoutRepository,
        workout_log_repository: WorkoutLogRepository,
    ) -> None:
        self.program_repository = program_repository
        self.workout_repository = workout_repository
        self.workout_log_repository = workout_log_repository

    # -- Resolution (read-only) ----------------------------------------------

    def resolve_current(self, user_id: uuid.UUID) -> ResolutionResult:
        """Resolve the user's current position in their active program assignment.

        Pure read — never mutates the assignment's cursor. Returns
        :attr:`ResolutionState.NO_ACTIVE_PROGRAM` if the user has no
        ``ACTIVE`` assignment, and :attr:`ResolutionState.PROGRAM_COMPLETE`
        once the assignment's cursor is exhausted.
        """
        assignment = self.program_repository.get_active_assignment_for_user(user_id)
        if assignment is None:
            return ResolutionResult(state=ResolutionState.NO_ACTIVE_PROGRAM)

        program = self.program_repository.get_by_id(assignment.program_id)

        if assignment.cursor_exhausted:
            return ResolutionResult(
                state=ResolutionState.PROGRAM_COMPLETE,
                program=program,
                assignment=assignment,
            )

        program_day = self.program_repository.get_day_at(
            assignment.program_id,
            assignment.current_week_number,
            assignment.current_day_number,
        )
        if program_day is None:
            # Defensive: once initialized by assign_program, the cursor only
            # ever moves via _advance_cursor onto a real ProgramDay. If that
            # row was since hard-deleted (WorkoutService.remove_program_day),
            # treat it the same as "nothing left to resolve" rather than
            # raising — the assignment stays ACTIVE and usable.
            return ResolutionResult(
                state=ResolutionState.PROGRAM_COMPLETE,
                program=program,
                assignment=assignment,
            )

        if program_day.workout_id is None:
            return ResolutionResult(
                state=ResolutionState.REST_DAY,
                program=program,
                assignment=assignment,
                program_day=program_day,
            )

        workout = self.workout_repository.get_by_id(program_day.workout_id)
        today_log_status, active_workout_log_id = self._resolve_today_log_status(
            user_id, assignment
        )
        return ResolutionResult(
            state=ResolutionState.TRAINING_DAY,
            program=program,
            assignment=assignment,
            program_day=program_day,
            workout=workout,
            today_log_status=today_log_status,
            active_workout_log_id=active_workout_log_id,
        )

    # -- Cursor advancement ---------------------------------------------------

    def advance_after_action(self, user_id: uuid.UUID, program_assignment_id: uuid.UUID) -> None:
        """Advance the progress cursor after a session tied to a program assignment finishes/is skipped.

        Internal side-effect primitive called by
        :class:`~app.services.workout_log_service.WorkoutLogService` from
        ``finish_workout``/``skip_workout`` — never exposed via the API
        directly. Deliberately a silent no-op (never raises) when
        ``program_assignment_id`` doesn't resolve, doesn't belong to
        ``user_id``, isn't ``ACTIVE``, or is already exhausted: a stale
        ``program_assignment_id`` on a historical logged session must never
        resurrect cursor movement on a since-completed/abandoned
        assignment. Callers own the transaction boundary (this method
        commits after mutating).
        """
        assignment = self.program_repository.get_assignment_by_id(program_assignment_id)
        if (
            assignment is None
            or assignment.user_id != user_id
            or assignment.status != AssignmentStatus.ACTIVE
            or assignment.cursor_exhausted
        ):
            return
        self._advance_cursor(assignment)
        self.program_repository.db.commit()

    def advance_past_rest_day(self, user_id: uuid.UUID) -> ProgramAssignment:
        """Advance the progress cursor past an explicit rest day.

        The only way to move past a ``ProgramDay`` with no ``workout_id``:
        rest days have no ``WorkoutLog`` of their own to finish/skip, so
        this is the client-facing counterpart to
        :meth:`~app.services.workout_log_service.WorkoutLogService.finish_workout`/
        :meth:`~app.services.workout_log_service.WorkoutLogService.skip_workout`
        for training days.

        Returns:
            The assignment with its cursor advanced (or marked exhausted,
            if this was the program's last scheduled day).

        Raises:
            NoActiveAssignmentError: If the user has no ``ACTIVE`` assignment.
            NotARestDayError: If the resolved state is not currently
                :attr:`ResolutionState.REST_DAY`.
        """
        result = self.resolve_current(user_id)
        if result.state == ResolutionState.NO_ACTIVE_PROGRAM:
            raise NoActiveAssignmentError("This user has no active program assignment.")
        if result.state != ResolutionState.REST_DAY:
            raise NotARestDayError(
                f"Cannot advance past a rest day; current resolved state is "
                f"'{result.state.value}'."
            )
        assignment = result.assignment
        self._advance_cursor(assignment)
        self.program_repository.db.commit()
        return assignment

    # -- Internal helpers --------------------------------------------------------

    def _advance_cursor(self, assignment: ProgramAssignment) -> None:
        """Move ``assignment``'s progress cursor to the next scheduled day, or mark it exhausted.

        Shared by :meth:`advance_after_action` and
        :meth:`advance_past_rest_day`. Does not commit — callers own the
        transaction boundary.
        """
        program = self.program_repository.get_by_id(assignment.program_id)
        next_day = self.program_repository.get_next_day_after(
            assignment.program_id,
            assignment.current_week_number,
            assignment.current_day_number,
            max_week=program.duration_weeks,
        )
        if next_day is None:
            assignment.cursor_exhausted = True
        else:
            assignment.current_week_number = next_day.week_number
            assignment.current_day_number = next_day.day_number
            assignment.current_program_day_id = next_day.id
        self.program_repository.update_assignment(assignment)

    def _resolve_today_log_status(
        self, user_id: uuid.UUID, assignment: ProgramAssignment
    ) -> tuple[TodayLogStatus, uuid.UUID | None]:
        """Determine whether the user has already acted on today's training day.

        Checks for an in-progress session first (regardless of date, since
        at most one can exist per user), then falls back to today's most
        recent completed/skipped session logged against this assignment.
        """
        active_log = self.workout_log_repository.get_active_for_user(user_id)
        if active_log is not None:
            return TodayLogStatus.IN_PROGRESS, active_log.id

        todays_logs = self.workout_log_repository.list_for_user(
            user_id,
            program_assignment_id=assignment.id,
            date_from=date.today(),
            date_to=date.today(),
            limit=1,
            offset=0,
        )
        if todays_logs:
            latest = todays_logs[0]
            if latest.status == WorkoutLogStatus.COMPLETED:
                return TodayLogStatus.COMPLETED, latest.id
            if latest.status == WorkoutLogStatus.SKIPPED:
                return TodayLogStatus.SKIPPED, latest.id

        return TodayLogStatus.NONE, None
