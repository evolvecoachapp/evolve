"""Unit tests for :class:`~app.services.progress_service.ProgressService`.

The injected repositories and :class:`~app.ai.progress_analyzer.ProgressAnalyzer`
are mocked throughout — these tests exercise entry logging, reference
validation (``goal_id``/``exercise_id``), ownership checks, and summary
assembly in isolation, with no database involved. See
``tests/integration/test_progress_api.py`` for a full end-to-end flow
against a real PostgreSQL instance.
"""

import uuid
from datetime import date, datetime, timezone
from decimal import Decimal

import pytest

from app.ai.progress_analyzer import ProgressAnalyzerOutput, ProgressStats, TrendDirection
from app.models.goal import Goal, GoalStatus, GoalType
from app.models.progress import Progress, ProgressMetricType, ProgressSource
from app.schemas.progress import ProgressEntryCreate
from app.services.progress_service import (
    InvalidProgressReferenceError,
    ProgressEntryNotFoundError,
    ProgressService,
)

USER_ID = uuid.uuid4()
OTHER_USER_ID = uuid.uuid4()


@pytest.fixture()
def progress_repository(mocker):
    repo = mocker.Mock()
    repo.db = mocker.Mock()
    return repo


@pytest.fixture()
def goal_repository(mocker):
    return mocker.Mock()


@pytest.fixture()
def exercise_repository(mocker):
    return mocker.Mock()


@pytest.fixture()
def analyzer(mocker):
    analyzer = mocker.Mock()
    analyzer.handle = mocker.AsyncMock(
        return_value=ProgressAnalyzerOutput(
            stats=ProgressStats(
                trend_direction=TrendDirection.DECREASING,
                slope_per_week=Decimal("-0.50"),
                consistency_pct=Decimal("100.00"),
                plateau_detected=False,
                projected_target_date=None,
            ),
            narrative_text="Great progress!",
            for_date=date(2026, 1, 22),
        )
    )
    return analyzer


@pytest.fixture()
def service(progress_repository, goal_repository, exercise_repository, analyzer) -> ProgressService:
    return ProgressService(progress_repository, goal_repository, exercise_repository, analyzer)


def _make_entry(
    *,
    entry_id: uuid.UUID | None = None,
    user_id: uuid.UUID = USER_ID,
    deleted_at: datetime | None = None,
) -> Progress:
    return Progress(
        id=entry_id or uuid.uuid4(),
        user_id=user_id,
        metric_type=ProgressMetricType.BODY_WEIGHT,
        value=Decimal("80.0"),
        unit="kg",
        recorded_date=date(2026, 1, 1),
        source=ProgressSource.MANUAL,
        created_at=datetime(2026, 1, 1, tzinfo=timezone.utc),
        deleted_at=deleted_at,
    )


def _make_goal(*, user_id: uuid.UUID = USER_ID, deleted_at: datetime | None = None) -> Goal:
    return Goal(
        id=uuid.uuid4(),
        user_id=user_id,
        goal_type=GoalType.WEIGHT_TARGET,
        description="Lose weight",
        target_value=Decimal("75.0"),
        target_unit="kg",
        start_date=date(2026, 1, 1),
        status=GoalStatus.ACTIVE,
        deleted_at=deleted_at,
    )


# -- Entry logging --------------------------------------------------------------


def test_log_progress_entry_persists_a_manual_entry(service, progress_repository):
    progress_repository.create.side_effect = lambda entry: entry
    data = ProgressEntryCreate(
        metric_type=ProgressMetricType.BODY_WEIGHT,
        value=Decimal("80.0"),
        unit="kg",
        recorded_date=date(2026, 1, 1),
    )

    created = service.log_progress_entry(USER_ID, data)

    assert created.user_id == USER_ID
    assert created.source == ProgressSource.MANUAL
    progress_repository.db.commit.assert_called_once()


