"""Pydantic v2 schemas for the Workout Execution domain — request/response contracts.

These schemas define the API surface independently of the SQLAlchemy
``WorkoutLog``/``WorkoutLogExercise``/``WorkoutSetLog`` models (see
``app.models.workout_log``). Supersedes the shell-only ``WorkoutLogRead``
that previously lived in ``app.schemas.workout`` (Sprint 3.2) — that schema
is removed now that the real logging workflow exists.

``status``, ``started_at``/``completed_at``, ``set_number``, ``order_index``,
and ``exercise_name_snapshot`` are never client-supplied; they are only ever
set by :class:`~app.services.workout_log_service.WorkoutLogService`'s
dedicated transition/logging methods, mirroring how ``ProgramCreate``
excludes ``status`` in ``app.schemas.program``.
"""

import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field, StringConstraints, model_validator

from app.models.workout_log import WorkoutLog, WorkoutLogExercise, WorkoutLogStatus, WorkoutSetLog

WorkoutLogTextField = Annotated[str, StringConstraints(max_length=10_000)]
RpeField = Annotated[Decimal, Field(ge=0, le=10)]


class WorkoutLogStart(BaseModel):
    """Input schema for starting a new logged session.

    Both ``workout_id`` and ``program_assignment_id`` are optional and
    independent — see ``app.models.workout_log.WorkoutLog`` for the four
    combinations this supports (fully ad-hoc, template-only, program-only
    is not meaningful, or template + active program assignment).
    """

    workout_id: uuid.UUID | None = None
    program_assignment_id: uuid.UUID | None = None
    scheduled_date: date | None = None
    notes: WorkoutLogTextField | None = None


class WorkoutLogFinish(BaseModel):
    """Input schema for finishing an in-progress session.

    Both fields are optional overrides — ``duration_actual_minutes``
    defaults to the elapsed time between ``started_at`` and ``completed_at``
    when omitted (see ``WorkoutLogService.finish_workout``).
    """

    duration_actual_minutes: int | None = Field(default=None, gt=0)
    notes: WorkoutLogTextField | None = None


class WorkoutLogExerciseCreate(BaseModel):
    """Input schema for adding an ad-hoc exercise instance to an in-progress session.

    ``exercise_name_snapshot`` is never client-supplied — the service
    copies it from the catalog ``Exercise.name`` at add-time.
    """

    exercise_id: uuid.UUID
    order_index: int | None = Field(default=None, ge=0)
    notes: WorkoutLogTextField | None = None


class WorkoutSetLogCreate(BaseModel):
    """Input schema for logging a new set within a log-exercise.

    ``set_number`` is never client-supplied — the service always assigns
    the next available number within the exercise.
    """

    weight_kg: Decimal | None = Field(default=None, gt=0)
    reps: int | None = Field(default=None, gt=0)
    rpe: RpeField | None = None
    duration_seconds: int | None = Field(default=None, gt=0)
    is_warmup: bool = False
    notes: WorkoutLogTextField | None = None

    @model_validator(mode="after")
    def _check_has_a_measurement(self) -> "WorkoutSetLogCreate":
        """Ensure at least one of weight/reps/duration is present — an empty set is meaningless."""
        if self.weight_kg is None and self.reps is None and self.duration_seconds is None:
            raise ValueError("At least one of weight_kg, reps, or duration_seconds is required.")
        return self


class WorkoutSetLogUpdate(BaseModel):
    """Input schema for partially updating a previously logged set.

    All fields are optional so clients submit only the attributes they
    wish to change. Subject to the service's edit-window rule regardless
    of which fields are provided.
    """

    weight_kg: Decimal | None = Field(default=None, gt=0)
    reps: int | None = Field(default=None, gt=0)
    rpe: RpeField | None = None
    duration_seconds: int | None = Field(default=None, gt=0)
    is_warmup: bool | None = None
    notes: WorkoutLogTextField | None = None

    @model_validator(mode="after")
    def _check_not_empty(self) -> "WorkoutSetLogUpdate":
        """Ensure the patch changes at least one field."""
        if all(
            value is None
            for value in (
                self.weight_kg,
                self.reps,
                self.rpe,
                self.duration_seconds,
                self.is_warmup,
                self.notes,
            )
        ):
            raise ValueError("At least one field must be provided.")
        return self


