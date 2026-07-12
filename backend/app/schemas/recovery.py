"""Pydantic v2 schemas for the Recovery domain — request/response contracts.

Separate from the AI-layer contracts in ``app.ai.recovery_engine``
(``RecoveryInput``/``RecoveryOutput``, etc.): those are internal to the
Recovery Engine and never returned directly by an API route.
``ReadinessRead`` is the HTTP-facing projection of
:class:`~app.ai.recovery_engine.RecoveryOutput`, mirroring how
``app.schemas.nutrition.DailyNutritionRead`` projects
:class:`~app.ai.nutrition_engine.NutritionOutput`.
"""

import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field, StringConstraints, model_validator

from app.ai.recovery_engine import ReadinessLevel, RecoveryOutput
from app.models.recovery import RecoveryCheckIn

RecoveryNotesField = Annotated[str, StringConstraints(max_length=10_000)]
LikertField = Annotated[int, Field(ge=1, le=5)]
SleepHoursField = Annotated[Decimal, Field(ge=0, le=24)]
PositiveIntField = Annotated[int, Field(gt=0)]


class RecoveryCheckInCreate(BaseModel):
    """Input schema for logging a new daily readiness check-in."""

    checkin_date: date
    sleep_hours: SleepHoursField
    sleep_quality: LikertField
    soreness: LikertField
    fatigue: LikertField
    resting_heart_rate: PositiveIntField | None = None
    hrv_ms: PositiveIntField | None = None
    notes: RecoveryNotesField | None = None


class RecoveryCheckInUpdate(BaseModel):
    """Input schema for partially updating an existing check-in.

    All fields are optional so clients submit only the attributes they wish
    to change. ``checkin_date`` is deliberately not editable — correcting
    the date a check-in represents is modeled as delete-and-recreate, not
    an update, to keep the one-per-day uniqueness check simple.
    """

    sleep_hours: SleepHoursField | None = None
    sleep_quality: LikertField | None = None
    soreness: LikertField | None = None
    fatigue: LikertField | None = None
    resting_heart_rate: PositiveIntField | None = None
    hrv_ms: PositiveIntField | None = None
    notes: RecoveryNotesField | None = None

    @model_validator(mode="after")
    def _check_not_empty(self) -> "RecoveryCheckInUpdate":
        """Ensure the patch changes at least one field."""
        if all(
            value is None
            for value in (
                self.sleep_hours,
                self.sleep_quality,
                self.soreness,
                self.fatigue,
                self.resting_heart_rate,
                self.hrv_ms,
                self.notes,
            )
        ):
            raise ValueError("At least one field must be provided.")
        return self


class RecoveryCheckInRead(BaseModel):
    """Public-facing representation of a single check-in."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    checkin_date: date
    sleep_hours: Decimal
    sleep_quality: int
    soreness: int
    fatigue: int
    resting_heart_rate: int | None
    hrv_ms: int | None
    notes: str | None
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_model(cls, check_in: RecoveryCheckIn) -> "RecoveryCheckInRead":
        """Build this schema from a :class:`RecoveryCheckIn` instance."""
        return cls.model_validate(check_in)


class RecoveryCheckInPage(BaseModel):
    """A paginated page of :class:`RecoveryCheckInRead` results."""

    items: list[RecoveryCheckInRead]
    total: int
    limit: int
    offset: int


class ReadinessRead(BaseModel):
    """HTTP-facing projection of :class:`~app.ai.recovery_engine.RecoveryOutput`."""

    readiness_score: Decimal
    readiness_level: ReadinessLevel
    recommendation_text: str
    protocols: list[str]
    for_date: date

    @classmethod
    def from_output(cls, output: RecoveryOutput) -> "ReadinessRead":
        """Build this schema from a :class:`RecoveryOutput` returned by the Recovery Engine."""
        return cls.model_validate(output.model_dump())
