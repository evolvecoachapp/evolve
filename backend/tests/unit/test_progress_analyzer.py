"""Unit tests for :class:`~app.ai.progress_analyzer.ProgressAnalyzer`.

Covers the deterministic statistics (slope, plateau, consistency), the
hybrid narrative path with a fake :class:`~app.ai.llm_provider.LLMProvider`,
and the deterministic fallback narrative on
:class:`~app.ai.llm_provider.LLMProviderError` — matching
``test_orchestrator.py``'s mocking style.
"""

import uuid
from datetime import date, timedelta
from decimal import Decimal

import pytest

from app.ai.llm_provider import LLMCompletion, LLMProviderError
from app.ai.progress_analyzer import (
    GoalSnapshot,
    InsufficientProgressDataError,
    ProgressAnalyzer,
    ProgressAnalyzerInput,
    ProgressDataPoint,
    TrendDirection,
)
from app.models.progress import ProgressMetricType

USER_ID = uuid.uuid4()


def _points(values: list[float], *, start: date, step_days: int = 7) -> list[ProgressDataPoint]:
    return [
        ProgressDataPoint(recorded_date=start + timedelta(days=step_days * i), value=Decimal(str(v)))
        for i, v in enumerate(values)
    ]


@pytest.fixture()
def llm_provider(mocker):
    provider = mocker.Mock()
    provider.complete = mocker.AsyncMock(return_value=LLMCompletion(content="You're making great progress!"))
    return provider


@pytest.fixture()
def analyzer(llm_provider) -> ProgressAnalyzer:
    return ProgressAnalyzer(llm_provider)


def _base_input(data_points: list[ProgressDataPoint], **overrides) -> ProgressAnalyzerInput:
    defaults = dict(
        user_id=USER_ID,
        metric_type=ProgressMetricType.BODY_WEIGHT,
        unit="kg",
        data_points=data_points,
        window_start=data_points[0].recorded_date,
        window_end=data_points[-1].recorded_date,
        goal=None,
    )
    defaults.update(overrides)
    return ProgressAnalyzerInput(**defaults)


async def test_handle_raises_when_too_few_data_points(analyzer):
    points = _points([80.0, 79.5], start=date(2026, 1, 1))

    with pytest.raises(InsufficientProgressDataError):
        await analyzer.handle(_base_input(points))


async def test_handle_detects_a_decreasing_trend(analyzer):
    points = _points([90.0, 88.0, 86.0, 84.0, 82.0], start=date(2026, 1, 1))

    output = await analyzer.handle(_base_input(points))

    assert output.stats.trend_direction == TrendDirection.DECREASING
    assert output.stats.slope_per_week < 0


async def test_handle_detects_an_increasing_trend(analyzer):
    points = _points([60.0, 61.0, 62.5, 64.0, 65.5], start=date(2026, 1, 1))

    output = await analyzer.handle(_base_input(points))

    assert output.stats.trend_direction == TrendDirection.INCREASING
    assert output.stats.slope_per_week > 0


async def test_handle_detects_a_stable_trend_for_near_flat_data(analyzer):
    points = _points([80.0, 80.1, 79.9, 80.05, 80.0], start=date(2026, 1, 1))

    output = await analyzer.handle(_base_input(points))

    assert output.stats.trend_direction == TrendDirection.STABLE


async def test_handle_computes_full_consistency_when_every_week_has_an_entry(analyzer):
    points = _points([80.0, 79.5, 79.0], start=date(2026, 1, 1), step_days=7)

    output = await analyzer.handle(_base_input(points))

    assert output.stats.consistency_pct == Decimal("100.00")


async def test_handle_computes_partial_consistency_when_weeks_are_skipped(analyzer):
    # 3 entries logged, but spread across a much longer window than 3 weeks.
    start = date(2026, 1, 1)
    points = [
        ProgressDataPoint(recorded_date=start, value=Decimal("80.0")),
        ProgressDataPoint(recorded_date=start + timedelta(weeks=4), value=Decimal("79.0")),
        ProgressDataPoint(recorded_date=start + timedelta(weeks=8), value=Decimal("78.0")),
    ]
    output = await analyzer.handle(
        _base_input(points, window_start=start, window_end=start + timedelta(weeks=8))
    )

    assert output.stats.consistency_pct < Decimal("50.00")


async def test_handle_detects_a_plateau_when_the_two_trailing_windows_barely_differ(analyzer, mocker):
    """A real decline followed by two full 14-day windows that barely differ from each other.

    Unlike a naive "are the last two points close together" check, plateau
    detection compares the *average* of the trailing 14-day window against
    the *average* of the 14 days before it — so this needs enough history
    to fill both windows, not just a couple of flat-looking points at the
    tail.
    """
    mocker.patch("app.ai.progress_analyzer.settings.progress_plateau_window_days", 14)
    mocker.patch("app.ai.progress_analyzer.settings.progress_plateau_threshold_pct", 2.0)
    start = date(2026, 1, 1)
    points = _points([95.0, 90.0, 85.0, 80.0, 79.9, 80.0, 79.95, 80.0], start=start, step_days=7)

    output = await analyzer.handle(_base_input(points))

    assert output.stats.plateau_detected is True


async def test_handle_does_not_detect_a_plateau_when_recent_values_keep_changing(analyzer, mocker):
    mocker.patch("app.ai.progress_analyzer.settings.progress_plateau_window_days", 14)
    mocker.patch("app.ai.progress_analyzer.settings.progress_plateau_threshold_pct", 2.0)
    points = _points([90.0, 85.0, 80.0, 75.0], start=date(2026, 1, 1), step_days=7)

    output = await analyzer.handle(_base_input(points))

    assert output.stats.plateau_detected is False


async def test_handle_projects_a_target_date_when_moving_toward_the_goal(analyzer):
    points = _points([90.0, 88.0, 86.0], start=date(2026, 1, 1))
    goal = GoalSnapshot(target_value=Decimal("80.0"), target_unit="kg")

    output = await analyzer.handle(_base_input(points, goal=goal))

    assert output.stats.projected_target_date is not None
    assert output.stats.projected_target_date > points[-1].recorded_date


async def test_handle_does_not_project_a_target_date_when_moving_away_from_the_goal(analyzer):
    points = _points([80.0, 82.0, 84.0], start=date(2026, 1, 1))
    goal = GoalSnapshot(target_value=Decimal("70.0"), target_unit="kg")

    output = await analyzer.handle(_base_input(points, goal=goal))

    assert output.stats.projected_target_date is None


async def test_handle_uses_the_llm_narrative_on_success(analyzer, llm_provider):
    points = _points([90.0, 88.0, 86.0], start=date(2026, 1, 1))

    output = await analyzer.handle(_base_input(points))

    llm_provider.complete.assert_called_once()
    assert output.narrative_text == "You're making great progress!"


async def test_handle_falls_back_to_a_templated_narrative_on_llm_failure(analyzer, llm_provider):
    llm_provider.complete.side_effect = LLMProviderError("upstream is down")
    points = _points([90.0, 88.0, 86.0], start=date(2026, 1, 1))

    output = await analyzer.handle(_base_input(points))

    assert "temporarily unavailable" in output.narrative_text
    assert "kg" in output.narrative_text
