"""Unit tests for :class:`~app.ai.llm_provider.OpenAICompatibleLLMProvider`.

The ``AsyncOpenAI`` SDK client is dependency-injected (see the provider's
``client`` constructor parameter) and replaced here with a fake carrying
only ``chat.completions.create`` — no real network calls, no new test
dependency needed, matching the plan's "mock the SDK client object
directly, not raw HTTP" approach. Extends
``test_mock_llm_provider.py``'s coverage of :func:`~app.ai.llm_provider.get_llm_provider`.
"""

import httpx
import pytest
from openai import APIConnectionError, APIStatusError, APITimeoutError

from app.ai.llm_provider import (
    LLMMessage,
    LLMProviderError,
    OpenAICompatibleLLMProvider,
    OpenAIError,
    get_llm_provider,
)


def _fake_response(content: str | None):
    message = type("Message", (), {"content": content})()
    choice = type("Choice", (), {"message": message})()
    return type("Completion", (), {"choices": [choice]})()


@pytest.fixture()
def fake_client(mocker):
    client = mocker.Mock()
    client.chat.completions.create = mocker.AsyncMock(
        return_value=_fake_response("Great job this week!")
    )
    return client


@pytest.fixture()
def provider(fake_client) -> OpenAICompatibleLLMProvider:
    return OpenAICompatibleLLMProvider(
        api_key="test-key", model="gpt-test", client=fake_client
    )


async def test_complete_returns_the_client_response_content(provider, fake_client):
    result = await provider.complete([LLMMessage(role="user", content="How am I doing?")])

    assert result.content == "Great job this week!"
    fake_client.chat.completions.create.assert_called_once()
    _, kwargs = fake_client.chat.completions.create.call_args
    assert kwargs["model"] == "gpt-test"
    assert kwargs["messages"] == [{"role": "user", "content": "How am I doing?"}]


async def test_complete_raises_llm_provider_error_when_no_content_is_returned(
    provider, fake_client
):
    fake_client.chat.completions.create.return_value = _fake_response(None)

    with pytest.raises(LLMProviderError):
        await provider.complete([LLMMessage(role="user", content="hi")])


async def test_complete_raises_llm_provider_error_when_choices_is_empty(provider, fake_client):
    fake_client.chat.completions.create.return_value = type("Completion", (), {"choices": []})()

    with pytest.raises(LLMProviderError):
        await provider.complete([LLMMessage(role="user", content="hi")])


@pytest.mark.parametrize(
    "sdk_exception",
    [
        APITimeoutError(request=httpx.Request("POST", "https://example.test/v1/chat/completions")),
        APIConnectionError(request=httpx.Request("POST", "https://example.test/v1/chat/completions")),
        APIStatusError(
            "rate limited",
            response=httpx.Response(
                429, request=httpx.Request("POST", "https://example.test/v1/chat/completions")
            ),
            body=None,
        ),
        OpenAIError("generic SDK failure"),
    ],
)
async def test_complete_wraps_every_sdk_error_in_llm_provider_error(
    provider, fake_client, sdk_exception
):
    fake_client.chat.completions.create.side_effect = sdk_exception

    with pytest.raises(LLMProviderError):
        await provider.complete([LLMMessage(role="user", content="hi")])


def test_get_llm_provider_returns_openai_compatible_when_configured(mocker):
    mocker.patch("app.ai.llm_provider.settings.ai_provider", "openai_compatible")
    mocker.patch(
        "app.ai.llm_provider.settings.ai_llm_api_key",
        mocker.Mock(get_secret_value=lambda: "sk-fake"),
    )
    mocker.patch("app.ai.llm_provider.settings.ai_llm_model", "gpt-test")

    result = get_llm_provider()

    assert isinstance(result, OpenAICompatibleLLMProvider)


def test_get_llm_provider_requires_an_api_key_for_openai_compatible(mocker):
    mocker.patch("app.ai.llm_provider.settings.ai_provider", "openai_compatible")
    mocker.patch("app.ai.llm_provider.settings.ai_llm_api_key", None)

    with pytest.raises(ValueError, match="AI_LLM_API_KEY"):
        get_llm_provider()
