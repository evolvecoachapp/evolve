"""Application-layer entry point for the conversational Coach.

Kept deliberately thin (per Decision 019 in ``docs/DECISIONS.md``):
:class:`CoachService` validates that a caller-given conversation belongs to
the requesting user, then delegates directly to
:meth:`~app.ai.orchestrator.AIOrchestrator.process_message` and returns its
:class:`~app.ai.orchestrator.CoachResponse` unchanged. Conversation
creation/resumption
(:meth:`~app.ai.memory_engine.MemoryEngine.start_or_resume_conversation`),
intent routing (``AIOrchestrator.engines``), and turn/artifact persistence
(``AIOrchestrator`` + ``MemoryEngine``) all stay exactly where they already
lived — this service adds the ownership check, a commit of the request
session after a successful send (so flushed conversation rows survive
``get_db`` closing the session), and, for history reads, a direct
repository query.
"""

import uuid

from app.ai.orchestrator import AIOrchestrator, CoachResponse
from app.models.chat import ChatMessage, Conversation
from app.repositories.chat_repository import ChatRepository
from app.utils.pagination import Page, clamp_pagination

__all__ = ["CoachServiceError", "ConversationAccessDeniedError", "CoachService"]


class CoachServiceError(Exception):
    """Base class for all errors raised by :class:`CoachService`."""


class ConversationAccessDeniedError(CoachServiceError):
    """Raised when a caller-given ``conversation_id`` does not resolve to one owned by this user."""


class CoachService:
    """Thin application-layer entry point for sending/reading Coach messages.

    Depends on an :class:`AIOrchestrator` (already wired with every
    registered engine adapter and the LLM provider — see
    :func:`~app.core.dependencies.get_coach_service`) and a
    :class:`ChatRepository` used for the ownership check, history reads,
    and the request-session commit after a successful send — never for
    conversation creation or message persistence, which
    ``AIOrchestrator``/``MemoryEngine`` already own.
    """

    def __init__(self, orchestrator: AIOrchestrator, chat_repository: ChatRepository) -> None:
        self.orchestrator = orchestrator
        self.chat_repository = chat_repository

    async def send_message(
        self,
        user_id: uuid.UUID,
        message: str,
        conversation_id: uuid.UUID | None = None,
    ) -> CoachResponse:
        """Send one message to the Coach and return its synthesized reply.

        If ``conversation_id`` is given, verify it belongs to ``user_id``,
        then delegate to :meth:`AIOrchestrator.process_message`. Commits the
        request session afterwards so flushed conversation rows survive
        ``get_db`` closing the session (which otherwise rolls back).

        Raises:
            ConversationAccessDeniedError: If ``conversation_id`` is given
                but does not resolve to a conversation owned by ``user_id``.
        """
        if conversation_id is not None:
            self._check_owned(user_id, conversation_id)
        response = await self.orchestrator.process_message(user_id, message, conversation_id)
        self.chat_repository.db.commit()
        return response

    def get_conversation_history(
        self,
        user_id: uuid.UUID,
        conversation_id: uuid.UUID,
        *,
        limit: int = 20,
        offset: int = 0,
    ) -> Page[ChatMessage]:
        """Return a paginated page of one conversation's messages, oldest first.

        Raises:
            ConversationAccessDeniedError: If ``conversation_id`` does not
                resolve to a conversation owned by ``user_id``.
        """
        self._check_owned(user_id, conversation_id)
        safe_limit, safe_offset = clamp_pagination(limit, offset)
        items = self.chat_repository.list_messages_page(
            conversation_id, limit=safe_limit, offset=safe_offset
        )
        total = self.chat_repository.count_messages(conversation_id)
        return Page(items=items, total=total, limit=safe_limit, offset=safe_offset)

    def get_any_conversation(self, conversation_id: uuid.UUID) -> Conversation:
        """Return a conversation by id without an ownership check (admin control plane).

        Raises:
            ConversationAccessDeniedError: If ``conversation_id`` does not resolve.
        """
        conversation = self.chat_repository.get_conversation(conversation_id)
        if conversation is None:
            raise ConversationAccessDeniedError("Conversation not found.")
        return conversation

    def list_all_conversations(
        self,
        *,
        user_id: uuid.UUID | None = None,
        limit: int = 20,
        offset: int = 0,
    ) -> Page[Conversation]:
        """Return a paginated page of conversations across users."""
        safe_limit, safe_offset = clamp_pagination(limit, offset)
        items = self.chat_repository.list_conversations(
            user_id=user_id, limit=safe_limit, offset=safe_offset
        )
        total = self.chat_repository.count_conversations_filtered(user_id=user_id)
        return Page(items=items, total=total, limit=safe_limit, offset=safe_offset)

    def get_any_conversation_history(
        self,
        conversation_id: uuid.UUID,
        *,
        limit: int = 20,
        offset: int = 0,
    ) -> Page[ChatMessage]:
        """Return a conversation's messages without an ownership check (admin).

        Raises:
            ConversationAccessDeniedError: If ``conversation_id`` does not resolve.
        """
        self.get_any_conversation(conversation_id)
        safe_limit, safe_offset = clamp_pagination(limit, offset)
        items = self.chat_repository.list_messages_page(
            conversation_id, limit=safe_limit, offset=safe_offset
        )
        total = self.chat_repository.count_messages(conversation_id)
        return Page(items=items, total=total, limit=safe_limit, offset=safe_offset)

    def _check_owned(self, user_id: uuid.UUID, conversation_id: uuid.UUID) -> None:
        """Raise :class:`ConversationAccessDeniedError` unless ``conversation_id`` belongs to ``user_id``."""
        conversation = self.chat_repository.get_conversation(conversation_id)
        if conversation is None or conversation.user_id != user_id:
            raise ConversationAccessDeniedError(
                f"Conversation {conversation_id} not found for this user."
            )
