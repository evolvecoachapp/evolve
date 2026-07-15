"""Workout log routes — starting, logging, finishing, correcting, and
reviewing workout sessions.

Routes stay thin: parse/validate input, delegate to
:class:`~app.services.workout_log_service.WorkoutLogService`, and
translate its documented exceptions into HTTP responses. No business
logic, database queries, or state-transition rules happen in this module.

Every route requires an authenticated user (``Depends(get_current_user)``);
``user_id`` is always taken from the resolved token, never from the
request body or path, so a caller can never act on another user's session.
``/workout-logs/active`` is registered before ``/workout-logs/{workout_log_id}``
so it isn't shadowed by the dynamic path.
"""

import uuid
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.dependencies import get_workout_log_service
from app.models.user import User
from app.models.workout_log import WorkoutLogStatus
from app.schemas.workout_log import (
    WorkoutLogDetail,
    WorkoutLogExerciseCreate,
    WorkoutLogExerciseRead,
    WorkoutLogFinish,
    WorkoutLogPage,
    WorkoutLogStart,
    WorkoutLogSummary,
    WorkoutSetLogCreate,
    WorkoutSetLogRead,
    WorkoutSetLogUpdate,
)
from app.security.dependencies import get_current_user
from app.services.workout_log_service import (
    ActiveSessionExistsError,
    ConcurrentSessionError,
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

router = APIRouter(prefix="/workout-logs", tags=["workout-logs"])


def _not_found(detail: str) -> HTTPException:
    return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=detail)


def _conflict(detail: str) -> HTTPException:
    return HTTPException(status_code=status.HTTP_409_CONFLICT, detail=detail)


def _bad_request(detail: str) -> HTTPException:
    return HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)


@router.post("/start", response_model=WorkoutLogDetail, status_code=status.HTTP_201_CREATED)
def start_workout(
    data: WorkoutLogStart,
    current_user: User = Depends(get_current_user),
    workout_log_service: WorkoutLogService = Depends(get_workout_log_service),
) -> WorkoutLogDetail:
    """Start a new logged session, directly in ``IN_PROGRESS``.

    Raises:
        HTTPException: 409 if the user already has an active session; 400
            if ``workout_id``/``program_assignment_id`` don't resolve to a
            usable reference owned by this user.
    """
    try:
        workout_log = workout_log_service.start_workout(current_user.id, data)
    except (ActiveSessionExistsError, ConcurrentSessionError) as exc:
        raise _conflict(str(exc)) from exc
    except (InvalidWorkoutReferenceError, InvalidProgramAssignmentReferenceError) as exc:
        raise _bad_request(str(exc)) from exc
    return WorkoutLogDetail.from_model(workout_log)


@router.get("/active", response_model=WorkoutLogDetail | None)
def get_active_log(
    current_user: User = Depends(get_current_user),
    workout_log_service: WorkoutLogService = Depends(get_workout_log_service),
) -> WorkoutLogDetail | None:
    """Return the user's current in-progress session, or ``null`` if they have none."""
    workout_log = workout_log_service.get_active_log(current_user.id)
    return WorkoutLogDetail.from_model(workout_log) if workout_log is not None else None


@router.get("", response_model=WorkoutLogPage)
def list_history(
    status_filter: WorkoutLogStatus | None = Query(default=None, alias="status"),
    date_from: date | None = None,
    date_to: date | None = None,
    program_assignment_id: uuid.UUID | None = None,
    workout_id: uuid.UUID | None = None,
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    current_user: User = Depends(get_current_user),
    workout_log_service: WorkoutLogService = Depends(get_workout_log_service),
) -> WorkoutLogPage:
    """Return a filtered, paginated page of the user's own logged sessions, most recent first."""
    page = workout_log_service.list_history(
        current_user.id,
        status=status_filter,
        date_from=date_from,
        date_to=date_to,
        program_assignment_id=program_assignment_id,
        workout_id=workout_id,
        limit=limit,
        offset=offset,
    )
    return WorkoutLogPage(
        items=[WorkoutLogSummary.from_model(workout_log) for workout_log in page.items],
        total=page.total,
        limit=page.limit,
        offset=page.offset,
    )


