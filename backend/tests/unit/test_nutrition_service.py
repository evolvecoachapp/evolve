"""Unit tests for :class:`~app.services.nutrition_service.NutritionService`.

The injected :class:`~app.repositories.meal_repository.MealRepository` and
:class:`~app.repositories.user_repository.UserRepository` are mocked
throughout — these tests exercise meal CRUD, logging (template-snapshot vs.
ad-hoc), visibility/ownership rules, and the incomplete-profile error path
in isolation, with no database involved. See
``tests/integration/test_nutrition_api.py`` for a full end-to-end flow
against a real PostgreSQL instance.
"""

import uuid
from datetime import date, datetime, timezone
from decimal import Decimal

import pytest

from app.models.meal import Meal, MealLog, MealType
from app.models.user import ActivityLevel, Gender, Goal, User
from app.schemas.nutrition import MealCreate, MealLogCreate, MealLogUpdate, MealUpdate
from app.services.nutrition_service import (
    IncompleteNutritionProfileError,
    MealLogNotFoundError,
    MealNotFoundError,
    NutritionService,
)

USER_ID = uuid.uuid4()
OTHER_USER_ID = uuid.uuid4()


@pytest.fixture()
def meal_repository(mocker):
    repo = mocker.Mock()
    repo.db = mocker.Mock()
    return repo


@pytest.fixture()
def user_repository(mocker):
    return mocker.Mock()


@pytest.fixture()
def service(meal_repository, user_repository):
    return NutritionService(meal_repository, user_repository)


def _make_meal(
    *,
    meal_id: uuid.UUID | None = None,
    created_by_id: uuid.UUID | None = USER_ID,
    is_public: bool = False,
    is_active: bool = True,
    deleted_at: datetime | None = None,
) -> Meal:
    return Meal(
        id=meal_id or uuid.uuid4(),
        created_by_id=created_by_id,
        is_public=is_public,
        name="Chicken and rice",
        description=None,
        meal_type=MealType.LUNCH,
        calories=Decimal("600"),
        protein_g=Decimal("50"),
        carbs_g=Decimal("70"),
        fat_g=Decimal("10"),
        dietary_tags=None,
        is_active=is_active,
        deleted_at=deleted_at,
    )


def _make_log(
    *,
    log_id: uuid.UUID | None = None,
    user_id: uuid.UUID = USER_ID,
    meal_id: uuid.UUID | None = None,
    deleted_at: datetime | None = None,
) -> MealLog:
    return MealLog(
        id=log_id or uuid.uuid4(),
        user_id=user_id,
        meal_id=meal_id,
        name_snapshot="Chicken and rice",
        meal_type=MealType.LUNCH,
        calories=Decimal("600"),
        protein_g=Decimal("50"),
        carbs_g=Decimal("70"),
        fat_g=Decimal("10"),
        consumed_at=datetime(2026, 1, 1, 12, 0, tzinfo=timezone.utc),
        notes=None,
        deleted_at=deleted_at,
    )


def _make_complete_user(**overrides) -> User:
    defaults = dict(
        id=USER_ID,
        email="user@example.test",
        username="testuser",
        hashed_password="hashed",
        birth_date=date(2000, 1, 1),
        gender=Gender.MALE,
        height_cm=Decimal("175"),
        current_weight_kg=Decimal("70"),
        activity_level=ActivityLevel.SEDENTARY,
        goal=Goal.MAINTAIN_WEIGHT,
    )
    defaults.update(overrides)
    return User(**defaults)


# -- Meal template CRUD -------------------------------------------------------


def test_create_meal_always_creates_a_private_meal_owned_by_the_caller(service, meal_repository):
    meal_repository.create_meal.side_effect = lambda meal: meal
    data = MealCreate(
        name="Oatmeal",
        meal_type=MealType.BREAKFAST,
        calories=Decimal("300"),
        protein_g=Decimal("15"),
        carbs_g=Decimal("45"),
        fat_g=Decimal("8"),
    )

    created = service.create_meal(USER_ID, data)

    assert created.created_by_id == USER_ID
    assert created.is_public is False
    meal_repository.db.commit.assert_called_once()


def test_update_meal_raises_when_not_owned_by_caller(service, meal_repository):
    meal_repository.get_meal_by_id.return_value = _make_meal(created_by_id=OTHER_USER_ID)

    with pytest.raises(MealNotFoundError):
        service.update_meal(USER_ID, uuid.uuid4(), MealUpdate(name="New name"))


def test_update_meal_applies_provided_fields_when_owned(service, meal_repository):
    meal = _make_meal(created_by_id=USER_ID)
    meal_repository.get_meal_by_id.return_value = meal
    meal_repository.update_meal.side_effect = lambda m: m

    updated = service.update_meal(USER_ID, meal.id, MealUpdate(name="Updated name"))

    assert updated.name == "Updated name"
    meal_repository.db.commit.assert_called_once()


