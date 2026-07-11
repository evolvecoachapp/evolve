"""Exercise routes — read-only catalog browsing.

Routes stay thin: parse/validate input, delegate to :class:`ExerciseService`,
and translate its documented exceptions into HTTP responses. No business
logic, database queries, or catalog-validation rules happen in this module.
Write operations (create/update/deactivate/substitutions) exist on
``ExerciseService`` for seeding and future admin use, but are intentionally
not exposed here yet — Sprint 3.1 scopes the public API to read-only.
"""

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.dependencies import get_exercise_service
from app.models.exercise import DifficultyLevel, ExerciseCategory
from app.schemas.exercise import ExercisePage, ExercisePublic, ExerciseSubstitutionRead
from app.services.exercise_service import ExerciseNotFoundError, ExerciseService

router = APIRouter(prefix="/exercises", tags=["exercises"])


def _resolve_exercise(id_or_slug: str, exercise_service: ExerciseService) -> ExercisePublic:
    """Look up an exercise by UUID id if possible, otherwise by slug."""
    try:
        exercise_id = uuid.UUID(id_or_slug)
    except ValueError:
        exercise = exercise_service.get_exercise_by_slug(id_or_slug)
    else:
        exercise = exercise_service.get_exercise(exercise_id)
    return ExercisePublic.from_model(exercise)


@router.get("", response_model=ExercisePage)
def list_exercises(
    category: ExerciseCategory | None = None,
    difficulty_level: DifficultyLevel | None = None,
    muscle_group_id: uuid.UUID | None = None,
    equipment_id: uuid.UUID | None = None,
    q: str | None = Query(default=None, description="Case-insensitive name search."),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    exercise_service: ExerciseService = Depends(get_exercise_service),
) -> ExercisePage:
    """Return a filtered, paginated page of active exercises."""
    page = exercise_service.list_exercises(
        category=category,
        difficulty_level=difficulty_level,
        muscle_group_id=muscle_group_id,
        equipment_id=equipment_id,
        search=q,
        limit=limit,
        offset=offset,
    )
    return ExercisePage(
        items=[ExercisePublic.from_model(exercise) for exercise in page.items],
        total=page.total,
        limit=page.limit,
        offset=page.offset,
    )


@router.get("/{id_or_slug}", response_model=ExercisePublic)
def get_exercise(
    id_or_slug: str,
    exercise_service: ExerciseService = Depends(get_exercise_service),
) -> ExercisePublic:
    """Return a single exercise by id or slug.

    Raises:
        HTTPException: 404 if no active exercise matches.
    """
    try:
        return _resolve_exercise(id_or_slug, exercise_service)
    except ExerciseNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Exercise not found.",
        ) from exc


@router.get("/{exercise_id}/substitutes", response_model=list[ExerciseSubstitutionRead])
def list_exercise_substitutes(
    exercise_id: uuid.UUID,
    exercise_service: ExerciseService = Depends(get_exercise_service),
) -> list[ExerciseSubstitutionRead]:
    """Return the registered substitute exercises for a given exercise.

    Raises:
        HTTPException: 404 if the exercise does not exist.
    """
    try:
        substitutions = exercise_service.list_substitutes(exercise_id)
    except ExerciseNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Exercise not found.",
        ) from exc

    return [ExerciseSubstitutionRead.from_link(link) for link in substitutions]
