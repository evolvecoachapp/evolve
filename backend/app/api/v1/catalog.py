"""Catalog routes — read-only browsing of the shared muscle group and equipment taxonomies.

Routes stay thin: delegate to :class:`CatalogService` and serialize its
return values. No business logic or database queries happen in this
module. These reference taxonomies are reusable beyond the Exercise
domain, so the router is not nested under ``/exercises``.
"""

from fastapi import APIRouter, Depends

from app.core.dependencies import get_catalog_service
from app.schemas.catalog import EquipmentRead, MuscleGroupRead
from app.services.catalog_service import CatalogService

router = APIRouter(tags=["catalog"])


@router.get("/muscle-groups", response_model=list[MuscleGroupRead])
def list_muscle_groups(
    catalog_service: CatalogService = Depends(get_catalog_service),
) -> list[MuscleGroupRead]:
    """Return the full muscle group taxonomy, ordered by name."""
    muscle_groups = catalog_service.list_muscle_groups()
    return [MuscleGroupRead.model_validate(mg) for mg in muscle_groups]


@router.get("/equipment", response_model=list[EquipmentRead])
def list_equipment(
    catalog_service: CatalogService = Depends(get_catalog_service),
) -> list[EquipmentRead]:
    """Return the full equipment taxonomy, ordered by name."""
    equipment = catalog_service.list_equipment()
    return [EquipmentRead.model_validate(eq) for eq in equipment]
