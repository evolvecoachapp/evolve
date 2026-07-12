"""Memory Engine v1 — conversation context read/write.

Scoped to recent conversation turns only. Long-term memory (stated
preferences, injury history, outcomes of past recommendations — the full
scope described for the Memory Engine in ``EVOLVE_ARCHITECTURE.md`` §4)
is explicitly out of scope for this sprint; that requires its own
persisted representation and is deferred to a later sprint.

Deliberately synchronous, matching every repository and service in the
codebase (Decision 009 in ``docs/DECISIONS.md``) — only
:class:`~app.ai.orchestrator.AIOrchestrator` and
:class:`~app.ai.llm_provider.LLMProvider` are ``async``, since the LLM
call is the only I/O this sprint anticipates crossing a real network
boundary.
"""

import uuid

from app.ai.contracts import ChatTurn, MemoryContext
from app.core.config import settings
from app.models.chat import ChatMessage, ChatRole, Conversation
from app.repositories.chat_repository import ChatRepository


class MemoryEngine:
    """Reads and writes conversation context via an injected :class:`ChatRepository`.

    Depends on the repository directly rather than composing other
    services, matching
    :class:`~app.services.workout_resolution_service.WorkoutResolutionService`'s
    precedent — keeps this class independently unit-testable with a
    mocked repository.
    """

    def __init__(self, chat_repository: ChatRepository) -> None:
        self.chat_repository = chat_repository

    def start_or_resume_conversation(
        self, user_id: uuid.UUID, conversation_id: uuid.UUID | None
    ) -> Conversation:
        """Resolve the conversation a message belongs to.

        - ``conversation_id`` is given: resume it if it exists (no
          ownership check here; that is the caller's responsibility,
          matching every other repository-backed lookup in this
          codebase); otherwise start a brand new conversation. A caller
          that names a specific (but unknown) conversation has expressed
          intent not to continue whatever their most recent unrelated
          conversation happens to be, so an unknown id never silently
          falls back to :meth:`ChatRepository.get_latest_conversation
          <app.repositories.chat_repository.ChatRepository.get_latest_conversation>`.
        - ``conversation_id`` is ``None``: resume ``user_id``'s most
          recently active conversation, or start a new one if they have
          none yet.

        This is the single place a :class:`Conversation` row is minted.
        """
        if conversation_id is not None:
            conversation = self.chat_repository.get_conversation(conversation_id)
            return conversation or self.chat_repository.create_conversation(user_id)

        latest = self.chat_repository.get_latest_conversation(user_id)
        return latest or self.chat_repository.create_conversation(user_id)

    def get_context(
        self,
        user_id: uuid.UUID,
        conversation_id: uuid.UUID,
        max_turns: int | None = None,
    ) -> MemoryContext:
        """Return the most recent ``max_turns`` messages for a conversation.

        ``user_id`` is accepted (and not currently used beyond
        documenting intent) so this method's signature stays stable once
        ownership/authorization checks are added in a later sprint.
        """
        del user_id  # not yet used; kept for a future ownership check
        limit = max_turns if max_turns is not None else settings.ai_memory_max_turns
        messages = self.chat_repository.list_messages(conversation_id, limit)
        return MemoryContext(
            conversation_id=conversation_id,
            turns=[
                ChatTurn(role=message.role, content=message.content, created_at=message.created_at)
                for message in messages
            ],
        )

    def record_turn(
        self,
        user_id: uuid.UUID,
        conversation_id: uuid.UUID,
        role: ChatRole,
        content: str,
        metadata: dict | None = None,
    ) -> ChatMessage:
        """Persist one turn and advance its conversation's ``last_message_at``."""
        message = ChatMessage(
            conversation_id=conversation_id,
            user_id=user_id,
            role=role,
            content=content,
            metadata_=metadata,
        )
        return self.chat_repository.create_message(message)
