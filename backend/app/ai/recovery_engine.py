"""Rule-based, deterministic Recovery Engine.

Pure, typed computation — no DB/network I/O, no dependency on repositories,
the ``AIOrchestrator``, or the generic
:class:`~app.ai.engine.AIEngine` protocol. Deliberately consumes its own
``RecoveryInput``/returns its own ``RecoveryOutput`` rather than the
generic ``EngineInput``/``EngineOutput`` contracts, and is not registered
into ``AIOrchestrator.engines`` this sprint — see Decision 016 in
``docs/DECISIONS.md`` (the same rationale as Decision 011 for the Nutrition
Engine: no ``CoachService`` exists yet to design the chat-integration
contract against).

``training_load`` on :class:`RecoveryInput` is always pre-aggregated by
:class:`~app.services.recovery_service.RecoveryService` from
:class:`~app.models.workout_log.WorkoutLog` history — this engine never
queries the database, and never accepts a manually self-reported load value
(see Decision 014).
"""

from datetime import date
from decimal import ROUND_HALF_UP, Decimal
from enum import Enum

from pydantic import BaseModel, Field

from app.ai.recovery_constants import (
    READINESS_GUIDANCE,
    READINESS_LEVEL_LOW_MAX,
    READINESS_LEVEL_MODERATE_MAX,
    TRAINING_LOAD_REFERENCE_MINUTES_PER_WEEK,
    TRAINING_LOAD_REFERENCE_RPE,
    TRAINING_LOAD_REFERENCE_SESSIONS_PER_WEEK,
)
from app.core.config import settings

__all__ = [
    "TrainingLoadSummary",
    "RecoveryInput",
    "ReadinessLevel",
    "RecoveryOutput",
    "RecoveryEngine",
]


class TrainingLoadSummary(BaseModel):
    """A trailing-window training-load summary, pre-aggregated from ``WorkoutLog`` history.

    ``avg_rpe`` is ``None`` when no set in the window has a logged RPE
    (distinct from "zero load") — the engine falls back to a neutral
    intensity ratio in that case rather than assuming no effort occurred.
    """

    session_count: int = Field(ge=0)
    total_duration_minutes: int = Field(ge=0)
    avg_rpe: Decimal | None = Field(default=None, ge=0, le=10)
    window_days: int = Field(ge=1)


class RecoveryInput(BaseModel):
    """Everything :meth:`RecoveryEngine.handle` needs for one readiness calculation.

    ``sleep_quality``/``soreness``/``fatigue`` are 1-5 Likert ratings
    (``sleep_quality``: higher is better; ``soreness``/``fatigue``: higher
    is worse), matching :class:`~app.models.recovery.RecoveryCheckIn`'s
    column semantics exactly.
    """

    sleep_hours: Decimal = Field(ge=0, le=24)
    sleep_quality: int = Field(ge=1, le=5)
    soreness: int = Field(ge=1, le=5)
    fatigue: int = Field(ge=1, le=5)
    training_load: TrainingLoadSummary
    for_date: date


class ReadinessLevel(str, Enum):
    """A qualitative bucket for a composite readiness score.

    Thresholds are defined in ``app.ai.recovery_constants``
    (``READINESS_LEVEL_LOW_MAX``/``READINESS_LEVEL_MODERATE_MAX``).
    """

    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"


class RecoveryOutput(BaseModel):
    """The full result of one :meth:`RecoveryEngine.handle` call."""

    readiness_score: Decimal
    readiness_level: ReadinessLevel
    recommendation_text: str
    protocols: list[str]
    for_date: date


