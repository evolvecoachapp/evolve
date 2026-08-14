"""Unit tests for :func:`~app.ai.coach_output.finalize_coach_reply`."""

from app.ai.coach_output import finalize_coach_reply
from app.ai.contracts import CoachLLMOutput


def test_structured_json_reply_is_extracted():
    raw = '{"reply": "Let\'s hit Push Day and keep the rest honest."}'

    assert finalize_coach_reply(raw) == "Let's hit Push Day and keep the rest honest."


def test_prose_wrapped_json_is_extracted():
    raw = (
        "Sure, here is the coach message:\n"
        '{"reply": "Breathe, then start with the first set."}\n'
        "Hope that helps."
    )

    assert finalize_coach_reply(raw) == "Breathe, then start with the first set."


def test_fenced_json_reply_is_extracted():
    raw = '```json\n{"reply": "Drink water and get to bed on time."}\n```'

    assert finalize_coach_reply(raw) == "Drink water and get to bed on time."


def test_raw_prose_without_json_is_kept_when_clean():
    raw = "You've got this — one session at a time."

    assert finalize_coach_reply(raw) == raw


def test_ordinary_structure_word_is_not_stripped():
    raw = "Here's the structure of your week: lift Monday, rest Tuesday."

    assert finalize_coach_reply(raw) == raw


def test_leak_headings_are_stripped_when_coach_prose_remains():
    raw = (
        "Keep today easy and stop if pain shows up.\n"
        "Instructions:\n"
        "Key point:\n"
        "Structure:\n"
    )

    assert finalize_coach_reply(raw) == "Keep today easy and stop if pain shows up."


def test_athlete_context_dump_is_rejected():
    raw = (
        "ATHLETE_CONTEXT:\n"
        '{"as_of":"2026-08-13","profile":{"display_name":"Alex"}}\n'
    )

    assert finalize_coach_reply(raw) is None


def test_domain_facts_marker_is_rejected():
    raw = "DOMAIN_FACTS are authoritative. Today's workout is Push Day."

    assert finalize_coach_reply(raw) is None


def test_implementation_metadata_is_rejected():
    raw = "I used engines_invoked and engine_name to pick workout_coach_engine."

    assert finalize_coach_reply(raw) is None


def test_empty_or_whitespace_is_rejected():
    assert finalize_coach_reply("") is None
    assert finalize_coach_reply("   \n") is None


def test_heading_only_leak_outline_is_rejected():
    raw = "Instructions:\nKey point:\nStructure:\nTone:\nGrounding:\nSafety:\n"

    assert finalize_coach_reply(raw) is None


def test_empty_structured_reply_is_rejected():
    assert finalize_coach_reply('{"reply": "   "}') is None


def test_coach_llm_output_requires_reply():
    parsed = CoachLLMOutput.model_validate({"reply": "Train as planned."})
    assert parsed.reply == "Train as planned."