def test_log_progress_entry_raises_when_goal_id_is_not_owned(
    service, progress_repository, goal_repository
):
    goal_repository.get_by_id.return_value = _make_goal(user_id=OTHER_USER_ID)
    data = ProgressEntryCreate(
        metric_type=ProgressMetricType.BODY_WEIGHT,
        value=Decimal("80.0"),
        unit="kg",
        recorded_date=date(2026, 1, 1),
        goal_id=uuid.uuid4(),
    )

    with pytest.raises(InvalidProgressReferenceError):
        service.log_progress_entry(USER_ID, data)
    progress_repository.create.assert_not_called()


def test_log_progress_entry_raises_when_exercise_id_does_not_resolve(
    service, progress_repository, exercise_repository
):
    exercise_repository.get_by_id.return_value = None
    data = ProgressEntryCreate(
        metric_type=ProgressMetricType.LIFT_PR,
        value=Decimal("100.0"),
        unit="kg",
        recorded_date=date(2026, 1, 1),
        exercise_id=uuid.uuid4(),
    )

    with pytest.raises(InvalidProgressReferenceError):
        service.log_progress_entry(USER_ID, data)
    progress_repository.create.assert_not_called()


def test_get_progress_entry_raises_when_not_owned_by_caller(service, progress_repository):
    progress_repository.get_by_id.return_value = _make_entry(user_id=OTHER_USER_ID)

    with pytest.raises(ProgressEntryNotFoundError):
        service.get_progress_entry(USER_ID, uuid.uuid4())


def test_delete_progress_entry_soft_deletes_when_owned(service, progress_repository):
    entry = _make_entry()
    progress_repository.get_by_id.return_value = entry

    service.delete_progress_entry(USER_ID, entry.id)

    progress_repository.delete.assert_called_once_with(entry)
    progress_repository.db.commit.assert_called_once()


# -- AI-driven summary -----------------------------------------------------------


async def test_get_progress_summary_builds_input_from_listed_entries(
    service, progress_repository, analyzer
):
    entries = [
        _make_entry(),
        _make_entry(),
    ]
    progress_repository.list_for_trend.return_value = entries

    output, window_start, window_end, unit = await service.get_progress_summary(
        USER_ID, ProgressMetricType.BODY_WEIGHT, date_from=date(2026, 1, 1), date_to=date(2026, 1, 22)
    )

    analyzer.handle.assert_called_once()
    analyzer_input = analyzer.handle.call_args.args[0]
    assert len(analyzer_input.data_points) == 2
    assert unit == "kg"
    assert window_start == date(2026, 1, 1)
    assert window_end == date(2026, 1, 22)
    assert output.narrative_text == "Great progress!"


async def test_get_progress_summary_raises_when_goal_id_is_not_owned(
    service, progress_repository, goal_repository
):
    goal_repository.get_by_id.return_value = _make_goal(user_id=OTHER_USER_ID)

    with pytest.raises(InvalidProgressReferenceError):
        await service.get_progress_summary(
            USER_ID, ProgressMetricType.BODY_WEIGHT, goal_id=uuid.uuid4()
        )


async def test_get_progress_summary_includes_the_goal_snapshot_when_linked(
    service, progress_repository, goal_repository, analyzer
):
    goal = _make_goal()
    goal_repository.get_by_id.return_value = goal
    entry = _make_entry()
    entry.goal_id = goal.id
    progress_repository.list_for_trend.return_value = [entry]

    await service.get_progress_summary(USER_ID, ProgressMetricType.BODY_WEIGHT, goal_id=goal.id)

    analyzer_input = analyzer.handle.call_args.args[0]
    assert analyzer_input.goal is not None
    assert analyzer_input.goal.target_value == Decimal("75.0")


async def test_get_progress_summary_defaults_to_a_trailing_window_when_dates_are_omitted(
    service, progress_repository
):
    progress_repository.list_for_trend.return_value = []

    _, window_start, window_end, _ = await service.get_progress_summary(
        USER_ID, ProgressMetricType.BODY_WEIGHT
    )

    assert (window_end - window_start).days == 90
