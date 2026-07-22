# Coach Intelligence

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-23  
**Purpose:** Document the Coach Intelligence domain foundation (Sprint 18.8).  
**Source of Truth:** Yes — for Coach Intelligence layout, Coaching Context, and downstream Conversation / Prompt Composition handoff on mobile.

Related: [ARCHITECTURE.md](./ARCHITECTURE.md), [INSIGHT_ENGINE.md](./INSIGHT_ENGINE.md), [RECOVERY_INTELLIGENCE.md](./RECOVERY_INTELLIGENCE.md), [CONVERSATION_ORCHESTRATOR.md](./CONVERSATION_ORCHESTRATOR.md), [PROMPT_COMPOSITION.md](./PROMPT_COMPOSITION.md), [AI_SYSTEM.md](./AI_SYSTEM.md), [DECISIONS.md](./DECISIONS.md) (ADR-046).

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
Prompt Composition Engine
      ↓
Prompt Package
      ↓
Future Provider Abstraction
      ↓
Future AI Providers
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

## Downstream: Conversation + Prompt Composition

Conversation Orchestrator (Sprint 19.0) and Prompt Composition Engine (Sprint 19.1) sit between Coaching Context and Future Provider Abstraction; see [CONVERSATION_ORCHESTRATOR.md](./CONVERSATION_ORCHESTRATOR.md) and [PROMPT_COMPOSITION.md](./PROMPT_COMPOSITION.md).

| Concern | Status |
|---------|--------|
| Input | `CoachingContext` (read-only) → Conversation Context → Prompt Package |
| Consumer | Conversation Orchestrator → Prompt Composition Engine |
| Rules | Coach Intelligence remains non-AI; Prompt Composition owns structured blocks only |

---

## Future Provider Abstraction / AI Providers

LLM / provider calls remain **reserved in architecture only** (after Prompt Package).

| Concern | Future |
|---------|--------|
| Input | `PromptPackage` from Prompt Composition Engine |
| Consumer | Future Provider Abstraction → AI Provider adapters (OpenAI / Anthropic / Gemini / Ollama / etc.) |
| Rules | Coach Intelligence never calls providers, never opens HTTP, never generates conversation |

---

## Explicit Non-Goals

No AI, prompt generation, networking, HTTP, persistence, OpenAI, Anthropic, Gemini, Ollama, or conversation generation. Does not modify Insight Engine, Recovery Intelligence, Athlete History, Achievement Engine, or Performance Engine.
