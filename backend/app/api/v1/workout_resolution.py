"""Workout Resolution Engine routes — "what should I do right now?".

Routes stay thin: parse/validate input, delegate to
:class:`~app.services.workout_resolution_service.WorkoutResolutionService`,
and translate its documented exceptions into HTTP responses. No business
logic, database queries, or cursor-advancement rules happen in this
module.

Both routes require an authenticated user (``Depends(get_current_user)``);
``user_id`` is always taken from the resolved token, never from the
request body or path, mirroring ``workout_logs.py``.
"""

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.dependencies import get_workout_resolution_service
from app.models.user import User
from app.schemas.workout_resolution import WorkoutPreview
from app.security.dependencies import get_current_user
from app.services.workout_resolution_service import (
    NoActiveAssignmentError,
    NotARestDayError,
    WorkoutResolutionService,
)

router = APIRouter(prefix="/workout-resolution", tags=["workout-resolution"])


def _not_found(detail: str) -> HTTPException:
    return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=detail)


def _conflict(detail: str) -> HTTPException:
    return HTTPException(status_code=status.HTTP_409_CONFLICT, detail=detail)


@router.get("/today", response_model=WorkoutPreview)
def get_today_preview(
    current_user: User = Depends(get_current_user),
    resolution_service: WorkoutResolutionService = Depends(get_workout_resolution_service),
) -> WorkoutPreview:
    """Return a read-only preview of what the user should do right now.

    Always returns ``200`` — ``state`` disambiguates ``training_day``,
    ``rest_day``, ``program_complete``, and ``no_active_program``. Never
    mutates the user's program assignment.
    """
    result = resolution_service.resolve_current(current_user.id)
    return WorkoutPreview.from_result(result)


@router.post("/advance-rest-day", response_model=WorkoutPreview)
def advance_rest_day(
    current_user: User = Depends(get_current_user),
    resolution_service: WorkoutResolutionService = Depends(get_workout_resolution_service),
) -> WorkoutPreview:
    """Advance the progress cursor past an explicit rest day.

    The only way to move past a scheduled rest day — it has no
    ``WorkoutLog`` of its own to finish/skip.

    Raises:
        HTTPException: 404 if the user has no active program assignment;
            409 if the currently resolved state is not ``rest_day``.
    """
    try:
        resolution_service.advance_past_rest_day(current_user.id)
    except NoActiveAssignmentError as exc:
        raise _not_found(str(exc)) from exc
    except NotARestDayError as exc:
        raise _conflict(str(exc)) from exc
    result = resolution_service.resolve_current(current_user.id)
    return WorkoutPreview.from_result(result)
