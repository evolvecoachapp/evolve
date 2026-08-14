"""Unit tests for :class:`~app.services.coach_service.CoachService`.

Both the injected :class:`~app.ai.orchestrator.AIOrchestrator` and
:class:`~app.repositories.chat_repository.ChatRepository` are mocked —
these tests exercise the ownership check and delegation in isolation, with
no database involved, and assert that ``CoachService`` never calls the
Orchestrator's internals (``MemoryEngine``, an engine adapter, or a domain
service) directly. See ``tests/integration/test_coach_api.py`` for a full
end-to-end flow against a real PostgreSQL instance.
"""

import uuid

import pytest

from app.ai.contracts import Intent
from app.ai.orchestrator import CoachResponse
from app.models.chat import Conversation
from app.services.coach_service import CoachService, ConversationAccessDeniedError

USER_ID = uuid.uuid4()
OTHER_USER_ID = uuid.uuid4()


@pytest.fixture()
def orchestrator(mocker):
    orchestrator = mocker.Mock()
    orchestrator.process_message = mocker.AsyncMock(
        return_value=CoachResponse(
            conversation_id=uuid.uuid4(),
            message="a reply",
            intent=Intent.GENERAL,
            engines_invoked=[],
        )
    )
    return orchestrator


@pytest.fixture()
def chat_repository(mocker):
    return mocker.Mock()


@pytest.fixture()
def service(orchestrator, chat_repository):
    return CoachService(orchestrator, chat_repository)


# -- send_message ------------------------------------------------------------


async def test_send_message_without_conversation_id_skips_the_ownership_check(
    service, orchestrator, chat_repository
):
    await service.send_message(USER_ID, "hello")

    chat_repository.get_conversation.assert_not_called()
    orchestrator.process_message.assert_called_once_with(USER_ID, "hello", None)
    chat_repository.db.commit.assert_called_once()


async def test_send_message_with_owned_conversation_id_delegates_to_orchestrator(
    service, orchestrator, chat_repository
):
    conversation_id = uuid.uuid4()
    chat_repository.get_conversation.return_value = Conversation(
        id=conversation_id, user_id=USER_ID
    )

    response = await service.send_message(USER_ID, "hello", conversation_id)

    orchestrator.process_message.assert_called_once_with(USER_ID, "hello", conversation_id)
    chat_repository.db.commit.assert_called_once()
    assert response.message == "a reply"


async def test_send_message_commits_after_the_orchestrator_persists(
    service, orchestrator, chat_repository
):
    order: list[str] = []

    async def _process(*_args, **_kwargs):
        order.append("process")
        return orchestrator.process_message.return_value

    orchestrator.process_message.side_effect = _process
    chat_repository.db.commit.side_effect = lambda: order.append("commit")

    await service.send_message(USER_ID, "hello")

    assert order == ["process", "commit"]


async def test_send_message_raises_when_conversation_not_owned_by_caller(
    service, orchestrator, chat_repository
):
    conversation_id = uuid.uuid4()
    chat_repository.get_conversation.return_value = Conversation(
        id=conversation_id, user_id=OTHER_USER_ID
    )

    with pytest.raises(ConversationAccessDeniedError):
        await service.send_message(USER_ID, "hello", conversation_id)
    orchestrator.process_message.assert_not_called()
    chat_repository.db.commit.assert_not_called()


async def test_send_message_raises_when_conversation_does_not_exist(
    service, orchestrator, chat_repository
):
    chat_repository.get_conversation.return_value = None

    with pytest.raises(ConversationAccessDeniedError):
        await service.send_message(USER_ID, "hello", uuid.uuid4())
    orchestrator.process_message.assert_not_called()
    chat_repository.db.commit.assert_not_called()


# -- get_conversation_history -------------------------------------------------


def test_get_conversation_history_raises_when_not_owned_by_caller(service, chat_repository):
    conversation_id = uuid.uuid4()
    chat_repository.get_conversation.return_value = Conversation(
        id=conversation_id, user_id=OTHER_USER_ID
    )

    with pytest.raises(ConversationAccessDeniedError):
        service.get_conversation_history(USER_ID, conversation_id)
    chat_repository.list_messages_page.assert_not_called()


def test_get_conversation_history_returns_a_page_when_owned(service, chat_repository):
    conversation_id = uuid.uuid4()
    chat_repository.get_conversation.return_value = Conversation(
        id=conversation_id, user_id=USER_ID
    )
    chat_repository.list_messages_page.return_value = ["message-1", "message-2"]
    chat_repository.count_messages.return_value = 2

    page = service.get_conversation_history(USER_ID, conversation_id, limit=20, offset=0)

    chat_repository.list_messages_page.assert_called_once_with(
        conversation_id, limit=20, offset=0
    )
    assert page.items == ["message-1", "message-2"]
    assert page.total == 2
