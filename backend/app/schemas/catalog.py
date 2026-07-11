"""Pydantic v2 schemas for the shared catalog domain — MuscleGroup/Equipment.

These describe reusable taxonomy entities, independent of any single
consumer (Exercise today; Workout, AI, and Analytics modules later). Kept in
their own module, separate from ``app.schemas.exercise``, so that future
domains can import them without importing anything Exercise-specific.
"""

import uuid
from datetime import datetime
from typing import Annotated

from pydantic import BaseModel, ConfigDict, StringConstraints

CatalogNameField = Annotated[str, StringConstraints(min_length=2, max_length=50)]
CatalogSlugField = Annotated[
    str,
    StringConstraints(min_length=2, max_length=50, pattern=r"^[a-z0-9]+(-[a-z0-9]+)*$"),
]
CatalogDescriptionField = Annotated[str, StringConstraints(max_length=2000)]


class MuscleGroupCreate(BaseModel):
    """Input schema for adding a new entry to the muscle group taxonomy.

    Not yet exposed via a public API route in Sprint 3.1 (the catalog is
    seed-managed), but used by :class:`~app.services.catalog_service.CatalogService`
    so seeding and any future admin endpoint share the same validation.
    """

    name: CatalogNameField
    slug: CatalogSlugField
    description: CatalogDescriptionField | None = None


class EquipmentCreate(BaseModel):
    """Input schema for adding a new entry to the equipment taxonomy.

    See :class:`MuscleGroupCreate` for why this exists ahead of a public
    write API.
    """

    name: CatalogNameField
    slug: CatalogSlugField
    description: CatalogDescriptionField | None = None


class MuscleGroupRead(BaseModel):
    """Public-facing representation of a muscle group."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    slug: str
    description: str | None
    created_at: datetime
    updated_at: datetime


class EquipmentRead(BaseModel):
    """Public-facing representation of an equipment entry."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    slug: str
    description: str | None
    created_at: datetime
    updated_at: datetime
