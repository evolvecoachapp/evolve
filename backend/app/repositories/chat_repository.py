"""Repository for persistence and retrieval of the ``Conversation`` aggregate.

Owns both :class:`~app.models.chat.Conversation` (the aggregate root) and
:class:`~app.models.chat.ChatMessage` (its child turns) — one repository
per aggregate, matching
:class:`~app.repositories.workout_log_repository.WorkoutLogRepository`'s
precedent for ``WorkoutLog``/``WorkoutLogExercise``/``WorkoutSetLog`).
Contains no business logic; it only translates calls into SQLAlchemy
queries against an injected :class:`~sqlalchemy.orm.Session` and returns
ORM model instances.
"""

import uuid

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.chat import ChatMessage, Conversation


class ChatRepository:
    """Data-access layer for the ``conversations`` and ``chat_messages`` tables.

    The session is injected by the caller rather than created internally,
    keeping this class testable and free of lifecycle concerns (matches
    :class:`~app.repositories.workout_log_repository.WorkoutLogRepository`).
    """

    def __init__(self, db: Session) -> None:
        self.db = db

    # -- Conversation ---------------------------------------------------------

    def create_conversation(self, user_id: uuid.UUID) -> Conversation:
        """Create and persist a new, empty :class:`Conversation` for ``user_id``."""
        conversation = Conversation(user_id=user_id)
        self.db.add(conversation)
        self.db.flush()
        self.db.refresh(conversation)
        return conversation

    def get_conversation(self, conversation_id: uuid.UUID) -> Conversation | None:
        """Return the conversation with the given id, or ``None`` if not found.

        Does not filter by ownership — applying that rule is a caller
        responsibility (matches
        :meth:`~app.repositories.workout_log_repository.WorkoutLogRepository.get_by_id`).
        """
        return self.db.execute(
            select(Conversation).where(Conversation.id == conversation_id)
        ).scalar_one_or_none()

    def get_latest_conversation(self, user_id: uuid.UUID) -> Conversation | None:
        """Return ``user_id``'s most recently active conversation, or ``None``.

        "Most recently active" is ordered by ``last_message_at`` (falling
        back to ``created_at`` for a conversation with no messages yet),
        satisfied by ``ix_conversations_user_last_message`` without a scan
        over ``chat_messages``.
        """
        return self.db.execute(
            select(Conversation)
            .where(Conversation.user_id == user_id)
            .order_by(
                Conversation.last_message_at.desc().nulls_last(),
                Conversation.created_at.desc(),
            )
            .limit(1)
        ).scalar_one_or_none()

    # -- ChatMessage ------------------------------------------------------------

    def create_message(self, message: ChatMessage) -> ChatMessage:
        """Persist a fully constructed :class:`ChatMessage` and advance its conversation.

        Advances the parent :class:`Conversation`'s ``last_message_at`` to
        this message's ``created_at`` in the same flush, so
        :meth:`get_latest_conversation` always reflects the true most
        recently active conversation.
        """
        self.db.add(message)
        self.db.flush()
        self.db.refresh(message)

        conversation = self.get_conversation(message.conversation_id)
        if conversation is not None:
            conversation.last_message_at = message.created_at
            self.db.flush()

        return message

    def list_messages(self, conversation_id: uuid.UUID, limit: int) -> list[ChatMessage]:
        """Return the most recent ``limit`` messages for a conversation, oldest first.

        Ordering is chronological (not reverse-chronological) since callers
        — chiefly :class:`~app.ai.memory_engine.MemoryEngine` — consume
        this directly as prompt/context history.
        """
        recent = self.db.execute(
            select(ChatMessage)
            .where(ChatMessage.conversation_id == conversation_id)
            .order_by(ChatMessage.created_at.desc())
            .limit(limit)
        ).scalars()
        return list(reversed(list(recent)))

    def list_messages_page(
        self, conversation_id: uuid.UUID, *, limit: int, offset: int
    ) -> list[ChatMessage]:
        """Return a standard chronological, offset-paginated page of a conversation's messages.

        Distinct from :meth:`list_messages` (which always anchors to the
        *most recent* ``limit`` messages for prompt-context windowing) —
        this method supports paging forward from the start of the
        conversation, for a history-browsing API consumer such as
        :class:`~app.services.coach_service.CoachService`.
        """
        return list(
            self.db.execute(
                select(ChatMessage)
                .where(ChatMessage.conversation_id == conversation_id)
                .order_by(ChatMessage.created_at)
                .limit(limit)
                .offset(offset)
            ).scalars()
        )

    def count_messages(self, conversation_id: uuid.UUID) -> int:
        """Return the total number of messages in a conversation, for pagination metadata."""
        return self.db.execute(
            select(func.count())
            .select_from(ChatMessage)
            .where(ChatMessage.conversation_id == conversation_id)
        ).scalar_one()