def test_deactivate_meal_sets_is_active_false(service, meal_repository):
    meal = _make_meal(created_by_id=USER_ID, is_active=True)
    meal_repository.get_meal_by_id.return_value = meal
    meal_repository.update_meal.side_effect = lambda m: m

    updated = service.deactivate_meal(USER_ID, meal.id)

    assert updated.is_active is False


def test_get_meal_visible_when_public_even_if_owned_by_someone_else(service, meal_repository):
    meal = _make_meal(created_by_id=OTHER_USER_ID, is_public=True)
    meal_repository.get_meal_by_id.return_value = meal

    result = service.get_meal(USER_ID, meal.id)

    assert result is meal


def test_get_meal_not_found_when_private_and_owned_by_someone_else(service, meal_repository):
    meal_repository.get_meal_by_id.return_value = _make_meal(
        created_by_id=OTHER_USER_ID, is_public=False
    )

    with pytest.raises(MealNotFoundError):
        service.get_meal(USER_ID, uuid.uuid4())


def test_get_meal_not_found_when_soft_deleted(service, meal_repository):
    meal_repository.get_meal_by_id.return_value = _make_meal(
        created_by_id=USER_ID, deleted_at=datetime.now(timezone.utc)
    )

    with pytest.raises(MealNotFoundError):
        service.get_meal(USER_ID, uuid.uuid4())


# -- Meal logging -------------------------------------------------------------


def test_log_meal_template_mode_snapshots_the_template(service, meal_repository):
    template = _make_meal(created_by_id=USER_ID)
    meal_repository.get_meal_by_id.return_value = template
    meal_repository.create_log.side_effect = lambda log: log

    result = service.log_meal(
        USER_ID,
        MealLogCreate(
            meal_id=template.id,
            consumed_at=datetime(2026, 1, 1, 12, 0, tzinfo=timezone.utc),
        ),
    )

    assert result.meal_id == template.id
    assert result.name_snapshot == template.name
    assert result.calories == template.calories
    meal_repository.db.commit.assert_called_once()


def test_log_meal_template_mode_requires_a_visible_template(service, meal_repository):
    meal_repository.get_meal_by_id.return_value = _make_meal(created_by_id=OTHER_USER_ID)

    with pytest.raises(MealNotFoundError):
        service.log_meal(
            USER_ID,
            MealLogCreate(
                meal_id=uuid.uuid4(),
                consumed_at=datetime(2026, 1, 1, 12, 0, tzinfo=timezone.utc),
            ),
        )


def test_log_meal_ad_hoc_mode_uses_supplied_fields_directly(service, meal_repository):
    meal_repository.create_log.side_effect = lambda log: log

    result = service.log_meal(
        USER_ID,
        MealLogCreate(
            name="Protein shake",
            meal_type=MealType.SNACK,
            calories=Decimal("200"),
            protein_g=Decimal("30"),
            carbs_g=Decimal("10"),
            fat_g=Decimal("2"),
            consumed_at=datetime(2026, 1, 1, 9, 0, tzinfo=timezone.utc),
        ),
    )

    assert result.meal_id is None
    assert result.name_snapshot == "Protein shake"
    meal_repository.get_meal_by_id.assert_not_called()


def test_update_meal_log_raises_when_not_owned_by_caller(service, meal_repository):
    meal_repository.get_log_by_id.return_value = _make_log(user_id=OTHER_USER_ID)

    with pytest.raises(MealLogNotFoundError):
        service.update_meal_log(USER_ID, uuid.uuid4(), MealLogUpdate(notes="edited"))


def test_delete_meal_log_soft_deletes_when_owned(service, meal_repository):
    log = _make_log(user_id=USER_ID)
    meal_repository.get_log_by_id.return_value = log

    service.delete_meal_log(USER_ID, log.id)

    meal_repository.delete_log.assert_called_once_with(log)
    meal_repository.db.commit.assert_called_once()


# -- Daily targets/adherence --------------------------------------------------


def test_get_daily_nutrition_raises_when_profile_is_incomplete(
    service, meal_repository, user_repository
):
    incomplete_user = _make_complete_user(gender=None)
    user_repository.get_by_id.return_value = incomplete_user

    with pytest.raises(IncompleteNutritionProfileError, match="gender"):
        service.get_daily_nutrition(USER_ID, for_date=date(2026, 1, 1))


def test_get_daily_nutrition_builds_input_from_profile_and_logged_totals(
    service, meal_repository, user_repository
):
    user_repository.get_by_id.return_value = _make_complete_user()
    meal_repository.sum_totals_for_date.return_value = {
        "calories": Decimal("500"),
        "protein_g": Decimal("40"),
        "carbs_g": Decimal("50"),
        "fat_g": Decimal("15"),
    }

    result = service.get_daily_nutrition(USER_ID, for_date=date(2026, 1, 1))

    assert result.for_date == date(2026, 1, 1)
    assert result.actual.calories == Decimal("500")
    meal_repository.sum_totals_for_date.assert_called_once_with(USER_ID, date(2026, 1, 1))
