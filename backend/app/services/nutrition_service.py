"""Business logic for the Meal/MealLog domain and daily nutrition targets.

``NutritionService`` is the only layer that composes
:class:`~app.repositories.meal_repository.MealRepository` and
:class:`~app.repositories.user_repository.UserRepository` with the
:class:`~app.ai.nutrition_engine.NutritionEngine` — no service-to-service
composition, matching
:class:`~app.services.workout_resolution_service.WorkoutResolutionService`'s
precedent. It covers three areas:

- **Meal template CRUD** — create/update/deactivate a personal meal
  template, and read/list templates visible to the current user (own +
  public, per Decision 012 in ``docs/DECISIONS.md``).
- **Meal logging** — record a diary entry, either snapshotted from a
  template or supplied ad-hoc, and manage that entry afterward.
- **Daily targets/adherence** — assemble a :class:`~app.ai.nutrition_engine.NutritionInput`
  from the user's profile and that date's logged totals, and delegate the
  actual computation to :class:`~app.ai.nutrition_engine.NutritionEngine`.

Contains no HTTP concepts and no raw SQL — the API layer translates this
service's return values and documented exceptions into request/response
schemas and HTTP status codes.
"""

import uuid
from datetime import date

from app.ai.bmr_strategies import NutritionProfile, get_bmr_strategy
from app.ai.nutrition_engine import (
    IncompleteNutritionProfileError,
    NutritionEngine,
    NutritionInput,
    NutritionOutput,
    NutritionTotals,
)
from app.core.config import settings
from app.models.meal import Meal, MealLog
from app.models.user import User
from app.repositories.meal_repository import MealRepository
from app.repositories.user_repository import UserRepository
from app.schemas.nutrition import MealCreate, MealLogCreate, MealLogUpdate, MealUpdate
from app.utils.datetime import age_in_years, utcnow
from app.utils.pagination import Page, clamp_pagination

__all__ = [
    "NutritionServiceError",
    "MealNotFoundError",
    "MealLogNotFoundError",
    "IncompleteNutritionProfileError",
    "NutritionService",
]


class NutritionServiceError(Exception):
    """Base class for all errors raised by :class:`NutritionService`."""


class MealNotFoundError(NutritionServiceError):
    """Raised when a referenced meal template does not resolve to one usable by this user."""


class MealLogNotFoundError(NutritionServiceError):
    """Raised when a referenced logged meal entry does not resolve to one owned by this user."""


_REQUIRED_PROFILE_FIELDS: tuple[str, ...] = (
    "current_weight_kg",
    "height_cm",
    "birth_date",
    "gender",
    "activity_level",
    "goal",
)


