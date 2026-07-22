# Prompt Composition Engine

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-23  
**Purpose:** Document the Prompt Composition Engine domain foundation (Sprint 19.1).  
**Source of Truth:** Yes — for Prompt Composition Engine layout, Prompt Package, and Future Provider Mapping on mobile.

Related: [ARCHITECTURE.md](./ARCHITECTURE.md), [CONVERSATION_ORCHESTRATOR.md](./CONVERSATION_ORCHESTRATOR.md), [COACH_INTELLIGENCE.md](./COACH_INTELLIGENCE.md), [AI_SYSTEM.md](./AI_SYSTEM.md), [DECISIONS.md](./DECISIONS.md) (ADR-048).

---

## Architecture Summary

```
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

This layer transforms an immutable **Conversation Context** into an immutable **Prompt Package** of structured blocks.

It consumes:

- immutable `ConversationContext` (required)

It may optionally reference (read-only):

- `CoachingContext`
- `InsightSnapshot`

It produces:

- immutable `PromptPackage`
- frozen `PromptSnapshot`
- frozen `PromptEngineResult`

It is **not**:

- an AI provider
- provider-specific prompt string generation
- LLM / OpenAI / Anthropic / Gemini / Ollama
- networking / HTTP
- persistence

Module: `app/src/features/prompt-composition/`.

---

## Prompt Package

Deterministic composition facts only:

| Model | Role |
|-------|------|
| **PromptPackage** | Primary immutable output (context, identity, knowledge, conversation, memory, constraints, safety, user input, instructions, blocks, sections, summary) |
| **PromptBlock** | Modular structured block (type, section, priority, order, statement, refs) |
| **PromptBlockType** | Extensible block kinds (`system` / `identity` / `knowledge` / `conversation` / `memory` / `constraints` / `safety` / `user_input` + reserved `tools` / `images` / `files` / `vision` / `audio` / `reasoning`) |
| **PromptSection** | Logical section grouping for blocks |
| **PromptPriority** | Ranking score 1–100 |
| **PromptMetadata** | Tags + attributes |
| **PromptContext** | Upstream id linkage + composition timestamp |
| **PromptConstraints** | Aggregated constraint ids / codes |
| **PromptInstruction** | Structured composition instruction facts |
| **PromptKnowledge** | Aggregated knowledge references |
| **PromptConversation** | Goal / turn / message structure refs |
| **PromptMemory** | Memory refs (placeholder-capable) |
| **PromptSafety** | Safety composition markers |
| **PromptIdentity** | Audience / role identity facts |
| **PromptUserInput** | Structured user-input slot from ConversationRequest |
| **PromptSummary** | Compact public summary of a Prompt Package |
| **PromptSnapshot** | Frozen composition artifact |
| **PromptEngineResult** | Snapshot + package + summary + validation issues |
| **PromptCompositionInput** | Engine input contract |
| **PromptEngineError** | Hard composition failure |

Statements are **composition facts**, never provider-ready prompt strings.

---

## Prompt Blocks

Supported today:

| Block | Composer |
|-------|----------|
| System | `SystemComposer` |
| Identity | `IdentityComposer` |
| Safety | `SafetyComposer` |
| Constraints | `ConstraintComposer` |
| Knowledge | `KnowledgeComposer` |
| Memory | `MemoryComposer` |
| Conversation | `ConversationComposer` |
| User Input | `UserInputComposer` |

Architecture reserves future blocks without redesign:

- Tools
- Images
- Files
- Vision
- Audio
- Reasoning

---

## Composers (one responsibility each)

| Composer | Emits |
|----------|--------|
| `SystemComposer` | System block + instructions |
| `IdentityComposer` | `PromptIdentity` + identity block |
| `KnowledgeComposer` | `PromptKnowledge` + knowledge block |
| `ConversationComposer` | `PromptConversation` + conversation block |
| `MemoryComposer` | `PromptMemory` + memory block |
| `ConstraintComposer` | `PromptConstraints` + constraints block |
| `SafetyComposer` | `PromptSafety` + safety block |
| `UserInputComposer` | `PromptUserInput` + user-input block |
| `SummaryComposer` | `PromptSummary` |

---

## Engine Responsibilities

`PromptCompositionEngine.compose()`:

1. Require `ConversationContext` (hard error if missing)  
2. Soft-validate optional upstream id alignment + missing information  
3. Run isolated composers  
4. Normalize priorities, sort blocks, aggregate sections  
5. Build `PromptPackage` + `PromptSummary` + `PromptSnapshot`  
6. Validate snapshot integrity (consistency, duplicates, mandatory blocks, ordering, priorities)  
7. Return frozen `PromptEngineResult`

---

## Public Application API

| Function | Role |
|----------|------|
| `composePromptPackage(options)` | Compose prompt package → snapshot + package + summary |
| `createPromptSnapshot(package, options?)` | Snapshot from existing package |
| `summarizePromptPackage(package \| snapshot)` | Public summary extraction |

Engine internals are not part of the public API surface.

---

## Future Provider Mapping

Provider-specific prompt rendering is **reserved in architecture only**.

| Concern | Future |
|---------|--------|
| Input | `PromptPackage` / `PromptSnapshot` (read-only structured blocks) |
| Consumer | Future Provider Abstraction |
| Mapping | Blocks → provider message roles / parts **outside** this domain |
| Rules | Prompt Composition Engine remains non-AI; Provider Abstraction owns provider strings / SDKs |

Future AI Providers (OpenAI / Anthropic / Gemini / Ollama / etc.) consume artifacts from Future Provider Abstraction — never from Conversation Orchestrator or Prompt Composition Engine directly.

---

## Explicit Non-Goals

No AI, networking, HTTP, persistence, OpenAI, Anthropic, Gemini, Ollama, or provider-specific string prompt generation. Does not modify Conversation Orchestrator, Coach Intelligence, or Insight Engine.
