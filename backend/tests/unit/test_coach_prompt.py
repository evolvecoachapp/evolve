"""Unit tests for :func:`~app.ai.coach_prompt.build_coach_prompt`."""

import uuid
from datetime import date, datetime, timezone

from app.ai.coach_context import (
    CoachContext,
    CoachNutritionSection,
    CoachProfileContext,
    CoachProgressSnapshot,
    CoachRecoverySection,
    CoachTrainingContext,
)
from app.ai.coach_prompt import COACH_SYSTEM_PROMPT, build_coach_prompt
from app.ai.contracts import ChatTurn, MemoryContext
from app.models.chat import ChatRole

CONVERSATION_ID = uuid.uuid4()


def _context() -> CoachContext:
    return CoachContext(
        as_of=date(2026, 8, 13),
        profile=CoachProfileContext(display_name="Alex", primary_goal="lose_weight"),
        training=CoachTrainingContext(available=True, state="training_day"),
        nutrition=CoachNutritionSection(available=False, reason="incomplete_profile"),
        recovery=CoachRecoverySection(available=False, reason="missing_checkin"),
        progress=[
            CoachProgressSnapshot(
                metric_type="body_weight",
                value="80.00",
                unit="kg",
                recorded_date=date(2026, 8, 1),
            )
        ],
    )


def _memory(*contents: tuple[ChatRole, str]) -> MemoryContext:
    return MemoryContext(
        conversation_id=CONVERSATION_ID,
        turns=[
            ChatTurn(
                role=role,
                content=text,
                created_at=datetime(2026, 8, 13, 12, 0, tzinfo=timezone.utc),
            )
            for role, text in contents
        ],
    )


def test_system_prompt_covers_persona_safety_and_anti_leak():
    lowered = COACH_SYSTEM_PROMPT.lower()
    assert "fitness coach" in lowered
    assert "not a doctor" in lowered
    assert "dietitian" in lowered
    assert "psychologist" in lowered or "therapist" in lowered
    assert "never invent" in lowered
    assert "engines" in lowered
    assert "intents" in lowered
    assert "artifacts" in lowered


def test_prompt_order_is_system_context_memory_facts_then_user_message():
    memory = _memory((ChatRole.USER, "yesterday I trained"), (ChatRole.ASSISTANT, "nice work"))
    facts = {"state": "training_day", "workout_name": "Push Day", "active_workout_log_id": "should-drop"}
    prompt = build_coach_prompt(
        coach_context=_context(),
        memory=memory,
        message="What should I train today?",
        domain_facts=facts,
    )

    assert [item.role for item in prompt] == [
        "system",
        "system",
        "user",
        "assistant",
        "system",
        "user",
    ]
    assert prompt[0].content == COACH_SYSTEM_PROMPT
    assert prompt[1].content.startswith("ATHLETE_CONTEXT:")
    assert "Alex" in prompt[1].content
    assert prompt[2].content == "yesterday I trained"
    assert prompt[3].content == "nice work"
    assert prompt[4].content.startswith("DOMAIN_FACTS")
    assert "Push Day" in prompt[4].content
    assert "active_workout_log_id" not in prompt[4].content
    assert prompt[-1].role == "user"
    assert prompt[-1].content == "What should I train today?"


def test_domain_facts_omitted_when_engine_did_not_run():
    prompt = build_coach_prompt(
        coach_context=_context(),
        memory=_memory(),
        message="How's it going?",
        domain_facts=None,
    )

    assert [item.role for item in prompt] == ["system", "system", "user"]
    assert not any(item.content.startswith("DOMAIN_FACTS") for item in prompt)
    assert prompt[-1].content == "How's it going?"


def test_empty_domain_facts_are_treated_as_absent():
    prompt = build_coach_prompt(
        coach_context=_context(),
        memory=_memory(),
        message="hello",
        domain_facts={},
    )

    assert not any(item.content.startswith("DOMAIN_FACTS") for item in prompt)
