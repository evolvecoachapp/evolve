"""Unit tests for :class:`~app.ai.orchestrator.AIOrchestrator`.

``MemoryEngine`` and ``LLMProvider`` are both mocked — these tests
exercise the Orchestrator's control flow (conversation resolution,
context assembly, keyword intent routing, fallback-to-LLM, graceful
degradation on an LLM failure, and persistence calls) in isolation. See
``tests/integration/test_chat_persistence.py`` for a full end-to-end
flow against a real PostgreSQL instance.

ADR-161: chat turns classify with ``_classify_intent_by_keyword`` only.
Under ``AI_PROVIDER=mock`` a matching engine supplies the reply with
zero provider calls; an unmatched intent spends exactly one synthesis
``complete()`` (the mock placeholder), never a classify hop.
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


def _stub_engine(name: str, reply: str) -> object:
    return type(
        "StubEngine",
        (),
        {
            "name": name,
            "handle": lambda self, engine_input: EngineOutput(
                engine_name=name,
                reply_text=reply,
            ),
        },
    )()


async def test_process_message_falls_back_to_llm_when_no_engine_registered(
    orchestrator, memory_engine, llm_provider, conversation
):
    response = await orchestrator.process_message(USER_ID, "What workout should I do today?")

    assert llm_provider.complete.call_count == 1
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
    orchestrator = AIOrchestrator(
        memory_engine,
        llm_provider,
        engines={Intent.WORKOUT: _stub_engine("workout_engine", "engine-generated reply")},
    )

    response = await orchestrator.process_message(USER_ID, "Adjust my leg day workout")

    llm_provider.complete.assert_not_called()
    assert response.message == "engine-generated reply"
    assert response.intent == Intent.WORKOUT
    assert response.engines_invoked == ["workout_engine"]


@pytest.mark.parametrize(
    ("message", "intent", "engine_name"),
    [
        ("What's my workout today?", Intent.WORKOUT, "workout_engine"),
        ("What should I eat for lunch?", Intent.NUTRITION, "nutrition_engine"),
        ("I'm feeling really sore and fatigued", Intent.RECOVERY, "recovery_engine"),
    ],
)
async def test_keyword_routing_invokes_the_matching_domain_engine(
    memory_engine, llm_provider, message, intent, engine_name
):
    engines = {
        Intent.WORKOUT: _stub_engine("workout_engine", "workout-template"),
        Intent.NUTRITION: _stub_engine("nutrition_engine", "nutrition-template"),
        Intent.RECOVERY: _stub_engine("recovery_engine", "recovery-template"),
    }
    orchestrator = AIOrchestrator(memory_engine, llm_provider, engines=engines)

    response = await orchestrator.process_message(USER_ID, message)

    llm_provider.complete.assert_not_called()
    assert response.intent == intent
    assert response.engines_invoked == [engine_name]
    assert response.message == f"{intent.value}-template"


async def test_progress_and_general_do_not_invoke_domain_engines(
    memory_engine, llm_provider
):
    engines = {
        Intent.WORKOUT: _stub_engine("workout_engine", "should-not-run"),
        Intent.NUTRITION: _stub_engine("nutrition_engine", "should-not-run"),
        Intent.RECOVERY: _stub_engine("recovery_engine", "should-not-run"),
    }
    orchestrator = AIOrchestrator(memory_engine, llm_provider, engines=engines)

    progress = await orchestrator.process_message(USER_ID, "How is my progress toward my goal?")
    general = await orchestrator.process_message(USER_ID, "Hey, how's it going?")

    assert progress.intent == Intent.PROGRESS
    assert progress.engines_invoked == []
    assert general.intent == Intent.GENERAL
    assert general.engines_invoked == []
    assert llm_provider.complete.call_count == 2


async def test_process_message_uses_llm_fallback_for_an_unregistered_intent(
    memory_engine, llm_provider
):
    orchestrator = AIOrchestrator(
        memory_engine,
        llm_provider,
        engines={Intent.NUTRITION: _stub_engine("nutrition_engine", "should never be called")},
    )

    response = await orchestrator.process_message(USER_ID, "What should I train today?")

    assert llm_provider.complete.call_count == 1
    assert response.message == "a mock coach reply"
    assert response.engines_invoked == []


async def test_process_message_degrades_gracefully_when_the_llm_call_fails(
    memory_engine, mocker
):
    """A failed synthesis call still returns a CoachResponse, never a 500.

    Keyword routing does not call the provider, so a raising ``complete``
    only hits the no-engine synthesis fallback.
    """
    llm_provider = mocker.Mock()
    llm_provider.complete = mocker.AsyncMock(side_effect=LLMProviderError("upstream is down"))
    orchestrator = AIOrchestrator(memory_engine, llm_provider)

    response = await orchestrator.process_message(USER_ID, "hello there")

    assert response.intent == Intent.GENERAL
    assert response.engines_invoked == []
    assert response.artifacts == {"llm_error": True}
    assert "trouble reaching" in response.message.lower()
    llm_provider.complete.assert_called_once()
