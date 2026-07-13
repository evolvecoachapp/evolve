"""Unit tests for :class:`~app.ai.orchestrator.AIOrchestrator`.

``MemoryEngine`` and ``LLMProvider`` are both mocked — these tests
exercise the Orchestrator's control flow (conversation resolution,
context assembly, intent-based routing, fallback-to-LLM, graceful
degradation on an LLM failure, and persistence calls) in isolation. See
``tests/integration/test_chat_persistence.py`` for a full end-to-end
flow against a real PostgreSQL instance.

Since Sprint 4.6 (Decision 024), ``AIOrchestrator.process_message`` calls
``await classify_intent(message, self.llm_provider)`` — which itself calls
``llm_provider.complete(...)`` once for classification before any
routing decision is made. The mocked ``llm_provider`` here always returns
a fixed reply that never parses as a valid ``Intent`` label, so
classification deterministically falls through to the keyword matcher —
exactly the "mock provider always falls back" behavior Decision 024
documents — meaning every test below still routes on the same keywords as
before this sprint, just via one extra ``complete()`` call.
"""

import uuid

import pytest

from app.ai.contracts import EngineOutput, Intent, MemoryContext
from app.ai.llm_provider import LLMCompletion, LLMProviderError
from app.ai.orchestrator import AIOrchestrator
from app.models.chat import ChatRole, Conversation

USER_ID = uuid.uuid4()


@pytest.fixture()
def conversation() -> Conversation:
    return Conversation(id=uuid.uuid4(), user_id=USER_ID)


@pytest.fixture()
def memory_engine(mocker, conversation):
    engine = mocker.Mock()
    engine.start_or_resume_conversation.return_value = conversation
    engine.get_context.return_value = MemoryContext(conversation_id=conversation.id, turns=[])
    return engine


@pytest.fixture()
def llm_provider(mocker):
    provider = mocker.Mock()
    provider.complete = mocker.AsyncMock(
        return_value=LLMCompletion(content="a mock coach reply")
    )
    return provider


@pytest.fixture()
def orchestrator(memory_engine, llm_provider):
    return AIOrchestrator(memory_engine, llm_provider)


async def test_process_message_falls_back_to_llm_when_no_engine_registered(
    orchestrator, memory_engine, llm_provider, conversation
):
    response = await orchestrator.process_message(USER_ID, "What workout should I do today?")

    # One call for intent classification (falls back to the keyword matcher
    # since "a mock coach reply" isn't a valid Intent label), one for the
    # actual reply, since no engine is registered for Intent.WORKOUT.
    assert llm_provider.complete.call_count == 2
    assert response.message == "a mock coach reply"
    assert response.conversation_id == conversation.id
    assert response.intent == Intent.WORKOUT
    assert response.engines_invoked == []


async def test_process_message_resumes_the_given_conversation_id(
    orchestrator, memory_engine
):
    explicit_id = uuid.uuid4()

    await orchestrator.process_message(USER_ID, "hello", conversation_id=explicit_id)

    memory_engine.start_or_resume_conversation.assert_called_once_with(USER_ID, explicit_id)


async def test_process_message_persists_both_user_and_assistant_turns(
    orchestrator, memory_engine, conversation
):
    await orchestrator.process_message(USER_ID, "What workout should I do today?")

    assert memory_engine.record_turn.call_count == 2
    user_call, assistant_call = memory_engine.record_turn.call_args_list

    assert user_call.args[:3] == (USER_ID, conversation.id, ChatRole.USER)
    assert user_call.args[3] == "What workout should I do today?"

    assert assistant_call.args[:3] == (USER_ID, conversation.id, ChatRole.ASSISTANT)
    assert assistant_call.args[3] == "a mock coach reply"
    assert assistant_call.kwargs["metadata"] == {
        "intent": Intent.WORKOUT.value,
        "engines_invoked": [],
        "artifacts": None,
    }


async def test_process_message_routes_to_a_registered_engine_when_intent_matches(
    memory_engine, llm_provider
):
    engine = type(
        "StubEngine",
        (),
        {
            "name": "workout_engine",
            "handle": lambda self, engine_input: EngineOutput(
                engine_name="workout_engine",
                reply_text="engine-generated reply",
            ),
        },
    )()
    orchestrator = AIOrchestrator(memory_engine, llm_provider, engines={Intent.WORKOUT: engine})

    response = await orchestrator.process_message(USER_ID, "Adjust my leg day workout")

    # Only the intent-classification call happens; the engine (not the LLM)
    # produces the reply.
    llm_provider.complete.assert_called_once()
    assert response.message == "engine-generated reply"
    assert response.engines_invoked == ["workout_engine"]


async def test_process_message_uses_llm_fallback_for_an_unregistered_intent(
    memory_engine, llm_provider
):
    engine = type(
        "StubEngine",
        (),
        {
            "name": "nutrition_engine",
            "handle": lambda self, engine_input: EngineOutput(
                engine_name="nutrition_engine",
                reply_text="should never be called",
            ),
        },
    )()
    orchestrator = AIOrchestrator(memory_engine, llm_provider, engines={Intent.NUTRITION: engine})

    response = await orchestrator.process_message(USER_ID, "What should I train today?")

    assert llm_provider.complete.call_count == 2
    assert response.message == "a mock coach reply"
    assert response.engines_invoked == []


async def test_process_message_degrades_gracefully_when_the_llm_call_fails(
    memory_engine, mocker
):
    """Both the intent-classification call and the reply-fallback call fail.

    ``classify_intent`` swallows its own ``LLMProviderError`` internally
    (falling back to the keyword matcher), but the Orchestrator's own
    LLM-fallback branch must also catch the error and return a normal
    ``CoachResponse`` with a fixed apology, never propagate a 500.
    """
    llm_provider = mocker.Mock()
    llm_provider.complete = mocker.AsyncMock(side_effect=LLMProviderError("upstream is down"))
    orchestrator = AIOrchestrator(memory_engine, llm_provider)

    response = await orchestrator.process_message(USER_ID, "hello there")

    assert response.intent == Intent.GENERAL
    assert response.engines_invoked == []
    assert response.artifacts == {"llm_error": True}
    assert "trouble reaching" in response.message.lower()
