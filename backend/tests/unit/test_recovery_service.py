"""Unit tests for :class:`~app.services.recovery_service.RecoveryService`.

The injected :class:`~app.repositories.recovery_repository.RecoveryCheckInRepository`
and :class:`~app.repositories.workout_log_repository.WorkoutLogRepository`
are mocked throughout — these tests exercise check-in CRUD, the one-per-day
uniqueness rule, ownership checks, and readiness assembly in isolation, with
no database involved. See ``tests/integration/test_recovery_api.py`` for a
full end-to-end flow against a real PostgreSQL instance.
"""

import uuid
from datetime import date, datetime, timezone
from decimal import Decimal

import pytest

from app.models.recovery import RecoveryCheckIn
from app.schemas.recovery import RecoveryCheckInCreate, RecoveryCheckInUpdate
from app.services.recovery_service import (
    CheckInAlreadyExistsError,
    CheckInNotFoundError,
    RecoveryService,
)

USER_ID = uuid.uuid4()
OTHER_USER_ID = uuid.uuid4()


@pytest.fixture()
def recovery_repository(mocker):
    repo = mocker.Mock()
    repo.db = mocker.Mock()
    return repo


@pytest.fixture()
def workout_log_repository(mocker):
    return mocker.Mock()


@pytest.fixture()
def service(recovery_repository, workout_log_repository):
    return RecoveryService(recovery_repository, workout_log_repository)


def _make_check_in(
    *,
    check_in_id: uuid.UUID | None = None,
    user_id: uuid.UUID = USER_ID,
    checkin_date: date = date(2026, 1, 1),
    deleted_at: datetime | None = None,
) -> RecoveryCheckIn:
    return RecoveryCheckIn(
        id=check_in_id or uuid.uuid4(),
        user_id=user_id,
        checkin_date=checkin_date,
        sleep_hours=Decimal("7.5"),
        sleep_quality=4,
        soreness=2,
        fatigue=2,
        resting_heart_rate=60,
        hrv_ms=65,
        notes=None,
        created_at=datetime(2026, 1, 1, tzinfo=timezone.utc),
        deleted_at=deleted_at,
    )


# -- Check-in CRUD -------------------------------------------------------------


def test_create_check_in_persists_a_new_check_in(service, recovery_repository):
    recovery_repository.get_for_user_and_date.return_value = None
    recovery_repository.create.side_effect = lambda check_in: check_in
    data = RecoveryCheckInCreate(
        checkin_date=date(2026, 1, 1),
        sleep_hours=Decimal("7.5"),
        sleep_quality=4,
        soreness=2,
        fatigue=2,
    )

    created = service.create_check_in(USER_ID, data)

    assert created.user_id == USER_ID
    assert created.checkin_date == date(2026, 1, 1)
    recovery_repository.db.commit.assert_called_once()


def test_create_check_in_raises_when_one_already_exists_for_that_date(
    service, recovery_repository
):
    recovery_repository.get_for_user_and_date.return_value = _make_check_in()
    data = RecoveryCheckInCreate(
        checkin_date=date(2026, 1, 1),
        sleep_hours=Decimal("7.5"),
        sleep_quality=4,
        soreness=2,
        fatigue=2,
    )

    with pytest.raises(CheckInAlreadyExistsError):
        service.create_check_in(USER_ID, data)
    recovery_repository.create.assert_not_called()


def test_update_check_in_raises_when_not_owned_by_caller(service, recovery_repository):
    recovery_repository.get_by_id.return_value = _make_check_in(user_id=OTHER_USER_ID)

    with pytest.raises(CheckInNotFoundError):
        service.update_check_in(USER_ID, uuid.uuid4(), RecoveryCheckInUpdate(notes="edited"))


def test_update_check_in_applies_provided_fields_when_owned(service, recovery_repository):
    check_in = _make_check_in(user_id=USER_ID)
    recovery_repository.get_by_id.return_value = check_in
    recovery_repository.update.side_effect = lambda c: c

    updated = service.update_check_in(
        USER_ID, check_in.id, RecoveryCheckInUpdate(soreness=5, notes="sore legs")
    )

    assert updated.soreness == 5
    assert updated.notes == "sore legs"
    recovery_repository.db.commit.assert_called_once()


def test_get_check_in_not_found_when_soft_deleted(service, recovery_repository):
    recovery_repository.get_by_id.return_value = _make_check_in(
        user_id=USER_ID, deleted_at=datetime.now(timezone.utc)
    )

    with pytest.raises(CheckInNotFoundError):
        service.get_check_in(USER_ID, uuid.uuid4())


def test_delete_check_in_soft_deletes_when_owned(service, recovery_repository):
    check_in = _make_check_in(user_id=USER_ID)
    recovery_repository.get_by_id.return_value = check_in

    service.delete_check_in(USER_ID, check_in.id)

    recovery_repository.delete.assert_called_once_with(check_in)
    recovery_repository.db.commit.assert_called_once()


# -- Daily readiness -----------------------------------------------------------


def test_get_daily_readiness_raises_when_no_check_in_exists_for_that_date(
    service, recovery_repository
):
    recovery_repository.get_for_user_and_date.return_value = None

    with pytest.raises(CheckInNotFoundError):
        service.get_daily_readiness(USER_ID, for_date=date(2026, 1, 1))


def test_get_daily_readiness_assembles_input_from_check_in_and_training_load(
    service, recovery_repository, workout_log_repository
):
    recovery_repository.get_for_user_and_date.return_value = _make_check_in()
    workout_log_repository.get_training_load_summary.return_value = {
        "session_count": 3,
        "total_duration_minutes": 150,
        "avg_rpe": Decimal("6"),
    }

    result = service.get_daily_readiness(USER_ID, for_date=date(2026, 1, 1))

    assert result.for_date == date(2026, 1, 1)
    workout_log_repository.get_training_load_summary.assert_called_once()
    _, kwargs = workout_log_repository.get_training_load_summary.call_args
    assert kwargs["date_to"] == date(2026, 1, 1)
    assert kwargs["date_from"] == date(2025, 12, 26)  # default 7-day window, inclusive