class RecoveryEngine:
    """Computes a composite daily readiness score from subjective inputs and training load.

    Stateless per invocation — carries no instance state at all (unlike
    ``NutritionEngine``, which carries an injected ``BMRStrategy``); every
    coefficient it reads comes from ``Settings``/``recovery_constants`` at
    call time.
    """

    def handle(self, recovery_input: RecoveryInput) -> RecoveryOutput:
        """Compute a composite readiness score, level, and templated guidance.

        The three component scores (sleep, soreness/fatigue, training
        load) are each normalized to a 0-100 scale before being combined
        with the configured weights (``settings.recovery_score_weight_*``),
        so no single input can dominate the composite score by virtue of
        its raw scale.
        """
        sleep_score = self._sleep_score(recovery_input.sleep_hours, recovery_input.sleep_quality)
        soreness_fatigue_score = self._soreness_fatigue_score(
            recovery_input.soreness, recovery_input.fatigue
        )
        training_load_score = self._training_load_score(recovery_input.training_load)

        composite = (
            sleep_score * Decimal(str(settings.recovery_score_weight_sleep))
            + soreness_fatigue_score
            * Decimal(str(settings.recovery_score_weight_soreness_fatigue))
            + training_load_score * Decimal(str(settings.recovery_score_weight_training_load))
        )
        readiness_score = self._quantize(self._clamp(composite))
        readiness_level = self._classify_level(readiness_score)
        guidance = READINESS_GUIDANCE[readiness_level.value]

        return RecoveryOutput(
            readiness_score=readiness_score,
            readiness_level=readiness_level,
            recommendation_text=str(guidance["recommendation_text"]),
            protocols=list(guidance["protocols"]),
            for_date=recovery_input.for_date,
        )

    @staticmethod
    def _sleep_score(sleep_hours: Decimal, sleep_quality: int) -> Decimal:
        """Blend sleep duration (vs. the configured target) with subjective sleep quality.

        Sleeping at or beyond the target contributes full marks for the
        duration half — there is no penalty for sleeping *more* than the
        target, only for sleeping less.
        """
        target_hours = Decimal(str(settings.recovery_sleep_target_hours))
        duration_ratio = min(sleep_hours / target_hours, Decimal(1)) if target_hours > 0 else Decimal(1)
        duration_score = duration_ratio * Decimal(100)
        quality_score = (Decimal(sleep_quality - 1) / Decimal(4)) * Decimal(100)
        return (duration_score + quality_score) / Decimal(2)

    @staticmethod
    def _soreness_fatigue_score(soreness: int, fatigue: int) -> Decimal:
        """Convert the inverse 1-5 soreness/fatigue ratings into a 0-100 "freshness" score."""
        soreness_score = (Decimal(5 - soreness) / Decimal(4)) * Decimal(100)
        fatigue_score = (Decimal(5 - fatigue) / Decimal(4)) * Decimal(100)
        return (soreness_score + fatigue_score) / Decimal(2)

    @staticmethod
    def _training_load_score(training_load: TrainingLoadSummary) -> Decimal:
        """Convert recent training load into a 0-100 score (lower recent load -> higher score).

        Each of session count, total duration, and average intensity
        (RPE) is normalized against a fixed weekly reference value scaled
        to the actual window length, then averaged into a single load
        ratio. A load ratio of 0 (no training at all in the window) scores
        100; a load ratio at or above 1 (matching or exceeding the
        reference load) scores 0.
        """
        weeks_in_window = Decimal(training_load.window_days) / Decimal(7)

        reference_sessions = Decimal(str(TRAINING_LOAD_REFERENCE_SESSIONS_PER_WEEK)) * weeks_in_window
        session_ratio = (
            Decimal(training_load.session_count) / reference_sessions
            if reference_sessions > 0
            else Decimal(0)
        )

        reference_minutes = Decimal(str(TRAINING_LOAD_REFERENCE_MINUTES_PER_WEEK)) * weeks_in_window
        duration_ratio = (
            Decimal(training_load.total_duration_minutes) / reference_minutes
            if reference_minutes > 0
            else Decimal(0)
        )

        if training_load.avg_rpe is None:
            # No RPE logged for any set in the window - assume a neutral,
            # moderate intensity rather than "no effort" or "maximal effort".
            intensity_ratio = Decimal("0.5")
        else:
            intensity_ratio = training_load.avg_rpe / Decimal(str(TRAINING_LOAD_REFERENCE_RPE))

        load_ratio = (session_ratio + duration_ratio + intensity_ratio) / Decimal(3)
        load_ratio = min(load_ratio, Decimal(1))
        return (Decimal(1) - load_ratio) * Decimal(100)

    @staticmethod
    def _classify_level(readiness_score: Decimal) -> ReadinessLevel:
        """Bucket a composite score into a :class:`ReadinessLevel` per the configured bands."""
        if readiness_score <= Decimal(str(READINESS_LEVEL_LOW_MAX)):
            return ReadinessLevel.LOW
        if readiness_score <= Decimal(str(READINESS_LEVEL_MODERATE_MAX)):
            return ReadinessLevel.MODERATE
        return ReadinessLevel.HIGH

    @staticmethod
    def _clamp(value: Decimal) -> Decimal:
        """Clamp a composite score to the valid ``[0, 100]`` range."""
        return max(Decimal(0), min(value, Decimal(100)))

    @staticmethod
    def _quantize(value: Decimal) -> Decimal:
        """Round to 2 decimal places, matching ``NutritionEngine``'s output precision."""
        return value.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
