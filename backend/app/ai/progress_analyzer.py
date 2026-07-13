"""Hybrid deterministic + LLM Progress Analyzer.

Own typed contracts (``ProgressAnalyzerInput``/``ProgressAnalyzerOutput``)
rather than the generic :class:`~app.ai.engine.AIEngine`/``EngineInput``/
``EngineOutput`` — same reasoning as Decisions 011/016 for the Nutrition and
Recovery Engines: no ``CoachService`` consumer exists yet for the Progress
domain (see Decision 023 in ``docs/DECISIONS.md``), and the richer stats
shape shouldn't be collapsed into ``EngineOutput.artifacts: dict | None``.

Unlike ``NutritionEngine``/``RecoveryEngine`` (fully deterministic, no LLM
call — Decisions 010/014), this engine is a deliberate hybrid (Decision
022): ``ProgressStats`` are always computed deterministically in pure
Python, then the real LLM narrates 2-3 sentences of insight *from those
stats* (never inventing its own numbers). If the LLM call fails, a
deterministic templated narrative is used instead — a Progress summary must
never surface as an unhandled error just because narrative generation
failed, matching ``app/ai/coach_engines.py``'s graceful-degradation
precedent.

``ProgressAnalyzer.handle`` is ``async def`` because it calls
:meth:`~app.ai.llm_provider.LLMProvider.complete` — a deliberate second
extension of Decision 009's async boundary (the first being the
Orchestrator/LLMProvider themselves), rippling outward to
:class:`~app.services.progress_service.ProgressService` and the
``/api/v1/progress/summary`` route, exactly as Decision 009's own
"Consequences" section anticipated.
"""

import uuid
from datetime import date, timedelta
from decimal import ROUND_HALF_UP, Decimal
from enum import Enum

from pydantic import BaseModel, Field

from app.ai.llm_provider import LLMMessage, LLMProvider, LLMProviderError
from app.ai.progress_constants import build_fallback_narrative
from app.core.config import settings
from app.models.progress import ProgressMetricType

__all__ = [
    "ProgressDataPoint",
    "GoalSnapshot",
    "ProgressAnalyzerInput",
    "TrendDirection",
    "ProgressStats",
    "ProgressAnalyzerOutput",
    "ProgressAnalyzer",
    "InsufficientProgressDataError",
]


class InsufficientProgressDataError(Exception):
    """Raised when fewer than ``settings.progress_min_data_points_for_trend`` points are given.

    Gathering enough data before calling :meth:`ProgressAnalyzer.handle` is
    the caller's responsibility — matching
    :class:`~app.ai.nutrition_engine.IncompleteNutritionProfileError`'s
    precondition-is-caller's-job precedent.
    """


class ProgressDataPoint(BaseModel):
    """A single ``(date, value)`` observation, pre-aggregated by :class:`~app.services.progress_service.ProgressService`."""

    recorded_date: date
    value: Decimal


class GoalSnapshot(BaseModel):
    """A read-only projection of the linked :class:`~app.models.goal.Goal`'s target, if any."""

    target_value: Decimal
    target_unit: str
    target_date: date | None = None


class ProgressAnalyzerInput(BaseModel):
    """Everything :meth:`ProgressAnalyzer.handle` needs for one analysis.

    ``data_points`` must be chronological (oldest first) and pre-filtered to
    ``[window_start, window_end]`` — the analyzer never queries the
    database.
    """

    user_id: uuid.UUID
    metric_type: ProgressMetricType
    unit: str
    data_points: list[ProgressDataPoint]
    window_start: date
    window_end: date
    goal: GoalSnapshot | None = None


class TrendDirection(str, Enum):
    """The raw shape of a metric's trend over the analysis window.

    Deliberately not a goal-relative "good"/"bad" judgment (e.g.
    "increasing" is favorable for a muscle-gain goal but unfavorable for a
    weight-loss goal) — that interpretation is left to the LLM narrative
    step, which is given the goal (if any) to reason about it correctly.
    """

    INCREASING = "increasing"
    DECREASING = "decreasing"
    STABLE = "stable"


class ProgressStats(BaseModel):
    """The full deterministic result of one analysis, before narration."""

    trend_direction: TrendDirection
    slope_per_week: Decimal
    consistency_pct: Decimal = Field(ge=0, le=100)
    plateau_detected: bool
    projected_target_date: date | None = None


