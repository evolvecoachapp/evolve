"""Intent classification for incoming Coach messages.

``classify_intent`` is explicitly a placeholder — simple keyword
matching, per the roadmap's original "intent routing stub" wording for
this sprint. It exists so :class:`~app.ai.orchestrator.AIOrchestrator`
has something to route on now; since no domain engine is registered yet
(Sprint 4.3+), every intent currently falls through to the same direct-LLM
fallback regardless of classification. A real classifier (LLM-based or
otherwise) replaces this once engines exist to route to.
"""

from app.ai.contracts import Intent

_KEYWORDS: dict[Intent, tuple[str, ...]] = {
    Intent.WORKOUT: ("workout", "exercise", "training", "reps", "sets", "program", "gym"),
    Intent.NUTRITION: ("meal", "nutrition", "diet", "calorie", "protein", "food", "eat"),
    Intent.RECOVERY: ("sleep", "recovery", "sore", "fatigue", "rest day", "injury", "pain"),
    Intent.PROGRESS: ("progress", "weight loss", "plateau", "trend", "goal"),
}


def classify_intent(message: str) -> Intent:
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
