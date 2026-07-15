"""Repository for persistence and retrieval of the ``WorkoutLog`` aggregate.

Owns :class:`~app.models.workout_log.WorkoutLog` plus its two sub-resources,
``WorkoutLogExercise`` (exercise instances logged within a session) and
``WorkoutSetLog`` (individual performed sets) — a separate aggregate from
:class:`~app.repositories.workout_repository.WorkoutRepository`'s
``Workout``/``WorkoutExercise`` templates, per the Sprint 3.3 design.
Contains no business logic; it only translates calls into SQLAlchemy
queries against an injected :class:`~sqlalchemy.orm.Session` and returns
ORM model instances.
"""

import uuid
from datetime import date

from sqlalchemy import Select, func, select
from sqlalchemy.orm import Session

from app.models.workout_log import (
    WorkoutLog,
    WorkoutLogExercise,
    WorkoutLogStatus,
    WorkoutSetLog,
)


class WorkoutLogRepository:
    """Data-access layer for the ``workout_logs``, ``workout_log_exercises``,
    and ``workout_set_logs`` tables.

    The session is injected by the caller rather than created internally,
    keeping this class testable and free of lifecycle concerns (matches
    :class:`~app.repositories.workout_repository.WorkoutRepository`).
    """

    def __init__(self, db: Session) -> None:
        self.db = db

    # -- WorkoutLog: core CRUD ------------------------------------------

    def create(self, workout_log: WorkoutLog) -> WorkoutLog:
        """Persist a fully constructed :class:`WorkoutLog` instance and return it."""
        self.db.add(workout_log)
        self.db.flush()
        self.db.refresh(workout_log)
        return workout_log

    def get_by_id(self, workout_log_id: uuid.UUID) -> WorkoutLog | None:
        """Return the logged session with the given id, or ``None`` if not found.

        Does not filter by ``deleted_at`` or ownership — applying such
        rules is a service-layer responsibility.
        """
        return self.db.execute(
            select(WorkoutLog).where(WorkoutLog.id == workout_log_id)
        ).scalar_one_or_none()

    def update(self, workout_log: WorkoutLog) -> WorkoutLog:
        """Flush pending changes on an already-tracked :class:`WorkoutLog` and return it.

        The caller is expected to mutate attributes on an instance obtained
        from this session before calling this method (matches
        :meth:`WorkoutRepository.update`).
        """
        self.db.flush()
        self.db.refresh(workout_log)
        return workout_log

    def get_active_for_user(self, user_id: uuid.UUID) -> WorkoutLog | None:
        """Return the user's current ``IN_PROGRESS`` session, or ``None`` if they have none.

        Relies on the same invariant enforced by
        ``WorkoutLogService.start_workout`` and the partial unique index
        ``uq_workout_logs_one_in_progress_per_user``: at most one row per
        user has ``status == IN_PROGRESS`` at any time.
        """
        return self.db.execute(
            select(WorkoutLog).where(
                WorkoutLog.user_id == user_id,
                WorkoutLog.status == WorkoutLogStatus.IN_PROGRESS,
            )
        ).scalar_one_or_none()

    # -- WorkoutLog: history listing --------------------------------------

    def _filtered_query(
        self,
        user_id: uuid.UUID,
        *,
        status: WorkoutLogStatus | None,
        date_from: date | None,
        date_to: date | None,
        program_assignment_id: uuid.UUID | None,
        workout_id: uuid.UUID | None,
    ) -> Select:
        """Build the shared filter predicate for :meth:`list_for_user` and :meth:`count`."""
        query = select(WorkoutLog).where(
            WorkoutLog.user_id == user_id,
            WorkoutLog.deleted_at.is_(None),
        )
        if status is not None:
            query = query.where(WorkoutLog.status == status)
        if date_from is not None:
            query = query.where(WorkoutLog.scheduled_date >= date_from)
        if date_to is not None:
            query = query.where(WorkoutLog.scheduled_date <= date_to)
        if program_assignment_id is not None:
            query = query.where(WorkoutLog.program_assignment_id == program_assignment_id)
        if workout_id is not None:
            query = query.where(WorkoutLog.workout_id == workout_id)
        return query

    def list_for_user(
        self,
        user_id: uuid.UUID,
        *,
        status: WorkoutLogStatus | None = None,
        date_from: date | None = None,
        date_to: date | None = None,
        program_assignment_id: uuid.UUID | None = None,
        workout_id: uuid.UUID | None = None,
        limit: int = 20,
        offset: int = 0,
    ) -> list[WorkoutLog]:
        """Return a filtered, paginated page of a user's logs, most recent first."""
        query = self._filtered_query(
            user_id,
            status=status,
            date_from=date_from,
            date_to=date_to,
            program_assignment_id=program_assignment_id,
            workout_id=workout_id,
        )
        query = (
            query.order_by(WorkoutLog.created_at.desc()).limit(limit).offset(offset)
        )
        return list(self.db.execute(query).scalars())

    def count(
        self,
        user_id: uuid.UUID,
        *,
        status: WorkoutLogStatus | None = None,
        date_from: date | None = None,
        date_to: date | None = None,
        program_assignment_id: uuid.UUID | None = None,
        workout_id: uuid.UUID | None = None,
    ) -> int:
        """Return the total count of logs matching the same filters as :meth:`list_for_user`."""
        query = self._filtered_query(
            user_id,
            status=status,
            date_from=date_from,
            date_to=date_to,
            program_assignment_id=program_assignment_id,
            workout_id=workout_id,
        )
        count_query = select(func.count()).select_from(query.subquery())
        return self.db.execute(count_query).scalar_one()

    # -- WorkoutLogExercise -----------------------------------------------

    def add_exercise(self, entry: WorkoutLogExercise) -> WorkoutLogExercise:
        """Persist a fully constructed :class:`WorkoutLogExercise` instance and return it."""
        self.db.add(entry)
        self.db.flush()
        self.db.refresh(entry)
        return entry

    def get_exercise_by_id(self, log_exercise_id: uuid.UUID) -> WorkoutLogExercise | None:
        """Return the log-exercise with the given id, or ``None`` if not found."""
        return self.db.execute(
            select(WorkoutLogExercise).where(WorkoutLogExercise.id == log_exercise_id)
        ).scalar_one_or_none()

    def update_exercise(self, log_exercise: WorkoutLogExercise) -> WorkoutLogExercise:
        """Flush pending changes on an already-tracked :class:`WorkoutLogExercise` and return it.

        Mirrors :meth:`update`/:meth:`update_set` — the caller mutates
        attributes on an instance obtained from this session before
        calling this method.
        """
        self.db.flush()
        self.db.refresh(log_exercise)
        return log_exercise

    def next_exercise_order_index(self, workout_log_id: uuid.UUID) -> int:
        """Return the next available ``order_index`` for a log (``max + 1``, or ``0``)."""
        current_max = self.db.execute(
            select(func.max(WorkoutLogExercise.order_index)).where(
                WorkoutLogExercise.workout_log_id == workout_log_id
            )
        ).scalar_one()
        return 0 if current_max is None else current_max + 1

    # -- WorkoutSetLog ------------------------------------------------------

    def add_set(self, set_log: WorkoutSetLog) -> WorkoutSetLog:
        """Persist a fully constructed :class:`WorkoutSetLog` instance and return it."""
        self.db.add(set_log)
        self.db.flush()
        self.db.refresh(set_log)
        return set_log

    def get_set_by_id(self, set_log_id: uuid.UUID) -> WorkoutSetLog | None:
        """Return the set log with the given id, or ``None`` if not found."""
        return self.db.execute(
            select(WorkoutSetLog).where(WorkoutSetLog.id == set_log_id)
        ).scalar_one_or_none()

    def update_set(self, set_log: WorkoutSetLog) -> WorkoutSetLog:
        """Flush pending changes on an already-tracked :class:`WorkoutSetLog` and return it."""
        self.db.flush()
        self.db.refresh(set_log)
        return set_log

    def delete_set(self, set_log_id: uuid.UUID) -> bool:
        """Hard-delete a single set log.

        Returns ``True`` if a matching row existed and was removed,
        ``False`` otherwise. Hard delete is acceptable here — a set log has
        no independent history of its own once removed, unlike
        ``WorkoutLog`` itself which is soft-deleted.
        """
        set_log = self.get_set_by_id(set_log_id)
        if set_log is None:
            return False
        self.db.delete(set_log)
        self.db.flush()
        return True

    def next_set_number(self, workout_log_exercise_id: uuid.UUID) -> int:
        """Return the next available ``set_number`` for a log-exercise (``max + 1``, or ``1``)."""
        current_max = self.db.execute(
            select(func.max(WorkoutSetLog.set_number)).where(
                WorkoutSetLog.workout_log_exercise_id == workout_log_exercise_id
            )
        ).scalar_one()
        return 1 if current_max is None else current_max + 1

    # -- Training load aggregation (Recovery Engine) -----------------------

    def _completed_logs_in_window(
        self, user_id: uuid.UUID, *, date_from: date, date_to: date
    ) -> Select:
        """Return the shared filter for training-load aggregation over a date window.

        Only ``COMPLETED`` sessions count toward training load — ``PLANNED``,
        ``IN_PROGRESS``, and ``SKIPPED`` sessions carry no actual load.
        Windowed on ``completed_at`` (the date training actually happened),
        not ``scheduled_date`` (nullable, and meaningless for ad-hoc
        sessions).
        """
        return select(WorkoutLog).where(
            WorkoutLog.user_id == user_id,
            WorkoutLog.deleted_at.is_(None),
            WorkoutLog.status == WorkoutLogStatus.COMPLETED,
            WorkoutLog.completed_at.is_not(None),
            func.date(WorkoutLog.completed_at) >= date_from,
            func.date(WorkoutLog.completed_at) <= date_to,
        )

    def get_training_load_summary(
        self, user_id: uuid.UUID, *, date_from: date, date_to: date
    ) -> dict[str, object]:
        """Aggregate a user's completed training load over a trailing date window.

        Backs :meth:`~app.services.recovery_service.RecoveryService.get_daily_readiness`
        — the Recovery Engine never queries the database itself (see
        Decision 014 in ``docs/DECISIONS.md``). Two separate queries are
        used deliberately (session/duration, then average RPE) rather than
        one join, since joining to ``WorkoutSetLog`` would fan out and
        double-count ``duration_actual_minutes`` per set. Warm-up sets are
        excluded from the RPE average, matching ``WorkoutSetLog.is_warmup``'s
        existing "excluded from volume/PR calculations" convention. Returns
        zeroed/``None`` fields (never a missing key) when no logs exist for
        the window, so callers don't need a separate "no logs" branch.
        """
        completed_logs = self._completed_logs_in_window(
            user_id, date_from=date_from, date_to=date_to
        ).subquery()

        session_row = self.db.execute(
            select(
                func.count(completed_logs.c.id).label("session_count"),
                func.coalesce(
                    func.sum(completed_logs.c.duration_actual_minutes), 0
                ).label("total_duration_minutes"),
            )
        ).one()

        avg_rpe = self.db.execute(
            select(func.avg(WorkoutSetLog.rpe))
            .join(
                WorkoutLogExercise,
                WorkoutSetLog.workout_log_exercise_id == WorkoutLogExercise.id,
            )
            .where(
                WorkoutLogExercise.workout_log_id.in_(select(completed_logs.c.id)),
                WorkoutSetLog.is_warmup.is_(False),
                WorkoutSetLog.rpe.is_not(None),
            )
        ).scalar_one()

        return {
            "session_count": session_row.session_count,
            "total_duration_minutes": session_row.total_duration_minutes,
            "avg_rpe": avg_rpe,
        }
