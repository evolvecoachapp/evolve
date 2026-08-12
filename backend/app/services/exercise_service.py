"""Business logic for the Exercise catalog domain.

``ExerciseService`` is the only layer that composes
:class:`~app.repositories.exercise_repository.ExerciseRepository` and
:class:`~app.services.catalog_service.CatalogService`. It contains no HTTP
concepts and no raw SQL — routes translate this service's return values and
documented exceptions into request/response schemas and HTTP status codes.
"""

import uuid

from sqlalchemy.exc import IntegrityError

from app.models.exercise import DifficultyLevel, Exercise, ExerciseCategory, ExerciseSubstitution
from app.repositories.exercise_repository import ExerciseRepository
from app.schemas.exercise import ExerciseCreate, ExerciseSubstitutionCreate, ExerciseUpdate
from app.services.catalog_service import CatalogService
from app.utils.pagination import Page, clamp_pagination
from app.utils.text import slugify


class ExerciseServiceError(Exception):
    """Base class for all errors raised by :class:`ExerciseService`."""


class ExerciseAlreadyExistsError(ExerciseServiceError):
    """Raised when creating/renaming an exercise to an already-used name."""


class ExerciseNotFoundError(ExerciseServiceError):
    """Raised when a referenced exercise id/slug does not resolve to a usable exercise."""


class InvalidCatalogReferenceError(ExerciseServiceError):
    """Raised when a muscle group or equipment id does not exist in the catalog."""


class SelfSubstitutionError(ExerciseServiceError):
    """Raised when an exercise is offered as its own substitute."""


class SubstitutionAlreadyExistsError(ExerciseServiceError):
    """Raised when a substitution edge between two exercises already exists."""


class SubstitutionNotFoundError(ExerciseServiceError):
    """Raised when removing a substitution edge that does not exist."""