@router.get("/{workout_log_id}", response_model=WorkoutLogDetail)
def get_workout_log(
    workout_log_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    workout_log_service: WorkoutLogService = Depends(get_workout_log_service),
) -> WorkoutLogDetail:
    """Return a single logged session by id, with exercises/sets nested.

    Raises:
        HTTPException: 404 if the session doesn't exist or isn't owned by
            this user.
    """
    try:
        workout_log = workout_log_service.get_workout_log(current_user.id, workout_log_id)
    except WorkoutLogNotFoundError as exc:
        raise _not_found("Workout log not found.") from exc
    return WorkoutLogDetail.from_model(workout_log)


@router.post("/{workout_log_id}/finish", response_model=WorkoutLogDetail)
def finish_workout(
    workout_log_id: uuid.UUID,
    data: WorkoutLogFinish,
    current_user: User = Depends(get_current_user),
    workout_log_service: WorkoutLogService = Depends(get_workout_log_service),
) -> WorkoutLogDetail:
    """Complete an in-progress session.

    Raises:
        HTTPException: 404 if not found/owned; 409 if the session is not
            ``IN_PROGRESS``.
    """
    try:
        workout_log = workout_log_service.finish_workout(current_user.id, workout_log_id, data)
    except WorkoutLogNotFoundError as exc:
        raise _not_found("Workout log not found.") from exc
    except InvalidWorkoutLogStateError as exc:
        raise _conflict(str(exc)) from exc
    return WorkoutLogDetail.from_model(workout_log)


@router.post("/{workout_log_id}/skip", response_model=WorkoutLogDetail)
def skip_workout(
    workout_log_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    workout_log_service: WorkoutLogService = Depends(get_workout_log_service),
) -> WorkoutLogDetail:
    """Cancel an in-progress session without discarding its row.

    Raises:
        HTTPException: 404 if not found/owned; 409 if the session is not
            ``IN_PROGRESS``.
    """
    try:
        workout_log = workout_log_service.skip_workout(current_user.id, workout_log_id)
    except WorkoutLogNotFoundError as exc:
        raise _not_found("Workout log not found.") from exc
    except InvalidWorkoutLogStateError as exc:
        raise _conflict(str(exc)) from exc
    return WorkoutLogDetail.from_model(workout_log)


@router.post(
    "/{workout_log_id}/exercises",
    response_model=WorkoutLogExerciseRead,
    status_code=status.HTTP_201_CREATED,
)
def add_exercise(
    workout_log_id: uuid.UUID,
    data: WorkoutLogExerciseCreate,
    current_user: User = Depends(get_current_user),
    workout_log_service: WorkoutLogService = Depends(get_workout_log_service),
) -> WorkoutLogExerciseRead:
    """Add an ad-hoc exercise instance to an in-progress session.

    Raises:
        HTTPException: 404 if the session doesn't exist/isn't owned; 409 if
            the session is not ``IN_PROGRESS``; 400 if ``exercise_id``
            doesn't resolve.
    """
    try:
        log_exercise = workout_log_service.add_exercise(current_user.id, workout_log_id, data)
    except WorkoutLogNotFoundError as exc:
        raise _not_found("Workout log not found.") from exc
    except InvalidWorkoutLogStateError as exc:
        raise _conflict(str(exc)) from exc
    except InvalidExerciseReferenceError as exc:
        raise _bad_request(str(exc)) from exc
    return WorkoutLogExerciseRead.from_model(log_exercise)


