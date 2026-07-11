"""Repository for persistence and retrieval of :class:`~app.models.muscle_group.MuscleGroup`.

``MuscleGroup`` is a shared, reusable catalog entity — this repository has
no knowledge of ``Exercise`` or any other consumer domain. Contains no
business logic; it only translates calls into SQLAlchemy queries against an
injected :class:`~sqlalchemy.orm.Session` and returns ORM model instances.
"""

import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.muscle_group import MuscleGroup


class MuscleGroupRepository:
    """Data-access layer for the ``muscle_groups`` reference table."""

    def __init__(self, db: Session) -> None:
        self.db = db

    def create(self, muscle_group: MuscleGroup) -> MuscleGroup:
        """Persist a fully constructed :class:`MuscleGroup` instance and return it."""
        self.db.add(muscle_group)
        self.db.flush()
        self.db.refresh(muscle_group)
        return muscle_group

    def get_by_id(self, muscle_group_id: uuid.UUID) -> MuscleGroup | None:
        """Return the muscle group with the given id, or ``None`` if not found."""
        return self.db.execute(
            select(MuscleGroup).where(MuscleGroup.id == muscle_group_id)
        ).scalar_one_or_none()

    def get_by_slug(self, slug: str) -> MuscleGroup | None:
        """Return the muscle group with the given slug, or ``None`` if not found."""
        return self.db.execute(
            select(MuscleGroup).where(MuscleGroup.slug == slug)
        ).scalar_one_or_none()

    def list_all(self) -> list[MuscleGroup]:
        """Return every muscle group, ordered by name.

        The taxonomy is small and fully curated, so no pagination is
        applied here — callers needing pagination compose it themselves.
        """
        return list(
            self.db.execute(select(MuscleGroup).order_by(MuscleGroup.name)).scalars()
        )

    def list_by_ids(self, muscle_group_ids: list[uuid.UUID]) -> list[MuscleGroup]:
        """Return the muscle groups matching any of the given ids."""
        if not muscle_group_ids:
            return []
        return list(
            self.db.execute(
                select(MuscleGroup).where(MuscleGroup.id.in_(muscle_group_ids))
            ).scalars()
        )

    def exists_id(self, muscle_group_id: uuid.UUID) -> bool:
        """Return ``True`` if a muscle group with the given id exists."""
        return (
            self.db.execute(
                select(MuscleGroup.id).where(MuscleGroup.id == muscle_group_id)
            ).first()
            is not None
        )

    def exists_slug(self, slug: str) -> bool:
        """Return ``True`` if a muscle group with the given slug exists."""
        return (
            self.db.execute(select(MuscleGroup.id).where(MuscleGroup.slug == slug)).first()
            is not None
        )
