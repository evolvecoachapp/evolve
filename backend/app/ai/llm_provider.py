"""Provider-agnostic LLM abstraction.

``MockLLMProvider`` remains the deterministic, offline stand-in used by
default and by every existing test. ``OpenAICompatibleLLMProvider`` is the
real vendor integration deferred by Decision 008 — a generic OpenAI-compatible
HTTP endpoint (OpenAI itself, Azure OpenAI, OpenRouter, or a local
OpenAI-compatible server), selected purely through configuration rather than
a hardcoded vendor SDK choice (see Decision 020 in ``docs/DECISIONS.md``).
``complete()`` is ``async`` because that is the one call in the whole backend
that crosses a real network boundary — see Decision 009 for why the async
boundary is scoped to exactly this interface and the Orchestrator that calls
it (later extended to :func:`app.ai.intent.classify_intent` and
:class:`app.ai.progress_analyzer.ProgressAnalyzer` — see Decisions 023/024).
"""

from abc import ABC, abstractmethod

from openai import (
    APIConnectionError,
    APIStatusError,
    APITimeoutError,
    AsyncOpenAI,
    OpenAIError,
)
from pydantic import BaseModel

from app.core.config import settings


class LLMMessage(BaseModel):
    """One message in a prompt, in the ``role``/``content`` shape every LLM API expects."""

    role: str
    content: str


class LLMCompletion(BaseModel):
    """The result of a single completion call."""

    content: str


class LLMProviderError(Exception):
    """Raised whenever an :class:`LLMProvider` implementation fails to produce a completion.

    The single error type every caller (:class:`~app.ai.orchestrator.AIOrchestrator`,
    :func:`~app.ai.intent.classify_intent`,
    :class:`~app.ai.progress_analyzer.ProgressAnalyzer`) ever needs to catch
    for graceful degradation — each concrete provider is responsible for
    translating its own vendor/SDK-specific exceptions (timeouts, auth
    failures, rate limits, connection errors) into this one type, so callers
    never need vendor-specific knowledge (see Decision 021 in
    ``docs/DECISIONS.md``).
    """


class LLMProvider(ABC):
    """Abstract interface every LLM backend (mock or real) implements."""

    @abstractmethod
    async def complete(self, messages: list[LLMMessage]) -> LLMCompletion:
        """Return a completion for the given ordered list of prompt messages.

        Raises:
            LLMProviderError: If the underlying call fails for any reason.
        """
        raise NotImplementedError


class MockLLMProvider(LLMProvider):
    """Deterministic, offline stand-in for a real LLM backend.

    Produces a templated acknowledgment referencing the latest user
    message — no randomness, no network I/O — so callers (including
    :class:`~app.ai.orchestrator.AIOrchestrator` and its tests) get
    fully reproducible output. Never raises :class:`LLMProviderError`.
    """

    async def complete(self, messages: list[LLMMessage]) -> LLMCompletion:
        """Return a deterministic completion derived from the last message's content."""
        last_content = messages[-1].content if messages else ""
        return LLMCompletion(
            content=(
                "This is a placeholder response from the mock LLM provider "
                f"(no real model is wired up yet). You said: {last_content!r}"
            )
        )


class OpenAICompatibleLLMProvider(LLMProvider):
    """Real LLM provider targeting any OpenAI-compatible chat completions endpoint.

    Deliberately vendor-generic rather than hardcoded to OpenAI itself — the
    same implementation works against OpenAI, Azure OpenAI, OpenRouter, or a
    local OpenAI-compatible server purely through ``base_url``/``api_key``/
    ``model`` configuration (see Decision 020 in ``docs/DECISIONS.md``).
    """

    def __init__(
        self,
        api_key: str,
        model: str,
        *,
        base_url: str | None = None,
        timeout_seconds: float = 30.0,
        max_output_tokens: int = 500,
        client: AsyncOpenAI | None = None,
    ) -> None:
        """Construct the provider.

        Args:
            api_key: The vendor API key.
            model: The model name passed to every completion call.
            base_url: Optional override for the API base URL; ``None`` uses
                the SDK's default (OpenAI's own API).
            timeout_seconds: Per-request timeout.
            max_output_tokens: Maximum tokens requested per completion.
            client: An optional pre-constructed client — dependency-injected
                so unit tests can supply a fake/mocked client instead of a
                real ``AsyncOpenAI`` instance.
        """
        self._model = model
        self._max_output_tokens = max_output_tokens
        self._client = client or AsyncOpenAI(
            api_key=api_key, base_url=base_url, timeout=timeout_seconds
        )

    async def complete(self, messages: list[LLMMessage]) -> LLMCompletion:
        """Call the configured chat completions endpoint and return its reply.

        Raises:
            LLMProviderError: If the SDK call raises any ``OpenAIError``
                (timeouts, auth failures, rate limits, connection errors, or
                a non-2xx API response).
        """
        try:
            response = await self._client.chat.completions.create(
                model=self._model,
                messages=[{"role": m.role, "content": m.content} for m in messages],
                max_tokens=self._max_output_tokens,
            )
        except (APITimeoutError, APIConnectionError, APIStatusError, OpenAIError) as exc:
            raise LLMProviderError(f"LLM completion call failed: {exc}") from exc

        content = response.choices[0].message.content if response.choices else None
        if not content:
            raise LLMProviderError("LLM completion call returned no content.")
        return LLMCompletion(content=content)


def get_llm_provider() -> LLMProvider:
    """Resolve the configured :class:`LLMProvider` implementation.

    Constructs a fresh instance on every call, matching the pre-existing
    per-request wiring in ``app.core.dependencies`` (not cached, so tests
    that monkeypatch ``settings.ai_provider`` between calls see the change
    immediately).

    Raises:
        ValueError: If ``settings.ai_provider`` names an unsupported
            provider, or if ``'openai_compatible'`` is selected without
            ``settings.ai_llm_api_key`` configured.
    """
    if settings.ai_provider == "mock":
        return MockLLMProvider()
    if settings.ai_provider == "openai_compatible":
        if settings.ai_llm_api_key is None:
            raise ValueError(
                "AI_PROVIDER='openai_compatible' requires AI_LLM_API_KEY to be set."
            )
        return OpenAICompatibleLLMProvider(
            api_key=settings.ai_llm_api_key.get_secret_value(),
            model=settings.ai_llm_model,
            base_url=settings.ai_llm_base_url,
            timeout_seconds=settings.ai_llm_timeout_seconds,
            max_output_tokens=settings.ai_llm_max_output_tokens,
        )
    raise ValueError(
        f"Unsupported AI_PROVIDER '{settings.ai_provider}'. "
        "Supported values: 'mock', 'openai_compatible'."
    )
