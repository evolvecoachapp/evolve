"""Nutrition routes — meal template CRUD, meal logging, and daily targets.

Routes stay thin: parse/validate input, delegate to
:class:`~app.services.nutrition_service.NutritionService`, and translate
its documented exceptions into HTTP responses. No business logic, database
queries, or target-calculation rules happen in this module.

Every route requires an authenticated user (``Depends(get_current_user)``);
``user_id`` is always taken from the resolved token, never from the request
body or path, mirroring ``workout_logs.py``.
"""

import uuid
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.ai.nutrition_engine import IncompleteNutritionProfileError
from app.core.dependencies import get_nutrition_service
from app.models.user import User
from app.schemas.nutrition import (
    DailyNutritionRead,
    MealCreate,
    MealLogCreate,
    MealLogPage,
    MealLogRead,
    MealLogUpdate,
    MealPage,
    MealRead,
    MealUpdate,
)
from app.security.dependencies import get_current_user
from app.services.nutrition_service import (
    MealLogNotFoundError,
    MealNotFoundError,
    NutritionService,
)

router = APIRouter(prefix="/nutrition", tags=["nutrition"])


def _not_found(detail: str) -> HTTPException:
    return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=detail)


def _unprocessable(detail: str) -> HTTPException:
    return HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=detail)


# -- Meal templates -----------------------------------------------------------


@router.post("/meals", response_model=MealRead, status_code=status.HTTP_201_CREATED)
def create_meal(
    data: MealCreate,
    current_user: User = Depends(get_current_user),
    nutrition_service: NutritionService = Depends(get_nutrition_service),
) -> MealRead:
    """Create a new private meal template owned by the current user."""
    meal = nutrition_service.create_meal(current_user.id, data)
    return MealRead.from_model(meal)


@router.get("/meals", response_model=MealPage)
def list_meals(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    current_user: User = Depends(get_current_user),
    nutrition_service: NutritionService = Depends(get_nutrition_service),
) -> MealPage:
    """Return a paginated page of active meals visible to the current user (own + public)."""
    page = nutrition_service.list_meals(current_user.id, limit=limit, offset=offset)
    return MealPage(
        items=[MealRead.from_model(meal) for meal in page.items],
        total=page.total,
        limit=page.limit,
        offset=page.offset,
    )


@router.get("/meals/{meal_id}", response_model=MealRead)
def get_meal(
    meal_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    nutrition_service: NutritionService = Depends(get_nutrition_service),
) -> MealRead:
    """Return a single meal template visible to the current user (own or public).

    Raises:
        HTTPException: 404 if the meal doesn't exist or isn't visible to
            this user.
    """
    try:
        meal = nutrition_service.get_meal(current_user.id, meal_id)
    except MealNotFoundError as exc:
        raise _not_found("Meal not found.") from exc
    return MealRead.from_model(meal)


@router.patch("/meals/{meal_id}", response_model=MealRead)
def update_meal(
    meal_id: uuid.UUID,
    data: MealUpdate,
    current_user: User = Depends(get_current_user),
    nutrition_service: NutritionService = Depends(get_nutrition_service),
) -> MealRead:
    """Partially update a meal template owned by the current user.

    Raises:
        HTTPException: 404 if the meal doesn't exist or isn't owned by
            this user.
    """
    try:
        meal = nutrition_service.update_meal(current_user.id, meal_id, data)
    except MealNotFoundError as exc:
        raise _not_found("Meal not found.") from exc
    return MealRead.from_model(meal)


@router.delete("/meals/{meal_id}", response_model=MealRead)
def deactivate_meal(
    meal_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    nutrition_service: NutritionService = Depends(get_nutrition_service),
) -> MealRead:
    """Deactivate (soft-remove) a meal template owned by the current user.

    Raises:
        HTTPException: 404 if the meal doesn't exist or isn't owned by
            this user.
    """
    try:
        meal = nutrition_service.deactivate_meal(current_user.id, meal_id)
    except MealNotFoundError as exc:
        raise _not_found("Meal not found.") from exc
    return MealRead.from_model(meal)


