"""The AI Orchestrator — the central coordination layer for the Coach.

Per ``EVOLVE_ARCHITECTURE.md`` §4, the Orchestrator's responsibilities
are: intent classification, context assembly, engine routing, response
synthesis, and persistence. It contains no domain algorithms of its own —
engines compute, the Orchestrator coordinates.

Sprint 4.5 registered ``Intent.WORKOUT``/``NUTRITION``/``RECOVERY`` adapters
(``app/ai/coach_engines.py``, Decision 017). ``Intent.GENERAL`` and
``Intent.PROGRESS`` have no engine (Progress Analyzer stays decoupled —
Decision 023) and never call
:meth:`~app.ai.progress_analyzer.ProgressAnalyzer.handle` on a chat turn.

ADR-161: interactive chat turns use deterministic keyword routing (no LLM
classify hop) and exactly one synthesis completion under
``AI_PROVIDER=openai_compatible``. Domain engines stay authoritative;
their templated ``reply_text`` is the mock path and the LLM-failure /
unsanitary-output fallback. ``AI_PROVIDER=mock`` keeps engine-template
replies so local development and tests stay deterministic (Decision
020/021). Completions are parsed and sanitized before persist.
"""

import uuid

from pydantic import BaseModel

from app.ai.coach_context import CoachContext, CoachContextAssembler, empty_coach_context
from app.ai.coach_output import finalize_coach_reply
from app.ai.coach_prompt import build_coach_prompt
from app.ai.contracts import EngineInput, EngineOutput, Intent, MemoryContext
from app.ai.engine import AIEngine
from app.ai.intent import _classify_intent_by_keyword
from app.ai.llm_provider import LLMProvider, LLMProviderError
from app.ai.memory_engine import MemoryEngine
from app.core.config import settings
from app.models.chat import ChatRole

_LLM_UNAVAILABLE_REPLY = (
    "I'm having trouble reaching my language model right now. Please try "
    "again in a moment — I can still help with workout, nutrition, and "
    "recovery questions directly."
)

_OPENAI_COMPATIBLE = "openai_compatible"


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
    registered engine falls back to an LLM completion (or the apology
    string on :class:`~app.ai.llm_provider.LLMProviderError`).
    :func:`~app.core.dependencies.get_coach_service` wires this with the
    three Sprint 4.5 adapters and a :class:`CoachContextAssembler`.
    """

    def __init__(
        self,
        memory_engine: MemoryEngine,
        llm_provider: LLMProvider,
        engines: dict[Intent, AIEngine] | None = None,
        context_assembler: CoachContextAssembler | None = None,
    ) -> None:
        self.memory_engine = memory_engine
        self.llm_provider = llm_provider
        self.engines = engines or {}
        self.context_assembler = context_assembler

    async def process_message(
        self,
        user_id: uuid.UUID,
        message: str,
        conversation_id: uuid.UUID | None = None,
    ) -> CoachResponse:
        """Process one incoming user message and return the Coach's reply.

        Resolves/creates the target conversation, assembles memory and a
        bounded :class:`CoachContext`, classifies intent with the keyword
        matcher (no LLM), optionally runs a domain engine for deterministic
        facts, synthesizes the user-facing reply (one LLM call when
        ``openai_compatible``; engine template under ``mock``), persists
        both turns, and returns a :class:`CoachResponse`.
        """
        conversation = self.memory_engine.start_or_resume_conversation(
            user_id, conversation_id
        )
        memory = self.memory_engine.get_context(user_id, conversation.id)
        coach_context = self._assemble_context(user_id)
        intent = _classify_intent_by_keyword(message)

        engine_output = self._run_engine(
            user_id, intent, message, memory, coach_context
        )
        engines_invoked = [engine_output.engine_name] if engine_output is not None else []
        artifacts = engine_output.artifacts if engine_output is not None else None

        reply_text, artifacts = await self._synthesize_reply(
            message=message,
            memory=memory,
            coach_context=coach_context,
            engine_output=engine_output,
            artifacts=artifacts,
        )

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

    def _assemble_context(self, user_id: uuid.UUID) -> CoachContext:
        """Assemble athlete context, returning an empty brief if assembly fails."""
        if self.context_assembler is None:
            return empty_coach_context()
        try:
            return self.context_assembler.assemble(user_id)
        except Exception:
            return empty_coach_context()

    def _run_engine(
        self,
        user_id: uuid.UUID,
        intent: Intent,
        message: str,
        memory: MemoryContext,
        coach_context: CoachContext,
    ) -> EngineOutput | None:
        """Run the registered engine for ``intent``, or ``None`` if none is registered.

        ``Intent.PROGRESS`` has no engine by design (Decision 023) — progress
        numbers live on :class:`CoachContext` instead of
        :class:`~app.ai.progress_analyzer.ProgressAnalyzer`.
        """
        engine = self.engines.get(intent)
        if engine is None:
            return None
        return engine.handle(
            EngineInput(
                user_id=user_id,
                intent=intent,
                message=message,
                context=memory,
                coach_context=coach_context,
            )
        )

    async def _synthesize_reply(
        self,
        *,
        message: str,
        memory: MemoryContext,
        coach_context: CoachContext,
        engine_output: EngineOutput | None,
        artifacts: dict | None,
    ) -> tuple[str, dict | None]:
        """Return ``(reply_text, artifacts)`` for the user-facing message.

        Under ``AI_PROVIDER=mock``, a registered engine's templated
        ``reply_text`` is used directly (existing tests and local
        development). Under ``openai_compatible``, every intent is
        LLM-written from unlabeled context plus optional engine facts;
        the completion is parsed and sanitized before persist. LLM
        failure or unsanitary output falls back to the engine template,
        or the fixed apology when no engine ran — never an unhandled
        exception and never a leaked raw completion.
        """
        if engine_output is not None and settings.ai_provider != _OPENAI_COMPATIBLE:
            return engine_output.reply_text, artifacts

        try:
            completion = await self.llm_provider.complete(
                build_coach_prompt(
                    coach_context=coach_context,
                    memory=memory,
                    message=message,
                    domain_facts=artifacts if artifacts else None,
                )
            )
        except LLMProviderError:
            return self._fallback_reply(engine_output, artifacts)

        sanitized = finalize_coach_reply(completion.content)
        if sanitized is None:
            return self._fallback_reply(engine_output, artifacts)
        return sanitized, artifacts

    @staticmethod
    def _fallback_reply(
        engine_output: EngineOutput | None,
        artifacts: dict | None,
    ) -> tuple[str, dict | None]:
        """Engine template when one ran; otherwise the fixed apology."""
        if engine_output is not None:
            return engine_output.reply_text, artifacts
        return _LLM_UNAVAILABLE_REPLY, {"llm_error": True}
