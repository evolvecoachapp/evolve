"""Unit tests for :class:`~app.services.user_service.UserService`.

The injected :class:`~app.repositories.user_repository.UserRepository` is
mocked throughout — these tests exercise profile updates and conflict
detection in isolation, with no database involved. See
``tests/integration/test_users_api.py`` for a full end-to-end flow against a
real PostgreSQL instance.
"""

import uuid
from datetime import datetime, timezone
from decimal import Decimal

import pytest

from app.models.user import ActivityLevel, Gender, Goal, User
from app.schemas.user import UserUpdate
from app.services.auth_service import UserAlreadyExistsError
from app.services.user_service import UserNotFoundError, UserService

USER_ID = uuid.uuid4()


@pytest.fixture()
def user_repository(mocker):
    repo = mocker.Mock()
    repo.db = mocker.Mock()
    return repo


@pytest.fixture()
def service(user_repository) -> UserService:
    return UserService(user_repository)


def _make_user(
    *,
    user_id: uuid.UUID = USER_ID,
    email: str = "coach@evolve.app",
    username: str = "coach_user",
    deleted_at: datetime | None = None,
) -> User:
    return User(
        id=user_id,
        email=email,
        username=username,
        hashed_password="hashed",
        first_name="Alex",
        last_name="Rivera",
        birth_date=None,
        gender=Gender.PREFER_NOT_TO_SAY,
        height_cm=Decimal("178.0"),
        current_weight_kg=Decimal("78.0"),
        target_weight_kg=Decimal("75.0"),
        activity_level=ActivityLevel.MODERATELY_ACTIVE,
        goal=Goal.GAIN_MUSCLE,
        is_active=True,
        is_verified=True,
        is_superuser=False,
        created_at=datetime(2026, 1, 1, tzinfo=timezone.utc),
        updated_at=datetime(2026, 7, 1, tzinfo=timezone.utc),
        deleted_at=deleted_at,
    )


def test_update_profile_applies_partial_fields(service, user_repository):
    user = _make_user()
    user_repository.get_by_id.return_value = user
    user_repository.update.side_effect = lambda updated: updated

    updated = service.update_profile(
        USER_ID,
        UserUpdate(first_name="Jordan", current_weight_kg=Decimal("76.5")),
    )

    assert updated.first_name == "Jordan"
    assert updated.current_weight_kg == Decimal("76.5")
    assert updated.last_name == "Rivera"
    user_repository.db.commit.assert_called_once()


def test_update_profile_raises_when_user_not_found(service, user_repository):
    user_repository.get_by_id.return_value = None

    with pytest.raises(UserNotFoundError):
        service.update_profile(USER_ID, UserUpdate(first_name="Jordan"))


def test_update_profile_raises_when_user_is_soft_deleted(service, user_repository):
    user_repository.get_by_id.return_value = _make_user(deleted_at=datetime.now(timezone.utc))

    with pytest.raises(UserNotFoundError):
        service.update_profile(USER_ID, UserUpdate(first_name="Jordan"))


def test_update_profile_raises_when_email_already_exists(service, user_repository):
    user = _make_user()
    user_repository.get_by_id.return_value = user
    user_repository.exists_email.return_value = True

    with pytest.raises(UserAlreadyExistsError):
        service.update_profile(USER_ID, UserUpdate(email="taken@evolve.app"))


def test_update_profile_raises_when_username_already_exists(service, user_repository):
    user = _make_user()
    user_repository.get_by_id.return_value = user
    user_repository.exists_username.return_value = True

    with pytest.raises(UserAlreadyExistsError):
        service.update_profile(USER_ID, UserUpdate(username="taken_user"))


def test_update_profile_skips_uniqueness_check_for_unchanged_email(service, user_repository):
    user = _make_user(email="coach@evolve.app")
    user_repository.get_by_id.return_value = user
    user_repository.update.side_effect = lambda updated: updated

    updated = service.update_profile(USER_ID, UserUpdate(email="coach@evolve.app"))

    assert updated.email == "coach@evolve.app"
    user_repository.exists_email.assert_not_called()
