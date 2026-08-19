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

_FENCE_BLOCK = re.compile(
    r"```(?:json)?\s*(.*?)\s*```",
    re.IGNORECASE | re.DOTALL,
)

_REPLY_FIELD = re.compile(
    r'"reply"\s*:\s*"((?:[^"\\]|\\.)*)"',
    re.DOTALL,
)

_LITERAL_ESCAPE = re.compile(r"\\([nrt\"\\])")


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
        reply = _reply_from_mapping(data)
        if reply is None:
            return None
        return _decode_escaped_sequences(reply)

    loose = _extract_reply_field_loosely(raw)
    if loose is not None:
        return _decode_escaped_sequences(loose)

    stripped = raw.strip() or None
    if stripped is None:
        return None
    return _decode_escaped_sequences(stripped)


def _reply_from_mapping(data: dict[str, Any]) -> str | None:
    """Return a non-empty ``reply`` string from a parsed object, if present."""
    try:
        parsed = CoachLLMOutput.model_validate(data)
    except ValidationError:
        reply = data.get("reply")
        if isinstance(reply, str) and reply.strip():
            return reply.strip()
        return None
    return parsed.reply.strip() or None


def _extract_json_object(raw: str) -> dict[str, Any] | None:
    """Return the first JSON object that contains a ``reply`` key, if any."""
    text = raw.strip()
    candidates = [text]
    fenced = _fenced_payload(text)
    if fenced is not None and fenced not in candidates:
        candidates.insert(0, fenced)

    for candidate in candidates:
        found = _parse_reply_object(candidate)
        if found is not None:
            return found
    return None


def _parse_reply_object(text: str) -> dict[str, Any] | None:
    """Parse ``text`` as JSON and return an object that contains ``reply``."""
    value: Any = _loads_json(text)
    if isinstance(value, str):
        value = _loads_json(value)
    if isinstance(value, dict) and "reply" in value:
        return value

    decoder = json.JSONDecoder(strict=False)
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


def _loads_json(text: str) -> Any:
    """Load JSON, allowing raw control characters inside strings.

    Weak models often insert real newlines inside ``reply`` instead of
    ``\\n``. Python's default ``strict=True`` rejects that as invalid, which
    used to fall through to the prose path and leak the JSON wrapper.
    """
    try:
        return json.loads(text, strict=False)
    except json.JSONDecodeError:
        return None


def _fenced_payload(text: str) -> str | None:
    """Return the inner body of a wrapping markdown fence, if one is present."""
    match = _FENCE_BLOCK.search(text)
    if match:
        inner = match.group(1).strip()
        return inner or None
    if not text.startswith("```"):
        return None
    text = re.sub(r"^```(?:json)?\s*", "", text, count=1, flags=re.IGNORECASE)
    return re.sub(r"\s*```\s*$", "", text).strip() or None


def _extract_reply_field_loosely(text: str) -> str | None:
    """Extract a ``reply`` string when the payload is near-JSON but not parseable."""
    match = _REPLY_FIELD.search(text)
    if not match:
        return None
    captured = match.group(1)
    try:
        decoded = json.loads(f'"{captured}"', strict=False)
    except json.JSONDecodeError:
        decoded = _decode_escaped_sequences(captured)
    if isinstance(decoded, str) and decoded.strip():
        return decoded.strip()
    return None


def _decode_escaped_sequences(text: str) -> str:
    """Turn leftover JSON-style ``\\n`` / ``\\t`` / ``\\r`` into real characters."""
    if "\\" not in text:
        return text
    mapping = {"n": "\n", "r": "\r", "t": "\t", '"': '"', "\\": "\\"}
    return _LITERAL_ESCAPE.sub(lambda match: mapping[match.group(1)], text)


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