class WorkoutSetLogRead(BaseModel):
    """Public-facing representation of a single logged set."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    set_number: int
    weight_kg: Decimal | None
    reps: int | None
    rpe: Decimal | None
    duration_seconds: int | None
    is_warmup: bool
    notes: str | None
    created_at: datetime
    updated_at: datetime


class WorkoutLogExerciseRead(BaseModel):
    """Public-facing representation of a single logged exercise instance, with its sets."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    exercise_id: uuid.UUID
    workout_exercise_id: uuid.UUID | None
    order_index: int
    exercise_name_snapshot: str
    target_sets: int | None
    target_reps_min: int | None
    target_reps_max: int | None
    rest_seconds: int | None
    notes: str | None
    sets: list[WorkoutSetLogRead]
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_model(cls, log_exercise: WorkoutLogExercise) -> "WorkoutLogExerciseRead":
        """Build this schema from a :class:`WorkoutLogExercise` with ``set_logs`` loaded."""
        return cls(
            id=log_exercise.id,
            exercise_id=log_exercise.exercise_id,
            workout_exercise_id=log_exercise.workout_exercise_id,
            order_index=log_exercise.order_index,
            exercise_name_snapshot=log_exercise.exercise_name_snapshot,
            target_sets=log_exercise.target_sets,
            target_reps_min=log_exercise.target_reps_min,
            target_reps_max=log_exercise.target_reps_max,
            rest_seconds=log_exercise.rest_seconds,
            notes=log_exercise.notes,
            sets=[WorkoutSetLogRead.model_validate(set_log) for set_log in log_exercise.set_logs],
            created_at=log_exercise.created_at,
            updated_at=log_exercise.updated_at,
        )


class WorkoutLogDetail(BaseModel):
    """Full public-facing representation of a single logged session, with nested exercises/sets."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    program_assignment_id: uuid.UUID | None
    workout_id: uuid.UUID | None
    status: WorkoutLogStatus
    scheduled_date: date | None
    started_at: datetime | None
    completed_at: datetime | None
    duration_actual_minutes: int | None
    notes: str | None
    exercises: list[WorkoutLogExerciseRead]
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_model(cls, workout_log: WorkoutLog) -> "WorkoutLogDetail":
        """Build this schema from a :class:`WorkoutLog` with ``log_exercises`` loaded.

        The model's relationship is named ``log_exercises`` (see
        ``app.models.workout_log``); this maps it onto the schema's public
        ``exercises`` field, mirroring ``WorkoutPublic.from_model``.
        """
        return cls(
            id=workout_log.id,
            user_id=workout_log.user_id,
            program_assignment_id=workout_log.program_assignment_id,
            workout_id=workout_log.workout_id,
            status=workout_log.status,
            scheduled_date=workout_log.scheduled_date,
            started_at=workout_log.started_at,
            completed_at=workout_log.completed_at,
            duration_actual_minutes=workout_log.duration_actual_minutes,
            notes=workout_log.notes,
            exercises=[
                WorkoutLogExerciseRead.from_model(log_exercise)
                for log_exercise in workout_log.log_exercises
            ],
            created_at=workout_log.created_at,
            updated_at=workout_log.updated_at,
        )


class WorkoutLogSummary(BaseModel):
    """Flat, lightweight representation of a logged session — no nested sets.

    Used for history lists, where fetching every set of every session on a
    page would be needlessly heavy; call the detail endpoint for a single
    session's full breakdown.
    """

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    program_assignment_id: uuid.UUID | None
    workout_id: uuid.UUID | None
    status: WorkoutLogStatus
    scheduled_date: date | None
    started_at: datetime | None
    completed_at: datetime | None
    duration_actual_minutes: int | None
    notes: str | None
    exercise_count: int
    created_at: datetime

    @classmethod
    def from_model(cls, workout_log: WorkoutLog) -> "WorkoutLogSummary":
        """Build this schema from a :class:`WorkoutLog` with ``log_exercises`` loaded."""
        return cls(
            id=workout_log.id,
            program_assignment_id=workout_log.program_assignment_id,
            workout_id=workout_log.workout_id,
            status=workout_log.status,
            scheduled_date=workout_log.scheduled_date,
            started_at=workout_log.started_at,
            completed_at=workout_log.completed_at,
            duration_actual_minutes=workout_log.duration_actual_minutes,
            notes=workout_log.notes,
            exercise_count=len(workout_log.log_exercises),
            created_at=workout_log.created_at,
        )


class WorkoutLogPage(BaseModel):
    """A paginated page of :class:`WorkoutLogSummary` results."""

    items: list[WorkoutLogSummary]
    total: int
    limit: int
    offset: int