# -- Meal logs ------------------------------------------------------------------


@router.post("/logs", response_model=MealLogRead, status_code=status.HTTP_201_CREATED)
def log_meal(
    data: MealLogCreate,
    current_user: User = Depends(get_current_user),
    nutrition_service: NutritionService = Depends(get_nutrition_service),
) -> MealLogRead:
    """Record a diary entry, either snapshotted from a template or supplied ad-hoc.

    Raises:
        HTTPException: 404 if ``meal_id`` is given but doesn't resolve to a
            meal visible to this user.
    """
    try:
        meal_log = nutrition_service.log_meal(current_user.id, data)
    except MealNotFoundError as exc:
        raise _not_found("Meal not found.") from exc
    return MealLogRead.from_model(meal_log)


@router.get("/logs", response_model=MealLogPage)
def list_meal_logs(
    date_from: date | None = None,
    date_to: date | None = None,
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    current_user: User = Depends(get_current_user),
    nutrition_service: NutritionService = Depends(get_nutrition_service),
) -> MealLogPage:
    """Return a filtered, paginated page of the user's own logged entries, most recent first."""
    page = nutrition_service.list_meal_logs(
        current_user.id, date_from=date_from, date_to=date_to, limit=limit, offset=offset
    )
    return MealLogPage(
        items=[MealLogRead.from_model(meal_log) for meal_log in page.items],
        total=page.total,
        limit=page.limit,
        offset=page.offset,
    )


@router.get("/logs/{log_id}", response_model=MealLogRead)
def get_meal_log(
    log_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    nutrition_service: NutritionService = Depends(get_nutrition_service),
) -> MealLogRead:
    """Return a single logged entry owned by the current user.

    Raises:
        HTTPException: 404 if the log doesn't exist or isn't owned by this
            user.
    """
    try:
        meal_log = nutrition_service.get_meal_log(current_user.id, log_id)
    except MealLogNotFoundError as exc:
        raise _not_found("Meal log not found.") from exc
    return MealLogRead.from_model(meal_log)


@router.patch("/logs/{log_id}", response_model=MealLogRead)
def update_meal_log(
    log_id: uuid.UUID,
    data: MealLogUpdate,
    current_user: User = Depends(get_current_user),
    nutrition_service: NutritionService = Depends(get_nutrition_service),
) -> MealLogRead:
    """Partially update a previously logged entry owned by the current user.

    Raises:
        HTTPException: 404 if the log doesn't exist or isn't owned by this
            user.
    """
    try:
        meal_log = nutrition_service.update_meal_log(current_user.id, log_id, data)
    except MealLogNotFoundError as exc:
        raise _not_found("Meal log not found.") from exc
    return MealLogRead.from_model(meal_log)


@router.delete("/logs/{log_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_meal_log(
    log_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    nutrition_service: NutritionService = Depends(get_nutrition_service),
) -> None:
    """Delete a previously logged entry owned by the current user.

    Raises:
        HTTPException: 404 if the log doesn't exist or isn't owned by this
            user.
    """
    try:
        nutrition_service.delete_meal_log(current_user.id, log_id)
    except MealLogNotFoundError as exc:
        raise _not_found("Meal log not found.") from exc


# -- Daily targets ------------------------------------------------------------


@router.get("/targets", response_model=DailyNutritionRead)
def get_targets(
    for_date: date | None = Query(default=None),
    current_user: User = Depends(get_current_user),
    nutrition_service: NutritionService = Depends(get_nutrition_service),
) -> DailyNutritionRead:
    """Return calorie/macro targets and adherence for a single day (defaults to today).

    Raises:
        HTTPException: 422 if the user's profile is missing a field
            required for target calculation.
    """
    try:
        output = nutrition_service.get_daily_nutrition(current_user.id, for_date=for_date)
    except IncompleteNutritionProfileError as exc:
        raise _unprocessable(str(exc)) from exc
    return DailyNutritionRead.from_output(output)
