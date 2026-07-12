"""Pydantic v2 schemas for the Workout Resolution Engine — response contracts.

There is no request/input schema here: resolution is a read (``GET
/workout-resolution/today``) and a single parameterless action (``POST
/workout-resolution/advance-rest-day``); everything the engine needs comes
from the authenticated user's id and their active
:class:`~app.models.program.ProgramAssignment`, never from a request body.

``WorkoutResolutionState`` and ``TodayLogStatus`` are defined here (rather
than in ``app.models``) because — unlike ``AssignmentStatus`` or
``WorkoutLogStatus`` — neither is a persisted column; both are computed
fresh on every read by
:class:`~app.services.workout_resolution_service.WorkoutResolutionService`.
The service imports them from this module, mirroring how it already
imports request schemas such as ``WorkoutLogStart`` from
``app.schemas.workout_log``.
"""

import uuid
from enum import Enum
from typing import TYPE_CHECKING

from pydantic import BaseModel

from app.models.workout import Workout
from app.schemas.program import ProgramPublic
from app.schemas.workout import WorkoutPublic

if TYPE_CHECKING:
    from app.services.workout_resolution_service import ResolutionResult


class WorkoutResolutionState(str, Enum):
    """The four mutually exclusive states a resolution can return."""

    TRAINING_DAY = "training_day"
    REST_DAY = "rest_day"
    PROGRAM_COMPLETE = "program_complete"
    NO_ACTIVE_PROGRAM = "no_active_program"


class TodayLogStatus(str, Enum):
    """Whether — and how — the user has already acted on today's resolved training day.

    Always :attr:`NONE` for non-``TRAINING_DAY`` resolution states.
    """

    NONE = "none"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    SKIPPED = "skipped"


class WorkoutPreview(BaseModel):
    """A read-only preview of what the user should do right now in their active program.

    ``program``/``assignment_id``/``week_number``/``day_number``/
    ``day_label``/``workout`` are populated only as relevant to ``state``:
    all are ``None`` for :attr:`WorkoutResolutionState.NO_ACTIVE_PROGRAM`,
    and ``workout`` is additionally ``None`` for
    :attr:`WorkoutResolutionState.REST_DAY`.
    """

    state: WorkoutResolutionState
    program: ProgramPublic | None = None
    assignment_id: uuid.UUID | None = None
    week_number: int | None = None
    day_number: int | None = None
    day_label: str | None = None
    workout: WorkoutPublic | None = None
    today_log_status: TodayLogStatus = TodayLogStatus.NONE
    active_workout_log_id: uuid.UUID | None = None

    @classmethod
    def from_result(cls, result: "ResolutionResult") -> "WorkoutPreview":
        """Build this schema from a :class:`~app.services.workout_resolution_service.ResolutionResult`.

        Kept here (rather than as a service method) so the service layer
        never needs to import a response schema, matching how
        ``WorkoutLogDetail.from_model``/``WorkoutPublic.from_model`` do the
        model-to-schema translation at the schema layer, not the service
        layer.
        """
        workout: Workout | None = result.workout
        program_day = result.program_day
        return cls(
            state=WorkoutResolutionState(result.state.value),
            program=ProgramPublic.model_validate(result.program)
            if result.program is not None
            else None,
            assignment_id=result.assignment.id if result.assignment is not None else None,
            week_number=program_day.week_number if program_day is not None else None,
            day_number=program_day.day_number if program_day is not None else None,
            day_label=program_day.label if program_day is not None else None,
            workout=WorkoutPublic.from_model(workout) if workout is not None else None,
            today_log_status=TodayLogStatus(result.today_log_status.value),
            active_workout_log_id=result.active_workout_log_id,
        )
