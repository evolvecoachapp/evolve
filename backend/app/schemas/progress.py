"""Pydantic v2 schemas for the Progress domain — request/response contracts.

``ProgressSummaryRead`` is the HTTP-facing projection of
:class:`~app.ai.progress_analyzer.ProgressAnalyzerOutput`, mirroring how
``app.schemas.recovery.ReadinessRead`` projects
:class:`~app.ai.recovery_engine.RecoveryOutput`.
"""

import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import Annotated

from pydantic import BaseModel, ConfigDict, StringConstraints, model_validator

from app.ai.progress_analyzer import ProgressAnalyzerOutput, TrendDirection
from app.models.progress import Progress, ProgressMetricType, ProgressSource

NotesField = Annotated[str, StringConstraints(max_length=10_000)]
UnitField = Annotated[str, StringConstraints(min_length=1, max_length=20)]


class ProgressEntryCreate(BaseModel):
    """Input schema for logging a new progress entry.

    ``source`` is deliberately not client-settable — every entry created
    through this API is ``source=MANUAL`` this sprint (see the
    :class:`~app.models.progress.Progress` model's docstring and Decision
    012 in ``docs/DECISIONS.md`` for the "carry the cheap column now"
    precedent ``ProgressSource.WEARABLE``/``CALCULATED`` follow).
    """

    metric_type: ProgressMetricType
    value: Decimal
    unit: UnitField
    recorded_date: date
    exercise_id: uuid.UUID | None = None
    goal_id: uuid.UUID | None = None
    notes: NotesField | None = None

    @model_validator(mode="after")
    def _validate(self) -> "ProgressEntryCreate":
        if self.value < 0:
            raise ValueError("value must be non-negative.")
        if self.metric_type == ProgressMetricType.LIFT_PR and self.exercise_id is None:
            raise ValueError("exercise_id is required when metric_type is 'lift_pr'.")
        if self.metric_type != ProgressMetricType.LIFT_PR and self.exercise_id is not None:
            raise ValueError("exercise_id is only valid when metric_type is 'lift_pr'.")
        return self


class ProgressEntryRead(BaseModel):
    """Public-facing representation of a single progress entry."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    goal_id: uuid.UUID | None
    exercise_id: uuid.UUID | None
    metric_type: ProgressMetricType
    value: Decimal
    unit: str
    recorded_date: date
    source: ProgressSource
    notes: str | None
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_model(cls, entry: Progress) -> "ProgressEntryRead":
        """Build this schema from a :class:`Progress` instance."""
        return cls.model_validate(entry)


class ProgressEntryPage(BaseModel):
    """A paginated page of :class:`ProgressEntryRead` results."""

    items: list[ProgressEntryRead]
    total: int
    limit: int
    offset: int


class ProgressStatsRead(BaseModel):
    """HTTP-facing projection of :class:`~app.ai.progress_analyzer.ProgressStats`."""

    trend_direction: TrendDirection
    slope_per_week: Decimal
    consistency_pct: Decimal
    plateau_detected: bool
    projected_target_date: date | None


class ProgressSummaryRead(BaseModel):
    """HTTP-facing projection of :class:`~app.ai.progress_analyzer.ProgressAnalyzerOutput`."""

    metric_type: ProgressMetricType
    unit: str
    window_start: date
    window_end: date
    stats: ProgressStatsRead
    narrative_text: str
    for_date: date

    @classmethod
    def from_output(
        cls,
        output: ProgressAnalyzerOutput,
        *,
        metric_type: ProgressMetricType,
        unit: str,
        window_start: date,
        window_end: date,
    ) -> "ProgressSummaryRead":
        """Build this schema from a :class:`ProgressAnalyzerOutput` returned by the analyzer."""
        return cls(
            metric_type=metric_type,
            unit=unit,
            window_start=window_start,
            window_end=window_end,
            stats=ProgressStatsRead.model_validate(output.stats.model_dump()),
            narrative_text=output.narrative_text,
            for_date=output.for_date,
        )
