"""Business logic for the Program and Workout domains.

``WorkoutService`` is the only layer that composes
:class:`~app.repositories.program_repository.ProgramRepository` and
:class:`~app.repositories.workout_repository.WorkoutRepository`, per the
Sprint 3.2 scope in ``docs/TASKS.md``. It covers three areas:

- **Program authoring** — create/update a program template, publish/archive
  its authoring lifecycle, and schedule ``ProgramDay`` slots onto it.
- **Workout authoring** — create/update a reusable workout template and its
  ordered exercise line items.
- **Program assignment flow** — assign a published program to a user,
  track their progress, and complete/abandon it.

Logging behavior (populating ``WorkoutLog``/``WorkoutLogExercise``/
``WorkoutSetLog`` rows) lives in the separate
:class:`~app.services.workout_log_service.WorkoutLogService`, per the
Sprint 3.3 design — a distinct aggregate with its own repository/service,
not an extension of this one.

Contains no HTTP concepts and no raw SQL — a future API layer translates
this service's return values and documented exceptions into
request/response schemas and HTTP status codes.
"""

import uuid
from datetime import datetime, timezone

from sqlalchemy.exc import IntegrityError

from app.core.config import settings
from app.models.program import (
    AssignmentStatus,
    Program,
    ProgramAssignment,
    ProgramDay,
    ProgramStatus,
)
from app.models.workout import Workout, WorkoutExercise
from app.repositories.program_repository import ProgramRepository
from app.repositories.workout_repository import WorkoutRepository
from app.schemas.program import ProgramCreate, ProgramDayInput, ProgramUpdate
from app.schemas.workout import WorkoutCreate, WorkoutExerciseInput, WorkoutUpdate
from app.utils.pagination import Page, clamp_pagination
from app.utils.text import slugify


class WorkoutServiceError(Exception):
    """Base class for all errors raised by :class:`WorkoutService`."""


class ProgramAlreadyExistsError(WorkoutServiceError):
    """Raised when creating a program collides with an existing slug (rare; see ``_generate_unique_program_slug``)."""


class ProgramNotFoundError(WorkoutServiceError):
    """Raised when a referenced program id/slug does not resolve to a usable program."""


class InvalidProgramStateError(WorkoutServiceError):
    """Raised when a program authoring-lifecycle transition is not valid from its current status."""


class ProgramNotAssignableError(WorkoutServiceError):
    """Raised when assigning a program that is not in :attr:`ProgramStatus.PUBLISHED`."""


class InvalidProgramDayError(WorkoutServiceError):
    """Raised when a ``ProgramDay`` cannot be scheduled as requested."""


class WorkoutAlreadyExistsError(WorkoutServiceError):
    """Raised when creating a workout collides with an existing slug (rare; see ``_generate_unique_workout_slug``)."""


class WorkoutNotFoundError(WorkoutServiceError):
    """Raised when a referenced workout id/slug does not resolve to a usable workout."""


class InvalidExerciseReferenceError(WorkoutServiceError):
    """Raised when a workout's exercise line items reference an exercise id that does not exist."""


class AssignmentNotFoundError(WorkoutServiceError):
    """Raised when a referenced program assignment id does not resolve to an existing assignment."""


class InvalidAssignmentStateError(WorkoutServiceError):
    """Raised when an assignment lifecycle transition is not valid from its current status."""


class ConcurrentAssignmentError(WorkoutServiceError):
    """Raised if a concurrent request slips a second ACTIVE assignment past the pre-check.

    A safety net for the partial unique index
    ``uq_program_assignments_one_active_per_user`` — this should be
    exceedingly rare given :meth:`WorkoutService.assign_program` abandons
    any existing active assignment before inserting the new one.
    """


class DefaultProgramNotFoundError(WorkoutServiceError):
    """Raised when the configured default program cannot be assigned.

    Covers a missing slug, a non-``PUBLISHED`` program, a soft-deleted row,
    or a published program with no scheduled days — callers should translate
    this to a clear HTTP error rather than returning ``no_active_program``.
    """