@router.post(
    "/{workout_log_id}/exercises/{log_exercise_id}/skip",
    response_model=WorkoutLogExerciseRead,
)
def skip_exercise(
    workout_log_id: uuid.UUID,
    log_exercise_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    workout_log_service: WorkoutLogService = Depends(get_workout_log_service),
) -> WorkoutLogExerciseRead:
    """Mark a single exercise instance within an in-progress session as skipped.

    Raises:
        HTTPException: 404 if the session/exercise doesn't exist/isn't
            owned; 409 if the session is not ``IN_PROGRESS``.
    """
    try:
        log_exercise = workout_log_service.skip_exercise(
            current_user.id, workout_log_id, log_exercise_id
        )
    except WorkoutLogNotFoundError as exc:
        raise _not_found("Workout log not found.") from exc
    except LogExerciseNotFoundError as exc:
        raise _not_found("Logged exercise not found.") from exc
    except InvalidWorkoutLogStateError as exc:
        raise _conflict(str(exc)) from exc
    return WorkoutLogExerciseRead.from_model(log_exercise)


@router.post(
    "/{workout_log_id}/exercises/{log_exercise_id}/sets",
    response_model=WorkoutSetLogRead,
    status_code=status.HTTP_201_CREATED,
)
def log_set(
    workout_log_id: uuid.UUID,
    log_exercise_id: uuid.UUID,
    data: WorkoutSetLogCreate,
    current_user: User = Depends(get_current_user),
    workout_log_service: WorkoutLogService = Depends(get_workout_log_service),
) -> WorkoutSetLogRead:
    """Append a new set to a log-exercise within an in-progress session.

    Raises:
        HTTPException: 404 if the session/exercise doesn't exist/isn't
            owned; 409 if the session is not ``IN_PROGRESS``.
    """
    try:
        set_log = workout_log_service.log_set(
            current_user.id, workout_log_id, log_exercise_id, data
        )
    except WorkoutLogNotFoundError as exc:
        raise _not_found("Workout log not found.") from exc
    except LogExerciseNotFoundError as exc:
        raise _not_found("Logged exercise not found.") from exc
    except InvalidWorkoutLogStateError as exc:
        raise _conflict(str(exc)) from exc
    return WorkoutSetLogRead.model_validate(set_log)


@router.patch(
    "/{workout_log_id}/exercises/{log_exercise_id}/sets/{set_log_id}",
    response_model=WorkoutSetLogRead,
)
def update_set(
    workout_log_id: uuid.UUID,
    log_exercise_id: uuid.UUID,
    set_log_id: uuid.UUID,
    data: WorkoutSetLogUpdate,
    current_user: User = Depends(get_current_user),
    workout_log_service: WorkoutLogService = Depends(get_workout_log_service),
) -> WorkoutSetLogRead:
    """Partially update a previously logged set.

    Raises:
        HTTPException: 404 if the session/exercise/set doesn't exist/isn't
            owned; 409 if the session's edit window has expired.
    """
    try:
        set_log = workout_log_service.update_set(
            current_user.id, workout_log_id, log_exercise_id, set_log_id, data
        )
    except WorkoutLogNotFoundError as exc:
        raise _not_found("Workout log not found.") from exc
    except LogExerciseNotFoundError as exc:
        raise _not_found("Logged exercise not found.") from exc
    except SetLogNotFoundError as exc:
        raise _not_found("Logged set not found.") from exc
    except EditWindowExpiredError as exc:
        raise _conflict(str(exc)) from exc
    return WorkoutSetLogRead.model_validate(set_log)


@router.delete(
    "/{workout_log_id}/exercises/{log_exercise_id}/sets/{set_log_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_set(
    workout_log_id: uuid.UUID,
    log_exercise_id: uuid.UUID,
    set_log_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    workout_log_service: WorkoutLogService = Depends(get_workout_log_service),
) -> None:
    """Delete a previously logged set.

    Raises:
        HTTPException: 404 if the session/exercise/set doesn't exist/isn't
            owned; 409 if the session's edit window has expired.
    """
    try:
        workout_log_service.delete_set(
            current_user.id, workout_log_id, log_exercise_id, set_log_id
        )
    except WorkoutLogNotFoundError as exc:
        raise _not_found("Workout log not found.") from exc
    except LogExerciseNotFoundError as exc:
        raise _not_found("Logged exercise not found.") from exc
    except SetLogNotFoundError as exc:
        raise _not_found("Logged set not found.") from exc
    except EditWindowExpiredError as exc:
        raise _conflict(str(exc)) from exc
