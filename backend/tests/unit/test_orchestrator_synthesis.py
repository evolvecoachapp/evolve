"""Orchestrator synthesis tests for Coach Stabilization Sprint 2.

Existing ``test_orchestrator.py`` covers the ``AI_PROVIDER=mock`` path
(engine templates, apology on LLM failure). This module patches the
provider to ``openai_compatible`` and mocks ``LLMProvider.complete`` at
the provider seam — no live OpenAI calls.
"""

import uuid
from datetime import date

import pytest

from app.ai.coach_context import CoachContext, CoachProgressSnapshot
from app.ai.contracts import EngineOutput, Intent, MemoryContext
from app.ai.llm_provider import LLMCompletion, LLMProviderError
from app.ai.orchestrator import AIOrchestrator
from app.models.chat import Conversation

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
def context_assembler(mocker):
    assembler = mocker.Mock()
    assembler.assemble.return_value = CoachContext(
        as_of=date(2026, 8, 13),
        progress=[
            CoachProgressSnapshot(
                metric_type="body_weight",
                value="80.00",
                unit="kg",
                recorded_date=date(2026, 8, 1),
            )
        ],
    )
    return assembler


@pytest.fixture()
def openai_settings(mocker):
    mocker.patch("app.ai.orchestrator.settings.ai_provider", "openai_compatible")


def _workout_engine():
    return type(
        "StubEngine",
        (),
        {
            "name": "workout_coach_engine",
            "handle": lambda self, engine_input: EngineOutput(
                engine_name="workout_coach_engine",
                reply_text="Today's training day: Push Day. Let's get to work.",
                artifacts={
                    "state": "training_day",
                    "workout_name": "Push Day",
                    "active_workout_log_id": str(uuid.uuid4()),
                },
            ),
        },
    )()


async def test_openai_synthesizes_domain_intent_from_engine_artifacts(
    memory_engine, llm_provider, context_assembler, openai_settings
):
    llm_provider.complete.side_effect = [
        LLMCompletion(content="not-an-intent"),
        LLMCompletion(content="Let's hit Push Day — keep the rest honest."),
    ]
    orchestrator = AIOrchestrator(
        memory_engine,
        llm_provider,
        engines={Intent.WORKOUT: _workout_engine()},
        context_assembler=context_assembler,
    )

    response = await orchestrator.process_message(USER_ID, "Adjust my leg day workout")

    assert response.message == "Let's hit Push Day — keep the rest honest."
    assert response.intent == Intent.WORKOUT
    assert response.engines_invoked == ["workout_coach_engine"]
    assert response.artifacts["workout_name"] == "Push Day"
    assert "active_workout_log_id" in response.artifacts
    assert llm_provider.complete.call_count == 2
    context_assembler.assemble.assert_called_once_with(USER_ID)

    synthesis_prompt = llm_provider.complete.call_args_list[1].args[0]
    assert synthesis_prompt[0].role == "system"
    assert "not a doctor" in synthesis_prompt[0].content.lower()
    assert any(item.content.startswith("ATHLETE_CONTEXT:") for item in synthesis_prompt)
    facts = next(item for item in synthesis_prompt if item.content.startswith("DOMAIN_FACTS"))
    assert "Push Day" in facts.content
    assert "active_workout_log_id" not in facts.content
    assert synthesis_prompt[-1].content == "Adjust my leg day workout"


async def test_openai_domain_llm_failure_falls_back_to_engine_template(
    memory_engine, llm_provider, context_assembler, openai_settings
):
    llm_provider.complete.side_effect = [
        LLMCompletion(content="not-an-intent"),
        LLMProviderError("upstream is down"),
    ]
    orchestrator = AIOrchestrator(
        memory_engine,
        llm_provider,
        engines={Intent.WORKOUT: _workout_engine()},
        context_assembler=context_assembler,
    )

    response = await orchestrator.process_message(USER_ID, "What's my workout today?")

    assert "Push Day" in response.message
    assert response.engines_invoked == ["workout_coach_engine"]
    assert response.artifacts["state"] == "training_day"
    assert response.artifacts.get("llm_error") is None


async def test_openai_general_llm_failure_returns_apology(
    memory_engine, llm_provider, context_assembler, openai_settings
):
    llm_provider.complete.side_effect = LLMProviderError("upstream is down")
    orchestrator = AIOrchestrator(
        memory_engine,
        llm_provider,
        context_assembler=context_assembler,
    )

    response = await orchestrator.process_message(USER_ID, "hello there")

    assert response.intent == Intent.GENERAL
    assert response.engines_invoked == []
    assert response.artifacts == {"llm_error": True}
    assert "trouble reaching" in response.message.lower()


async def test_progress_intent_uses_context_and_does_not_register_an_analyzer(
    memory_engine, llm_provider, context_assembler, openai_settings, mocker
):
    llm_provider.complete.side_effect = [
        LLMCompletion(content="not-an-intent"),
        LLMCompletion(content="Your weight log is moving in the right direction."),
    ]
    progress_analyzer = mocker.Mock()
    progress_analyzer.handle = mocker.AsyncMock()
    orchestrator = AIOrchestrator(
        memory_engine,
        llm_provider,
        context_assembler=context_assembler,
    )

    response = await orchestrator.process_message(USER_ID, "How is my progress looking?")

    assert response.intent == Intent.PROGRESS
    assert response.engines_invoked == []
    assert response.message == "Your weight log is moving in the right direction."
    progress_analyzer.handle.assert_not_called()
    context_assembler.assemble.assert_called_once_with(USER_ID)
    synthesis_prompt = llm_provider.complete.call_args_list[1].args[0]
    assert not any(item.content.startswith("DOMAIN_FACTS") for item in synthesis_prompt)
    assert "80.00" in synthesis_prompt[1].content


async def test_general_openai_prompt_has_no_domain_facts(
    memory_engine, llm_provider, context_assembler, openai_settings
):
    llm_provider.complete.side_effect = [
        LLMCompletion(content="not-an-intent"),
        LLMCompletion(content="You've got this — one session at a time."),
    ]
    orchestrator = AIOrchestrator(
        memory_engine,
        llm_provider,
        context_assembler=context_assembler,
    )

    response = await orchestrator.process_message(USER_ID, "I had a stressful week")

    assert response.intent == Intent.GENERAL
    assert response.engines_invoked == []
    synthesis_prompt = llm_provider.complete.call_args_list[1].args[0]
    assert not any(item.content.startswith("DOMAIN_FACTS") for item in synthesis_prompt)
    assert synthesis_prompt[-1].content == "I had a stressful week"


async def test_assembler_failure_does_not_fail_the_turn(
    memory_engine, llm_provider, mocker, openai_settings
):
    assembler = mocker.Mock()
    assembler.assemble.side_effect = RuntimeError("boom")
    llm_provider.complete.side_effect = [
        LLMCompletion(content="not-an-intent"),
        LLMCompletion(content="Let's keep it simple today."),
    ]
    orchestrator = AIOrchestrator(
        memory_engine, llm_provider, context_assembler=assembler
    )

    response = await orchestrator.process_message(USER_ID, "hello there")

    assert response.message == "Let's keep it simple today."
    assert response.intent == Intent.GENERAL
