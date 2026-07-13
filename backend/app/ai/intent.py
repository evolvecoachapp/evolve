"""Intent classification for incoming Coach messages.

``classify_intent`` is LLM-primary with a keyword-based fallback (Decision
024 in ``docs/DECISIONS.md``): it asks the configured
:class:`~app.ai.llm_provider.LLMProvider` to name one of the five
:class:`~app.ai.contracts.Intent` labels, and falls back to the original
keyword matcher (now :func:`_classify_intent_by_keyword`) whenever the LLM
call fails (:class:`~app.ai.llm_provider.LLMProviderError`) or returns
something that doesn't parse into a valid label. Under
``AI_PROVIDER=mock`` this *always* falls back to the keyword matcher — the
mock's fixed placeholder text never parses as a valid intent label — so
every existing test written against the mock provider's routing behavior
stays fully deterministic with no special-casing.
"""

from app.ai.contracts import Intent
from app.ai.llm_provider import LLMMessage, LLMProvider, LLMProviderError

_KEYWORDS: dict[Intent, tuple[str, ...]] = {
    Intent.WORKOUT: ("workout", "exercise", "training", "reps", "sets", "program", "gym"),
    Intent.NUTRITION: ("meal", "nutrition", "diet", "calorie", "protein", "food", "eat"),
    Intent.RECOVERY: ("sleep", "recovery", "sore", "fatigue", "rest day", "injury", "pain"),
    Intent.PROGRESS: ("progress", "weight loss", "plateau", "trend", "goal"),
}

_CLASSIFICATION_SYSTEM_PROMPT = (
    "Classify the user's message into exactly one of these categories: "
    "general, workout, nutrition, recovery, progress. "
    "Respond with only the single category word, nothing else."
)


async def classify_intent(message: str, llm_provider: LLMProvider) -> Intent:
    """Classify ``message`` into a coaching domain, LLM-first with a keyword fallback.

    Falls back to :func:`_classify_intent_by_keyword` if the LLM call
    raises :class:`~app.ai.llm_provider.LLMProviderError` or its response
    doesn't parse into a valid :class:`~app.ai.contracts.Intent` value —
    intent classification must never block the Coach from replying.
    """
    try:
        completion = await llm_provider.complete(
            [
                LLMMessage(role="system", content=_CLASSIFICATION_SYSTEM_PROMPT),
                LLMMessage(role="user", content=message),
            ]
        )
    except LLMProviderError:
        return _classify_intent_by_keyword(message)

    parsed = _parse_intent_label(completion.content)
    return parsed if parsed is not None else _classify_intent_by_keyword(message)


def _parse_intent_label(raw: str) -> Intent | None:
    """Parse a raw LLM completion into an :class:`Intent`, or ``None`` if it doesn't match one."""
    normalized = raw.strip().lower().strip(".!\"' ")
    try:
        return Intent(normalized)
    except ValueError:
        return None


def _classify_intent_by_keyword(message: str) -> Intent:
    """Classify ``message`` into a coaching domain by keyword matching.

    Checks each :class:`~app.ai.contracts.Intent`'s keyword list in a
    fixed order and returns the first match; falls back to
    :attr:`Intent.GENERAL` when nothing matches. Case-insensitive.
    """
    lowered = message.lower()
    for intent, keywords in _KEYWORDS.items():
        if any(keyword in lowered for keyword in keywords):
            return intent
    return Intent.GENERAL
