"""Workout template routes — read-only browsing of authored workout templates.

Routes stay thin: parse/validate input, delegate to
:class:`~app.services.workout_service.WorkoutService`, and translate its
documented exceptions into HTTP responses. No business logic, database
queries, or catalog-validation rules happen in this module.

Requires an authenticated user (``Depends(get_current_user)``), mirroring
``workout_logs.py``/``workout_resolution.py`` rather than the public
``exercises.py`` catalog — workout templates may include coach/AI-authored
drafts a user shouldn't be able to browse unauthenticated. Write operations
(create/update/deactivate/program authoring) exist on ``WorkoutService`` for
future coach/admin tooling, but are intentionally not exposed here yet —
Sprint 6.3 scopes the public API to the read surface the mobile app needs.

Sprint 6.3 also exposes convenience session/resolution aliases under this
router (``/workouts/current``, ``/workouts/session``) so clients can
discover the workout domain from a single prefix; the canonical execution
routes remain under ``/workout-logs``.
"""

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.v1.workout_preview import resolve_today_preview_for_user
from app.core.dependencies import (
    get_workout_log_service,
    get_workout_resolution_service,
    get_workout_service,
)
from app.models.user import User
from app.schemas.workout import WorkoutPage, WorkoutPublic
from app.schemas.workout_log import WorkoutLogDetail, WorkoutLogStart, WorkoutSessionUpdate
from app.schemas.workout_resolution import WorkoutPreview
from app.security.dependencies import get_current_user
from app.services.workout_log_service import (
    ActiveSessionExistsError,
    ConcurrentSessionError,
    InvalidProgramAssignmentReferenceError,
    InvalidWorkoutLogStateError,
    InvalidWorkoutReferenceError,
    WorkoutLogNotFoundError,
    WorkoutLogService,
)
from app.services.workout_service import WorkoutNotFoundError, WorkoutService
from app.services.workout_resolution_service import WorkoutResolutionService

router = APIRouter(prefix="/workouts", tags=["workouts"])


def _not_found(detail: str) -> HTTPException:
    return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=detail)


def _conflict(detail: str) -> HTTPException:
    return HTTPException(status_code=status.HTTP_409_CONFLICT, detail=detail)


def _bad_request(detail: str) -> HTTPException:
    return HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)


def _resolve_workout(id_or_slug: str, workout_service: WorkoutService) -> WorkoutPublic:
    """Look up a workout template by UUID id if possible, otherwise by slug."""
    try:
        workout_id = uuid.UUID(id_or_slug)
    except ValueError:
        workout = workout_service.get_workout_by_slug(id_or_slug)
    else:
        workout = workout_service.get_workout(workout_id)
    return WorkoutPublic.from_model(workout)


@router.get("/current", response_model=WorkoutPreview)
def get_current_workout(
    current_user: User = Depends(get_current_user),
    workout_service: WorkoutService = Depends(get_workout_service),
    resolution_service: WorkoutResolutionService = Depends(get_workout_resolution_service),
) -> WorkoutPreview:
    """Return what the user should do right now in their active program.

    Alias for ``GET /workout-resolution/today`` — auto-assigns the default
    beginner program on first access (Sprint 6.3.1).
    """
    return resolve_today_preview_for_user(
        current_user.id,
        workout_service=workout_service,
        resolution_service=resolution_service,
    )


@router.post("/session", response_model=WorkoutLogDetail, status_code=status.HTTP_201_CREATED)
def start_workout_session(
    data: WorkoutLogStart,
    current_user: User = Depends(get_current_user),
    workout_log_service: WorkoutLogService = Depends(get_workout_log_service),
) -> WorkoutLogDetail:
    """Start a new logged workout session.

    Alias for ``POST /workout-logs/start``.
    """
    try:
        workout_log = workout_log_service.start_workout(current_user.id, data)
    except (ActiveSessionExistsError, ConcurrentSessionError) as exc:
        raise _conflict(str(exc)) from exc
    except (InvalidWorkoutReferenceError, InvalidProgramAssignmentReferenceError) as exc:
        raise _bad_request(str(exc)) from exc
    return WorkoutLogDetail.from_model(workout_log)


@router.patch("/session/{session_id}", response_model=WorkoutLogDetail)
def update_workout_session(
    session_id: uuid.UUID,
    data: WorkoutSessionUpdate,
    current_user: User = Depends(get_current_user),
    workout_log_service: WorkoutLogService = Depends(get_workout_log_service),
) -> WorkoutLogDetail:
    """Partially update an in-progress session or finish/skip it.

    ``action=finish`` completes the session (optional ``notes``,
    ``duration_actual_minutes``). ``action=skip`` cancels it. Omit
    ``action`` to update ``notes`` on an in-progress session only.
    """
    try:
        workout_log = workout_log_service.update_session(current_user.id, session_id, data)
    except WorkoutLogNotFoundError as exc:
        raise _not_found("Workout session not found.") from exc
    except InvalidWorkoutLogStateError as exc:
        raise _conflict(str(exc)) from exc
    return WorkoutLogDetail.from_model(workout_log)


@router.get("", response_model=WorkoutPage)
def list_workouts(
    q: str | None = Query(default=None, description="Case-insensitive name search."),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    current_user: User = Depends(get_current_user),
    workout_service: WorkoutService = Depends(get_workout_service),
) -> WorkoutPage:
    """Return a filtered, paginated page of active workout templates."""
    page = workout_service.list_workouts(search=q, limit=limit, offset=offset)
    return WorkoutPage(
        items=[WorkoutPublic.from_model(workout) for workout in page.items],
        total=page.total,
        limit=page.limit,
        offset=page.offset,
    )


@router.get("/{id_or_slug}", response_model=WorkoutPublic)
def get_workout(
    id_or_slug: str,
    current_user: User = Depends(get_current_user),
    workout_service: WorkoutService = Depends(get_workout_service),
) -> WorkoutPublic:
    """Return a single workout template by id or slug, with ordered exercises.

    Raises:
        HTTPException: 404 if no active workout template matches.
    """
    try:
        return _resolve_workout(id_or_slug, workout_service)
    except WorkoutNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workout not found.",
        ) from exc
