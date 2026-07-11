"""SQLAlchemy model for the Equipment reference entity.

``Equipment`` is a reusable catalog/taxonomy entity, not an Exercise-only
concept. It is designed to be referenced by the Exercise domain today and by
future Workout, AI, and Analytics modules (e.g. "what can this user train
with given their home-gym equipment") without any structural change.
"""

import uuid
from datetime import datetime

from sqlalchemy import DateTime, String, Text, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class Equipment(Base):
    """A single entry in the shared equipment taxonomy (e.g. "Barbell").

    Rows are curated/seeded reference data, not user-generated content.
    ``slug`` is the stable, human-readable key used by seed data and future
    API filters; ``name`` is the display label.
    """

    __tablename__ = "equipment"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    name: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    slug: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    def __repr__(self) -> str:
        """Return an unambiguous representation useful for logs and debugging."""
        return f"<Equipment id={self.id} slug={self.slug!r}>"
