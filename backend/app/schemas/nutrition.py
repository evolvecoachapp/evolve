"""Pydantic v2 schemas for the Nutrition domain — request/response contracts.

Separate from the AI-layer contracts in ``app.ai.nutrition_engine``
(``NutritionInput``/``NutritionOutput``, etc.): those are internal to the
Nutrition Engine and never returned directly by an API route.
``DailyNutritionRead`` is the HTTP-facing projection of
:class:`~app.ai.nutrition_engine.NutritionOutput`, mirroring how
``app.schemas.workout_resolution`` projects
:class:`~app.services.workout_resolution_service.ResolutionResult`.

``created_by_id``/``is_public`` are never client-supplied on
``MealCreate``/``MealUpdate`` — this sprint's API only ever creates private
meals owned by the requesting user (see Decision 012 in
``docs/DECISIONS.md``); both are still surfaced on ``MealRead`` since a
future sprint may expose public/shared meals through this same read schema.
"""

import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field, StringConstraints, model_validator

from app.ai.nutrition_engine import NutritionOutput
from app.models.meal import Meal, MealLog, MealType

NutritionNameField = Annotated[str, StringConstraints(min_length=2, max_length=150)]
NutritionTextField = Annotated[str, StringConstraints(max_length=10_000)]
MacroField = Annotated[Decimal, Field(ge=0)]


class MealCreate(BaseModel):
    """Input schema for authoring a new personal meal template."""

    name: NutritionNameField
    description: NutritionTextField | None = None
    meal_type: MealType
    calories: MacroField
    protein_g: MacroField
    carbs_g: MacroField
    fat_g: MacroField
    dietary_tags: list[str] | None = None


class MealUpdate(BaseModel):
    """Input schema for partially updating an existing meal template.

    All fields are optional so clients submit only the attributes they wish
    to change.
    """

    name: NutritionNameField | None = None
    description: NutritionTextField | None = None
    meal_type: MealType | None = None
    calories: MacroField | None = None
    protein_g: MacroField | None = None
    carbs_g: MacroField | None = None
    fat_g: MacroField | None = None
    dietary_tags: list[str] | None = None
    is_active: bool | None = None


class MealRead(BaseModel):
    """Public-facing representation of a single meal template."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    created_by_id: uuid.UUID | None
    is_public: bool
    name: str
    description: str | None
    meal_type: MealType
    calories: Decimal
    protein_g: Decimal
    carbs_g: Decimal
    fat_g: Decimal
    dietary_tags: list[str] | None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_model(cls, meal: Meal) -> "MealRead":
        """Build this schema from a :class:`Meal` instance."""
        return cls.model_validate(meal)


class MealPage(BaseModel):
    """A paginated page of :class:`MealRead` results."""

    items: list[MealRead]
    total: int
    limit: int
    offset: int


class MealLogCreate(BaseModel):
    """Input schema for logging a new meal, either from a template or ad-hoc.

    Exactly one of the two modes must be used:

    - **Template mode**: only ``meal_id`` is set — the service snapshots
      the template's ``name``/``meal_type``/macros at log time.
    - **Ad-hoc mode**: ``meal_id`` is omitted and ``name``/``meal_type``/all
      four macro fields are supplied directly.
    """

    meal_id: uuid.UUID | None = None
    name: NutritionNameField | None = None
    meal_type: MealType | None = None
    calories: MacroField | None = None
    protein_g: MacroField | None = None
    carbs_g: MacroField | None = None
    fat_g: MacroField | None = None
    consumed_at: datetime
    notes: NutritionTextField | None = None

    @model_validator(mode="after")
    def _check_exactly_one_mode(self) -> "MealLogCreate":
        """Ensure ``meal_id`` and the ad-hoc fields are mutually exclusive and complete."""
        ad_hoc_fields = (self.name, self.meal_type, self.calories, self.protein_g, self.carbs_g, self.fat_g)
        has_any_ad_hoc_field = any(field is not None for field in ad_hoc_fields)

        if self.meal_id is not None and has_any_ad_hoc_field:
            raise ValueError(
                "Provide either meal_id (template mode) or name/meal_type/macros "
                "(ad-hoc mode), not both."
            )
        if self.meal_id is None and not all(field is not None for field in ad_hoc_fields):
            raise ValueError(
                "Ad-hoc mode requires name, meal_type, calories, protein_g, carbs_g, "
                "and fat_g to all be provided when meal_id is omitted."
            )
        return self


class MealLogUpdate(BaseModel):
    """Input schema for partially updating a previously logged meal entry.

    All fields are optional so clients submit only the attributes they wish
    to change; the snapshotted ``name``/``meal_type``/macros can still be
    corrected after the fact (e.g. fixing a typo or an underestimated
    portion), independently of whichever template (if any) they were
    originally copied from.
    """

    name: NutritionNameField | None = None
    meal_type: MealType | None = None
    calories: MacroField | None = None
    protein_g: MacroField | None = None
    carbs_g: MacroField | None = None
    fat_g: MacroField | None = None
    consumed_at: datetime | None = None
    notes: NutritionTextField | None = None

    @model_validator(mode="after")
    def _check_not_empty(self) -> "MealLogUpdate":
        """Ensure the patch changes at least one field."""
        if all(
            value is None
            for value in (
                self.name,
                self.meal_type,
                self.calories,
                self.protein_g,
                self.carbs_g,
                self.fat_g,
                self.consumed_at,
                self.notes,
            )
        ):
            raise ValueError("At least one field must be provided.")
        return self


class MealLogRead(BaseModel):
    """Public-facing representation of a single logged meal entry."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    meal_id: uuid.UUID | None
    name_snapshot: str
    meal_type: MealType
    calories: Decimal
    protein_g: Decimal
    carbs_g: Decimal
    fat_g: Decimal
    consumed_at: datetime
    notes: str | None
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_model(cls, meal_log: MealLog) -> "MealLogRead":
        """Build this schema from a :class:`MealLog` instance."""
        return cls.model_validate(meal_log)


class MealLogPage(BaseModel):
    """A paginated page of :class:`MealLogRead` results."""

    items: list[MealLogRead]
    total: int
    limit: int
    offset: int


class MacroBreakdown(BaseModel):
    """A flat calorie/macro breakdown, shared by ``targets`` and ``actual`` below."""

    calories: Decimal
    protein_g: Decimal
    carbs_g: Decimal
    fat_g: Decimal


class DailyNutritionRead(BaseModel):
    """HTTP-facing projection of :class:`~app.ai.nutrition_engine.NutritionOutput`."""

    targets: MacroBreakdown
    actual: MacroBreakdown
    adherence: dict[str, str]
    summary_text: str
    for_date: date

    @classmethod
    def from_output(cls, output: NutritionOutput) -> "DailyNutritionRead":
        """Build this schema from a :class:`NutritionOutput` returned by the Nutrition Engine."""
        return cls(
            targets=MacroBreakdown(**output.targets.model_dump()),
            actual=MacroBreakdown(**output.actual.model_dump()),
            adherence=output.adherence,
            summary_text=output.summary_text,
            for_date=output.for_date,
        )
