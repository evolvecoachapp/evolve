"""Integration test for the AI Orchestrator's chat persistence, end to end.

Runs against the real PostgreSQL instance (see ``tests/conftest.py`` for
the transaction-rollback isolation strategy), composing
:class:`~app.ai.orchestrator.AIOrchestrator`,
:class:`~app.ai.memory_engine.MemoryEngine`, and
:class:`~app.repositories.chat_repository.ChatRepository` directly — there
is no HTTP endpoint yet (``CoachService``/``/api/v1/coach`` are Sprint
4.4), so this exercises the service-level stack rather than going through
FastAPI's ``TestClient``, mirroring how ``test_workout_resolution_api.py``
seeds fixtures directly against the database where no authoring endpoint
exists yet.
"""

import uuid

import pytest
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.ai.llm_provider import MockLLMProvider
from app.ai.memory_engine import MemoryEngine
from app.ai.orchestrator import AIOrchestrator
from app.models.chat import ChatMessage, ChatRole, Conversation
from app.models.user import User
from app.repositories.chat_repository import ChatRepository


@pytest.fixture()
def orchestrator(db_session: Session) -> AIOrchestrator:
    memory_engine = MemoryEngine(ChatRepository(db_session))
    return AIOrchestrator(memory_engine, MockLLMProvider())


async def test_process_message_persists_conversation_and_both_turns(
    db_session: Session, test_user: User, orchestrator: AIOrchestrator
) -> None:
    response = await orchestrator.process_message(test_user.id, "What should I train today?")

    conversation = db_session.get(Conversation, response.conversation_id)
    assert conversation is not None
    assert conversation.user_id == test_user.id
    assert conversation.last_message_at is not None

    messages = list(
        db_session.execute(
            select(ChatMessage)
            .where(ChatMessage.conversation_id == conversation.id)
            .order_by(ChatMessage.created_at)
        ).scalars()
    )
    assert len(messages) == 2
    assert messages[0].role == ChatRole.USER
    assert messages[0].content == "What should I train today?"
    assert messages[1].role == ChatRole.ASSISTANT
    assert messages[1].content == response.message
    assert messages[1].metadata_["intent"] == response.intent.value


async def test_process_message_without_conversation_id_resumes_the_latest_conversation(
    db_session: Session, test_user: User, orchestrator: AIOrchestrator
) -> None:
    first_response = await orchestrator.process_message(test_user.id, "first message")
    second_response = await orchestrator.process_message(test_user.id, "second message")

    assert second_response.conversation_id == first_response.conversation_id

    messages = list(
        db_session.execute(
            select(ChatMessage)
            .where(ChatMessage.conversation_id == first_response.conversation_id)
            .order_by(ChatMessage.created_at)
        ).scalars()
    )
    assert [message.content for message in messages] == [
        "first message",
        first_response.message,
        "second message",
        second_response.message,
    ]


async def test_process_message_with_explicit_conversation_id_starts_a_separate_thread(
    db_session: Session, test_user: User, orchestrator: AIOrchestrator
) -> None:
    first_response = await orchestrator.process_message(test_user.id, "first conversation")
    second_response = await orchestrator.process_message(
        test_user.id, "second conversation", conversation_id=uuid.uuid4()
    )

    assert second_response.conversation_id != first_response.conversation_id
    assert db_session.get(Conversation, second_response.conversation_id) is not None
