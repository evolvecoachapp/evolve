"""Repository for persistence and retrieval of the ``Exercise`` aggregate.

Owns :class:`~app.models.exercise.Exercise` plus its three association
tables (``ExerciseMuscleGroup``, ``ExerciseEquipment``,
``ExerciseSubstitution``), since those are sub-resources of the Exercise
aggregate rather than independent aggregates. It has no knowledge of the
``MuscleGroup``/``Equipment`` catalog entities beyond their ids — validating
that a referenced id actually exists is a service-layer concern.

Contains no business logic, slug generation, or validation rules; it only
translates calls into SQLAlchemy queries against an injected
:class:`~sqlalchemy.orm.Session` and returns ORM model instances. Muscle
group/equipment/substitute relationships are declared with
``lazy="selectin"``/``lazy="joined"`` on the model itself (see
``app.models.exercise``), so eager loading here is deliberate and
consistent rather than accidental per-query behavior.
"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import Select, delete, func, select
from sqlalchemy.orm import Session

from app.models.exercise import (
    DifficultyLevel,
    Exercise,
    ExerciseCategory,
    ExerciseEquipment,
    ExerciseMuscleGroup,
    ExerciseSubstitution,
    SubstitutionReason,
)


class ExerciseRepository:
    """Data-access layer for the ``exercises`` table and its associations.

    The session is injected by the caller rather than created internally,
    keeping this class testable and free of lifecycle concerns (matches
    :class:`~app.repositories.user_repository.UserRepository`).
    """

    def __init__(self, db: Session) -> None:
        self.db = db

    # -- Core CRUD ---------------------------------------------------

    def create(self, exercise: Exercise) -> Exercise:
        """Persist a fully constructed :class:`Exercise` instance and return it."""
        self.db.add(exercise)
        self.db.flush()
        self.db.refresh(exercise)
        return exercise

    def get_by_id(self, exercise_id: uuid.UUID) -> Exercise | None:
        """Return the exercise with the given id, or ``None`` if not found.

        Does not filter by ``deleted_at`` or ``is_active`` — applying such
        rules is a service-layer responsibility.
        """
        return self.db.execute(
            select(Exercise).where(Exercise.id == exercise_id)
        ).scalar_one_or_none()

    def get_by_slug(self, slug: str) -> Exercise | None:
        """Return the exercise with the given slug, or ``None`` if not found."""
        return self.db.execute(
            select(Exercise).where(Exercise.slug == slug)
        ).scalar_one_or_none()

    def update(self, exercise: Exercise) -> Exercise:
        """Flush pending changes on an already-tracked :class:`Exercise` and return it.

        The caller is expected to mutate attributes on an instance obtained
        from this session before calling this method (matches
        :meth:`UserRepository.update`).
        """
        self.db.flush()
        self.db.refresh(exercise)
        return exercise

    def delete(self, exercise_id: uuid.UUID) -> bool:
        """Soft-delete an exercise by setting ``deleted_at``.

        Returns ``True`` if a matching exercise was found and marked
        deleted, ``False`` otherwise.
        """
        exercise = self.get_by_id(exercise_id)
        if exercise is None:
            return False
        exercise.deleted_at = datetime.now(timezone.utc)
        self.db.flush()
        return True

    def exists_name(self, name: str) -> bool:
        """Return ``True`` if an exercise with the given name exists."""
        return (
            self.db.execute(select(Exercise.id).where(Exercise.name == name)).first()
            is not None
        )

    def exists_slug(self, slug: str) -> bool:
        """Return ``True`` if an exercise with the given slug exists."""
        return (
            self.db.execute(select(Exercise.id).where(Exercise.slug == slug)).first()
            is not None
        )

    # -- Catalog listing ----------------------------------------------

    def _filtered_query(
        self,
        *,
        category: ExerciseCategory | None,
        difficulty_level: DifficultyLevel | None,
        muscle_group_id: uuid.UUID | None,
        equipment_id: uuid.UUID | None,
        search: str | None,
        include_inactive: bool,
    ) -> Select:
        """Build the shared filter predicate for :meth:`list` and :meth:`count`."""
        query = select(Exercise).where(Exercise.deleted_at.is_(None))

        if not include_inactive:
            query = query.where(Exercise.is_active.is_(True))
        if category is not None:
            query = query.where(Exercise.category == category)
        if difficulty_level is not None:
            query = query.where(Exercise.difficulty_level == difficulty_level)
        if search is not None:
            query = query.where(Exercise.name.ilike(f"%{search}%"))
        if muscle_group_id is not None:
            query = query.where(
                Exercise.id.in_(
                    select(ExerciseMuscleGroup.exercise_id).where(
                        ExerciseMuscleGroup.muscle_group_id == muscle_group_id
                    )
                )
            )
        if equipment_id is not None:
            query = query.where(
                Exercise.id.in_(
                    select(ExerciseEquipment.exercise_id).where(
                        ExerciseEquipment.equipment_id == equipment_id
                    )
                )
            )
        return query

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
    ) -> list[Exercise]:
        """Return a filtered, paginated page of exercises ordered by name."""
        query = self._filtered_query(
            category=category,
            difficulty_level=difficulty_level,
            muscle_group_id=muscle_group_id,
            equipment_id=equipment_id,
            search=search,
            include_inactive=include_inactive,
        )
        query = query.order_by(Exercise.name).limit(limit).offset(offset)
        return list(self.db.execute(query).scalars())

    def count(
        self,
        *,
        category: ExerciseCategory | None = None,
        difficulty_level: DifficultyLevel | None = None,
        muscle_group_id: uuid.UUID | None = None,
        equipment_id: uuid.UUID | None = None,
        search: str | None = None,
        include_inactive: bool = False,
    ) -> int:
        """Return the total count of exercises matching the same filters as :meth:`list`."""
        query = self._filtered_query(
            category=category,
            difficulty_level=difficulty_level,
            muscle_group_id=muscle_group_id,
            equipment_id=equipment_id,
            search=search,
            include_inactive=include_inactive,
        )
        count_query = select(func.count()).select_from(query.subquery())
        return self.db.execute(count_query).scalar_one()

    # -- Muscle group / equipment associations -------------------------

    def replace_muscle_groups(
        self, exercise_id: uuid.UUID, entries: list[tuple[uuid.UUID, bool]]
    ) -> None:
        """Replace all muscle-group associations for an exercise.

        ``entries`` is a list of ``(muscle_group_id, is_primary)`` pairs.
        Uses replace-all semantics (delete then re-insert) rather than a
        surgical diff, since an exercise typically has only a handful of
        muscle groups and the simplicity outweighs the minor write
        overhead.
        """
        self.db.execute(
            delete(ExerciseMuscleGroup).where(
                ExerciseMuscleGroup.exercise_id == exercise_id
            )
        )
        self.db.add_all(
            ExerciseMuscleGroup(
                exercise_id=exercise_id,
                muscle_group_id=muscle_group_id,
                is_primary=is_primary,
            )
            for muscle_group_id, is_primary in entries
        )
        self.db.flush()

    def replace_equipment(
        self, exercise_id: uuid.UUID, entries: list[tuple[uuid.UUID, bool]]
    ) -> None:
        """Replace all equipment associations for an exercise.

        ``entries`` is a list of ``(equipment_id, is_required)`` pairs. See
        :meth:`replace_muscle_groups` for the replace-all rationale.
        """
        self.db.execute(
            delete(ExerciseEquipment).where(ExerciseEquipment.exercise_id == exercise_id)
        )
        self.db.add_all(
            ExerciseEquipment(
                exercise_id=exercise_id,
                equipment_id=equipment_id,
                is_required=is_required,
            )
            for equipment_id, is_required in entries
        )
        self.db.flush()

    # -- Substitutions --------------------------------------------------

    def add_substitution(
        self,
        exercise_id: uuid.UUID,
        substitute_exercise_id: uuid.UUID,
        reason: SubstitutionReason | None,
    ) -> ExerciseSubstitution:
        """Persist a directed substitution edge and return it."""
        substitution = ExerciseSubstitution(
            exercise_id=exercise_id,
            substitute_exercise_id=substitute_exercise_id,
            reason=reason,
        )
        self.db.add(substitution)
        self.db.flush()
        self.db.refresh(substitution)
        return substitution

    def remove_substitution(
        self, exercise_id: uuid.UUID, substitute_exercise_id: uuid.UUID
    ) -> bool:
        """Remove a directed substitution edge.

        Returns ``True`` if a matching row existed and was removed,
        ``False`` otherwise.
        """
        result = self.db.execute(
            delete(ExerciseSubstitution).where(
                ExerciseSubstitution.exercise_id == exercise_id,
                ExerciseSubstitution.substitute_exercise_id == substitute_exercise_id,
            )
        )
        self.db.flush()
        return result.rowcount > 0

    def list_substitutes(self, exercise_id: uuid.UUID) -> list[ExerciseSubstitution]:
        """Return all substitution edges originating from the given exercise."""
        return list(
            self.db.execute(
                select(ExerciseSubstitution).where(
                    ExerciseSubstitution.exercise_id == exercise_id
                )
            ).scalars()
        )
