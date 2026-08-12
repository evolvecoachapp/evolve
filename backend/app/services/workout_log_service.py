"""Business logic for the Workout Execution domain — logging a session.

``WorkoutLogService`` is the only layer that composes
:class:`~app.repositories.workout_log_repository.WorkoutLogRepository`
with the read-only repositories it needs to validate cross-aggregate
references (:class:`~app.repositories.workout_repository.WorkoutRepository`
for template lookups,
:class:`~app.repositories.exercise_repository.ExerciseRepository` for
catalog lookups, and
:class:`~app.repositories.program_repository.ProgramRepository` for
program-assignment ownership/status checks). It is deliberately a
separate service from
:class:`~app.services.workout_service.WorkoutService` — that service owns
authoring (programs/workout templates); this one owns *execution*
(starting, logging, finishing, and reviewing a session), per the
Sprint 3.3 design.

Covers:

- **Session lifecycle** — start (always ad-hoc-or-templated, directly
  ``IN_PROGRESS``; never more than one active session per user), finish,
  skip.
- **Logging** — adding exercise instances and sets to an active session.
- **Correction** — editing/deleting a previously logged set, gated by a
  configurable post-completion edit window.
- **History** — filtered, paginated review of past sessions.

Contains no HTTP concepts and no raw SQL — a future API layer translates
this service's return values and documented exceptions into
request/response schemas and HTTP status codes.
"""

import uuid
from datetime import date

from sqlalchemy.exc import IntegrityError

from app.core.config import settings
from app.models.program import AssignmentStatus
from app.models.workout_log import (
    WorkoutLog,
    WorkoutLogExercise,
    WorkoutLogStatus,
    WorkoutSetLog,
)
from app.repositories.exercise_repository import ExerciseRepository
from app.repositories.program_repository import ProgramRepository
from app.repositories.workout_log_repository import WorkoutLogRepository
from app.repositories.workout_repository import WorkoutRepository
from app.schemas.workout_log import (
    WorkoutLogExerciseCreate,
    WorkoutLogFinish,
    WorkoutLogStart,
    WorkoutSessionAction,
    WorkoutSessionUpdate,
    WorkoutSetLogCreate,
    WorkoutSetLogUpdate,
)
from app.services.workout_resolution_service import WorkoutResolutionService
from app.utils.datetime import utcnow
from app.utils.pagination import Page, clamp_pagination


class WorkoutLogServiceError(Exception):
    """Base class for all errors raised by :class:`WorkoutLogService`."""


class WorkoutLogNotFoundError(WorkoutLogServiceError):
    """Raised when a workout log id does not resolve to a session owned by the caller.

    Deliberately raised both when the log truly doesn't exist and when it
    belongs to a different user — the caller-facing error is identical
    (404) in both cases, so a log's existence can't be probed by id.
    """


class LogExerciseNotFoundError(WorkoutLogServiceError):
    """Raised when a log-exercise id does not resolve within the given workout log."""


class SetLogNotFoundError(WorkoutLogServiceError):
    """Raised when a set-log id does not resolve within the given log-exercise."""


class ActiveSessionExistsError(WorkoutLogServiceError):
    """Raised by :meth:`WorkoutLogService.start_workout` if the user already has an ``IN_PROGRESS`` session.

    Deliberately a hard conflict rather than auto-abandoning the existing
    session (unlike ``WorkoutService.assign_program``'s auto-abandon) —
    silently discarding in-flight logged sets would be worse than a clear
    409.
    """


class ConcurrentSessionError(WorkoutLogServiceError):
    """Raised if a race condition slips a second ``IN_PROGRESS`` session past the pre-check.

    A safety net for the partial unique index
    ``uq_workout_logs_one_in_progress_per_user`` — should be exceedingly
    rare given :meth:`WorkoutLogService.start_workout` checks
    :meth:`WorkoutLogRepository.get_active_for_user` first.
    """


class InvalidWorkoutLogStateError(WorkoutLogServiceError):
    """Raised when a state transition or mutation is not valid from the log's current status."""


