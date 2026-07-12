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
lived — this service adds nothing to that pipeline besides the ownership
check and, for history reads, a direct repository query.
"""

import uuid

from app.ai.orchestrator import AIOrchestrator, CoachResponse
from app.models.chat import ChatMessage
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
    :class:`ChatRepository` used *only* for the ownership check and history
    reads below — never for conversation creation, message persistence, or
    anything else ``AIOrchestrator``/``MemoryEngine`` already own.
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

        Performs exactly one thing before delegating: if ``conversation_id``
        is given, verify it belongs to ``user_id``. Everything else —
        resuming/creating the conversation, classifying intent, routing to
        an engine or the LLM fallback, and persisting both turns — happens
        inside :meth:`AIOrchestrator.process_message`.

        Raises:
            ConversationAccessDeniedError: If ``conversation_id`` is given
                but does not resolve to a conversation owned by ``user_id``.
        """
        if conversation_id is not None:
            self._check_owned(user_id, conversation_id)
        return await self.orchestrator.process_message(user_id, message, conversation_id)

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

    def _check_owned(self, user_id: uuid.UUID, conversation_id: uuid.UUID) -> None:
        """Raise :class:`ConversationAccessDeniedError` unless ``conversation_id`` belongs to ``user_id``."""
        conversation = self.chat_repository.get_conversation(conversation_id)
        if conversation is None or conversation.user_id != user_id:
            raise ConversationAccessDeniedError(
                f"Conversation {conversation_id} not found for this user."
            )
