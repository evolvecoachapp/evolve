"""Progress routes — entry logging and the AI-driven progress summary.

Routes stay thin: parse/validate input, delegate to
:class:`~app.services.progress_service.ProgressService`, and translate its
documented exceptions into HTTP responses. No business logic, database
queries, or statistics/narrative computation happen in this module.

Every route requires an authenticated user (``Depends(get_current_user)``);
``user_id`` is always taken from the resolved token, never from the request
body or path, mirroring ``recovery.py``/``goals.py``.
"""

import uuid
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.ai.progress_analyzer import InsufficientProgressDataError
from app.core.dependencies import get_progress_service
from app.models.progress import ProgressMetricType
from app.models.user import User
from app.schemas.progress import (
    ProgressEntryCreate,
    ProgressEntryPage,
    ProgressEntryRead,
    ProgressSummaryRead,
)
from app.security.dependencies import get_current_user
from app.services.progress_service import InvalidProgressReferenceError, ProgressService

router = APIRouter(prefix="/progress", tags=["progress"])


def _bad_request(detail: str) -> HTTPException:
    return HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)


def _unprocessable(detail: str) -> HTTPException:
    return HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=detail)


@router.post("", response_model=ProgressEntryRead, status_code=status.HTTP_201_CREATED)
def log_progress_entry(
    data: ProgressEntryCreate,
    current_user: User = Depends(get_current_user),
    progress_service: ProgressService = Depends(get_progress_service),
) -> ProgressEntryRead:
    """Log a new (``source=manual``) progress entry for the current user.

    Raises:
        HTTPException: 400 if ``goal_id`` or ``exercise_id`` is given but
            doesn't resolve for this user.
    """
    try:
        entry = progress_service.log_progress_entry(current_user.id, data)
    except InvalidProgressReferenceError as exc:
        raise _bad_request(str(exc)) from exc
    return ProgressEntryRead.from_model(entry)


@router.get("", response_model=ProgressEntryPage)
def list_progress(
    metric_type: ProgressMetricType | None = None,
    goal_id: uuid.UUID | None = None,
    date_from: date | None = None,
    date_to: date | None = None,
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    current_user: User = Depends(get_current_user),
    progress_service: ProgressService = Depends(get_progress_service),
) -> ProgressEntryPage:
    """Return a filtered, paginated page of the current user's progress entries, most recent first."""
    page = progress_service.list_progress(
        current_user.id,
        metric_type=metric_type,
        goal_id=goal_id,
        date_from=date_from,
        date_to=date_to,
        limit=limit,
        offset=offset,
    )
    return ProgressEntryPage(
        items=[ProgressEntryRead.from_model(entry) for entry in page.items],
        total=page.total,
        limit=page.limit,
        offset=page.offset,
    )


@router.get("/summary", response_model=ProgressSummaryRead)
async def get_progress_summary(
    metric_type: ProgressMetricType,
    goal_id: uuid.UUID | None = None,
    date_from: date | None = None,
    date_to: date | None = None,
    current_user: User = Depends(get_current_user),
    progress_service: ProgressService = Depends(get_progress_service),
) -> ProgressSummaryRead:
    """Return a trend/consistency/plateau summary with an AI-narrated insight.

    Defaults to a trailing 90-day window ending today when
    ``date_from``/``date_to`` aren't given (see
    ``ProgressService.DEFAULT_SUMMARY_WINDOW_DAYS``).

    Raises:
        HTTPException: 400 if ``goal_id`` is given but doesn't resolve for
            this user; 422 if too few entries fall within the resolved
            window to compute a trend.
    """
    try:
        output, window_start, window_end, unit = await progress_service.get_progress_summary(
            current_user.id,
            metric_type,
            goal_id=goal_id,
            date_from=date_from,
            date_to=date_to,
        )
    except InvalidProgressReferenceError as exc:
        raise _bad_request(str(exc)) from exc
    except InsufficientProgressDataError as exc:
        raise _unprocessable(str(exc)) from exc

    return ProgressSummaryRead.from_output(
        output,
        metric_type=metric_type,
        unit=unit,
        window_start=window_start,
        window_end=window_end,
    )
