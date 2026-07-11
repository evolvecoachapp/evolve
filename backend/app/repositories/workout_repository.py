"""Repository for persistence and retrieval of the ``Workout`` aggregate.

Owns :class:`~app.models.workout.Workout` plus its two sub-resources,
``WorkoutExercise`` (the template's ordered exercise line items) and
``WorkoutLog`` (a logged session shell) — mirrors how
:class:`~app.repositories.exercise_repository.ExerciseRepository` owns
``Exercise``'s association tables. Contains no business logic; it only
translates calls into SQLAlchemy queries against an injected
:class:`~sqlalchemy.orm.Session` and returns ORM model instances.

``WorkoutLog`` support is intentionally minimal this sprint (create/get
only) — the create/update logging workflow itself is Sprint 3.3 scope.
"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import Select, delete, func, select
from sqlalchemy.orm import Session

from app.models.workout import Workout, WorkoutExercise, WorkoutLog


class WorkoutRepository:
    """Data-access layer for the ``workouts``, ``workout_exercises``, and
    ``workout_logs`` tables.

    The session is injected by the caller rather than created internally,
    keeping this class testable and free of lifecycle concerns (matches
    :class:`~app.repositories.exercise_repository.ExerciseRepository`).
    """

    def __init__(self, db: Session) -> None:
        self.db = db

    # -- Workout: core CRUD -------------------------------------------------

    def create(self, workout: Workout) -> Workout:
        """Persist a fully constructed :class:`Workout` instance and return it."""
        self.db.add(workout)
        self.db.flush()
        self.db.refresh(workout)
        return workout

    def get_by_id(self, workout_id: uuid.UUID) -> Workout | None:
        """Return the workout with the given id, or ``None`` if not found.

        Does not filter by ``deleted_at`` or ``is_active`` — applying such
        rules is a service-layer responsibility.
        """
        return self.db.execute(
            select(Workout).where(Workout.id == workout_id)
        ).scalar_one_or_none()

    def get_by_slug(self, slug: str) -> Workout | None:
        """Return the workout with the given slug, or ``None`` if not found."""
        return self.db.execute(
            select(Workout).where(Workout.slug == slug)
        ).scalar_one_or_none()

    def update(self, workout: Workout) -> Workout:
        """Flush pending changes on an already-tracked :class:`Workout` and return it.

        The caller is expected to mutate attributes on an instance obtained
        from this session before calling this method (matches
        :meth:`ExerciseRepository.update`).
        """
        self.db.flush()
        self.db.refresh(workout)
        return workout

    def delete(self, workout_id: uuid.UUID) -> bool:
        """Soft-delete a workout by setting ``deleted_at``.

        Returns ``True`` if a matching workout was found and marked
        deleted, ``False`` otherwise.
        """
        workout = self.get_by_id(workout_id)
        if workout is None:
            return False
        workout.deleted_at = datetime.now(timezone.utc)
        self.db.flush()
        return True

    def exists_slug(self, slug: str) -> bool:
        """Return ``True`` if a workout with the given slug exists."""
        return (
            self.db.execute(select(Workout.id).where(Workout.slug == slug)).first()
            is not None
        )

    # -- Workout: listing ----------------------------------------------------

    def _filtered_query(self, *, search: str | None, include_inactive: bool) -> Select:
        """Build the shared filter predicate for :meth:`list_workouts` and :meth:`count`."""
        query = select(Workout).where(Workout.deleted_at.is_(None))
        if not include_inactive:
            query = query.where(Workout.is_active.is_(True))
        if search is not None:
            query = query.where(Workout.name.ilike(f"%{search}%"))
        return query

    def list_workouts(
        self,
        *,
        search: str | None = None,
        include_inactive: bool = False,
        limit: int = 20,
        offset: int = 0,
    ) -> list[Workout]:
        """Return a filtered, paginated page of workouts ordered by name."""
        query = self._filtered_query(search=search, include_inactive=include_inactive)
        query = query.order_by(Workout.name).limit(limit).offset(offset)
        return list(self.db.execute(query).scalars())

    def count(self, *, search: str | None = None, include_inactive: bool = False) -> int:
        """Return the total count of workouts matching the same filters as :meth:`list_workouts`."""
        query = self._filtered_query(search=search, include_inactive=include_inactive)
        count_query = select(func.count()).select_from(query.subquery())
        return self.db.execute(count_query).scalar_one()

    # -- WorkoutExercise -----------------------------------------------------

    def replace_exercises(
        self,
        workout_id: uuid.UUID,
        entries: list[WorkoutExercise],
    ) -> None:
        """Replace all exercise line items for a workout.

        Uses replace-all semantics (delete then re-insert) rather than a
        surgical diff, mirroring
        :meth:`ExerciseRepository.replace_muscle_groups` — a workout
        typically has only a handful of exercise line items, so the
        simplicity outweighs the minor write overhead.
        """
        self.db.execute(
            delete(WorkoutExercise).where(WorkoutExercise.workout_id == workout_id)
        )
        self.db.add_all(entries)
        self.db.flush()

    def list_exercises(self, workout_id: uuid.UUID) -> list[WorkoutExercise]:
        """Return every exercise line item for a workout, ordered by ``order_index``."""
        return list(
            self.db.execute(
                select(WorkoutExercise)
                .where(WorkoutExercise.workout_id == workout_id)
                .order_by(WorkoutExercise.order_index)
            ).scalars()
        )

    # -- WorkoutLog (shell only — see module docstring) -----------------------

    def create_log(self, workout_log: WorkoutLog) -> WorkoutLog:
        """Persist a fully constructed :class:`WorkoutLog` instance and return it."""
        self.db.add(workout_log)
        self.db.flush()
        self.db.refresh(workout_log)
        return workout_log

    def get_log_by_id(self, workout_log_id: uuid.UUID) -> WorkoutLog | None:
        """Return the logged session with the given id, or ``None`` if not found."""
        return self.db.execute(
            select(WorkoutLog).where(WorkoutLog.id == workout_log_id)
        ).scalar_one_or_none()
