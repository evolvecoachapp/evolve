# Workout Agent

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-23  
**Purpose:** Document the Workout Agent foundation (Sprint 21.0).  
**Source of Truth:** Yes — for Workout Agent layout, reasoning / planning layers, and public API on mobile.

Related: [ARCHITECTURE.md](./ARCHITECTURE.md), [AGENT_RUNTIME.md](./AGENT_RUNTIME.md), [WORKOUT_INTELLIGENCE.md](./WORKOUT_INTELLIGENCE.md), [COACH_INTELLIGENCE.md](./COACH_INTELLIGENCE.md), [CONVERSATION_ORCHESTRATOR.md](./CONVERSATION_ORCHESTRATOR.md), [ACTION_ENGINE.md](./ACTION_ENGINE.md), [TOOL_RUNTIME.md](./TOOL_RUNTIME.md), [DECISIONS.md](./DECISIONS.md) (ADR-059).

---

## Architecture Summary

```
User Request
      ↓
Conversation Runtime
      ↓
Workout Agent
      ↓
Coach Intelligence
      ↓
Prompt Builder
      ↓
AI Provider
      ↓
Response Formatter
      ↓
Action Engine
      ↓
Tool Runtime
      ↓
Workout Domain
```

Module: `app/src/features/workout-agent/`.

The Workout Agent is the first intelligent domain agent of EVOLVE. It specializes in workout planning, programming, progression, exercise selection, and training conversations.

It consumes the complete AI Runtime but **owns no infrastructure**.

It does **not**:

- generate prompts
- call providers directly
- execute tools directly
- network / persist / render UI

It **orchestrates** existing components and organizes domain knowledge before AI interaction.

---

## Integration

### Consumes

| Input | Source |
|-------|--------|
| Conversation Context | Conversation Orchestrator |
| Conversation Memory | Coach memory (turn counts / history) |
| CoachResponse | Response Formatter (optional handoff) |
| ActionPlan | Action Engine (optional handoff) |
| ToolExecutionResult | Tool Runtime (optional feedback) |
| Workout Domain facts | Existing workout / selection / progression modules (delegated, not duplicated) |

### Produces

| Output | Role |
|--------|------|
| **WorkoutAgentResult** | Immutable primary agent output |
| WorkoutPlanProposal | Planning-only proposal |
| WorkoutDecision / Recommendations / Explanation | Decision surface |
| WorkoutValidation | Integrity checks |

---

## Module Layout

| Folder | Role |
|--------|------|
| `models/` | Immutable agent models |
| `agent/` | WorkoutAgent, Engine, Coordinator, Session, State |
| `orchestrator/` | Runtime artifact wiring |
| `reasoning/` | Deterministic reasoners (no AI) |
| `planning/` | Planners (no execution) |
| `strategies/` | Strength / Hypertrophy / Powerbuilding / Powerlifting / General Fitness |
| `policies/` | Safety / Recovery / Progression / Volume / Exercise |
| `selectors/` | Intent / Objective / Strategy / Split / Exercise / Recommendation |
| `builders/` | Context / Plan / Recommendation builders |
| `validators/` | Objective / split / exercise / volume / intensity / recovery / progression |
| `services/` | WorkoutAgentService |
| `application/` | Public API only |
| `utils/` | Metrics, helpers, FreezeAgentState |

---

## Reasoning Layer

Deterministic modules that organize domain knowledge **before** AI interaction:

- ExerciseReasoner
- ProgressionReasoner
- VolumeReasoner
- IntensityReasoner
- FatigueReasoner
- FrequencyReasoner
- SplitReasoner
- GoalReasoner

No AI. No provider logic.

---

## Planning Layer

Planners produce planning decisions only:

- WorkoutPlanner
- ProgressionPlanner
- ExercisePlanner
- SplitPlanner
- AccessoryPlanner
- DeloadPlanner
- RecoveryPlanner

No execution. No tool calls.

---

## Public API

```ts
processWorkoutRequest()
buildWorkoutPlan()
evaluateWorkout()
describeWorkoutCapabilities()
validateWorkoutPlan()
```

Internals (reasoners, planners, policies, engine) are not part of the public surface.

---

## Design Rules

- No OpenAI SDK / provider-specific logic
- No networking / persistence / UI
- No business logic duplication — delegate to existing domain modules whenever possible
- Workout Agent is an **orchestrator**, not a replacement for the Workout Domain
