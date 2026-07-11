"""Repository for persistence and retrieval of :class:`~app.models.equipment.Equipment`.

``Equipment`` is a shared, reusable catalog entity — this repository has no
knowledge of ``Exercise`` or any other consumer domain. Contains no business
logic; it only translates calls into SQLAlchemy queries against an injected
:class:`~sqlalchemy.orm.Session` and returns ORM model instances.
"""

import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.equipment import Equipment


class EquipmentRepository:
    """Data-access layer for the ``equipment`` reference table."""

    def __init__(self, db: Session) -> None:
        self.db = db

    def create(self, equipment: Equipment) -> Equipment:
        """Persist a fully constructed :class:`Equipment` instance and return it."""
        self.db.add(equipment)
        self.db.flush()
        self.db.refresh(equipment)
        return equipment

    def get_by_id(self, equipment_id: uuid.UUID) -> Equipment | None:
        """Return the equipment with the given id, or ``None`` if not found."""
        return self.db.execute(
            select(Equipment).where(Equipment.id == equipment_id)
        ).scalar_one_or_none()

    def get_by_slug(self, slug: str) -> Equipment | None:
        """Return the equipment with the given slug, or ``None`` if not found."""
        return self.db.execute(
            select(Equipment).where(Equipment.slug == slug)
        ).scalar_one_or_none()

    def list_all(self) -> list[Equipment]:
        """Return every equipment entry, ordered by name.

        The taxonomy is small and fully curated, so no pagination is
        applied here — callers needing pagination compose it themselves.
        """
        return list(self.db.execute(select(Equipment).order_by(Equipment.name)).scalars())

    def list_by_ids(self, equipment_ids: list[uuid.UUID]) -> list[Equipment]:
        """Return the equipment entries matching any of the given ids."""
        if not equipment_ids:
            return []
        return list(
            self.db.execute(
                select(Equipment).where(Equipment.id.in_(equipment_ids))
            ).scalars()
        )

    def exists_id(self, equipment_id: uuid.UUID) -> bool:
        """Return ``True`` if an equipment entry with the given id exists."""
        return (
            self.db.execute(
                select(Equipment.id).where(Equipment.id == equipment_id)
            ).first()
            is not None
        )

    def exists_slug(self, slug: str) -> bool:
        """Return ``True`` if an equipment entry with the given slug exists."""
        return (
            self.db.execute(select(Equipment.id).where(Equipment.slug == slug)).first()
            is not None
        )
