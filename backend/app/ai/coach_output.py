"""Parse and sanitize Coach LLM completions before they reach the user.

The Orchestrator is the only caller. Completions may be structured JSON
``{"reply": "..."}`` or raw prose from weaker/free models. Only a
sanitized user-facing reply is returned; leaked prompt or implementation
content is stripped or rejected so it is never persisted.
"""

from __future__ import annotations

import json
import re
from typing import Any

from pydantic import ValidationError

from app.ai.contracts import CoachLLMOutput

# Heading-only leak patterns. Do not match ordinary words mid-sentence
# (e.g. "here's the structure of your week").
_LEAK_HEADING = re.compile(
    r"(?im)^[ \t]*(?:#{1,6}[ \t]+|\*\*|__)?(?:"
    r"ATHLETE_CONTEXT|DOMAIN_FACTS|"
    r"Instructions|Key[ \t]+points?|"
    r"Structure|Tone|Grounding|Safety|Anti-?leak|"
    r"Implementation(?:[ \t]+(?:notes?|details?|meta(?:data)?|instructions?))?|"
    r"Meta(?:data)?(?:[ \t]+instructions?)?|"
    r"System[ \t]+prompt"
    r")[ \t]*(?::|\*\*|__)?[ \t]*.*$"
)

# Tokens that must never appear in a user-facing reply, even mid-sentence.
_INLINE_LEAK = re.compile(
    r"(?i)(?:"
    r"\bATHLETE_CONTEXT\b|"
    r"\bDOMAIN_FACTS\b|"
    r"\bengines_invoked\b|"
    r"\bcoach_context\b|"
    r"\bclassify_intent\b|"
    r"\bLLMProvider\b|"
    r"\bAI_PROVIDER\b|"
    r"you are (?:an |a )?(?:AI )?language model|"
    r"as an AI language model"
    r")"
)

_META_INLINE = re.compile(
    r"(?i)(?:"
    r"\bengine_name\b|"
    r"\bIntent\.(?:GENERAL|WORKOUT|NUTRITION|RECOVERY|PROGRESS)\b|"
    r"internal (?:prompt|implementation|metadata)|"
    r"JSON field names"
    r")"
)

_CONTEXT_DUMP = re.compile(
    r'(?i)"(?:as_of|display_name|readiness_score|today_workout_name|engines_invoked)"'
)


def finalize_coach_reply(raw: str) -> str | None:
    """Return a sanitized user-facing reply, or ``None`` if it cannot be salvaged.

    ``None`` means the Orchestrator must fall back to an engine template or
    the fixed apology — never persist ``raw``.
    """
    if not raw or not raw.strip():
        return None
    candidate = _extract_reply(raw)
    if candidate is None:
        return None
    cleaned = _sanitize_reply(candidate)
    if cleaned is None or not cleaned.strip():
        return None
    if _still_leaks(cleaned):
        return None
    return cleaned.strip()


def _extract_reply(raw: str) -> str | None:
    """Prefer a structured ``reply`` field; otherwise treat ``raw`` as prose."""
    data = _extract_json_object(raw)
    if data is not None:
        try:
            parsed = CoachLLMOutput.model_validate(data)
        except ValidationError:
            reply = data.get("reply")
            if isinstance(reply, str) and reply.strip():
                return reply.strip()
            return None
        return parsed.reply.strip() or None
    return raw.strip() or None


def _extract_json_object(raw: str) -> dict[str, Any] | None:
    """Return the first JSON object that contains a ``reply`` key, if any."""
    text = _strip_code_fences(raw.strip())
    decoder = json.JSONDecoder()
    for index, char in enumerate(text):
        if char != "{":
            continue
        try:
            data, _end = decoder.raw_decode(text, index)
        except json.JSONDecodeError:
            continue
        if isinstance(data, dict) and "reply" in data:
            return data
    return None


def _strip_code_fences(text: str) -> str:
    """Remove a wrapping markdown fence so weak models' ```json blocks parse."""
    if not text.startswith("```"):
        return text
    text = re.sub(r"^```(?:json)?\s*", "", text, count=1, flags=re.IGNORECASE)
    return re.sub(r"\s*```\s*$", "", text)


def _sanitize_reply(text: str) -> str | None:
    """Drop leak-heading lines and obvious context-dump lines."""
    kept: list[str] = []
    for line in text.splitlines():
        if _LEAK_HEADING.match(line):
            continue
        stripped = line.strip()
        if stripped.startswith("{") and _CONTEXT_DUMP.search(stripped):
            continue
        kept.append(line)
    cleaned = re.sub(r"\n{3,}", "\n\n", "\n".join(kept)).strip()
    return cleaned or None


def _still_leaks(text: str) -> bool:
    """True when remaining text still contains prompt or implementation leakage."""
    if _INLINE_LEAK.search(text):
        return True
    if _META_INLINE.search(text):
        return True
    if _LEAK_HEADING.search(text):
        return True
    if _CONTEXT_DUMP.search(text) and text.lstrip().startswith("{"):
        return True
    return False
