"""Unit tests for :func:`~app.ai.intent.classify_intent`.

``classify_intent`` remains the Decision 024 LLM-primary helper for
non-chat callers. Interactive Coach chat turns use
:func:`_classify_intent_by_keyword` only (ADR-161) and do not call this
function. These tests keep the public classify contract unchanged.
"""

import pytest

from app.ai.contracts import Intent
from app.ai.intent import _classify_intent_by_keyword, classify_intent
from app.ai.llm_provider import LLMCompletion, LLMProviderError, MockLLMProvider


@pytest.fixture()
def llm_provider(mocker):
    provider = mocker.Mock()
    provider.complete = mocker.AsyncMock()
    return provider


async def test_uses_the_llm_label_when_it_parses_to_a_valid_intent(llm_provider):
    llm_provider.complete.return_value = LLMCompletion(content="nutrition")

    result = await classify_intent("does not matter what this says", llm_provider)

    assert result == Intent.NUTRITION


async def test_llm_label_matching_is_case_and_whitespace_insensitive(llm_provider):
    llm_provider.complete.return_value = LLMCompletion(content="  Recovery.\n")

    result = await classify_intent("anything", llm_provider)

    assert result == Intent.RECOVERY


async def test_falls_back_to_keyword_matching_when_the_llm_response_is_unparseable(llm_provider):
    llm_provider.complete.return_value = LLMCompletion(content="I'm not sure, maybe workout-ish?")

    result = await classify_intent("What's my workout for today?", llm_provider)

    assert result == Intent.WORKOUT


async def test_falls_back_to_keyword_matching_when_the_llm_call_raises(llm_provider):
    llm_provider.complete.side_effect = LLMProviderError("upstream timeout")

    result = await classify_intent("I'm feeling sore today", llm_provider)

    assert result == Intent.RECOVERY


async def test_falls_back_to_general_when_neither_llm_nor_keywords_match(llm_provider):
    llm_provider.complete.return_value = LLMCompletion(content="not a real label")

    result = await classify_intent("How's it going?", llm_provider)

    assert result == Intent.GENERAL


async def test_mock_provider_always_falls_back_to_keyword_matching():
    """Under ``AI_PROVIDER=mock``, the LLM path always loses to the keyword fallback.

    ``MockLLMProvider.complete`` returns a fixed placeholder string that
    never parses as a valid ``Intent`` label, so behavior stays fully
    deterministic — no special-casing required anywhere else.
    """
    provider = MockLLMProvider()
    message = "What should I eat for dinner tonight?"

    result = await classify_intent(message, provider)

    assert result == _classify_intent_by_keyword(message)
    assert result == Intent.NUTRITION


class TestClassifyIntentByKeyword:
    """Direct unit tests for the underlying keyword matcher, unchanged since before Sprint 4.6."""

    @pytest.mark.parametrize(
        ("message", "expected"),
        [
            ("What's my workout today?", Intent.WORKOUT),
            ("What should I eat for lunch?", Intent.NUTRITION),
            ("I'm feeling really sore and fatigued", Intent.RECOVERY),
            ("How is my progress toward my goal?", Intent.PROGRESS),
            ("Hey, how's it going?", Intent.GENERAL),
        ],
    )
    def test_classifies_by_keyword(self, message: str, expected: Intent) -> None:
        assert _classify_intent_by_keyword(message) == expected
