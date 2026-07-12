"""Provider-agnostic LLM abstraction.

``MockLLMProvider`` is the only implementation shipped this sprint — a
deterministic, offline stand-in with no network I/O and no API key. Real
vendor integration (OpenAI, Anthropic, etc.) is deferred to a later
sprint; see Decision 008 in ``docs/DECISIONS.md`` for why the abstraction
ships ahead of any concrete vendor. ``complete()`` is ``async`` because
that is the one call in the whole backend that will eventually cross a
real network boundary — see Decision 009 for why the async boundary is
scoped to exactly this interface and the Orchestrator that calls it.
"""

from abc import ABC, abstractmethod

from pydantic import BaseModel

from app.core.config import settings


class LLMMessage(BaseModel):
    """One message in a prompt, in the ``role``/``content`` shape every LLM API expects."""

    role: str
    content: str


class LLMCompletion(BaseModel):
    """The result of a single completion call."""

    content: str


class LLMProvider(ABC):
    """Abstract interface every LLM backend (mock or real) implements."""

    @abstractmethod
    async def complete(self, messages: list[LLMMessage]) -> LLMCompletion:
        """Return a completion for the given ordered list of prompt messages."""
        raise NotImplementedError


class MockLLMProvider(LLMProvider):
    """Deterministic, offline stand-in for a real LLM backend.

    Produces a templated acknowledgment referencing the latest user
    message — no randomness, no network I/O — so callers (including
    :class:`~app.ai.orchestrator.AIOrchestrator` and its tests) get
    fully reproducible output.
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


def get_llm_provider() -> LLMProvider:
    """Resolve the configured :class:`LLMProvider` implementation.

    Only ``settings.ai_provider == "mock"`` is supported until a real
    vendor is integrated in a later sprint.

    Raises:
        ValueError: If ``settings.ai_provider`` names an unsupported
            provider.
    """
    if settings.ai_provider == "mock":
        return MockLLMProvider()
    raise ValueError(
        f"Unsupported AI_PROVIDER '{settings.ai_provider}'. "
        "Only 'mock' is supported until a real provider is integrated."
    )
