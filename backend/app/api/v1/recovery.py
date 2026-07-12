"""Recovery routes — daily readiness check-in CRUD and readiness scoring.

Routes stay thin: parse/validate input, delegate to
:class:`~app.services.recovery_service.RecoveryService`, and translate its
documented exceptions into HTTP responses. No business logic, database
queries, or scoring rules happen in this module.

Every route requires an authenticated user (``Depends(get_current_user)``);
``user_id`` is always taken from the resolved token, never from the request
body or path, mirroring ``nutrition.py``.
"""

import uuid
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.dependencies import get_recovery_service
from app.models.user import User
from app.schemas.recovery import (
    ReadinessRead,
    RecoveryCheckInCreate,
    RecoveryCheckInPage,
    RecoveryCheckInRead,
    RecoveryCheckInUpdate,
)
from app.security.dependencies import get_current_user
from app.services.recovery_service import (
    CheckInAlreadyExistsError,
    CheckInNotFoundError,
    RecoveryService,
)

router = APIRouter(prefix="/recovery", tags=["recovery"])


def _not_found(detail: str) -> HTTPException:
    return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=detail)


def _conflict(detail: str) -> HTTPException:
    return HTTPException(status_code=status.HTTP_409_CONFLICT, detail=detail)


# -- Check-ins ------------------------------------------------------------------


@router.post(
    "/check-ins", response_model=RecoveryCheckInRead, status_code=status.HTTP_201_CREATED
)
def create_check_in(
    data: RecoveryCheckInCreate,
    current_user: User = Depends(get_current_user),
    recovery_service: RecoveryService = Depends(get_recovery_service),
) -> RecoveryCheckInRead:
    """Log a new daily readiness check-in for the current user.

    Raises:
        HTTPException: 409 if the current user already has a check-in for
            ``data.checkin_date``.
    """
    try:
        check_in = recovery_service.create_check_in(current_user.id, data)
    except CheckInAlreadyExistsError as exc:
        raise _conflict(str(exc)) from exc
    return RecoveryCheckInRead.from_model(check_in)


@router.get("/check-ins", response_model=RecoveryCheckInPage)
def list_check_ins(
    date_from: date | None = None,
    date_to: date | None = None,
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    current_user: User = Depends(get_current_user),
    recovery_service: RecoveryService = Depends(get_recovery_service),
) -> RecoveryCheckInPage:
    """Return a filtered, paginated page of the current user's check-ins, most recent first."""
    page = recovery_service.list_check_ins(
        current_user.id, date_from=date_from, date_to=date_to, limit=limit, offset=offset
    )
    return RecoveryCheckInPage(
        items=[RecoveryCheckInRead.from_model(check_in) for check_in in page.items],
        total=page.total,
        limit=page.limit,
        offset=page.offset,
    )


@router.get("/check-ins/{check_in_id}", response_model=RecoveryCheckInRead)
def get_check_in(
    check_in_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    recovery_service: RecoveryService = Depends(get_recovery_service),
) -> RecoveryCheckInRead:
    """Return a single check-in owned by the current user.

    Raises:
        HTTPException: 404 if the check-in doesn't exist or isn't owned by
            this user.
    """
    try:
        check_in = recovery_service.get_check_in(current_user.id, check_in_id)
    except CheckInNotFoundError as exc:
        raise _not_found("Check-in not found.") from exc
    return RecoveryCheckInRead.from_model(check_in)


@router.patch("/check-ins/{check_in_id}", response_model=RecoveryCheckInRead)
def update_check_in(
    check_in_id: uuid.UUID,
    data: RecoveryCheckInUpdate,
    current_user: User = Depends(get_current_user),
    recovery_service: RecoveryService = Depends(get_recovery_service),
) -> RecoveryCheckInRead:
    """Partially update a check-in owned by the current user.

    Raises:
        HTTPException: 404 if the check-in doesn't exist or isn't owned by
            this user.
    """
    try:
        check_in = recovery_service.update_check_in(current_user.id, check_in_id, data)
    except CheckInNotFoundError as exc:
        raise _not_found("Check-in not found.") from exc
    return RecoveryCheckInRead.from_model(check_in)


@router.delete("/check-ins/{check_in_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_check_in(
    check_in_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    recovery_service: RecoveryService = Depends(get_recovery_service),
) -> None:
    """Delete a check-in owned by the current user.

    Raises:
        HTTPException: 404 if the check-in doesn't exist or isn't owned by
            this user.
    """
    try:
        recovery_service.delete_check_in(current_user.id, check_in_id)
    except CheckInNotFoundError as exc:
        raise _not_found("Check-in not found.") from exc


# -- Readiness --------------------------------------------------------------


@router.get("/readiness", response_model=ReadinessRead)
def get_readiness(
    for_date: date | None = Query(default=None),
    current_user: User = Depends(get_current_user),
    recovery_service: RecoveryService = Depends(get_recovery_service),
) -> ReadinessRead:
    """Return the readiness score/level/guidance for a single day (defaults to today).

    Raises:
        HTTPException: 404 if the current user has no check-in for that
            date — readiness cannot be computed without one.
    """
    try:
        output = recovery_service.get_daily_readiness(current_user.id, for_date=for_date)
    except CheckInNotFoundError as exc:
        raise _not_found(str(exc)) from exc
    return ReadinessRead.from_output(output)
