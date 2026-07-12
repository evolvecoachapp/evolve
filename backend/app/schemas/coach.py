"""Pydantic v2 schemas for the Coach domain — request/response contracts.

Separate from the AI-layer contracts in ``app.ai.contracts``/
``app.ai.orchestrator`` (``EngineInput``/``EngineOutput``/``CoachResponse``):
those are internal to the AI layer and are never returned directly by an API
route. ``CoachMessageRead`` is the HTTP-facing projection of
:class:`~app.ai.orchestrator.CoachResponse`, mirroring how
``app.schemas.recovery.ReadinessRead`` projects
:class:`~app.ai.recovery_engine.RecoveryOutput`.
"""

import uuid
from datetime import datetime
from typing import Annotated

from pydantic import BaseModel, ConfigDict, StringConstraints

from app.ai.contracts import Intent
from app.ai.orchestrator import CoachResponse
from app.models.chat import ChatMessage, ChatRole

CoachMessageField = Annotated[str, StringConstraints(min_length=1, max_length=10_000)]


class CoachMessageCreate(BaseModel):
    """Input schema for sending one message to the Coach."""

    message: CoachMessageField
    conversation_id: uuid.UUID | None = None


class CoachMessageRead(BaseModel):
    """HTTP-facing projection of :class:`~app.ai.orchestrator.CoachResponse`."""

    conversation_id: uuid.UUID
    message: str
    intent: Intent
    engines_invoked: list[str]
    artifacts: dict | None

    @classmethod
    def from_response(cls, response: CoachResponse) -> "CoachMessageRead":
        """Build this schema from a :class:`CoachResponse` returned by the Orchestrator."""
        return cls.model_validate(response.model_dump())


class ChatMessageRead(BaseModel):
    """Public-facing representation of a single persisted chat turn."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    conversation_id: uuid.UUID
    role: ChatRole
    content: str
    created_at: datetime

    @classmethod
    def from_model(cls, message: ChatMessage) -> "ChatMessageRead":
        """Build this schema from a :class:`~app.models.chat.ChatMessage` instance."""
        return cls.model_validate(message)


class ChatMessagePage(BaseModel):
    """A paginated page of :class:`ChatMessageRead` results, oldest first."""

    items: list[ChatMessageRead]
    total: int
    limit: int
    offset: int