class ExerciseService:
    """Catalog workflows for the ``Exercise`` aggregate.

    Depends on injected repositories/services rather than a raw
    :class:`~sqlalchemy.orm.Session`, so it can be unit-tested with mocks
    (matches :class:`~app.services.auth_service.AuthService`).
    """

    def __init__(
        self,
        exercise_repository: ExerciseRepository,
        catalog_service: CatalogService,
    ) -> None:
        self.exercise_repository = exercise_repository
        self.catalog_service = catalog_service

    # -- Creation and mutation ------------------------------------------

    def create_exercise(
        self,
        data: ExerciseCreate,
        *,
        created_by_id: uuid.UUID | None = None,
    ) -> Exercise:
        """Create a new exercise with its muscle group and equipment associations.

        Args:
            data: Validated exercise input, including at least one muscle
                group (exactly one marked primary).
            created_by_id: The id of the authoring user, if any. ``None``
                for system/seed-created exercises.

        Returns:
            The newly created exercise, with associations eagerly loaded.

        Raises:
            InvalidCatalogReferenceError: If any muscle group or equipment
                id does not exist.
            ExerciseAlreadyExistsError: If the name is already registered.
        """
        self._validate_catalog_references(
            muscle_group_ids=[entry.muscle_group_id for entry in data.muscle_groups],
            equipment_ids=[entry.equipment_id for entry in data.equipment],
        )

        if self.exercise_repository.exists_name(data.name):
            raise ExerciseAlreadyExistsError(f"Exercise '{data.name}' already exists.")

        exercise = Exercise(
            name=data.name,
            slug=self._generate_unique_slug(data.name),
            description=data.description,
            instructions=data.instructions,
            difficulty_level=data.difficulty_level,
            category=data.category,
            video_url=str(data.video_url) if data.video_url else None,
            image_url=str(data.image_url) if data.image_url else None,
            created_by_id=created_by_id,
        )

        try:
            created = self.exercise_repository.create(exercise)
            self.exercise_repository.replace_muscle_groups(
                created.id,
                [(entry.muscle_group_id, entry.is_primary) for entry in data.muscle_groups],
            )
            self.exercise_repository.replace_equipment(
                created.id,
                [(entry.equipment_id, entry.is_required) for entry in data.equipment],
            )
            self.exercise_repository.db.commit()
        except IntegrityError as exc:
            self.exercise_repository.db.rollback()
            raise ExerciseAlreadyExistsError(f"Exercise '{data.name}' already exists.") from exc

        return self.exercise_repository.get_by_id(created.id)

    def update_exercise(self, exercise_id: uuid.UUID, data: ExerciseUpdate) -> Exercise:
        """Partially update an exercise and/or replace its associations.

        ``slug`` is intentionally immutable once assigned, so existing
        links to this exercise (e.g. future Program/Workout references)
        never break because a display name changed.

        Raises:
            ExerciseNotFoundError: If ``exercise_id`` does not resolve.
            ExerciseAlreadyExistsError: If renaming to an already-used name.
            InvalidCatalogReferenceError: If any replacement muscle group or
                equipment id does not exist.
        """
        exercise = self._get_exercise_or_raise(exercise_id, include_inactive=True)

        if data.name is not None and data.name != exercise.name:
            if self.exercise_repository.exists_name(data.name):
                raise ExerciseAlreadyExistsError(f"Exercise '{data.name}' already exists.")
            exercise.name = data.name
        if data.description is not None:
            exercise.description = data.description
        if data.instructions is not None:
            exercise.instructions = data.instructions
        if data.difficulty_level is not None:
            exercise.difficulty_level = data.difficulty_level
        if data.category is not None:
            exercise.category = data.category
        if data.video_url is not None:
            exercise.video_url = str(data.video_url)
        if data.image_url is not None:
            exercise.image_url = str(data.image_url)
        if data.is_active is not None:
            exercise.is_active = data.is_active

        if data.muscle_groups is not None:
            self._validate_catalog_references(
                muscle_group_ids=[entry.muscle_group_id for entry in data.muscle_groups],
            )
        if data.equipment is not None:
            self._validate_catalog_references(
                equipment_ids=[entry.equipment_id for entry in data.equipment],
            )

        try:
            if data.muscle_groups is not None:
                self.exercise_repository.replace_muscle_groups(
                    exercise.id,
                    [(entry.muscle_group_id, entry.is_primary) for entry in data.muscle_groups],
                )
            if data.equipment is not None:
                self.exercise_repository.replace_equipment(
                    exercise.id,
                    [(entry.equipment_id, entry.is_required) for entry in data.equipment],
                )
            updated = self.exercise_repository.update(exercise)
            self.exercise_repository.db.commit()
        except IntegrityError as exc:
            self.exercise_repository.db.rollback()
            raise ExerciseAlreadyExistsError(f"Exercise '{data.name}' already exists.") from exc

        return self.exercise_repository.get_by_id(updated.id)

    def deactivate_exercise(self, exercise_id: uuid.UUID) -> Exercise:
        """Mark an exercise inactive without removing it from the catalog.

        Raises:
            ExerciseNotFoundError: If ``exercise_id`` does not resolve.
        """
        exercise = self._get_exercise_or_raise(exercise_id, include_inactive=True)
        exercise.is_active = False
        updated = self.exercise_repository.update(exercise)
        self.exercise_repository.db.commit()
        return updated

    # -- Lookups ----------------------------------------------------------

    def get_exercise(self, exercise_id: uuid.UUID, *, include_inactive: bool = False) -> Exercise:
        """Return a single exercise by id.

        Raises:
            ExerciseNotFoundError: If no active (or, if ``include_inactive``,
                any non-deleted) exercise has this id.
        """
        return self._get_exercise_or_raise(exercise_id, include_inactive=include_inactive)

    def get_exercise_by_slug(self, slug: str, *, include_inactive: bool = False) -> Exercise:
        """Return a single exercise by slug.

        Raises:
            ExerciseNotFoundError: If no active (or, if ``include_inactive``,
                any non-deleted) exercise has this slug.
        """
        exercise = self.exercise_repository.get_by_slug(slug)
        return self._check_usable(exercise, include_inactive=include_inactive)

    def list_exercises(
        self,
        *,
        category: ExerciseCategory | None = None,
        difficulty_level: DifficultyLevel | None = None,
        muscle_group_id: uuid.UUID | None = None,
        equipment_id: uuid.UUID | None = None,
        search: str | None = None,
        include_inactive: bool = False,
        limit: int = 20,
        offset: int = 0,
    ) -> Page[Exercise]:
        """Return a filtered, paginated page of exercises.

        Public catalog callers leave ``include_inactive`` false. Admin
        listing passes ``True`` so inactive catalog rows remain visible.
        """
        safe_limit, safe_offset = clamp_pagination(limit, offset)
        filters = {
            "category": category,
            "difficulty_level": difficulty_level,
            "muscle_group_id": muscle_group_id,
            "equipment_id": equipment_id,
            "search": search,
            "include_inactive": include_inactive,
        }
        items = self.exercise_repository.list_exercises(
            **filters, limit=safe_limit, offset=safe_offset
        )
        total = self.exercise_repository.count(**filters)
        return Page(items=items, total=total, limit=safe_limit, offset=safe_offset)

    # -- Substitutions ------------------------------------------------------

    def add_substitution(
        self, exercise_id: uuid.UUID, data: ExerciseSubstitutionCreate
    ) -> ExerciseSubstitution:
        """Register a directed substitution edge from one exercise to another.

        Raises:
            ExerciseNotFoundError: If either exercise does not resolve.
            SelfSubstitutionError: If ``exercise_id`` equals the substitute id.
            SubstitutionAlreadyExistsError: If the edge already exists.
        """
        if exercise_id == data.substitute_exercise_id:
            raise SelfSubstitutionError("An exercise cannot substitute itself.")

        self._get_exercise_or_raise(exercise_id, include_inactive=True)
        self._get_exercise_or_raise(data.substitute_exercise_id, include_inactive=True)

        try:
            substitution = self.exercise_repository.add_substitution(
                exercise_id, data.substitute_exercise_id, data.reason
            )
            self.exercise_repository.db.commit()
        except IntegrityError as exc:
            self.exercise_repository.db.rollback()
            raise SubstitutionAlreadyExistsError(
                "This substitution already exists."
            ) from exc

        return substitution

    def remove_substitution(
        self, exercise_id: uuid.UUID, substitute_exercise_id: uuid.UUID
    ) -> None:
        """Remove a directed substitution edge.

        Raises:
            SubstitutionNotFoundError: If no matching edge exists.
        """
        removed = self.exercise_repository.remove_substitution(
            exercise_id, substitute_exercise_id
        )
        self.exercise_repository.db.commit()
        if not removed:
            raise SubstitutionNotFoundError("This substitution does not exist.")

    def list_substitutes(self, exercise_id: uuid.UUID) -> list[ExerciseSubstitution]:
        """Return every substitution edge originating from an exercise.

        Raises:
            ExerciseNotFoundError: If ``exercise_id`` does not resolve.
        """
        self._get_exercise_or_raise(exercise_id, include_inactive=True)
        return self.exercise_repository.list_substitutes(exercise_id)

    # -- Internal helpers --------------------------------------------------

    def _validate_catalog_references(
        self,
        *,
        muscle_group_ids: list[uuid.UUID] | None = None,
        equipment_ids: list[uuid.UUID] | None = None,
    ) -> None:
        """Raise :class:`InvalidCatalogReferenceError` if any id does not exist."""
        result = self.catalog_service.validate_references(
            muscle_group_ids=muscle_group_ids or [],
            equipment_ids=equipment_ids or [],
        )
        if not result.is_valid:
            raise InvalidCatalogReferenceError(
                "Unknown catalog reference(s): "
                f"muscle_group_ids={result.missing_muscle_group_ids}, "
                f"equipment_ids={result.missing_equipment_ids}"
            )

    def _generate_unique_slug(self, name: str) -> str:
        """Derive a unique, URL-safe slug from a display name."""
        base_slug = slugify(name)
        slug = base_slug
        suffix = 2
        while self.exercise_repository.exists_slug(slug):
            slug = f"{base_slug}-{suffix}"
            suffix += 1
        return slug

    def _get_exercise_or_raise(
        self, exercise_id: uuid.UUID, *, include_inactive: bool
    ) -> Exercise:
        exercise = self.exercise_repository.get_by_id(exercise_id)
        return self._check_usable(exercise, include_inactive=include_inactive)

    def _check_usable(
        self, exercise: Exercise | None, *, include_inactive: bool
    ) -> Exercise:
        if exercise is None or exercise.deleted_at is not None:
            raise ExerciseNotFoundError("Exercise not found.")
        if not include_inactive and not exercise.is_active:
            raise ExerciseNotFoundError("Exercise not found.")
        return exercise