class EditWindowExpiredError(WorkoutLogServiceError):
    """Raised when editing/deleting a set log after its post-completion edit window has elapsed."""


class InvalidWorkoutReferenceError(WorkoutLogServiceError):
    """Raised when ``workout_id`` does not resolve to a usable workout template."""


class InvalidExerciseReferenceError(WorkoutLogServiceError):
    """Raised when ``exercise_id`` does not resolve to a usable catalog exercise."""


class InvalidProgramAssignmentReferenceError(WorkoutLogServiceError):
    """Raised when ``program_assignment_id`` does not resolve to an active assignment owned by the caller."""


class WorkoutLogService:
    """Session start/finish/skip, per-set logging, corrections, and history.

    Depends on repositories directly rather than on
    :class:`~app.services.workout_service.WorkoutService`, keeping
    composition flat and each service unit-testable with mocked
    repositories. The one exception is
    :class:`~app.services.workout_resolution_service.WorkoutResolutionService`:
    :meth:`finish_workout`/:meth:`skip_workout` call its
    ``advance_after_action`` side effect so a program assignment's Workout
    Resolution Engine progress cursor moves forward automatically whenever
    a scheduled session concludes, without requiring the client to make a
    separate call.
    """

    def __init__(
        self,
        workout_log_repository: WorkoutLogRepository,
        workout_repository: WorkoutRepository,
        exercise_repository: ExerciseRepository,
        program_repository: ProgramRepository,
        workout_resolution_service: WorkoutResolutionService,
    ) -> None:
        self.workout_log_repository = workout_log_repository
        self.workout_repository = workout_repository
        self.exercise_repository = exercise_repository
        self.program_repository = program_repository
        self.workout_resolution_service = workout_resolution_service

    # -- Session lifecycle ---------------------------------------------------

    def start_workout(self, user_id: uuid.UUID, data: WorkoutLogStart) -> WorkoutLog:
        """Start a new logged session, directly in :attr:`WorkoutLogStatus.IN_PROGRESS`.

        If ``data.workout_id`` is given, auto-seeds one
        :class:`WorkoutLogExercise` per exercise line item in that
        template (copying its target prescription as a snapshot), so the
        client can log sets against existing rows instead of re-declaring
        exercises. A fully ad-hoc session (no ``workout_id``) starts with
        zero exercises.

        Args:
            user_id: The authenticated user starting the session.
            data: Validated start input.

        Returns:
            The newly created, ``IN_PROGRESS`` session with any auto-seeded
            exercises eagerly loaded.

        Raises:
            ActiveSessionExistsError: If the user already has an
                ``IN_PROGRESS`` session.
            InvalidProgramAssignmentReferenceError: If
                ``data.program_assignment_id`` is given but does not
                belong to ``user_id`` or is not ``ACTIVE``.
            InvalidWorkoutReferenceError: If ``data.workout_id`` is given
                but does not resolve to a usable workout template.
            ConcurrentSessionError: If a race condition slips a second
                active session past the pre-check.
        """
        if self.workout_log_repository.get_active_for_user(user_id) is not None:
            raise ActiveSessionExistsError(
                "This user already has an in-progress workout session."
            )

        if data.program_assignment_id is not None:
            self._get_owned_active_assignment_or_raise(user_id, data.program_assignment_id)

        template = None
        if data.workout_id is not None:
            template = self._get_usable_workout_or_raise(data.workout_id)

        now = utcnow()
        workout_log = WorkoutLog(
            user_id=user_id,
            program_assignment_id=data.program_assignment_id,
            workout_id=data.workout_id,
            status=WorkoutLogStatus.IN_PROGRESS,
            started_at=now,
            scheduled_date=data.scheduled_date or date.today(),
            notes=data.notes,
        )

        try:
            created = self.workout_log_repository.create(workout_log)
            if template is not None:
                for line_item in template.exercise_links:
                    self.workout_log_repository.add_exercise(
                        WorkoutLogExercise(
                            workout_log_id=created.id,
                            exercise_id=line_item.exercise_id,
                            workout_exercise_id=line_item.id,
                            order_index=line_item.order_index,
                            exercise_name_snapshot=line_item.exercise.name,
                            target_sets=line_item.target_sets,
                            target_reps_min=line_item.target_reps_min,
                            target_reps_max=line_item.target_reps_max,
                            rest_seconds=line_item.rest_seconds,
                        )
                    )
            self.workout_log_repository.db.commit()
        except IntegrityError as exc:
            self.workout_log_repository.db.rollback()
            raise ConcurrentSessionError(
                "This user already has an in-progress workout session."
            ) from exc

        return self.workout_log_repository.get_by_id(created.id)

    def finish_workout(
        self, user_id: uuid.UUID, workout_log_id: uuid.UUID, data: WorkoutLogFinish
    ) -> WorkoutLog:
        """Complete an in-progress session.

        Zero logged sets is allowed — a client can still finish an empty
        or aborted-but-intentional session.

        Args:
            user_id: The authenticated user finishing the session.
            workout_log_id: The session to finish.
            data: Optional overrides (``duration_actual_minutes``, ``notes``).

        Returns:
            The now-``COMPLETED`` session.

        Raises:
            WorkoutLogNotFoundError: If ``workout_log_id`` does not resolve
                to a session owned by ``user_id``.
            InvalidWorkoutLogStateError: If the session is not
                ``IN_PROGRESS``.
        """
        workout_log = self._get_owned_log_or_raise(user_id, workout_log_id)
        if workout_log.status != WorkoutLogStatus.IN_PROGRESS:
            raise InvalidWorkoutLogStateError(
                f"Session must be IN_PROGRESS to finish (current status: "
                f"{workout_log.status.value})."
            )

        now = utcnow()
        workout_log.completed_at = now
        workout_log.status = WorkoutLogStatus.COMPLETED
        if data.duration_actual_minutes is not None:
            workout_log.duration_actual_minutes = data.duration_actual_minutes
        elif workout_log.started_at is not None:
            elapsed_minutes = (now - workout_log.started_at).total_seconds() / 60
            workout_log.duration_actual_minutes = max(1, round(elapsed_minutes))
        if data.notes is not None:
            workout_log.notes = data.notes

        updated = self.workout_log_repository.update(workout_log)
        self.workout_log_repository.db.commit()
        self._advance_resolution_cursor(user_id, updated)
        return updated

    def skip_workout(self, user_id: uuid.UUID, workout_log_id: uuid.UUID) -> WorkoutLog:
        """Cancel an in-progress session without discarding its row.

        Args:
            user_id: The authenticated user skipping the session.
            workout_log_id: The session to skip.

        Returns:
            The now-``SKIPPED`` session.

        Raises:
            WorkoutLogNotFoundError: If ``workout_log_id`` does not resolve
                to a session owned by ``user_id``.
            InvalidWorkoutLogStateError: If the session is not
                ``IN_PROGRESS``.
        """
        workout_log = self._get_owned_log_or_raise(user_id, workout_log_id)
        if workout_log.status != WorkoutLogStatus.IN_PROGRESS:
            raise InvalidWorkoutLogStateError(
                f"Session must be IN_PROGRESS to skip (current status: "
                f"{workout_log.status.value})."
            )

        workout_log.status = WorkoutLogStatus.SKIPPED
        workout_log.completed_at = utcnow()

        updated = self.workout_log_repository.update(workout_log)
        self.workout_log_repository.db.commit()
        self._advance_resolution_cursor(user_id, updated)
        return updated

    def update_session(
        self, user_id: uuid.UUID, workout_log_id: uuid.UUID, data: WorkoutSessionUpdate
    ) -> WorkoutLog:
        """Partially update an in-progress session or transition it to a terminal state.

        When ``data.action`` is :attr:`WorkoutSessionAction.FINISH` or
        :attr:`WorkoutSessionAction.SKIP`, delegates to
        :meth:`finish_workout`/:meth:`skip_workout`. Otherwise updates
        session metadata (``notes``) on an ``IN_PROGRESS`` row.

        Args:
            user_id: The authenticated user updating the session.
            workout_log_id: The session to update.
            data: Validated patch input.

        Returns:
            The updated session.

        Raises:
            WorkoutLogNotFoundError: If ``workout_log_id`` does not resolve
                to a session owned by ``user_id``.
            InvalidWorkoutLogStateError: If a metadata-only patch targets a
                session that is not ``IN_PROGRESS``, or if a finish/skip
                action is invalid for the current status.
        """
        if data.action == WorkoutSessionAction.FINISH:
            return self.finish_workout(
                user_id,
                workout_log_id,
                WorkoutLogFinish(
                    duration_actual_minutes=data.duration_actual_minutes,
                    notes=data.notes,
                ),
            )
        if data.action == WorkoutSessionAction.SKIP:
            return self.skip_workout(user_id, workout_log_id)

        workout_log = self._get_owned_in_progress_log_or_raise(user_id, workout_log_id)
        if data.notes is not None:
            workout_log.notes = data.notes
        updated = self.workout_log_repository.update(workout_log)
        self.workout_log_repository.db.commit()
        return updated

    # -- Logging: exercises and sets -----------------------------------------

    def add_exercise(
        self, user_id: uuid.UUID, workout_log_id: uuid.UUID, data: WorkoutLogExerciseCreate
    ) -> WorkoutLogExercise:
        """Add an ad-hoc exercise instance to an in-progress session.

        Args:
            user_id: The authenticated user logging the exercise.
            workout_log_id: The session to add the exercise to.
            data: Validated exercise input.

        Returns:
            The newly created log-exercise, with an empty set list.

        Raises:
            WorkoutLogNotFoundError: If ``workout_log_id`` does not resolve
                to a session owned by ``user_id``.
            InvalidWorkoutLogStateError: If the session is not
                ``IN_PROGRESS``.
            InvalidExerciseReferenceError: If ``data.exercise_id`` does not
                resolve to a usable catalog exercise.
        """
        workout_log = self._get_owned_in_progress_log_or_raise(user_id, workout_log_id)
        exercise = self._get_usable_exercise_or_raise(data.exercise_id)

        order_index = (
            data.order_index
            if data.order_index is not None
            else self.workout_log_repository.next_exercise_order_index(workout_log.id)
        )
        entry = WorkoutLogExercise(
            workout_log_id=workout_log.id,
            exercise_id=exercise.id,
            order_index=order_index,
            exercise_name_snapshot=exercise.name,
            notes=data.notes,
        )
        created = self.workout_log_repository.add_exercise(entry)
        self.workout_log_repository.db.commit()
        return created

    def skip_exercise(
        self, user_id: uuid.UUID, workout_log_id: uuid.UUID, log_exercise_id: uuid.UUID
    ) -> WorkoutLogExercise:
        """Mark a single exercise instance as explicitly skipped.

        Distinct from :meth:`skip_workout` (which skips the whole
        session) — this marks one exercise within an otherwise
        in-progress session as intentionally not performed, e.g. an
        injury or lack of equipment discovered mid-session. Allowed
        regardless of whether any sets have already been logged against
        this exercise.

        Args:
            user_id: The authenticated user skipping the exercise.
            workout_log_id: The session the exercise belongs to.
            log_exercise_id: The log-exercise to mark skipped.

        Returns:
            The updated log-exercise.

        Raises:
            WorkoutLogNotFoundError: If ``workout_log_id`` does not resolve
                to a session owned by ``user_id``.
            InvalidWorkoutLogStateError: If the session is not
                ``IN_PROGRESS``.
            LogExerciseNotFoundError: If ``log_exercise_id`` does not
                belong to ``workout_log_id``.
        """
        workout_log = self._get_owned_in_progress_log_or_raise(user_id, workout_log_id)
        log_exercise = self._get_log_exercise_or_raise(workout_log.id, log_exercise_id)

        log_exercise.skipped = True
        updated = self.workout_log_repository.update_exercise(log_exercise)
        self.workout_log_repository.db.commit()
        return updated

    def log_set(
        self,
        user_id: uuid.UUID,
        workout_log_id: uuid.UUID,
        log_exercise_id: uuid.UUID,
        data: WorkoutSetLogCreate,
    ) -> WorkoutSetLog:
        """Append a new set to a log-exercise within an in-progress session.

        ``set_number`` is always server-assigned (next available number
        within the exercise) — never client-supplied.

        Args:
            user_id: The authenticated user logging the set.
            workout_log_id: The session the exercise belongs to.
            log_exercise_id: The log-exercise to append the set to.
            data: Validated set input.

        Returns:
            The newly created set log.

        Raises:
            WorkoutLogNotFoundError: If ``workout_log_id`` does not resolve
                to a session owned by ``user_id``.
            InvalidWorkoutLogStateError: If the session is not
                ``IN_PROGRESS``.
            LogExerciseNotFoundError: If ``log_exercise_id`` does not
                belong to ``workout_log_id``.
        """
        workout_log = self._get_owned_in_progress_log_or_raise(user_id, workout_log_id)
        log_exercise = self._get_log_exercise_or_raise(workout_log.id, log_exercise_id)

        set_log = WorkoutSetLog(
            workout_log_exercise_id=log_exercise.id,
            set_number=self.workout_log_repository.next_set_number(log_exercise.id),
            weight_kg=data.weight_kg,
            reps=data.reps,
            rpe=data.rpe,
            duration_seconds=data.duration_seconds,
            is_warmup=data.is_warmup,
            notes=data.notes,
        )
        created = self.workout_log_repository.add_set(set_log)
        self.workout_log_repository.db.commit()
        return created

    def update_set(
        self,
        user_id: uuid.UUID,
        workout_log_id: uuid.UUID,
        log_exercise_id: uuid.UUID,
        set_log_id: uuid.UUID,
        data: WorkoutSetLogUpdate,
    ) -> WorkoutSetLog:
        """Partially update a previously logged set.

        Allowed while the session is ``IN_PROGRESS``, or for
        ``settings.workout_log_edit_window_hours`` after it was
        ``COMPLETED`` — see :meth:`_ensure_editable`.

        Raises:
            WorkoutLogNotFoundError: If ``workout_log_id`` does not resolve
                to a session owned by ``user_id``.
            LogExerciseNotFoundError: If ``log_exercise_id`` does not
                belong to ``workout_log_id``.
            SetLogNotFoundError: If ``set_log_id`` does not belong to
                ``log_exercise_id``.
            EditWindowExpiredError: If the session is locked (see above).
        """
        workout_log = self._get_owned_log_or_raise(user_id, workout_log_id)
        log_exercise = self._get_log_exercise_or_raise(workout_log.id, log_exercise_id)
        set_log = self._get_set_log_or_raise(log_exercise.id, set_log_id)
        self._ensure_editable(workout_log)

        if data.weight_kg is not None:
            set_log.weight_kg = data.weight_kg
        if data.reps is not None:
            set_log.reps = data.reps
        if data.rpe is not None:
            set_log.rpe = data.rpe
        if data.duration_seconds is not None:
            set_log.duration_seconds = data.duration_seconds
        if data.is_warmup is not None:
            set_log.is_warmup = data.is_warmup
        if data.notes is not None:
            set_log.notes = data.notes

        updated = self.workout_log_repository.update_set(set_log)
        self.workout_log_repository.db.commit()
        return updated

    def delete_set(
        self,
        user_id: uuid.UUID,
        workout_log_id: uuid.UUID,
        log_exercise_id: uuid.UUID,
        set_log_id: uuid.UUID,
    ) -> None:
        """Delete a previously logged set.

        Subject to the same edit-window rule as :meth:`update_set`.

        Raises:
            WorkoutLogNotFoundError: If ``workout_log_id`` does not resolve
                to a session owned by ``user_id``.
            LogExerciseNotFoundError: If ``log_exercise_id`` does not
                belong to ``workout_log_id``.
            SetLogNotFoundError: If ``set_log_id`` does not belong to
                ``log_exercise_id``.
            EditWindowExpiredError: If the session is locked (see
                :meth:`_ensure_editable`).
        """
        workout_log = self._get_owned_log_or_raise(user_id, workout_log_id)
        log_exercise = self._get_log_exercise_or_raise(workout_log.id, log_exercise_id)
        self._get_set_log_or_raise(log_exercise.id, set_log_id)
        self._ensure_editable(workout_log)

        self.workout_log_repository.delete_set(set_log_id)
        self.workout_log_repository.db.commit()

    # -- Reads ----------------------------------------------------------------

    def get_workout_log(self, user_id: uuid.UUID, workout_log_id: uuid.UUID) -> WorkoutLog:
        """Return a single session by id, with exercises/sets eagerly loaded.

        Raises:
            WorkoutLogNotFoundError: If ``workout_log_id`` does not resolve
                to a session owned by ``user_id``.
        """
        return self._get_owned_log_or_raise(user_id, workout_log_id)

    def get_active_log(self, user_id: uuid.UUID) -> WorkoutLog | None:
        """Return the user's current ``IN_PROGRESS`` session, or ``None`` if they have none."""
        return self.workout_log_repository.get_active_for_user(user_id)

    def list_history(
        self,
        user_id: uuid.UUID,
        *,
        status: WorkoutLogStatus | None = None,
        date_from: date | None = None,
        date_to: date | None = None,
        program_assignment_id: uuid.UUID | None = None,
        workout_id: uuid.UUID | None = None,
        limit: int = 20,
        offset: int = 0,
    ) -> Page[WorkoutLog]:
        """Return a filtered, paginated page of a user's sessions, most recent first."""
        safe_limit, safe_offset = clamp_pagination(limit, offset)
        filters = {
            "status": status,
            "date_from": date_from,
            "date_to": date_to,
            "program_assignment_id": program_assignment_id,
            "workout_id": workout_id,
        }
        items = self.workout_log_repository.list_for_user(
            user_id, **filters, limit=safe_limit, offset=safe_offset
        )
        total = self.workout_log_repository.count(user_id, **filters)
        return Page(items=items, total=total, limit=safe_limit, offset=safe_offset)

    def get_any_workout_log(self, workout_log_id: uuid.UUID) -> WorkoutLog:
        """Return a session by id without an ownership check (admin control plane).

        Raises:
            WorkoutLogNotFoundError: If ``workout_log_id`` does not resolve
                to a non-deleted session.
        """
        workout_log = self.workout_log_repository.get_by_id(workout_log_id)
        if workout_log is None or workout_log.deleted_at is not None:
            raise WorkoutLogNotFoundError("Workout log not found.")
        return workout_log

    def list_all_logs(
        self,
        *,
        user_id: uuid.UUID | None = None,
        status: WorkoutLogStatus | None = None,
        date_from: date | None = None,
        date_to: date | None = None,
        program_assignment_id: uuid.UUID | None = None,
        workout_id: uuid.UUID | None = None,
        limit: int = 20,
        offset: int = 0,
    ) -> Page[WorkoutLog]:
        """Return a filtered, paginated page of sessions across users."""
        safe_limit, safe_offset = clamp_pagination(limit, offset)
        filters = {
            "user_id": user_id,
            "status": status,
            "date_from": date_from,
            "date_to": date_to,
            "program_assignment_id": program_assignment_id,
            "workout_id": workout_id,
        }
        items = self.workout_log_repository.list_all(
            **filters, limit=safe_limit, offset=safe_offset
        )
        total = self.workout_log_repository.count_filtered(**filters)
        return Page(items=items, total=total, limit=safe_limit, offset=safe_offset)

    # -- Internal helpers --------------------------------------------------------

    def _get_owned_log_or_raise(
        self, user_id: uuid.UUID, workout_log_id: uuid.UUID
    ) -> WorkoutLog:
        workout_log = self.workout_log_repository.get_by_id(workout_log_id)
        if (
            workout_log is None
            or workout_log.deleted_at is not None
            or workout_log.user_id != user_id
        ):
            raise WorkoutLogNotFoundError("Workout log not found.")
        return workout_log

    def _get_owned_in_progress_log_or_raise(
        self, user_id: uuid.UUID, workout_log_id: uuid.UUID
    ) -> WorkoutLog:
        workout_log = self._get_owned_log_or_raise(user_id, workout_log_id)
        if workout_log.status != WorkoutLogStatus.IN_PROGRESS:
            raise InvalidWorkoutLogStateError(
                f"Session must be IN_PROGRESS to log exercises/sets (current "
                f"status: {workout_log.status.value})."
            )
        return workout_log

    def _get_log_exercise_or_raise(
        self, workout_log_id: uuid.UUID, log_exercise_id: uuid.UUID
    ) -> WorkoutLogExercise:
        log_exercise = self.workout_log_repository.get_exercise_by_id(log_exercise_id)
        if log_exercise is None or log_exercise.workout_log_id != workout_log_id:
            raise LogExerciseNotFoundError("Logged exercise not found.")
        return log_exercise

    def _get_set_log_or_raise(
        self, log_exercise_id: uuid.UUID, set_log_id: uuid.UUID
    ) -> WorkoutSetLog:
        set_log = self.workout_log_repository.get_set_by_id(set_log_id)
        if set_log is None or set_log.workout_log_exercise_id != log_exercise_id:
            raise SetLogNotFoundError("Logged set not found.")
        return set_log

    def _ensure_editable(self, workout_log: WorkoutLog) -> None:
        """Enforce the edit-window rule shared by :meth:`update_set`/:meth:`delete_set`.

        Editable while ``IN_PROGRESS``; editable for
        ``settings.workout_log_edit_window_hours`` after ``COMPLETED``;
        locked otherwise (``SKIPPED``, ``PLANNED``, or an expired window).
        """
        if workout_log.status == WorkoutLogStatus.IN_PROGRESS:
            return
        if workout_log.status == WorkoutLogStatus.COMPLETED and workout_log.completed_at is not None:
            elapsed_hours = (utcnow() - workout_log.completed_at).total_seconds() / 3600
            if elapsed_hours <= settings.workout_log_edit_window_hours:
                return
            raise EditWindowExpiredError(
                f"This session was completed more than "
                f"{settings.workout_log_edit_window_hours}h ago and is no longer editable."
            )
        raise EditWindowExpiredError(
            f"This session is not editable (status: {workout_log.status.value})."
        )

    def _get_usable_workout_or_raise(self, workout_id: uuid.UUID):
        workout = self.workout_repository.get_by_id(workout_id)
        if workout is None or workout.deleted_at is not None:
            raise InvalidWorkoutReferenceError("Workout template not found.")
        return workout

    def _get_usable_exercise_or_raise(self, exercise_id: uuid.UUID):
        exercise = self.exercise_repository.get_by_id(exercise_id)
        if exercise is None or exercise.deleted_at is not None:
            raise InvalidExerciseReferenceError("Exercise not found.")
        return exercise

    def _advance_resolution_cursor(self, user_id: uuid.UUID, workout_log: WorkoutLog) -> None:
        """Advance the Workout Resolution Engine cursor after a session concludes.

        A no-op when the session wasn't tied to a program assignment
        (``program_assignment_id is None``) — ad-hoc sessions have no
        cursor to move. Delegates the actual ownership/state guards to
        :meth:`~app.services.workout_resolution_service.WorkoutResolutionService.advance_after_action`,
        which is itself a silent no-op for a stale/inactive assignment.
        """
        if workout_log.program_assignment_id is None:
            return
        self.workout_resolution_service.advance_after_action(
            user_id, workout_log.program_assignment_id
        )

    def _get_owned_active_assignment_or_raise(
        self, user_id: uuid.UUID, program_assignment_id: uuid.UUID
    ):
        assignment = self.program_repository.get_assignment_by_id(program_assignment_id)
        if (
            assignment is None
            or assignment.user_id != user_id
            or assignment.status != AssignmentStatus.ACTIVE
        ):
            raise InvalidProgramAssignmentReferenceError(
                "This program assignment is not an active assignment owned by this user."
            )
        return assignment
