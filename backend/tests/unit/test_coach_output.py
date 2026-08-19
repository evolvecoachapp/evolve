"""Unit tests for :func:`~app.ai.coach_output.finalize_coach_reply`."""

from app.ai.coach_output import finalize_coach_reply
from app.ai.contracts import CoachLLMOutput


def test_structured_json_reply_is_extracted():
    raw = '{"reply": "Let\'s hit Push Day and keep the rest honest."}'

    result = finalize_coach_reply(raw)

    assert result == "Let's hit Push Day and keep the rest honest."
    assert '"reply"' not in result
    assert not result.startswith("{")


def test_json_with_leading_and_trailing_whitespace_is_extracted():
    raw = '\n  {"reply": "Train as planned."}  \n'

    assert finalize_coach_reply(raw) == "Train as planned."


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


def test_fenced_json_with_surrounding_whitespace_is_extracted():
    raw = '\n```json\n{"reply": "Drink water and get to bed on time."}\n```\n'

    assert finalize_coach_reply(raw) == "Drink water and get to bed on time."


def test_json_with_escaped_newlines_decodes_line_breaks():
    raw = '{"reply":"Certamente.\\n\\nRiposa oggi."}'

    result = finalize_coach_reply(raw)

    assert result == "Certamente.\n\nRiposa oggi."
    assert "\\n" not in result
    assert '"reply"' not in result


def test_json_with_raw_newlines_inside_reply_is_extracted():
    raw = '{"reply":"Certamente.\n\nRiposa oggi."}'

    result = finalize_coach_reply(raw)

    assert result == "Certamente.\n\nRiposa oggi."
    assert not result.startswith("{")
    assert '"reply"' not in result


def test_double_escaped_newlines_in_reply_become_line_breaks():
    raw = '{"reply":"Certamente.\\\\n\\\\nRiposa oggi."}'

    result = finalize_coach_reply(raw)

    assert result == "Certamente.\n\nRiposa oggi."
    assert "\\n" not in result


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
    assert finalize_coach_reply('{"reply": ""}') is None


def test_structured_reply_containing_leak_is_rejected():
    raw = '{"reply": "DOMAIN_FACTS are authoritative. Keep today easy."}'

    assert finalize_coach_reply(raw) is None


def test_coach_llm_output_requires_reply():
    parsed = CoachLLMOutput.model_validate({"reply": "Train as planned."})
    assert parsed.reply == "Train as planned."


def test_coach_llm_output_ignores_extra_keys():
    parsed = CoachLLMOutput.model_validate(
        {"reply": "Train as planned.", "intent": "workout", "debug": True}
    )
    assert parsed.model_dump() == {"reply": "Train as planned."}


def test_extra_json_keys_are_not_returned_to_the_user():
    raw = '{"reply": "Keep today easy.", "intent": "recovery", "debug": true}'

    assert finalize_coach_reply(raw) == "Keep today easy."


def test_json_encoded_string_payload_is_unwrapped():
    raw = '"{\\"reply\\":\\"Hello there.\\"}"'

    assert finalize_coach_reply(raw) == "Hello there."


def test_near_json_with_trailing_comma_extracts_reply():
    raw = '{"reply": "Keep going.",}'

    assert finalize_coach_reply(raw) == "Keep going."
