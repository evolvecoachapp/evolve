"""The AI Orchestrator — the central coordination layer for the Coach.

Per ``EVOLVE_ARCHITECTURE.md`` §4, the Orchestrator's responsibilities
are: intent classification, context assembly, engine routing, response
synthesis, and persistence. It contains no domain algorithms of its own —
engines compute, the Orchestrator coordinates.

As of Sprint 4.5, ``Intent.WORKOUT``/``Intent.NUTRITION``/``Intent.RECOVERY``
have adapters registered (``app/ai/coach_engines.py`` — see Decision 017 in
``docs/DECISIONS.md``); ``Intent.GENERAL`` and ``Intent.PROGRESS`` (the
Progress Analyzer ships decoupled from the Orchestrator this sprint — see
Decision 023) still fall through to a direct LLM completion built from the
assembled memory context, now with graceful degradation on
:class:`~app.ai.llm_provider.LLMProviderError` (Decision 021) — a failed
upstream call returns a fixed apology reply, never an unhandled 500.

``process_message`` was originally the only ``async def`` in the backend
(Decision 009 in ``docs/DECISIONS.md``): the one call in the request path
that crosses a real network boundary (the LLM call). Sprint 4.6 extends
that boundary twice more — :func:`~app.ai.intent.classify_intent` (Decision
024) and :class:`~app.ai.progress_analyzer.ProgressAnalyzer` (Decision
022) — both for the same reason: each calls
:meth:`~app.ai.llm_provider.LLMProvider.complete`. Everything else this
method calls into — :class:`~app.ai.memory_engine.MemoryEngine`,
:class:`~app.repositories.chat_repository.ChatRepository` — stays
synchronous, matching every other service/repository in the codebase.
"""

import uuid

from pydantic import BaseModel

from app.ai.contracts import EngineInput, Intent, MemoryContext
from app.ai.engine import AIEngine
from app.ai.intent import classify_intent
from app.ai.llm_provider import LLMMessage, LLMProvider, LLMProviderError
from app.ai.memory_engine import MemoryEngine
from app.models.chat import ChatRole

_LLM_UNAVAILABLE_REPLY = (
    "I'm having trouble reaching my language model right now. Please try "
    "again in a moment — I can still help with workout, nutrition, and "
    "recovery questions directly."
)


class CoachResponse(BaseModel):
    """The Orchestrator's synthesized reply to one incoming message."""

    conversation_id: uuid.UUID
    message: str
    intent: Intent
    engines_invoked: list[str]
    artifacts: dict | None = None


class AIOrchestrator:
    """Coordinates intent classification, context assembly, engine routing,
    response synthesis, and persistence for a single incoming Coach message.

    ``engines`` defaults to an empty registry; any intent with no
    registered engine falls back to a direct LLM completion.
    :func:`~app.core.dependencies.get_coach_service` wires this with the
    three Sprint 4.5 adapters (``app/ai/coach_engines.py``) registered.
    """

    def __init__(
        self,
        memory_engine: MemoryEngine,
        llm_provider: LLMProvider,
        engines: dict[Intent, AIEngine] | None = None,
    ) -> None:
        self.memory_engine = memory_engine
        self.llm_provider = llm_provider
        self.engines = engines or {}

    async def process_message(
        self,
        user_id: uuid.UUID,
        message: str,
        conversation_id: uuid.UUID | None = None,
    ) -> CoachResponse:
        """Process one incoming user message and return the Coach's reply.

        Resolves/creates the target conversation, assembles recent
        context, classifies intent, routes to a registered engine (or
        falls back to a direct LLM completion when none is registered),
        persists both the user message and the reply, and returns the
        synthesized :class:`CoachResponse`.
        """
        conversation = self.memory_engine.start_or_resume_conversation(
            user_id, conversation_id
        )
        context = self.memory_engine.get_context(user_id, conversation.id)
        intent = await classify_intent(message, self.llm_provider)

        engine = self.engines.get(intent)
        if engine is not None:
            output = engine.handle(
                EngineInput(user_id=user_id, intent=intent, message=message, context=context)
            )
            reply_text = output.reply_text
            engines_invoked = [output.engine_name]
            artifacts = output.artifacts
        else:
            try:
                completion = await self.llm_provider.complete(
                    self._build_prompt(context, message)
                )
                reply_text = completion.content
                artifacts = None
            except LLMProviderError:
                reply_text = _LLM_UNAVAILABLE_REPLY
                artifacts = {"llm_error": True}
            engines_invoked = []

        self.memory_engine.record_turn(user_id, conversation.id, ChatRole.USER, message)
        self.memory_engine.record_turn(
            user_id,
            conversation.id,
            ChatRole.ASSISTANT,
            reply_text,
            metadata={
                "intent": intent.value,
                "engines_invoked": engines_invoked,
                "artifacts": artifacts,
            },
        )

        return CoachResponse(
            conversation_id=conversation.id,
            message=reply_text,
            intent=intent,
            engines_invoked=engines_invoked,
            artifacts=artifacts,
        )

    @staticmethod
    def _build_prompt(context: MemoryContext, message: str) -> list[LLMMessage]:
        """Translate assembled memory context plus the new message into LLM-ready prompt turns."""
        prompt = [LLMMessage(role=turn.role.value, content=turn.content) for turn in context.turns]
        prompt.append(LLMMessage(role=ChatRole.USER.value, content=message))
        return prompt
