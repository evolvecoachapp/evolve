"""Business logic for the shared MuscleGroup/Equipment catalog domain.

``CatalogService`` is the only layer that composes
:class:`~app.repositories.muscle_group_repository.MuscleGroupRepository` and
:class:`~app.repositories.equipment_repository.EquipmentRepository`. It
contains no HTTP concepts and no Exercise-specific knowledge — this keeps
the catalog domain genuinely reusable by future Workout, AI, and Analytics
services, which can depend on this service directly instead of reaching
into repositories themselves.
"""

import uuid
from collections.abc import Iterable
from dataclasses import dataclass

from sqlalchemy.exc import IntegrityError

from app.models.equipment import Equipment
from app.models.muscle_group import MuscleGroup
from app.repositories.equipment_repository import EquipmentRepository
from app.repositories.muscle_group_repository import MuscleGroupRepository
from app.schemas.catalog import EquipmentCreate, MuscleGroupCreate


class CatalogServiceError(Exception):
    """Base class for all errors raised by :class:`CatalogService`."""


class MuscleGroupNotFoundError(CatalogServiceError):
    """Raised when a referenced muscle group id does not exist."""


class EquipmentNotFoundError(CatalogServiceError):
    """Raised when a referenced equipment id does not exist."""


class MuscleGroupAlreadyExistsError(CatalogServiceError):
    """Raised when creating a muscle group with a duplicate name or slug."""


class EquipmentAlreadyExistsError(CatalogServiceError):
    """Raised when creating an equipment entry with a duplicate name or slug."""


@dataclass(frozen=True)
class InvalidCatalogReferences:
    """The subset of requested ids that do not exist, split by taxonomy.

    Returned by :meth:`CatalogService.validate_references` so callers (e.g.
    :class:`~app.services.exercise_service.ExerciseService`) can build a
    precise error message naming exactly which ids were invalid.
    """

    missing_muscle_group_ids: list[uuid.UUID]
    missing_equipment_ids: list[uuid.UUID]

    @property
    def is_valid(self) -> bool:
        """Return ``True`` if no missing ids were found."""
        return not self.missing_muscle_group_ids and not self.missing_equipment_ids


class CatalogService:
    """Read/write workflows for the shared muscle group and equipment taxonomies.

    Depends on injected repositories rather than raw
    :class:`~sqlalchemy.orm.Session` instances, so it can be unit-tested
    with mocked repositories (matches
    :class:`~app.services.auth_service.AuthService`).
    """

    def __init__(
        self,
        muscle_group_repository: MuscleGroupRepository,
        equipment_repository: EquipmentRepository,
    ) -> None:
        self.muscle_group_repository = muscle_group_repository
        self.equipment_repository = equipment_repository

    # -- Muscle groups --------------------------------------------------

    def list_muscle_groups(self) -> list[MuscleGroup]:
        """Return the full muscle group taxonomy, ordered by name."""
        return self.muscle_group_repository.list_all()

    def get_muscle_group(self, muscle_group_id: uuid.UUID) -> MuscleGroup:
        """Return a single muscle group by id.

        Raises:
            MuscleGroupNotFoundError: If no muscle group has this id.
        """
        muscle_group = self.muscle_group_repository.get_by_id(muscle_group_id)
        if muscle_group is None:
            raise MuscleGroupNotFoundError(f"Muscle group {muscle_group_id} not found.")
        return muscle_group

    def create_muscle_group(self, data: MuscleGroupCreate) -> MuscleGroup:
        """Add a new entry to the muscle group taxonomy.

        Raises:
            MuscleGroupAlreadyExistsError: If the name or slug is already taken.
        """
        if self.muscle_group_repository.exists_slug(data.slug):
            raise MuscleGroupAlreadyExistsError(
                f"Muscle group with slug '{data.slug}' already exists."
            )

        muscle_group = MuscleGroup(
            name=data.name,
            slug=data.slug,
            description=data.description,
        )
        try:
            created = self.muscle_group_repository.create(muscle_group)
            self.muscle_group_repository.db.commit()
        except IntegrityError as exc:
            self.muscle_group_repository.db.rollback()
            raise MuscleGroupAlreadyExistsError(
                f"Muscle group '{data.name}' already exists."
            ) from exc
        return created

    # -- Equipment --------------------------------------------------------

    def list_equipment(self) -> list[Equipment]:
        """Return the full equipment taxonomy, ordered by name."""
        return self.equipment_repository.list_all()

    def get_equipment(self, equipment_id: uuid.UUID) -> Equipment:
        """Return a single equipment entry by id.

        Raises:
            EquipmentNotFoundError: If no equipment entry has this id.
        """
        equipment = self.equipment_repository.get_by_id(equipment_id)
        if equipment is None:
            raise EquipmentNotFoundError(f"Equipment {equipment_id} not found.")
        return equipment

    def create_equipment(self, data: EquipmentCreate) -> Equipment:
        """Add a new entry to the equipment taxonomy.

        Raises:
            EquipmentAlreadyExistsError: If the name or slug is already taken.
        """
        if self.equipment_repository.exists_slug(data.slug):
            raise EquipmentAlreadyExistsError(
                f"Equipment with slug '{data.slug}' already exists."
            )

        equipment = Equipment(
            name=data.name,
            slug=data.slug,
            description=data.description,
        )
        try:
            created = self.equipment_repository.create(equipment)
            self.equipment_repository.db.commit()
        except IntegrityError as exc:
            self.equipment_repository.db.rollback()
            raise EquipmentAlreadyExistsError(
                f"Equipment '{data.name}' already exists."
            ) from exc
        return created

    # -- Cross-domain validation -----------------------------------------

    def validate_references(
        self,
        *,
        muscle_group_ids: Iterable[uuid.UUID] = (),
        equipment_ids: Iterable[uuid.UUID] = (),
    ) -> InvalidCatalogReferences:
        """Check that every given id exists in its respective taxonomy.

        Used by consumer services (e.g. ``ExerciseService``) to validate
        foreign references before persisting, without duplicating existence
        checks against the catalog repositories themselves.
        """
        muscle_group_id_list = list(muscle_group_ids)
        equipment_id_list = list(equipment_ids)

        found_muscle_groups = {
            m.id for m in self.muscle_group_repository.list_by_ids(muscle_group_id_list)
        }
        found_equipment = {
            e.id for e in self.equipment_repository.list_by_ids(equipment_id_list)
        }

        return InvalidCatalogReferences(
            missing_muscle_group_ids=[
                mg_id for mg_id in muscle_group_id_list if mg_id not in found_muscle_groups
            ],
            missing_equipment_ids=[
                eq_id for eq_id in equipment_id_list if eq_id not in found_equipment
            ],
        )
