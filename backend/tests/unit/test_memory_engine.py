"""Unit tests for :class:`~app.ai.memory_engine.MemoryEngine`.

The injected :class:`~app.repositories.chat_repository.ChatRepository` is
mocked throughout — these tests exercise conversation
resolution/creation and context windowing in isolation, with no database
involved. See ``tests/integration/test_chat_persistence.py`` for a full
end-to-end flow against a real PostgreSQL instance.
"""

import uuid
from datetime import UTC, datetime

import pytest

from app.ai.memory_engine import MemoryEngine
from app.core.config import settings
from app.models.chat import ChatMessage, ChatRole, Conversation

USER_ID = uuid.uuid4()


@pytest.fixture()
def chat_repository(mocker):
    return mocker.Mock()


@pytest.fixture()
def engine(chat_repository):
    return MemoryEngine(chat_repository)


def _make_conversation(*, user_id: uuid.UUID = USER_ID) -> Conversation:
    return Conversation(id=uuid.uuid4(), user_id=user_id)


def _make_message(
    *, conversation_id: uuid.UUID, role: ChatRole, content: str
) -> ChatMessage:
    return ChatMessage(
        id=uuid.uuid4(),
        conversation_id=conversation_id,
        user_id=USER_ID,
        role=role,
        content=content,
        created_at=datetime.now(UTC),
    )


# -- start_or_resume_conversation --------------------------------------------


def test_start_or_resume_resumes_explicit_conversation_when_found(engine, chat_repository):
    conversation = _make_conversation()
    chat_repository.get_conversation.return_value = conversation

    result = engine.start_or_resume_conversation(USER_ID, conversation.id)

    assert result is conversation
    chat_repository.get_conversation.assert_called_once_with(conversation.id)
    chat_repository.get_latest_conversation.assert_not_called()
    chat_repository.create_conversation.assert_not_called()


def test_start_or_resume_falls_back_to_latest_when_no_id_given(engine, chat_repository):
    latest = _make_conversation()
    chat_repository.get_latest_conversation.return_value = latest

    result = engine.start_or_resume_conversation(USER_ID, None)

    assert result is latest
    chat_repository.get_conversation.assert_not_called()
    chat_repository.create_conversation.assert_not_called()


def test_start_or_resume_creates_new_conversation_when_explicit_id_not_found(
    engine, chat_repository
):
    """An unknown explicit id must never silently resume an unrelated latest conversation."""
    created = _make_conversation()
    chat_repository.get_conversation.return_value = None
    chat_repository.create_conversation.return_value = created

    result = engine.start_or_resume_conversation(USER_ID, uuid.uuid4())

    assert result is created
    chat_repository.get_latest_conversation.assert_not_called()
    chat_repository.create_conversation.assert_called_once_with(USER_ID)


def test_start_or_resume_creates_new_conversation_when_none_exists(engine, chat_repository):
    created = _make_conversation()
    chat_repository.get_latest_conversation.return_value = None
    chat_repository.create_conversation.return_value = created

    result = engine.start_or_resume_conversation(USER_ID, None)

    assert result is created
    chat_repository.create_conversation.assert_called_once_with(USER_ID)


# -- get_context -----------------------------------------------------------------


def test_get_context_uses_configured_default_max_turns(engine, chat_repository):
    conversation_id = uuid.uuid4()
    chat_repository.list_messages.return_value = []

    engine.get_context(USER_ID, conversation_id)

    chat_repository.list_messages.assert_called_once_with(
        conversation_id, settings.ai_memory_max_turns
    )


def test_get_context_honors_explicit_max_turns_override(engine, chat_repository):
    conversation_id = uuid.uuid4()
    chat_repository.list_messages.return_value = []

    engine.get_context(USER_ID, conversation_id, max_turns=5)

    chat_repository.list_messages.assert_called_once_with(conversation_id, 5)


def test_get_context_maps_messages_to_chat_turns_in_order(engine, chat_repository):
    conversation_id = uuid.uuid4()
    first = _make_message(conversation_id=conversation_id, role=ChatRole.USER, content="hi")
    second = _make_message(
        conversation_id=conversation_id, role=ChatRole.ASSISTANT, content="hello"
    )
    chat_repository.list_messages.return_value = [first, second]

    context = engine.get_context(USER_ID, conversation_id)

    assert context.conversation_id == conversation_id
    assert [turn.content for turn in context.turns] == ["hi", "hello"]
    assert [turn.role for turn in context.turns] == [ChatRole.USER, ChatRole.ASSISTANT]


# -- record_turn ------------------------------------------------------------------


def test_record_turn_persists_a_chat_message_with_given_fields(engine, chat_repository):
    conversation_id = uuid.uuid4()
    chat_repository.create_message.side_effect = lambda message: message

    result = engine.record_turn(
        USER_ID,
        conversation_id,
        ChatRole.ASSISTANT,
        "here's your answer",
        metadata={"intent": "general", "engines_invoked": []},
    )

    chat_repository.create_message.assert_called_once()
    persisted = chat_repository.create_message.call_args[0][0]
    assert persisted is result
    assert persisted.conversation_id == conversation_id
    assert persisted.user_id == USER_ID
    assert persisted.role == ChatRole.ASSISTANT
    assert persisted.content == "here's your answer"
    assert persisted.metadata_ == {"intent": "general", "engines_invoked": []}
