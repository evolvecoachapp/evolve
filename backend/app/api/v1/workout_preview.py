"""Shared helpers for workout preview/resolution API routes.

Sprint 6.3.1 — auto-assigns the default beginner program on first workout
access before delegating to
:class:`~app.services.workout_resolution_service.WorkoutResolutionService`.
Keeps orchestration in the API layer so ``WorkoutResolutionService`` stays
read-only and ``WorkoutService.assign_program`` remains the single
assignment code path.
"""

import uuid

from fastapi import HTTPException, status

from app.schemas.workout_resolution import WorkoutPreview
from app.services.workout_resolution_service import WorkoutResolutionService
from app.services.workout_service import DefaultProgramNotFoundError, WorkoutService


def resolve_today_preview_for_user(
    user_id: uuid.UUID,
    *,
    workout_service: WorkoutService,
    resolution_service: WorkoutResolutionService,
) -> WorkoutPreview:
    """Ensure an active assignment exists, then resolve today's workout preview.

    Raises:
        HTTPException: 503 if the configured default program is missing or
            not assignable.
    """
    try:
        workout_service.ensure_active_assignment(user_id)
    except DefaultProgramNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc
    result = resolution_service.resolve_current(user_id)
    return WorkoutPreview.from_result(result)
