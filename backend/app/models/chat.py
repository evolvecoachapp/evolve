"""SQLAlchemy models for the ``Conversation``/``ChatMessage`` aggregate.

``Conversation`` is the aggregate root — a persistent grouping of turns
between a user and the Coach — introduced now (Sprint 4.2) even though no
conversation-listing, title, or archiving feature exists yet. The
alternative (storing a bare ``conversation_id`` UUID on ``ChatMessage``
with no backing table) defers the one part of this design that is
genuinely expensive to retrofit later: once real conversations exist,
introducing the entity would require backfilling one row per historical
id and adding a ``NOT NULL`` foreign key after the fact. Feature columns
that have no such asymmetry (``title``, archive/soft-delete flags, etc.)
are deliberately *not* included yet — see Decision 007 in
``docs/DECISIONS.md``.

``ChatMessage`` carries a denormalized ``user_id`` alongside its
``conversation_id`` FK so ownership checks never require a join; it is
set once at creation and never updated, so there is no update-anomaly
risk.
"""

import uuid
from datetime import datetime
from enum import Enum

from sqlalchemy import DateTime, ForeignKey, Index, Text, Uuid, func
from sqlalchemy import Enum as SAEnum
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class ChatRole(str, Enum):
    """Who authored a given :class:`ChatMessage`."""

    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"


class Conversation(Base):
    """A persistent grouping of :class:`ChatMessage` turns for one user.

    ``last_message_at`` is advanced by
    :class:`~app.repositories.chat_repository.ChatRepository` every time a
    message is added, powering "resume my most recent conversation"
    (:meth:`~app.repositories.chat_repository.ChatRepository.get_latest_conversation`)
    as an indexed lookup rather than a scan over ``chat_messages``.
    """

    __tablename__ = "conversations"
    __table_args__ = (
        Index("ix_conversations_user_id", "user_id"),
        Index("ix_conversations_user_last_message", "user_id", "last_message_at"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE", name="fk_conversations_user_id"),
        nullable=False,
    )

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
    last_message_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    messages: Mapped[list["ChatMessage"]] = relationship(
        back_populates="conversation",
        cascade="all, delete-orphan",
        order_by="ChatMessage.created_at",
    )

    def __repr__(self) -> str:
        """Return an unambiguous representation useful for logs and debugging."""
        return f"<Conversation id={self.id} user_id={self.user_id}>"


class ChatMessage(Base):
    """A single turn (user, assistant, or system) within a :class:`Conversation`.

    ``metadata_`` holds AI-orchestration context about this turn —
    ``intent_detected``, ``engines_invoked``, and future generated
    artifacts — per ``EVOLVE_ARCHITECTURE.md``'s "Chats" entity
    description. Mapped to the Python attribute ``metadata_`` (not
    ``metadata``, which is reserved by SQLAlchemy's declarative base) but
    stored under the ``metadata`` column name.
    """

    __tablename__ = "chat_messages"
    __table_args__ = (
        Index("ix_chat_messages_conversation_created", "conversation_id", "created_at"),
        Index("ix_chat_messages_user_id", "user_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    conversation_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey(
            "conversations.id",
            ondelete="CASCADE",
            name="fk_chat_messages_conversation_id",
        ),
        nullable=False,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE", name="fk_chat_messages_user_id"),
        nullable=False,
    )

    role: Mapped[ChatRole] = mapped_column(
        SAEnum(
            ChatRole,
            name="chat_role_enum",
            native_enum=True,
            validate_strings=True,
            values_callable=lambda enum_cls: [member.value for member in enum_cls],
        ),
        nullable=False,
    )
    content: Mapped[str] = mapped_column(Text, nullable=False)
    metadata_: Mapped[dict | None] = mapped_column("metadata", JSONB, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    conversation: Mapped["Conversation"] = relationship(back_populates="messages")

    def __repr__(self) -> str:
        """Return an unambiguous representation useful for logs and debugging."""
        return (
            f"<ChatMessage id={self.id} conversation_id={self.conversation_id} "
            f"role={self.role.value}>"
        )
