# Conversation Orchestrator

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-23  
**Purpose:** Document the Conversation Orchestrator domain foundation (Sprint 19.0).  
**Source of Truth:** Yes — for Conversation Orchestrator layout, Conversation Context, and handoff to Prompt Composition on mobile.

Related: [ARCHITECTURE.md](./ARCHITECTURE.md), [COACH_INTELLIGENCE.md](./COACH_INTELLIGENCE.md), [PROMPT_COMPOSITION.md](./PROMPT_COMPOSITION.md), [AI_SYSTEM.md](./AI_SYSTEM.md), [DECISIONS.md](./DECISIONS.md) (ADR-047).

---

## Architecture Summary

```
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

This layer coordinates flow between **Coach Intelligence** and future AI components by preparing an immutable **Conversation Context**.

It consumes:

- immutable `CoachingContext` (required)

It may optionally reference (read-only):

- `InsightSnapshot`
- `RecoverySnapshot`
- `AthleteHistory`
- `AchievementResult`
- `PerformanceSnapshot`

It produces:

- immutable `ConversationContext`
- frozen `ConversationSnapshot`
- frozen `ConversationEngineResult`

It is **not**:

- an AI provider
- prompt generation
- LLM / OpenAI / Anthropic / Gemini / Ollama
- conversational response generation
- networking / HTTP
- persistence

Module: `app/src/features/conversation-orchestrator/`.

---

## Conversation Context

Deterministic orchestration preparation facts only:

| Model | Role |
|-------|------|
| **ConversationContext** | Primary immutable output (session, goals, constraints, evidence, knowledge, turns, request, summary) |
| **ConversationSession** | Upstream id linkage + preparation timestamp |
| **ConversationGoal** | Structured goal derived from coaching objectives |
| **ConversationIntent** | Intent code (`inform` / `reinforce` / `caution` / `celebrate` / `prepare` / `focus` / `clarify`) |
| **ConversationPriority** | Ranking score 1–100 |
| **ConversationConstraint** | Constraint facts from coaching constraints |
| **ConversationMessage** | Structural message placeholder (not AI dialogue) |
| **ConversationTurn** | Structural turn sequencing (not generated replies) |
| **ConversationEvidence** | Source attribution |
| **ConversationMetadata** | Tags + attributes |
| **ConversationSummary** | Compact public summary of a Conversation Context |
| **ConversationSnapshot** | Frozen preparation artifact |
| **ConversationEngineResult** | Snapshot + context + summary + validation issues |
| **ConversationPreparation** | Selector run metadata + missing-information list |
| **ConversationAudience** | Audience metadata (`athlete` / `system` / `review`) |
| **ConversationState** | Orchestration state (`idle` / `preparing` / `ready` / `awaiting_response` / `closed`) |
| **ConversationStage** | Pipeline stage (`intake` / `context_ready` / `request_ready` / `handoff`) |
| **ConversationKnowledge** | Aggregated selected knowledge references |
| **ConversationRequest** | Structured handoff for Prompt Composition Engine (not a prompt string) |
| **ConversationResponsePlaceholder** | Reserved empty slot for Future AI Provider (`provider`/`content` always null here) |
| **ConversationReason** | Deterministic reason code + factual statement |

Statements are **orchestration preparation facts**, never prompts or conversational replies.

---

## Selectors (one responsibility each)

| Selector | Emits |
|----------|--------|
| `KnowledgeSelector` | Aggregated knowledge from `CoachingContext` |
| `PrioritySelector` | Ranked objective ids / priorities |
| `GoalSelector` | `ConversationGoal` from ranked objectives |
| `EvidenceSelector` | `ConversationEvidence` from coaching evidence |
| `ConstraintSelector` | `ConversationConstraint` from coaching constraints |
| `SessionSelector` | `ConversationSession` linkage |

---

## Engine Responsibilities

`ConversationOrchestratorEngine.prepare()`:

1. Require `CoachingContext` (hard error if missing)  
2. Soft-validate optional upstream id alignment + missing information  
3. Run isolated selectors  
4. Normalize priorities, sort goals/evidence/constraints  
5. Build structural message/turn placeholders (not AI dialogue)  
6. Build `ConversationRequest` + reserved `ConversationResponsePlaceholder`  
7. Build `ConversationContext` + `ConversationSummary` + `ConversationSnapshot`  
8. Validate snapshot integrity  
9. Return frozen `ConversationEngineResult`

---

## Public Application API

| Function | Role |
|----------|------|
| `prepareConversation(options)` | Prepare conversation context → snapshot + context + summary |
| `createConversationSnapshot(context, options?)` | Snapshot from existing context |
| `summarizeConversation(context \| snapshot)` | Public summary extraction |

Engine internals are not part of the public API surface.

---

## Downstream: Prompt Composition Engine

Prompt composition from `ConversationContext` is implemented in Sprint 19.1 — see [PROMPT_COMPOSITION.md](./PROMPT_COMPOSITION.md).

| Concern | Status |
|---------|--------|
| Input | `ConversationContext` / `ConversationRequest` (read-only) |
| Consumer | Prompt Composition Engine → immutable `PromptPackage` |
| Rules | Conversation Orchestrator remains non-AI; Prompt Composition owns structured blocks only (no provider strings) |

---

## Future Provider Abstraction / AI Providers

LLM / provider calls remain **reserved in architecture only** (after Prompt Package).

| Concern | Future |
|---------|--------|
| Input | `PromptPackage` / `PromptSnapshot` from Prompt Composition Engine |
| Consumer | Future Provider Abstraction → AI Provider adapters (OpenAI / Anthropic / Gemini / Ollama / etc.) |
| Rules | Conversation Orchestrator never calls providers, never opens HTTP, never fills `ConversationResponsePlaceholder` |

---

## Explicit Non-Goals

No AI, prompt generation, networking, HTTP, persistence, OpenAI, Anthropic, Gemini, Ollama, or conversation generation. Does not modify Coach Intelligence, Insight Engine, Recovery Intelligence, Athlete History, Achievement Engine, or Performance Engine.
