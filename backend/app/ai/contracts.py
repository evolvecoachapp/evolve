"""Shared Pydantic contracts for the AI Orchestrator and its engines.

Distinct from ``app.schemas`` (which defines the HTTP request/response
contract): these types are internal to the AI layer and are never
returned directly by an API route — matching how
``EVOLVE_ARCHITECTURE.md`` §4 describes engines as exposing "clear
input/output contracts (Pydantic models)" of their own.
"""

import uuid
from datetime import datetime
from enum import Enum

from pydantic import BaseModel

from app.ai.coach_context import CoachContext
from app.models.chat import ChatRole


class Intent(str, Enum):
    """The coaching domain a message appears to be about.

    Produced by :func:`app.ai.intent.classify_intent` and used by
    :class:`~app.ai.orchestrator.AIOrchestrator` to select a registered
    :class:`~app.ai.engine.AIEngine`. No engine is registered for any
    intent yet (Sprint 4.2 ships the contract only) — every message
    currently falls through to a direct LLM completion regardless of the
    classified intent.
    """

    GENERAL = "general"
    WORKOUT = "workout"
    NUTRITION = "nutrition"
    RECOVERY = "recovery"
    PROGRESS = "progress"


class ChatTurn(BaseModel):
    """One historical turn, as surfaced to the orchestrator/engines by the Memory Engine.

    A read-only projection of :class:`~app.models.chat.ChatMessage` —
    deliberately narrower than the ORM model (no ``id``, no
    ``metadata_``), since engines and prompt-building only ever need the
    role/content/timing of past turns.
    """

    role: ChatRole
    content: str
    created_at: datetime


class MemoryContext(BaseModel):
    """The conversational context assembled by the Memory Engine for one request.

    ``turns`` is chronological (oldest first) and bounded to the most
    recent ``settings.ai_memory_max_turns`` messages — see
    :meth:`app.ai.memory_engine.MemoryEngine.get_context`.
    """

    conversation_id: uuid.UUID
    turns: list[ChatTurn]


class EngineInput(BaseModel):
    """The typed envelope every :class:`~app.ai.engine.AIEngine` receives.

    Engines are stateless per invocation (per
    ``EVOLVE_ARCHITECTURE.md`` §4) — everything an engine needs is on this
    object; nothing is read from ambient/global state.
    ``coach_context`` is optional so existing engine tests and adapters
    stay valid without passing an athlete brief.
    """

    user_id: uuid.UUID
    intent: Intent
    message: str
    context: MemoryContext
    coach_context: CoachContext | None = None


class EngineOutput(BaseModel):
    """The typed result every :class:`~app.ai.engine.AIEngine` returns."""

    engine_name: str
    reply_text: str
    artifacts: dict | None = None