class NutritionService:
    """Meal template CRUD, meal logging, and daily nutrition target/adherence workflows.

    Depends on injected repositories rather than raw
    :class:`~sqlalchemy.orm.Session` instances, so it can be unit-tested
    with mocks (matches :class:`~app.services.workout_service.WorkoutService`).
    """

    def __init__(
        self,
        meal_repository: MealRepository,
        user_repository: UserRepository,
    ) -> None:
        self.meal_repository = meal_repository
        self.user_repository = user_repository
        self._engine = NutritionEngine(get_bmr_strategy(settings.nutrition_bmr_formula))

    # -- Meal template CRUD -----------------------------------------------

    def create_meal(self, user_id: uuid.UUID, data: MealCreate) -> Meal:
        """Create a new private meal template owned by ``user_id``.

        Always ``is_public=False``, ``created_by_id=user_id`` this sprint —
        see Decision 012 in ``docs/DECISIONS.md``.
        """
        meal = Meal(
            created_by_id=user_id,
            is_public=False,
            name=data.name,
            description=data.description,
            meal_type=data.meal_type,
            calories=data.calories,
            protein_g=data.protein_g,
            carbs_g=data.carbs_g,
            fat_g=data.fat_g,
            dietary_tags=data.dietary_tags,
        )
        created = self.meal_repository.create_meal(meal)
        self.meal_repository.db.commit()
        return created

    def update_meal(self, user_id: uuid.UUID, meal_id: uuid.UUID, data: MealUpdate) -> Meal:
        """Partially update a meal template owned by ``user_id``.

        Raises:
            MealNotFoundError: If ``meal_id`` does not resolve, or resolves
                to a meal not owned by ``user_id`` (a public meal owned by
                someone else is readable but never writable).
        """
        meal = self._get_owned_meal_or_raise(user_id, meal_id)

        if data.name is not None:
            meal.name = data.name
        if data.description is not None:
            meal.description = data.description
        if data.meal_type is not None:
            meal.meal_type = data.meal_type
        if data.calories is not None:
            meal.calories = data.calories
        if data.protein_g is not None:
            meal.protein_g = data.protein_g
        if data.carbs_g is not None:
            meal.carbs_g = data.carbs_g
        if data.fat_g is not None:
            meal.fat_g = data.fat_g
        if data.dietary_tags is not None:
            meal.dietary_tags = data.dietary_tags
        if data.is_active is not None:
            meal.is_active = data.is_active

        updated = self.meal_repository.update_meal(meal)
        self.meal_repository.db.commit()
        return updated

    def deactivate_meal(self, user_id: uuid.UUID, meal_id: uuid.UUID) -> Meal:
        """Mark a meal template inactive without removing it.

        Raises:
            MealNotFoundError: If ``meal_id`` does not resolve, or is not
                owned by ``user_id``.
        """
        meal = self._get_owned_meal_or_raise(user_id, meal_id)
        meal.is_active = False
        updated = self.meal_repository.update_meal(meal)
        self.meal_repository.db.commit()
        return updated

    def get_meal(self, user_id: uuid.UUID, meal_id: uuid.UUID) -> Meal:
        """Return a single meal template visible to ``user_id`` (own or public).

        Raises:
            MealNotFoundError: If ``meal_id`` does not resolve, or resolves
                to a private meal owned by someone else.
        """
        meal = self.meal_repository.get_meal_by_id(meal_id)
        return self._check_meal_visible(meal, user_id)

    def list_meals(
        self,
        user_id: uuid.UUID,
        *,
        limit: int = 20,
        offset: int = 0,
    ) -> Page[Meal]:
        """Return a paginated page of active meals visible to ``user_id`` (own + public)."""
        safe_limit, safe_offset = clamp_pagination(limit, offset)
        items = self.meal_repository.list_meals(user_id, limit=safe_limit, offset=safe_offset)
        total = self.meal_repository.count_meals(user_id)
        return Page(items=items, total=total, limit=safe_limit, offset=safe_offset)

    # -- Meal logging -------------------------------------------------------

    def log_meal(self, user_id: uuid.UUID, data: MealLogCreate) -> MealLog:
        """Record a diary entry, either snapshotted from a template or supplied ad-hoc.

        Raises:
            MealNotFoundError: If ``data.meal_id`` is given but does not
                resolve to a meal visible to ``user_id``.
        """
        if data.meal_id is not None:
            template = self.get_meal(user_id, data.meal_id)
            meal_log = MealLog(
                user_id=user_id,
                meal_id=template.id,
                name_snapshot=template.name,
                meal_type=template.meal_type,
                calories=template.calories,
                protein_g=template.protein_g,
                carbs_g=template.carbs_g,
                fat_g=template.fat_g,
                consumed_at=data.consumed_at,
                notes=data.notes,
            )
        else:
            meal_log = MealLog(
                user_id=user_id,
                meal_id=None,
                name_snapshot=data.name,
                meal_type=data.meal_type,
                calories=data.calories,
                protein_g=data.protein_g,
                carbs_g=data.carbs_g,
                fat_g=data.fat_g,
                consumed_at=data.consumed_at,
                notes=data.notes,
            )

        created = self.meal_repository.create_log(meal_log)
        self.meal_repository.db.commit()
        return created

    def update_meal_log(
        self, user_id: uuid.UUID, meal_log_id: uuid.UUID, data: MealLogUpdate
    ) -> MealLog:
        """Partially update a previously logged entry owned by ``user_id``.

        Raises:
            MealLogNotFoundError: If ``meal_log_id`` does not resolve, or is
                not owned by ``user_id``.
        """
        meal_log = self._get_owned_log_or_raise(user_id, meal_log_id)

        if data.name is not None:
            meal_log.name_snapshot = data.name
        if data.meal_type is not None:
            meal_log.meal_type = data.meal_type
        if data.calories is not None:
            meal_log.calories = data.calories
        if data.protein_g is not None:
            meal_log.protein_g = data.protein_g
        if data.carbs_g is not None:
            meal_log.carbs_g = data.carbs_g
        if data.fat_g is not None:
            meal_log.fat_g = data.fat_g
        if data.consumed_at is not None:
            meal_log.consumed_at = data.consumed_at
        if data.notes is not None:
            meal_log.notes = data.notes

        updated = self.meal_repository.update_log(meal_log)
        self.meal_repository.db.commit()
        return updated

    def delete_meal_log(self, user_id: uuid.UUID, meal_log_id: uuid.UUID) -> None:
        """Soft-delete a previously logged entry owned by ``user_id``.

        Raises:
            MealLogNotFoundError: If ``meal_log_id`` does not resolve, or is
                not owned by ``user_id``.
        """
        meal_log = self._get_owned_log_or_raise(user_id, meal_log_id)
        self.meal_repository.delete_log(meal_log)
        self.meal_repository.db.commit()

    def get_meal_log(self, user_id: uuid.UUID, meal_log_id: uuid.UUID) -> MealLog:
        """Return a single logged entry owned by ``user_id``.

        Raises:
            MealLogNotFoundError: If ``meal_log_id`` does not resolve, or is
                not owned by ``user_id``.
        """
        return self._get_owned_log_or_raise(user_id, meal_log_id)

    def list_meal_logs(
        self,
        user_id: uuid.UUID,
        *,
        date_from: date | None = None,
        date_to: date | None = None,
        limit: int = 20,
        offset: int = 0,
    ) -> Page[MealLog]:
        """Return a filtered, paginated page of a user's logged entries, most recent first."""
        safe_limit, safe_offset = clamp_pagination(limit, offset)
        items = self.meal_repository.list_logs(
            user_id, date_from=date_from, date_to=date_to, limit=safe_limit, offset=safe_offset
        )
        total = self.meal_repository.count_logs(user_id, date_from=date_from, date_to=date_to)
        return Page(items=items, total=total, limit=safe_limit, offset=safe_offset)

    # -- Daily targets/adherence ---------------------------------------------

    def get_daily_nutrition(
        self, user_id: uuid.UUID, *, for_date: date | None = None
    ) -> NutritionOutput:
        """Compute a user's calorie/macro targets and adherence for a single day.

        Args:
            user_id: The user to compute targets for.
            for_date: The calendar date to compute targets/adherence
                against; defaults to today (UTC).

        Raises:
            IncompleteNutritionProfileError: If the user's profile is
                missing any field :meth:`NutritionEngine.handle` requires
                (see ``_REQUIRED_PROFILE_FIELDS``); names the missing
                fields so the client can prompt the user to complete their
                profile.
        """
        resolved_date = for_date if for_date is not None else utcnow().date()

        user = self.user_repository.get_by_id(user_id)
        if user is None:
            raise MealNotFoundError("User not found.")

        profile = self._build_profile_or_raise(user)

        totals = self.meal_repository.sum_totals_for_date(user_id, resolved_date)
        logged_totals = NutritionTotals(
            calories=totals["calories"],
            protein_g=totals["protein_g"],
            carbs_g=totals["carbs_g"],
            fat_g=totals["fat_g"],
        )

        nutrition_input = NutritionInput(
            user_id=user_id,
            profile=profile,
            logged_totals=logged_totals,
            for_date=resolved_date,
        )
        return self._engine.handle(nutrition_input)

    # -- Internal helpers --------------------------------------------------------

    def _build_profile_or_raise(self, user: User) -> NutritionProfile:
        """Assemble a :class:`NutritionProfile` from ``user``, validating completeness first."""
        missing_fields = [
            field_name
            for field_name in _REQUIRED_PROFILE_FIELDS
            if getattr(user, field_name) is None
        ]
        if missing_fields:
            raise IncompleteNutritionProfileError(
                "Cannot compute nutrition targets: profile is missing "
                f"{', '.join(missing_fields)}. Complete your profile and try again."
            )
        return NutritionProfile(
            weight_kg=user.current_weight_kg,
            height_cm=user.height_cm,
            age_years=age_in_years(user.birth_date),
            gender=user.gender,
            activity_level=user.activity_level,
            goal=user.goal,
        )

    def _get_owned_meal_or_raise(self, user_id: uuid.UUID, meal_id: uuid.UUID) -> Meal:
        meal = self.meal_repository.get_meal_by_id(meal_id)
        if meal is None or meal.deleted_at is not None or meal.created_by_id != user_id:
            raise MealNotFoundError("Meal not found.")
        return meal

    def _check_meal_visible(self, meal: Meal | None, user_id: uuid.UUID) -> Meal:
        if (
            meal is None
            or meal.deleted_at is not None
            or not (meal.is_public or meal.created_by_id == user_id)
        ):
            raise MealNotFoundError("Meal not found.")
        return meal

    def _get_owned_log_or_raise(self, user_id: uuid.UUID, meal_log_id: uuid.UUID) -> MealLog:
        meal_log = self.meal_repository.get_log_by_id(meal_log_id)
        if (
            meal_log is None
            or meal_log.deleted_at is not None
            or meal_log.user_id != user_id
        ):
            raise MealLogNotFoundError("Meal log not found.")
        return meal_log
