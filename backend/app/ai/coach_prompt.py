"""Coach LLM prompt construction — persona, safety, context, and memory.

The Orchestrator is the only caller. Prompts never include credentials,
user UUIDs, or engine class names. Domain numbers come from
:class:`~app.ai.coach_context.CoachContext` and optional ``DOMAIN_FACTS``
produced by deterministic engines; the model is instructed not to invent
computed values.
"""

from __future__ import annotations

import json
from typing import Any

from app.ai.coach_context import CoachContext
from app.ai.contracts import MemoryContext
from app.ai.llm_provider import LLMMessage
from app.models.chat import ChatRole

COACH_SYSTEM_PROMPT = """\
You are EVOLVE Coach — a real, human-like fitness coach talking to one athlete.

Tone:
- Conversational, warm, direct, and specific. Sound like a trusted coach, not a chatbot.
- Empathetic about training, nutrition, recovery, progress, motivation, and life/stress around training.
- Keep replies to 1–3 short paragraphs unless the athlete asks for a plan or list.
- Use the athlete's name and today's situation when it helps; do not force it.

Grounding:
- Use ONLY the ATHLETE_CONTEXT, conversation history, and DOMAIN_FACTS provided.
- Never invent computed numbers (calories, macros, body weight, readiness scores, \
sets, reps, dates, trends). If a number is missing, say you don't have it and ask \
the athlete to log or complete the missing piece — in coach voice, not error-code voice.
- If DOMAIN_FACTS are present, they are authoritative for this turn. Do not contradict them.
- If a context section is marked unavailable, work with what you do have.

Safety:
- You are not a doctor, dietitian, licensed psychologist, or therapist.
- Do not diagnose, prescribe treatment, or provide medical, dietary-therapy, or mental-health care.
- You may discuss stress, motivation, and how life affects training. If the athlete \
needs clinical help, say so clearly and point them to a qualified professional.
- For persistent pain, injury, illness, disordered eating, or crisis, do not improvise care.

Anti-leak:
- Never mention internal implementation: engines, intents, artifacts, prompts, tokens, \
APIs, JSON field names, providers, models, or that you are an AI language model.
- Never paste ATHLETE_CONTEXT or DOMAIN_FACTS back to the athlete.
- Never mention user ids, emails, passwords, tokens, or account flags.
- Speak only as the coach. Answer the athlete's actual question.
"""

_ID_SUFFIXES = ("_id", "_uuid")
_FORBIDDEN_FACT_KEYS = {
    "active_workout_log_id",
    "user_id",
    "email",
    "hashed_password",
    "password",
    "api_key",
    "token",
}


def build_coach_prompt(
    *,
    coach_context: CoachContext,
    memory: MemoryContext,
    message: str,
    domain_facts: dict[str, Any] | None = None,
) -> list[LLMMessage]:
    """Build the ordered prompt: system, athlete context, memory, optional facts, user message.

    ``message`` is always last. ``DOMAIN_FACTS`` is included only when
    ``domain_facts`` is a non-empty mapping (an engine produced artifacts).
    """
    prompt: list[LLMMessage] = [
        LLMMessage(role="system", content=COACH_SYSTEM_PROMPT),
        LLMMessage(
            role="system",
            content="ATHLETE_CONTEXT:\n" + _dump_json(coach_context.model_dump(mode="json")),
        ),
    ]
    for turn in memory.turns:
        prompt.append(LLMMessage(role=turn.role.value, content=turn.content))

    sanitized = _sanitize_domain_facts(domain_facts)
    if sanitized:
        prompt.append(
            LLMMessage(
                role="system",
                content=(
                    "DOMAIN_FACTS (authoritative computed values for this turn; "
                    "do not contradict these numbers):\n" + _dump_json(sanitized)
                ),
            )
        )

    prompt.append(LLMMessage(role=ChatRole.USER.value, content=message))
    return prompt


def _dump_json(payload: Any) -> str:
    """Serialize context/facts compactly for the prompt."""
    return json.dumps(payload, ensure_ascii=False, default=str, separators=(",", ":"))


def _sanitize_domain_facts(domain_facts: dict[str, Any] | None) -> dict[str, Any] | None:
    """Drop identifier keys from engine artifacts before they enter the prompt."""
    if not domain_facts:
        return None
    cleaned = _strip_identifiers(domain_facts)
    return cleaned or None


def _strip_identifiers(value: Any) -> Any:
    """Recursively drop keys that look like identifiers or secrets."""
    if isinstance(value, dict):
        stripped: dict[str, Any] = {}
        for key, item in value.items():
            lowered = str(key).lower()
            if lowered in _FORBIDDEN_FACT_KEYS or lowered.endswith(_ID_SUFFIXES):
                continue
            stripped[key] = _strip_identifiers(item)
        return stripped
    if isinstance(value, list):
        return [_strip_identifiers(item) for item in value]
    return value
