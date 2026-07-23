# Prompt Builder

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-23  
**Purpose:** Document the Prompt Builder domain foundation (Sprint 19.1).  
**Source of Truth:** Yes — for Prompt Builder layout, Prompt Package composition from Conversation Context, and handoff to future AI providers on mobile.

Related: [ARCHITECTURE.md](./ARCHITECTURE.md), [PROMPT_COMPOSITION.md](./PROMPT_COMPOSITION.md), [CONVERSATION_ORCHESTRATOR.md](./CONVERSATION_ORCHESTRATOR.md), [DECISIONS.md](./DECISIONS.md) (ADR-055).

---

## Architecture Summary

```
Conversation Context
      ↓
Prompt Builder
      ↓
Prompt Package
      ↓
Future AI Provider
```

This layer transforms an immutable **Conversation Context** into an immutable **Prompt Package**.

It prepares every block required by future AI providers.

It consumes:

- immutable `ConversationContext` (required, read-only)

It produces:

- immutable `PromptPackage`
- frozen `PromptSnapshot`
- frozen `PromptBuildResult`
- aggregated `SystemPrompt` / `UserPrompt` (composition facts only)

It is **not**:

- an AI provider
- OpenAI / Anthropic / Gemini SDK usage
- networking / HTTP
- persistence
- prompt execution
- response generation

Module: `app/src/features/prompt-builder/`.

Legacy coach-backed `PromptContext` (hooks / repository / `getCoachPrompt`) remains under `models/coach/` and is separate from this Conversation Context → Prompt Package path.

---

## Prompt Package

Deterministic composition facts only:

| Model | Role |
|-------|------|
| **PromptPackage** | Primary immutable output |
| **PromptBlock** | Modular structured block |
| **SystemPrompt** / **UserPrompt** / **AssistantPrompt** | Role aggregates (assistant is placeholder-null; never generated) |
| **PromptTemplate** | Reusable provider-agnostic domain templates |
| **PromptPersona** / **PromptCapability** / **PromptKnowledge** | Identity + capability + knowledge aggregates |
| **PromptFormatting** / **PromptToolDefinition** / **PromptSafety** | Formatting, tool placeholders, safety |
| **PromptConstraint** / **PromptInstruction** | Constraints + instructions |
| **PromptComposition** / **PromptStatistics** | Composition record + approx stats |
| **PromptSummary** / **PromptSnapshot** / **PromptBuildResult** | Summary, snapshot, public build result |

---

## Prompt Blocks

Independent builders:

| Block | Builder |
|-------|---------|
| System | `SystemBlockBuilder` |
| Persona | `PersonaBlockBuilder` |
| Capabilities | `CapabilitiesBlockBuilder` |
| Knowledge | `KnowledgeBlockBuilder` |
| Conversation | `ConversationBlockBuilder` |
| Athlete | `AthleteBlockBuilder` |
| Recovery | `RecoveryBlockBuilder` |
| Insight | `InsightBlockBuilder` |
| Constraint | `ConstraintBlockBuilder` |
| Formatting | `FormattingBlockBuilder` |
| Tool | `ToolBlockBuilder` |
| Safety | `SafetyBlockBuilder` |
| Summary | `SummaryBlockBuilder` |

---

## Composer

`PromptComposer` receives `ConversationContext`, builds independent blocks, sorts them, aggregates role prompts / statistics / composition, freezes a `PromptPackage`, validates, and returns `PromptBuildResult`.

Deterministic only.

---

## Public Application API

| Function | Role |
|----------|------|
| `buildPromptPackage(options)` | ConversationContext → PromptBuildResult |
| `buildSystemPrompt(package)` | SystemPrompt from package |
| `buildUserPrompt(package)` | UserPrompt from package |
| `validatePromptPackage(package)` | Completeness + integrity issues |

No internal composer exposure required for consumers.

---

## Relationship to Prompt Composition

[PROMPT_COMPOSITION.md](./PROMPT_COMPOSITION.md) documents the parallel Sprint 19.1 Prompt Composition Engine (`features/prompt-composition`) with a related Prompt Package contract for the AI Provider Abstraction path.

Prompt Builder (`features/prompt-builder`) is the Conversation Context → Prompt Package foundation with independent block builders, domain templates, and role prompt aggregates, while preserving the legacy coach-backed path.
