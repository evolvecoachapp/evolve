"""Repository for persistence and retrieval of the ``Program`` aggregate.

Owns :class:`~app.models.program.Program` plus its two sub-resources,
``ProgramDay`` (the program's day-by-day structure) and
``ProgramAssignment`` (a user's progress through a program instance) —
mirrors how :class:`~app.repositories.exercise_repository.ExerciseRepository`
owns ``Exercise``'s association tables. Contains no business logic; it only
translates calls into SQLAlchemy queries against an injected
:class:`~sqlalchemy.orm.Session` and returns ORM model instances.
"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import Select, delete, func, select, tuple_
from sqlalchemy.orm import Session

from app.models.program import (
    AssignmentStatus,
    Program,
    ProgramAssignment,
    ProgramDay,
    ProgramStatus,
)


class ProgramRepository:
    """Data-access layer for the ``programs``, ``program_days``, and
    ``program_assignments`` tables.

    The session is injected by the caller rather than created internally,
    keeping this class testable and free of lifecycle concerns (matches
    :class:`~app.repositories.exercise_repository.ExerciseRepository`).
    """

    def __init__(self, db: Session) -> None:
        self.db = db

    # -- Program: core CRUD --------------------------------------------

    def create(self, program: Program) -> Program:
        """Persist a fully constructed :class:`Program` instance and return it."""
        self.db.add(program)
        self.db.flush()
        self.db.refresh(program)
        return program

    def get_by_id(self, program_id: uuid.UUID) -> Program | None:
        """Return the program with the given id, or ``None`` if not found.

        Does not filter by ``deleted_at`` or ``status`` — applying such
        rules is a service-layer responsibility.
        """
        return self.db.execute(
            select(Program).where(Program.id == program_id)
        ).scalar_one_or_none()

    def get_by_slug(self, slug: str) -> Program | None:
        """Return the program with the given slug, or ``None`` if not found."""
        return self.db.execute(
            select(Program).where(Program.slug == slug)
        ).scalar_one_or_none()

    def update(self, program: Program) -> Program:
        """Flush pending changes on an already-tracked :class:`Program` and return it.

        The caller is expected to mutate attributes on an instance obtained
        from this session before calling this method (matches
        :meth:`ExerciseRepository.update`).
        """
        self.db.flush()
        self.db.refresh(program)
        return program

    def delete(self, program_id: uuid.UUID) -> bool:
        """Soft-delete a program by setting ``deleted_at``.

        Returns ``True`` if a matching program was found and marked
        deleted, ``False`` otherwise.
        """
        program = self.get_by_id(program_id)
        if program is None:
            return False
        program.deleted_at = datetime.now(timezone.utc)
        self.db.flush()
        return True

    def exists_slug(self, slug: str) -> bool:
        """Return ``True`` if a program with the given slug exists."""
        return (
            self.db.execute(select(Program.id).where(Program.slug == slug)).first()
            is not None
        )

    # -- Program: listing -------------------------------------------------

    def _filtered_query(
        self,
        *,
        status: ProgramStatus | None,
        search: str | None,
    ) -> Select:
        """Build the shared filter predicate for :meth:`list_programs` and :meth:`count`."""
        query = select(Program).where(Program.deleted_at.is_(None))
        if status is not None:
            query = query.where(Program.status == status)
        if search is not None:
            query = query.where(Program.name.ilike(f"%{search}%"))
        return query

    def list_programs(
        self,
        *,
        status: ProgramStatus | None = None,
        search: str | None = None,
        limit: int = 20,
        offset: int = 0,
    ) -> list[Program]:
        """Return a filtered, paginated page of programs ordered by name."""
        query = self._filtered_query(status=status, search=search)
        query = query.order_by(Program.name).limit(limit).offset(offset)
        return list(self.db.execute(query).scalars())

    def count(
        self,
        *,
        status: ProgramStatus | None = None,
        search: str | None = None,
    ) -> int:
        """Return the total count of programs matching the same filters as :meth:`list_programs`."""
        query = self._filtered_query(status=status, search=search)
        count_query = select(func.count()).select_from(query.subquery())
        return self.db.execute(count_query).scalar_one()

    # -- ProgramDay --------------------------------------------------------

    def add_day(self, program_day: ProgramDay) -> ProgramDay:
        """Persist a fully constructed :class:`ProgramDay` instance and return it."""
        self.db.add(program_day)
        self.db.flush()
        self.db.refresh(program_day)
        return program_day

    def get_day(self, program_day_id: uuid.UUID) -> ProgramDay | None:
        """Return the program day with the given id, or ``None`` if not found."""
        return self.db.execute(
            select(ProgramDay).where(ProgramDay.id == program_day_id)
        ).scalar_one_or_none()

    def list_days(self, program_id: uuid.UUID) -> list[ProgramDay]:
        """Return every day for a program, ordered by ``(week_number, day_number)``.

        Per the model docstring, this composite ordering is the only
        correct traversal order — never a single scalar column.
        """
        return list(
            self.db.execute(
                select(ProgramDay)
                .where(ProgramDay.program_id == program_id)
                .order_by(ProgramDay.week_number, ProgramDay.day_number)
            ).scalars()
        )

    def exists_day(self, program_id: uuid.UUID, week_number: int, day_number: int) -> bool:
        """Return ``True`` if a day already exists at this ``(week_number, day_number)`` slot."""
        return (
            self.db.execute(
                select(ProgramDay.id).where(
                    ProgramDay.program_id == program_id,
                    ProgramDay.week_number == week_number,
                    ProgramDay.day_number == day_number,
                )
            ).first()
            is not None
        )

    def get_day_at(
        self, program_id: uuid.UUID, week_number: int, day_number: int
    ) -> ProgramDay | None:
        """Return the exact ``ProgramDay`` at a ``(week_number, day_number)`` slot, or ``None``.

        Used by :class:`~app.services.workout_resolution_service.WorkoutResolutionService`
        to resolve a :class:`~app.models.program.ProgramAssignment`'s current
        cursor position.
        """
        return self.db.execute(
            select(ProgramDay).where(
                ProgramDay.program_id == program_id,
                ProgramDay.week_number == week_number,
                ProgramDay.day_number == day_number,
            )
        ).scalar_one_or_none()

    def get_first_day(self, program_id: uuid.UUID) -> ProgramDay | None:
        """Return the program's earliest scheduled day, ordered by ``(week_number, day_number)``.

        Used to initialize a new :class:`~app.models.program.ProgramAssignment`'s
        progress cursor in :meth:`~app.services.workout_service.WorkoutService.assign_program` —
        deliberately not hardcoded to ``(1, 1)``, since a program's first
        defined slot is not guaranteed to be numbered that way.
        """
        return self.db.execute(
            select(ProgramDay)
            .where(ProgramDay.program_id == program_id)
            .order_by(ProgramDay.week_number, ProgramDay.day_number)
            .limit(1)
        ).scalar_one_or_none()

    def get_next_day_after(
        self,
        program_id: uuid.UUID,
        week_number: int,
        day_number: int,
        *,
        max_week: int,
    ) -> ProgramDay | None:
        """Return the next scheduled day strictly after ``(week_number, day_number)``.

        Ordered by ``(week_number, day_number)`` and capped at ``max_week``
        (a program's ``duration_weeks``), so the search never wraps into a
        hypothetical week beyond the program's actual length. Returns
        ``None`` when there is nothing left to advance to, which
        :class:`~app.services.workout_resolution_service.WorkoutResolutionService`
        treats as "the program is exhausted".
        """
        return self.db.execute(
            select(ProgramDay)
            .where(
                ProgramDay.program_id == program_id,
                ProgramDay.week_number <= max_week,
                tuple_(ProgramDay.week_number, ProgramDay.day_number)
                > (week_number, day_number),
            )
            .order_by(ProgramDay.week_number, ProgramDay.day_number)
            .limit(1)
        ).scalar_one_or_none()

    def remove_day(self, program_day_id: uuid.UUID) -> bool:
        """Hard-delete a single program day.

        Returns ``True`` if a matching row existed and was removed,
        ``False`` otherwise. Hard delete is acceptable here (unlike
        ``Program`` itself) since a day is pure structure with no
        independent history of its own — logged sessions reference
        ``Workout``/``ProgramAssignment`` directly, not ``ProgramDay``.
        """
        result = self.db.execute(delete(ProgramDay).where(ProgramDay.id == program_day_id))
        self.db.flush()
        return result.rowcount > 0

    # -- ProgramAssignment --------------------------------------------------

    def create_assignment(self, assignment: ProgramAssignment) -> ProgramAssignment:
        """Persist a fully constructed :class:`ProgramAssignment` instance and return it."""
        self.db.add(assignment)
        self.db.flush()
        self.db.refresh(assignment)
        return assignment

    def get_assignment_by_id(self, assignment_id: uuid.UUID) -> ProgramAssignment | None:
        """Return the assignment with the given id, or ``None`` if not found."""
        return self.db.execute(
            select(ProgramAssignment).where(ProgramAssignment.id == assignment_id)
        ).scalar_one_or_none()

    def get_active_assignment_for_user(self, user_id: uuid.UUID) -> ProgramAssignment | None:
        """Return the user's current ``ACTIVE`` assignment, or ``None`` if they have none.

        Relies on the same invariant enforced by
        ``WorkoutService.assign_program`` and the partial unique index
        ``uq_program_assignments_one_active_per_user``: at most one row per
        user has ``status == ACTIVE`` at any time.
        """
        return self.db.execute(
            select(ProgramAssignment).where(
                ProgramAssignment.user_id == user_id,
                ProgramAssignment.status == AssignmentStatus.ACTIVE,
            )
        ).scalar_one_or_none()

    def list_assignments_for_user(self, user_id: uuid.UUID) -> list[ProgramAssignment]:
        """Return every assignment (active and historical) for a user, most recent first."""
        return list(
            self.db.execute(
                select(ProgramAssignment)
                .where(ProgramAssignment.user_id == user_id)
                .order_by(ProgramAssignment.started_at.desc())
            ).scalars()
        )

    def list_assignments_for_program(self, program_id: uuid.UUID) -> list[ProgramAssignment]:
        """Return every assignment of a program, most recent first."""
        return list(
            self.db.execute(
                select(ProgramAssignment)
                .where(ProgramAssignment.program_id == program_id)
                .order_by(ProgramAssignment.started_at.desc())
            ).scalars()
        )

    def update_assignment(self, assignment: ProgramAssignment) -> ProgramAssignment:
        """Flush pending changes on an already-tracked :class:`ProgramAssignment` and return it."""
        self.db.flush()
        self.db.refresh(assignment)
        return assignment
