"""Unit tests for :class:`~app.ai.llm_provider.MockLLMProvider`.

Asserts the one property this stand-in exists to guarantee: fully
deterministic, offline completions — no randomness, no network I/O.
"""

import pytest

from app.ai.llm_provider import LLMMessage, MockLLMProvider, get_llm_provider


@pytest.fixture()
def provider() -> MockLLMProvider:
    return MockLLMProvider()


async def test_complete_is_deterministic_for_the_same_input(provider):
    messages = [LLMMessage(role="user", content="What should I train today?")]

    first = await provider.complete(messages)
    second = await provider.complete(messages)

    assert first.content == second.content


async def test_complete_references_the_latest_message_content(provider):
    messages = [
        LLMMessage(role="user", content="earlier message"),
        LLMMessage(role="assistant", content="an earlier reply"),
        LLMMessage(role="user", content="What should I train today?"),
    ]

    result = await provider.complete(messages)

    assert "What should I train today?" in result.content
    assert "earlier message" not in result.content


async def test_complete_handles_an_empty_message_list(provider):
    result = await provider.complete([])

    assert isinstance(result.content, str)
    assert result.content != ""


def test_get_llm_provider_returns_mock_by_default():
    provider = get_llm_provider()

    assert isinstance(provider, MockLLMProvider)


def test_get_llm_provider_rejects_unsupported_provider_names(mocker):
    mocker.patch("app.ai.llm_provider.settings.ai_provider", "openai")

    with pytest.raises(ValueError, match="Unsupported AI_PROVIDER"):
        get_llm_provider()
