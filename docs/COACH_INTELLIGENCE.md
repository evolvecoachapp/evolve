# Coach Intelligence

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-23  
**Purpose:** Document the Coach Intelligence domain foundation (Sprint 18.8).  
**Source of Truth:** Yes — for Coach Intelligence layout, Coaching Context, Future Prompt Builder, and Future AI Provider placeholders on mobile.

Related: [ARCHITECTURE.md](./ARCHITECTURE.md), [INSIGHT_ENGINE.md](./INSIGHT_ENGINE.md), [RECOVERY_INTELLIGENCE.md](./RECOVERY_INTELLIGENCE.md), [AI_SYSTEM.md](./AI_SYSTEM.md), [DECISIONS.md](./DECISIONS.md) (ADR-046).

---

## Architecture Summary

```
Insight Snapshot
      ↓
Coach Intelligence
      ↓
Coaching Context
      ↓
Conversation Orchestrator
      ↓
Conversation Context
      ↓
Future Prompt Builder
      ↓
Future AI Provider
```

This layer transforms **deterministic domain knowledge** into an immutable **Coaching Context**.

It consumes:

- immutable `InsightSnapshot` (required)

It may optionally reference (read-only):

- `RecoverySnapshot`
- `AthleteHistory`
- `AchievementResult`
- `PerformanceSnapshot`

It produces:

- immutable `CoachingContext`
- frozen `CoachContextSnapshot`
- frozen `CoachEngineResult`

It is **not**:

- an AI provider
- prompt generation
- LLM / OpenAI / Anthropic / Gemini / Ollama
- conversational responses
- networking / HTTP
- persistence

Module: `app/src/features/coach-intelligence/`.

---

## Coaching Context

Deterministic coaching preparation facts only:

| Model | Role |
|-------|------|
| **CoachingContext** | Primary immutable output (session, objectives, constraints, instructions, focus, evidence, knowledge, summary) |
| **CoachSession** | Upstream id linkage + preparation timestamp |
| **CoachObjective** | Structured objective derived from selected insights |
| **CoachIntent** | Intent code (`inform` / `reinforce` / `caution` / `celebrate` / `prepare` / `focus`) |
| **CoachPriority** | Ranking score 1–100 |
| **CoachConstraint** | Constraint facts (e.g. recovery status) |
| **CoachInstruction** | Structured instruction for future prompt builders (not a prompt) |
| **CoachFocus** | Focus areas selected from insights / history |
| **CoachEvidence** | Source attribution |
| **CoachMetadata** | Tags + attributes |
| **CoachingContextSummary** | Compact public summary of a Coaching Context (distinct from legacy history-backed `CoachSummary`) |
| **CoachContextSnapshot** | Frozen preparation artifact |
| **CoachEngineResult** | Snapshot + context + summary + validation issues |
| **CoachPreparation** | Selector run metadata + missing-information list |
| **CoachAudience** | Audience metadata (`athlete` / `system` / `review`) |
| **CoachCommunicationStyle** | Style preference metadata (not prompt text) |
| **CoachKnowledge** | Aggregated selected knowledge references |
| **CoachReason** | Deterministic reason code + factual statement |

Statements are **domain preparation facts**, never prompts or conversational replies.

---

## Selectors (one responsibility each)

| Selector | Emits |
|----------|--------|
| `InsightSelector` | Active insights from `InsightSnapshot` |
| `PrioritySelector` | Ranked insight ids / priorities |
| `EvidenceSelector` | `CoachEvidence` from selected insights |
| `RecoverySelector` | Recovery-derived `CoachConstraint` (optional) |
| `HistorySelector` | History-derived `CoachFocus` (optional) |
| `ObjectiveSelector` | `CoachObjective` from ranked insights |

---

## Engine Responsibilities

`CoachIntelligenceEngine.prepare()`:

1. Require `InsightSnapshot` (hard error if missing)  
2. Soft-validate optional upstream id alignment + missing information  
3. Run isolated selectors  
4. Normalize priorities, sort evidence/objectives  
5. Build instructions via `CoachInstructionBuilder`  
6. Build `CoachingContext` + `CoachSummary` + `CoachContextSnapshot`  
7. Validate snapshot integrity  
8. Return frozen `CoachEngineResult`

---

## Public Application API

| Function | Role |
|----------|------|
| `prepareCoachingContext(options)` | Prepare coaching context → snapshot + context + summary |
| `createCoachSnapshot(context, options?)` | Snapshot from existing context |
| `summarizeCoachingContext(context \| snapshot)` | Public summary extraction |

Engine internals are not part of the public API surface.

---

## Future Prompt Builder

Prompt composition is **reserved in architecture only**. Conversation Orchestrator (Sprint 19.0) now sits between Coaching Context and Future Prompt Builder; see [CONVERSATION_ORCHESTRATOR.md](./CONVERSATION_ORCHESTRATOR.md).

Future sprints may:

1. Consume `ConversationContext` (preferred) or `CoachingContext` / `CoachContextSnapshot` as structured input  
2. Map objectives, constraints, instructions, and style metadata into prompts **outside** this domain  
3. Keep Coach Intelligence free of prompt strings and provider SDKs  

Placeholder contract (not implemented):

| Concern | Future |
|---------|--------|
| Input | `ConversationContext` / `CoachingContext` (read-only) |
| Consumer | Prompt Builder |
| Rules | Coach Intelligence remains non-AI; Prompt Builder owns prompt text |

---

## Future AI Provider

LLM / provider calls are **reserved in architecture only**.

| Concern | Future |
|---------|--------|
| Input | Prompt artifacts from Future Prompt Builder |
| Consumer | AI Provider adapters (OpenAI / Anthropic / Gemini / Ollama / etc.) |
| Rules | Coach Intelligence never calls providers, never opens HTTP, never generates conversation |

---

## Explicit Non-Goals

No AI, prompt generation, networking, HTTP, persistence, OpenAI, Anthropic, Gemini, Ollama, or conversation generation. Does not modify Insight Engine, Recovery Intelligence, Athlete History, Achievement Engine, or Performance Engine.
