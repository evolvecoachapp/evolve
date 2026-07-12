"""Repository for persistence and retrieval of the ``Meal``/``MealLog`` pair.

Owns both :class:`~app.models.meal.Meal` (the template) and
:class:`~app.models.meal.MealLog` (the diary entry) — one repository for
this tightly-coupled aggregate pair, matching
:class:`~app.repositories.chat_repository.ChatRepository`'s precedent
(not the two-repository ``WorkoutRepository``/``WorkoutLogRepository``
split, since Meal/MealLog's combined scope here is much smaller). Contains
no business logic — visibility/ownership rules, snapshotting, and
validation all live in
:class:`~app.services.nutrition_service.NutritionService`; this class only
translates calls into SQLAlchemy queries against an injected
:class:`~sqlalchemy.orm.Session` and returns ORM model instances.
"""

import uuid
from datetime import date, datetime

from sqlalchemy import Select, func, or_, select
from sqlalchemy.orm import Session

from app.models.meal import Meal, MealLog


class MealRepository:
    """Data-access layer for the ``meals`` and ``meal_logs`` tables.

    The session is injected by the caller rather than created internally,
    keeping this class testable and free of lifecycle concerns (matches
    :class:`~app.repositories.chat_repository.ChatRepository`).
    """

    def __init__(self, db: Session) -> None:
        self.db = db

    # -- Meal (template) ---------------------------------------------------

    def create_meal(self, meal: Meal) -> Meal:
        """Persist a fully constructed :class:`Meal` instance and return it."""
        self.db.add(meal)
        self.db.flush()
        self.db.refresh(meal)
        return meal

    def get_meal_by_id(self, meal_id: uuid.UUID) -> Meal | None:
        """Return the meal template with the given id, or ``None`` if not found.

        Does not filter by ``deleted_at``, ``is_active``, or
        visibility/ownership — applying such rules is a service-layer
        responsibility.
        """
        return self.db.execute(select(Meal).where(Meal.id == meal_id)).scalar_one_or_none()

    def update_meal(self, meal: Meal) -> Meal:
        """Flush pending changes on an already-tracked :class:`Meal` and return it.

        The caller is expected to mutate attributes on an instance obtained
        from this session before calling this method (matches
        :meth:`~app.repositories.workout_repository.WorkoutRepository.update`).
        """
        self.db.flush()
        self.db.refresh(meal)
        return meal

    def _visible_meals_query(self, user_id: uuid.UUID) -> Select:
        """Build the shared "readable by this user" predicate for meal templates.

        A meal is readable if it is public or owned by ``user_id`` — see
        Decision 012 in ``docs/DECISIONS.md``.
        """
        return select(Meal).where(
            Meal.deleted_at.is_(None),
            or_(Meal.is_public.is_(True), Meal.created_by_id == user_id),
        )

    def list_meals(
        self,
        user_id: uuid.UUID,
        *,
        include_inactive: bool = False,
        limit: int = 20,
        offset: int = 0,
    ) -> list[Meal]:
        """Return a paginated page of meals visible to ``user_id``, most recent first."""
        query = self._visible_meals_query(user_id)
        if not include_inactive:
            query = query.where(Meal.is_active.is_(True))
        query = query.order_by(Meal.created_at.desc()).limit(limit).offset(offset)
        return list(self.db.execute(query).scalars())

    def count_meals(self, user_id: uuid.UUID, *, include_inactive: bool = False) -> int:
        """Return the total count of meals matching the same filters as :meth:`list_meals`."""
        query = self._visible_meals_query(user_id)
        if not include_inactive:
            query = query.where(Meal.is_active.is_(True))
        count_query = select(func.count()).select_from(query.subquery())
        return self.db.execute(count_query).scalar_one()

    # -- MealLog ------------------------------------------------------------

    def create_log(self, meal_log: MealLog) -> MealLog:
        """Persist a fully constructed :class:`MealLog` instance and return it."""
        self.db.add(meal_log)
        self.db.flush()
        self.db.refresh(meal_log)
        return meal_log

    def get_log_by_id(self, meal_log_id: uuid.UUID) -> MealLog | None:
        """Return the logged entry with the given id, or ``None`` if not found.

        Does not filter by ``deleted_at`` or ownership — applying such
        rules is a service-layer responsibility.
        """
        return self.db.execute(
            select(MealLog).where(MealLog.id == meal_log_id)
        ).scalar_one_or_none()

    def update_log(self, meal_log: MealLog) -> MealLog:
        """Flush pending changes on an already-tracked :class:`MealLog` and return it."""
        self.db.flush()
        self.db.refresh(meal_log)
        return meal_log

    def delete_log(self, meal_log: MealLog) -> None:
        """Soft-delete a single logged entry by setting ``deleted_at``."""
        meal_log.deleted_at = datetime.now(meal_log.consumed_at.tzinfo)
        self.db.flush()

    def _filtered_logs_query(
        self,
        user_id: uuid.UUID,
        *,
        date_from: date | None,
        date_to: date | None,
    ) -> Select:
        """Build the shared filter predicate for :meth:`list_logs` and :meth:`count_logs`."""
        query = select(MealLog).where(
            MealLog.user_id == user_id,
            MealLog.deleted_at.is_(None),
        )
        if date_from is not None:
            query = query.where(func.date(MealLog.consumed_at) >= date_from)
        if date_to is not None:
            query = query.where(func.date(MealLog.consumed_at) <= date_to)
        return query

    def list_logs(
        self,
        user_id: uuid.UUID,
        *,
        date_from: date | None = None,
        date_to: date | None = None,
        limit: int = 20,
        offset: int = 0,
    ) -> list[MealLog]:
        """Return a filtered, paginated page of a user's logged entries, most recent first."""
        query = self._filtered_logs_query(user_id, date_from=date_from, date_to=date_to)
        query = query.order_by(MealLog.consumed_at.desc()).limit(limit).offset(offset)
        return list(self.db.execute(query).scalars())

    def count_logs(
        self,
        user_id: uuid.UUID,
        *,
        date_from: date | None = None,
        date_to: date | None = None,
    ) -> int:
        """Return the total count of logs matching the same filters as :meth:`list_logs`."""
        query = self._filtered_logs_query(user_id, date_from=date_from, date_to=date_to)
        count_query = select(func.count()).select_from(query.subquery())
        return self.db.execute(count_query).scalar_one()

    def sum_totals_for_date(self, user_id: uuid.UUID, for_date: date) -> dict[str, object]:
        """Aggregate a user's logged macro totals for a single calendar date.

        Backs :meth:`~app.services.nutrition_service.NutritionService.get_daily_nutrition`
        — the Nutrition Engine never queries the database itself. Returns
        zeroed totals (never ``None``) when no logs exist for the date, so
        callers don't need a separate "no logs" branch.
        """
        row = self.db.execute(
            select(
                func.coalesce(func.sum(MealLog.calories), 0).label("calories"),
                func.coalesce(func.sum(MealLog.protein_g), 0).label("protein_g"),
                func.coalesce(func.sum(MealLog.carbs_g), 0).label("carbs_g"),
                func.coalesce(func.sum(MealLog.fat_g), 0).label("fat_g"),
            ).where(
                MealLog.user_id == user_id,
                MealLog.deleted_at.is_(None),
                func.date(MealLog.consumed_at) == for_date,
            )
        ).one()
        return {
            "calories": row.calories,
            "protein_g": row.protein_g,
            "carbs_g": row.carbs_g,
            "fat_g": row.fat_g,
        }
