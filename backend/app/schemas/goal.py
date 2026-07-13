"""Pydantic v2 schemas for the Goal domain — request/response contracts.

Separate from the ORM model (:class:`~app.models.goal.Goal`): schemas never
expose internal columns like ``deleted_at``, and validate input shapes the
model itself does not (e.g. "target fields are all-or-nothing").
"""

import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import Annotated

from pydantic import BaseModel, ConfigDict, StringConstraints, model_validator

from app.models.goal import Goal, GoalPriority, GoalStatus, GoalType
from app.models.progress import ProgressMetricType

DescriptionField = Annotated[str, StringConstraints(min_length=1, max_length=2_000)]
UnitField = Annotated[str, StringConstraints(min_length=1, max_length=20)]


def _check_target_fields_consistent(
    target_metric_type: ProgressMetricType | None,
    target_value: Decimal | None,
    target_unit: str | None,
) -> None:
    """Ensure the three target fields are either all given or all omitted."""
    given = (target_metric_type, target_value, target_unit)
    if any(field is not None for field in given) and not all(field is not None for field in given):
        raise ValueError(
            "target_metric_type, target_value, and target_unit must be provided together, "
            "or all omitted."
        )


class GoalCreate(BaseModel):
    """Input schema for creating a new goal."""

    goal_type: GoalType
    description: DescriptionField
    target_metric_type: ProgressMetricType | None = None
    target_value: Decimal | None = None
    target_unit: UnitField | None = None
    target_exercise_id: uuid.UUID | None = None
    start_date: date
    target_date: date | None = None
    priority: GoalPriority = GoalPriority.MEDIUM

    @model_validator(mode="after")
    def _validate(self) -> "GoalCreate":
        _check_target_fields_consistent(self.target_metric_type, self.target_value, self.target_unit)
        if self.target_date is not None and self.target_date < self.start_date:
            raise ValueError("target_date cannot be before start_date.")
        return self


class GoalUpdate(BaseModel):
    """Input schema for partially updating an existing goal.

    All fields are optional so clients submit only the attributes they wish
    to change. ``start_date`` is deliberately not editable, matching
    ``RecoveryCheckInUpdate``'s precedent of keeping identity-establishing
    fields immutable after creation.
    """

    description: DescriptionField | None = None
    target_metric_type: ProgressMetricType | None = None
    target_value: Decimal | None = None
    target_unit: UnitField | None = None
    target_exercise_id: uuid.UUID | None = None
    target_date: date | None = None
    status: GoalStatus | None = None
    priority: GoalPriority | None = None

    @model_validator(mode="after")
    def _check_not_empty(self) -> "GoalUpdate":
        """Ensure the patch changes at least one field."""
        if all(
            value is None
            for value in (
                self.description,
                self.target_metric_type,
                self.target_value,
                self.target_unit,
                self.target_exercise_id,
                self.target_date,
                self.status,
                self.priority,
            )
        ):
            raise ValueError("At least one field must be provided.")
        return self


class GoalRead(BaseModel):
    """Public-facing representation of a single goal."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    goal_type: GoalType
    description: str
    target_metric_type: ProgressMetricType | None
    target_value: Decimal | None
    target_unit: str | None
    target_exercise_id: uuid.UUID | None
    start_date: date
    target_date: date | None
    status: GoalStatus
    priority: GoalPriority
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_model(cls, goal: Goal) -> "GoalRead":
        """Build this schema from a :class:`Goal` instance."""
        return cls.model_validate(goal)


class GoalPage(BaseModel):
    """A paginated page of :class:`GoalRead` results."""

    items: list[GoalRead]
    total: int
    limit: int
    offset: int