class ProgressAnalyzerOutput(BaseModel):
    """The full result of one :meth:`ProgressAnalyzer.handle` call."""

    stats: ProgressStats
    narrative_text: str
    for_date: date


class ProgressAnalyzer:
    """Computes deterministic trend/consistency/plateau statistics, then narrates them via an LLM.

    Stateless per invocation — ``llm_provider`` is the only thing carried on
    the instance, and it is itself the sole source of non-determinism
    (guarded by the fallback path on :class:`~app.ai.llm_provider.LLMProviderError`).
    """

    def __init__(self, llm_provider: LLMProvider) -> None:
        self._llm_provider = llm_provider

    async def handle(self, analyzer_input: ProgressAnalyzerInput) -> ProgressAnalyzerOutput:
        """Compute stats and a narrative summary for one metric's progress history.

        Raises:
            InsufficientProgressDataError: If fewer than
                ``settings.progress_min_data_points_for_trend`` points are
                given.
        """
        points = sorted(analyzer_input.data_points, key=lambda p: p.recorded_date)
        if len(points) < settings.progress_min_data_points_for_trend:
            raise InsufficientProgressDataError(
                f"At least {settings.progress_min_data_points_for_trend} progress entries are "
                f"required to analyze a trend; only {len(points)} were found."
            )

        slope_per_week = self._compute_slope_per_week(points)
        trend_direction = self._classify_trend_direction(points, slope_per_week)
        consistency_pct = self._compute_consistency_pct(
            points, analyzer_input.window_start, analyzer_input.window_end
        )
        plateau_detected = self._detect_plateau(points)
        projected_target_date = self._project_target_date(
            points, slope_per_week, analyzer_input.goal
        )

        stats = ProgressStats(
            trend_direction=trend_direction,
            slope_per_week=slope_per_week,
            consistency_pct=consistency_pct,
            plateau_detected=plateau_detected,
            projected_target_date=projected_target_date,
        )

        narrative_text = await self._build_narrative(analyzer_input, stats)
        return ProgressAnalyzerOutput(
            stats=stats, narrative_text=narrative_text, for_date=analyzer_input.window_end
        )

    # -- Deterministic statistics --------------------------------------------

    @staticmethod
    def _compute_slope_per_week(points: list[ProgressDataPoint]) -> Decimal:
        """Return the least-squares linear slope of value-per-day, scaled to per-week.

        Uses ``float`` for the regression arithmetic (a slope estimate does
        not need ``Decimal`` precision, unlike money/macro totals elsewhere)
        and quantizes the result back to a 2-decimal ``Decimal``.
        """
        first_date = points[0].recorded_date
        xs = [float((p.recorded_date - first_date).days) for p in points]
        ys = [float(p.value) for p in points]
        n = len(points)
        mean_x = sum(xs) / n
        mean_y = sum(ys) / n
        numerator = sum((x - mean_x) * (y - mean_y) for x, y in zip(xs, ys))
        denominator = sum((x - mean_x) ** 2 for x in xs)
        slope_per_day = numerator / denominator if denominator != 0 else 0.0
        return ProgressAnalyzer._quantize(Decimal(str(slope_per_day * 7)))

    @staticmethod
    def _classify_trend_direction(
        points: list[ProgressDataPoint], slope_per_week: Decimal
    ) -> TrendDirection:
        """Classify the overall trend, treating a small relative change as STABLE.

        The "small" threshold reuses ``settings.progress_plateau_threshold_pct``
        applied to the *entire* window's relative change, distinct from
        :meth:`_detect_plateau`'s localized recent-window comparison.
        """
        first_value = points[0].value
        last_value = points[-1].value
        reference = first_value if first_value != 0 else Decimal("1")
        relative_change_pct = abs(last_value - first_value) / abs(reference) * Decimal(100)
        if relative_change_pct <= Decimal(str(settings.progress_plateau_threshold_pct)):
            return TrendDirection.STABLE
        return TrendDirection.INCREASING if slope_per_week > 0 else TrendDirection.DECREASING

    @staticmethod
    def _compute_consistency_pct(
        points: list[ProgressDataPoint], window_start: date, window_end: date
    ) -> Decimal:
        """Return the percentage of ISO weeks in the window with at least one logged entry."""
        total_days = (window_end - window_start).days + 1
        total_weeks = max(1, -(-total_days // 7))  # ceil division
        logged_weeks = {
            (p.recorded_date - window_start).days // 7 for p in points
        }
        pct = (Decimal(len(logged_weeks)) / Decimal(total_weeks)) * Decimal(100)
        return ProgressAnalyzer._quantize(min(pct, Decimal(100)))

    @staticmethod
    def _detect_plateau(points: list[ProgressDataPoint]) -> bool:
        """Detect a plateau by comparing two consecutive trailing windows' averages.

        Returns ``False`` (cannot determine) when the data doesn't span two
        full windows of ``settings.progress_plateau_window_days`` each.
        """
        window_days = settings.progress_plateau_window_days
        latest_date = points[-1].recorded_date
        recent_start = latest_date - timedelta(days=window_days - 1)
        previous_start = recent_start - timedelta(days=window_days)
        previous_end = recent_start - timedelta(days=1)

        recent_values = [p.value for p in points if p.recorded_date >= recent_start]
        previous_values = [
            p.value for p in points if previous_start <= p.recorded_date <= previous_end
        ]
        if not recent_values or not previous_values:
            return False

        recent_avg = sum(recent_values) / Decimal(len(recent_values))
        previous_avg = sum(previous_values) / Decimal(len(previous_values))
        reference = previous_avg if previous_avg != 0 else Decimal("1")
        relative_change_pct = abs(recent_avg - previous_avg) / abs(reference) * Decimal(100)
        return relative_change_pct <= Decimal(str(settings.progress_plateau_threshold_pct))

    @staticmethod
    def _project_target_date(
        points: list[ProgressDataPoint],
        slope_per_week: Decimal,
        goal: GoalSnapshot | None,
    ) -> date | None:
        """Linearly extrapolate a target completion date, only when moving toward the goal."""
        if goal is None or slope_per_week == 0:
            return None
        current_value = points[-1].value
        remaining = goal.target_value - current_value
        if remaining == 0:
            return points[-1].recorded_date
        weeks_needed = remaining / slope_per_week
        if weeks_needed <= 0:
            return None
        return points[-1].recorded_date + timedelta(days=float(weeks_needed) * 7)

    @staticmethod
    def _quantize(value: Decimal) -> Decimal:
        """Round to 2 decimal places, matching every other AI-layer engine's output precision."""
        return value.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

    # -- Narrative (hybrid LLM step) ------------------------------------------

    async def _build_narrative(
        self, analyzer_input: ProgressAnalyzerInput, stats: ProgressStats
    ) -> str:
        """Ask the LLM to narrate ``stats`` in 2-3 sentences, falling back on failure."""
        prompt = self._build_prompt(analyzer_input, stats)
        try:
            completion = await self._llm_provider.complete(prompt)
            return completion.content
        except LLMProviderError:
            return build_fallback_narrative(
                trend_direction=stats.trend_direction.value,
                slope_per_week=str(stats.slope_per_week),
                consistency_pct=str(stats.consistency_pct),
                plateau_detected=stats.plateau_detected,
                unit=analyzer_input.unit,
            )

    @staticmethod
    def _build_prompt(
        analyzer_input: ProgressAnalyzerInput, stats: ProgressStats
    ) -> list[LLMMessage]:
        """Build a bounded prompt: state the computed stats, forbid inventing new numbers."""
        goal_line = "No goal is linked to this metric."
        if analyzer_input.goal is not None:
            goal_line = (
                f"Goal target: {analyzer_input.goal.target_value} {analyzer_input.goal.target_unit}"
                + (
                    f" by {analyzer_input.goal.target_date}."
                    if analyzer_input.goal.target_date
                    else "."
                )
            )
        system = LLMMessage(
            role="system",
            content=(
                "You are a fitness coach writing a short progress update. Use ONLY the "
                "statistics provided below — never invent numbers not given. Write exactly "
                "2-3 encouraging, factual sentences."
            ),
        )
        user = LLMMessage(
            role="user",
            content=(
                f"Metric: {analyzer_input.metric_type.value} ({analyzer_input.unit}). "
                f"Trend: {stats.trend_direction.value}, {stats.slope_per_week} {analyzer_input.unit}/week. "
                f"Logging consistency: {stats.consistency_pct}% of weeks in the window. "
                f"Plateau detected: {stats.plateau_detected}. "
                f"{goal_line}"
            ),
        )
        return [system, user]