class WorkoutService:
    """Program authoring, workout authoring, and assignment-flow workflows.

    Depends on injected repositories rather than raw
    :class:`~sqlalchemy.orm.Session` instances, so it can be unit-tested
    with mocks (matches :class:`~app.services.exercise_service.ExerciseService`).
    """

    def __init__(
        self,
        program_repository: ProgramRepository,
        workout_repository: WorkoutRepository,
    ) -> None:
        self.program_repository = program_repository
        self.workout_repository = workout_repository

    # -- Program authoring --------------------------------------------------

    def create_program(self, data: ProgramCreate, *, created_by_id: uuid.UUID | None = None) -> Program:
        """Create a new program template in :attr:`ProgramStatus.DRAFT`.

        Args:
            data: Validated program input.
            created_by_id: The id of the authoring user, if any. ``None``
                for system/AI-created programs.

        Returns:
            The newly created program.

        Raises:
            ProgramAlreadyExistsError: If slug generation still collides
                after suffixing (only possible under a concurrent race).
        """
        program = Program(
            name=data.name,
            slug=self._generate_unique_program_slug(data.name),
            description=data.description,
            duration_weeks=data.duration_weeks,
            goal=data.goal,
            difficulty_level=data.difficulty_level,
            status=ProgramStatus.DRAFT,
            created_by_id=created_by_id,
        )
        try:
            created = self.program_repository.create(program)
            self.program_repository.db.commit()
        except IntegrityError as exc:
            self.program_repository.db.rollback()
            raise ProgramAlreadyExistsError(f"Program '{data.name}' already exists.") from exc
        return created

    def update_program(self, program_id: uuid.UUID, data: ProgramUpdate) -> Program:
        """Partially update a program template's authoring fields.

        ``slug`` and ``status`` are immutable via this method — status
        changes only ever happen through :meth:`publish_program` /
        :meth:`archive_program`.

        Raises:
            ProgramNotFoundError: If ``program_id`` does not resolve.
        """
        program = self._get_program_or_raise(program_id, include_unpublished=True)

        if data.name is not None:
            program.name = data.name
        if data.description is not None:
            program.description = data.description
        if data.duration_weeks is not None:
            program.duration_weeks = data.duration_weeks
        if data.goal is not None:
            program.goal = data.goal
        if data.difficulty_level is not None:
            program.difficulty_level = data.difficulty_level

        updated = self.program_repository.update(program)
        self.program_repository.db.commit()
        return updated

    def publish_program(self, program_id: uuid.UUID) -> Program:
        """Transition a program from ``DRAFT`` to ``PUBLISHED``, making it assignable.

        Raises:
            ProgramNotFoundError: If ``program_id`` does not resolve.
            InvalidProgramStateError: If the program is not currently ``DRAFT``.
        """
        program = self._get_program_or_raise(program_id, include_unpublished=True)
        if program.status != ProgramStatus.DRAFT:
            raise InvalidProgramStateError(
                f"Program must be DRAFT to publish (current status: {program.status.value})."
            )
        program.status = ProgramStatus.PUBLISHED
        updated = self.program_repository.update(program)
        self.program_repository.db.commit()
        return updated

    def archive_program(self, program_id: uuid.UUID) -> Program:
        """Transition a program to ``ARCHIVED``, making it unassignable.

        Existing assignments are unaffected — archiving only prevents new
        assignments via :meth:`assign_program`.

        Raises:
            ProgramNotFoundError: If ``program_id`` does not resolve.
            InvalidProgramStateError: If the program is already ``ARCHIVED``.
        """
        program = self._get_program_or_raise(program_id, include_unpublished=True)
        if program.status == ProgramStatus.ARCHIVED:
            raise InvalidProgramStateError("Program is already archived.")
        program.status = ProgramStatus.ARCHIVED
        updated = self.program_repository.update(program)
        self.program_repository.db.commit()
        return updated

    def get_program(self, program_id: uuid.UUID, *, include_unpublished: bool = False) -> Program:
        """Return a single program by id.

        Raises:
            ProgramNotFoundError: If no published (or, if
                ``include_unpublished``, any non-deleted) program has this id.
        """
        return self._get_program_or_raise(program_id, include_unpublished=include_unpublished)

    def get_program_by_slug(self, slug: str, *, include_unpublished: bool = False) -> Program:
        """Return a single program by slug.

        Raises:
            ProgramNotFoundError: If no published (or, if
                ``include_unpublished``, any non-deleted) program has this slug.
        """
        program = self.program_repository.get_by_slug(slug)
        return self._check_program_usable(program, include_unpublished=include_unpublished)

    def list_programs(
        self,
        *,
        status: ProgramStatus | None = None,
        search: str | None = None,
        limit: int = 20,
        offset: int = 0,
    ) -> Page[Program]:
        """Return a filtered, paginated page of programs."""
        safe_limit, safe_offset = clamp_pagination(limit, offset)
        filters = {"status": status, "search": search}
        items = self.program_repository.list_programs(**filters, limit=safe_limit, offset=safe_offset)
        total = self.program_repository.count(**filters)
        return Page(items=items, total=total, limit=safe_limit, offset=safe_offset)

    # -- Program day scheduling -----------------------------------------------

    def add_program_day(self, program_id: uuid.UUID, data: ProgramDayInput) -> ProgramDay:
        """Schedule a day onto a program at ``(week_number, day_number)``.

        ``day_number`` is intentionally open-ended (not capped to 1-7) so
        3-day, 4-day, 5-day, 6-day, or 10-day microcycles are all
        representable — only positivity is validated. Program-wide
        traversal must always sort by the composite ``(week_number,
        day_number)`` key (see ``app.models.program.ProgramDay``).

        Raises:
            ProgramNotFoundError: If ``program_id`` does not resolve.
            InvalidProgramDayError: If ``week_number`` exceeds the
                program's ``duration_weeks``, or a day already exists at
                this slot.
            WorkoutNotFoundError: If ``data.workout_id`` is given but does
                not resolve to a usable workout.
        """
        program = self._get_program_or_raise(program_id, include_unpublished=True)

        if data.week_number > program.duration_weeks:
            raise InvalidProgramDayError(
                f"week_number {data.week_number} exceeds program duration "
                f"({program.duration_weeks} weeks)."
            )
        if self.program_repository.exists_day(program_id, data.week_number, data.day_number):
            raise InvalidProgramDayError(
                f"A day already exists at week {data.week_number}, day {data.day_number}."
            )
        if data.workout_id is not None:
            self._get_workout_or_raise(data.workout_id, include_inactive=True)

        program_day = ProgramDay(
            program_id=program_id,
            week_number=data.week_number,
            day_number=data.day_number,
            label=data.label,
            workout_id=data.workout_id,
        )
        try:
            created = self.program_repository.add_day(program_day)
            self.program_repository.db.commit()
        except IntegrityError as exc:
            self.program_repository.db.rollback()
            raise InvalidProgramDayError(
                f"A day already exists at week {data.week_number}, day {data.day_number}."
            ) from exc
        return created

    def list_program_days(self, program_id: uuid.UUID) -> list[ProgramDay]:
        """Return every scheduled day for a program, ordered by ``(week_number, day_number)``.

        Raises:
            ProgramNotFoundError: If ``program_id`` does not resolve.
        """
        self._get_program_or_raise(program_id, include_unpublished=True)
        return self.program_repository.list_days(program_id)

    def remove_program_day(self, program_id: uuid.UUID, program_day_id: uuid.UUID) -> None:
        """Remove a single scheduled day from a program.

        Raises:
            ProgramNotFoundError: If ``program_id`` does not resolve.
            InvalidProgramDayError: If ``program_day_id`` does not belong
                to ``program_id`` or does not exist.
        """
        self._get_program_or_raise(program_id, include_unpublished=True)
        day = self.program_repository.get_day(program_day_id)
        if day is None or day.program_id != program_id:
            raise InvalidProgramDayError("This program day does not exist.")
        self.program_repository.remove_day(program_day_id)
        self.program_repository.db.commit()

    # -- Workout authoring -----------------------------------------------------

    def create_workout(self, data: WorkoutCreate, *, created_by_id: uuid.UUID | None = None) -> Workout:
        """Create a new workout template with its ordered exercise line items.

        Args:
            data: Validated workout input, including at least the exercise
                line items to include.
            created_by_id: The id of the authoring user, if any. ``None``
                for system/AI-created workouts.

        Returns:
            The newly created workout, with exercise line items eagerly loaded.

        Raises:
            InvalidExerciseReferenceError: If any ``exercise_id`` does not exist.
            WorkoutAlreadyExistsError: If slug generation still collides
                after suffixing (only possible under a concurrent race).
        """
        workout = Workout(
            name=data.name,
            slug=self._generate_unique_workout_slug(data.name),
            description=data.description,
            estimated_duration_minutes=data.estimated_duration_minutes,
            created_by_id=created_by_id,
        )

        try:
            created = self.workout_repository.create(workout)
            self.workout_repository.replace_exercises(
                created.id, self._build_exercise_entries(created.id, data.exercises)
            )
            self.workout_repository.db.commit()
        except IntegrityError as exc:
            self.workout_repository.db.rollback()
            raise InvalidExerciseReferenceError(
                "One or more exercise_id values do not exist, or the generated slug collided."
            ) from exc

        return self.workout_repository.get_by_id(created.id)

    def update_workout(self, workout_id: uuid.UUID, data: WorkoutUpdate) -> Workout:
        """Partially update a workout template and/or replace its exercise line items.

        ``slug`` is intentionally immutable once assigned, so existing
        references to this workout (``ProgramDay.workout_id``,
        ``WorkoutLog.workout_id``) never break because a display name
        changed.

        Raises:
            WorkoutNotFoundError: If ``workout_id`` does not resolve.
            InvalidExerciseReferenceError: If any replacement ``exercise_id``
                does not exist.
        """
        workout = self._get_workout_or_raise(workout_id, include_inactive=True)

        if data.name is not None:
            workout.name = data.name
        if data.description is not None:
            workout.description = data.description
        if data.estimated_duration_minutes is not None:
            workout.estimated_duration_minutes = data.estimated_duration_minutes
        if data.is_active is not None:
            workout.is_active = data.is_active

        try:
            if data.exercises is not None:
                self.workout_repository.replace_exercises(
                    workout.id, self._build_exercise_entries(workout.id, data.exercises)
                )
            updated = self.workout_repository.update(workout)
            self.workout_repository.db.commit()
        except IntegrityError as exc:
            self.workout_repository.db.rollback()
            raise InvalidExerciseReferenceError(
                "One or more exercise_id values do not exist."
            ) from exc

        return self.workout_repository.get_by_id(updated.id)

    def deactivate_workout(self, workout_id: uuid.UUID) -> Workout:
        """Mark a workout template inactive without removing it.

        Raises:
            WorkoutNotFoundError: If ``workout_id`` does not resolve.
        """
        workout = self._get_workout_or_raise(workout_id, include_inactive=True)
        workout.is_active = False
        updated = self.workout_repository.update(workout)
        self.workout_repository.db.commit()
        return updated

    def get_workout(self, workout_id: uuid.UUID, *, include_inactive: bool = False) -> Workout:
        """Return a single workout by id.

        Raises:
            WorkoutNotFoundError: If no active (or, if ``include_inactive``,
                any non-deleted) workout has this id.
        """
        return self._get_workout_or_raise(workout_id, include_inactive=include_inactive)

    def get_workout_by_slug(self, slug: str, *, include_inactive: bool = False) -> Workout:
        """Return a single workout by slug.

        Raises:
            WorkoutNotFoundError: If no active (or, if ``include_inactive``,
                any non-deleted) workout has this slug.
        """
        workout = self.workout_repository.get_by_slug(slug)
        return self._check_workout_usable(workout, include_inactive=include_inactive)

    def list_workouts(
        self,
        *,
        search: str | None = None,
        include_inactive: bool = False,
        limit: int = 20,
        offset: int = 0,
    ) -> Page[Workout]:
        """Return a filtered, paginated page of workouts.

        Public callers leave ``include_inactive`` false. Admin listing
        passes ``True`` so inactive templates remain visible.
        """
        safe_limit, safe_offset = clamp_pagination(limit, offset)
        items = self.workout_repository.list_workouts(
            search=search, include_inactive=include_inactive, limit=safe_limit, offset=safe_offset
        )
        total = self.workout_repository.count(search=search, include_inactive=include_inactive)
        return Page(items=items, total=total, limit=safe_limit, offset=safe_offset)

    def list_assignments_for_program(self, program_id: uuid.UUID) -> list[ProgramAssignment]:
        """Return every assignment of a program, most recent first.

        Raises:
            ProgramNotFoundError: If ``program_id`` does not resolve.
        """
        self._get_program_or_raise(program_id, include_unpublished=True)
        return self.program_repository.list_assignments_for_program(program_id)

    # -- Program assignment flow ------------------------------------------------

    def assign_program(self, user_id: uuid.UUID, program_id: uuid.UUID) -> ProgramAssignment:
        """Assign a published program to a user, starting a new active assignment.

        Only one ``ACTIVE`` assignment per user is allowed: if the user
        already has one (for this or any other program), it is marked
        ``ABANDONED`` before the new assignment is created. The new
        assignment's Workout Resolution Engine progress cursor
        (``current_week_number``/``current_day_number``/
        ``current_program_day_id``) is initialized to the program's
        earliest scheduled day, not hardcoded to ``(1, 1)``.

        Args:
            user_id: The user being assigned the program.
            program_id: The program to assign; must be ``PUBLISHED``.

        Returns:
            The newly created, ``ACTIVE`` assignment.

        Raises:
            ProgramNotFoundError: If ``program_id`` does not resolve.
            ProgramNotAssignableError: If the program is not ``PUBLISHED``,
                or has no scheduled ``ProgramDay`` to resolve against.
            ConcurrentAssignmentError: If a race condition slips a second
                active assignment past the abandon-then-create sequence
                (guarded by ``uq_program_assignments_one_active_per_user``).
        """
        program = self._get_program_or_raise(program_id, include_unpublished=True)
        if program.status != ProgramStatus.PUBLISHED:
            raise ProgramNotAssignableError(
                f"Program must be PUBLISHED to assign (current status: {program.status.value})."
            )

        first_day = self.program_repository.get_first_day(program_id)
        if first_day is None:
            raise ProgramNotAssignableError(
                "Program must have at least one scheduled day to be assigned."
            )

        existing_active = self.program_repository.get_active_assignment_for_user(user_id)
        if existing_active is not None:
            existing_active.status = AssignmentStatus.ABANDONED
            existing_active.ended_at = datetime.now(timezone.utc)
            self.program_repository.update_assignment(existing_active)

        assignment = ProgramAssignment(
            program_id=program_id,
            user_id=user_id,
            status=AssignmentStatus.ACTIVE,
            current_week_number=first_day.week_number,
            current_day_number=first_day.day_number,
            current_program_day_id=first_day.id,
        )
        try:
            created = self.program_repository.create_assignment(assignment)
            self.program_repository.db.commit()
        except IntegrityError as exc:
            self.program_repository.db.rollback()
            raise ConcurrentAssignmentError(
                "This user already has an active program assignment."
            ) from exc
        return created

    def ensure_active_assignment(self, user_id: uuid.UUID) -> ProgramAssignment:
        """Return the user's active assignment, auto-assigning the default program if needed.

        Idempotent for users who already have an ``ACTIVE`` assignment.
        On first workout access (no assignment), delegates to
        :meth:`assign_default_program`, which reuses :meth:`assign_program`.

        Args:
            user_id: The authenticated user.

        Returns:
            The user's ``ACTIVE`` assignment (existing or newly created).

        Raises:
            DefaultProgramNotFoundError: If no assignable default program is
                configured in the database.
            ConcurrentAssignmentError: If a race slips a second active
                assignment past the abandon-then-create sequence.
        """
        existing = self.get_active_assignment(user_id)
        if existing is not None:
            return existing
        return self.assign_default_program(user_id)

    def assign_default_program(self, user_id: uuid.UUID) -> ProgramAssignment:
        """Assign the configured default beginner program to a user.

        Looks up :attr:`~app.core.config.Settings.default_program_slug`
        and reuses :meth:`assign_program` — no duplicate assignment logic.

        Args:
            user_id: The user receiving the default program.

        Returns:
            The newly created, ``ACTIVE`` assignment.

        Raises:
            DefaultProgramNotFoundError: If the slug does not resolve to an
                assignable published program with at least one scheduled day.
            ConcurrentAssignmentError: Propagated from :meth:`assign_program`.
        """
        program = self._get_default_program_or_raise()
        return self.assign_program(user_id, program.id)

    def get_active_assignment(self, user_id: uuid.UUID) -> ProgramAssignment | None:
        """Return the user's current active assignment, or ``None`` if they have none."""
        return self.program_repository.get_active_assignment_for_user(user_id)

    def list_assignments(self, user_id: uuid.UUID) -> list[ProgramAssignment]:
        """Return every assignment (active and historical) for a user, most recent first."""
        return self.program_repository.list_assignments_for_user(user_id)

    def complete_assignment(self, assignment_id: uuid.UUID) -> ProgramAssignment:
        """Mark an active assignment ``COMPLETED``.

        Raises:
            AssignmentNotFoundError: If ``assignment_id`` does not resolve.
            InvalidAssignmentStateError: If the assignment is not ``ACTIVE``.
        """
        return self._transition_assignment(assignment_id, AssignmentStatus.COMPLETED)

    def abandon_assignment(self, assignment_id: uuid.UUID) -> ProgramAssignment:
        """Mark an active assignment ``ABANDONED``.

        Raises:
            AssignmentNotFoundError: If ``assignment_id`` does not resolve.
            InvalidAssignmentStateError: If the assignment is not ``ACTIVE``.
        """
        return self._transition_assignment(assignment_id, AssignmentStatus.ABANDONED)

    def _transition_assignment(
        self, assignment_id: uuid.UUID, new_status: AssignmentStatus
    ) -> ProgramAssignment:
        """Move an assignment from ``ACTIVE`` to a terminal status, shared by
        :meth:`complete_assignment` and :meth:`abandon_assignment`."""
        assignment = self.program_repository.get_assignment_by_id(assignment_id)
        if assignment is None:
            raise AssignmentNotFoundError("Assignment not found.")
        if assignment.status != AssignmentStatus.ACTIVE:
            raise InvalidAssignmentStateError(
                f"Assignment must be ACTIVE to transition (current status: "
                f"{assignment.status.value})."
            )
        assignment.status = new_status
        assignment.ended_at = datetime.now(timezone.utc)
        updated = self.program_repository.update_assignment(assignment)
        self.program_repository.db.commit()
        return updated

    # -- Internal helpers --------------------------------------------------------

    def _build_exercise_entries(
        self, workout_id: uuid.UUID, entries: list[WorkoutExerciseInput]
    ) -> list[WorkoutExercise]:
        """Translate validated ``WorkoutExerciseInput`` schemas into ORM rows."""
        return [
            WorkoutExercise(
                workout_id=workout_id,
                exercise_id=entry.exercise_id,
                order_index=entry.order_index,
                target_sets=entry.target_sets,
                target_reps_min=entry.target_reps_min,
                target_reps_max=entry.target_reps_max,
                rest_seconds=entry.rest_seconds,
                notes=entry.notes,
            )
            for entry in entries
        ]

    def _generate_unique_program_slug(self, name: str) -> str:
        """Derive a unique, URL-safe slug for a program from its display name."""
        base_slug = slugify(name)
        slug = base_slug
        suffix = 2
        while self.program_repository.exists_slug(slug):
            slug = f"{base_slug}-{suffix}"
            suffix += 1
        return slug

    def _generate_unique_workout_slug(self, name: str) -> str:
        """Derive a unique, URL-safe slug for a workout from its display name."""
        base_slug = slugify(name)
        slug = base_slug
        suffix = 2
        while self.workout_repository.exists_slug(slug):
            slug = f"{base_slug}-{suffix}"
            suffix += 1
        return slug

    def _get_program_or_raise(
        self, program_id: uuid.UUID, *, include_unpublished: bool
    ) -> Program:
        program = self.program_repository.get_by_id(program_id)
        return self._check_program_usable(program, include_unpublished=include_unpublished)

    def _check_program_usable(
        self, program: Program | None, *, include_unpublished: bool
    ) -> Program:
        if program is None or program.deleted_at is not None:
            raise ProgramNotFoundError("Program not found.")
        if not include_unpublished and program.status != ProgramStatus.PUBLISHED:
            raise ProgramNotFoundError("Program not found.")
        return program

    def _get_workout_or_raise(
        self, workout_id: uuid.UUID, *, include_inactive: bool
    ) -> Workout:
        workout = self.workout_repository.get_by_id(workout_id)
        return self._check_workout_usable(workout, include_inactive=include_inactive)

    def _check_workout_usable(
        self, workout: Workout | None, *, include_inactive: bool
    ) -> Workout:
        if workout is None or workout.deleted_at is not None:
            raise WorkoutNotFoundError("Workout not found.")
        if not include_inactive and not workout.is_active:
            raise WorkoutNotFoundError("Workout not found.")
        return workout

    def _get_default_program_or_raise(self) -> Program:
        """Resolve the configured default program slug to an assignable template."""
        slug = settings.default_program_slug
        program = self.program_repository.get_by_slug(slug)
        if program is None or program.deleted_at is not None:
            raise DefaultProgramNotFoundError(
                f"Default beginner program '{slug}' is not configured. "
                "Run database/seeds/seed_default_program.py after seeding exercises."
            )
        if program.status != ProgramStatus.PUBLISHED:
            raise DefaultProgramNotFoundError(
                f"Default beginner program '{slug}' is not published "
                f"(current status: {program.status.value})."
            )
        if self.program_repository.get_first_day(program.id) is None:
            raise DefaultProgramNotFoundError(
                f"Default beginner program '{slug}' has no scheduled days."
            )
        return program
