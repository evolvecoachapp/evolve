# Context Fusion Engine

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-25  
**Purpose:** Document the Context Fusion Engine — immutable unified coaching context from all runtime sources.  
**Source of Truth:** Yes — for Context Fusion Engine layout, aggregation, resolution, boundaries, and public API on mobile.

Related: [DECISION_PIPELINE.md](./DECISION_PIPELINE.md), [STATE_MANAGEMENT.md](./STATE_MANAGEMENT.md), [AI_RUNTIME.md](./AI_RUNTIME.md), [ARCHITECTURE.md](./ARCHITECTURE.md), [ATHLETE_STATE_ENGINE.md](./ATHLETE_STATE_ENGINE.md), [COACHING_SESSION_RUNTIME.md](./COACHING_SESSION_RUNTIME.md), [DECISIONS.md](./DECISIONS.md) (ADR-072).

---

## Responsibilities

Context Fusion Engine owns **immutable context fusion only**.

It **does**:

- fuse conversation, coaching session, athlete state, specialist agent, and supervisor context into one `UnifiedCoachingContext`
- aggregate opaque source slices deterministically
- resolve conflicts by fixed priority tables
- produce `ContextSnapshot`, `ContextSummary`, `ContextPackage`, and `DecisionEngineContext`
- expose a narrow public application API

It **does not**:

- perform AI reasoning / prompts / provider calls
- perform business calculations or domain scoring
- persist state
- network
- render UI
- invoke Decision Engine logic

Module: `app/src/features/context-fusion/`.

---

## Architecture Summary

```
Conversation Runtime
+
Coaching Session Runtime
+
Athlete State Engine
+
Workout Agent
+
Nutrition Agent
+
Recovery Agent
+
Goal Agent
+
Coach Supervisor Context
      ↓
Context Fusion Engine
      ↓
Unified Coaching Context
      ↓
Decision Engine
```

---

## Module Boundaries

| Layer | Role |
|-------|------|
| `models/` | Immutable context / source / merge / conflict / snapshot / result types |
| `fusion/` | `ContextFusionEngine` / `ContextFusionCoordinator` / `ContextFusionSession` |
| `aggregation/` | Deterministic conversation / session / athlete / specialist / supervisor aggregators |
| `resolution/` | Priority / source / version / conflict / merge / context resolvers |
| `builders/` | Unified context / snapshot / summary / package / decision-engine context |
| `validators/` | Integrity / version / dependencies / merge / conflict / snapshot / timeline |
| `policies/` | Merge / integrity / priority / conflict / version / consistency |
| `selectors/` | Context / source / priority / snapshot / section / dependency |
| `contracts/` | Upstream ports (+ mocks) |
| `application/` | Narrow public API |
| `services/` | `ContextFusionService` facade |

---

## Public API

| Function | Purpose |
|----------|---------|
| `buildUnifiedContext` | Fuse upstream contributions into immutable `UnifiedCoachingContext` |
| `mergeContexts` | Merge additional contributions into existing fused context |
| `validateUnifiedContext` | Validate stored / requested unified context |
| `describeContext` | Describe engine capabilities |
| `createContextSnapshot` | Capture point-in-time `ContextSnapshot` |

Root export: models + application + `ContextFusionService` only — internal modules are not part of the public surface.

---

## Integration

| Consumes | Via |
|----------|-----|
| Conversation Runtime | `ConversationRuntimePort` (mock in tests) |
| Coaching Session Runtime | `CoachingSessionPort` (mock in tests) |
| Athlete State Engine | `AthleteStatePort` (mock in tests) |
| Workout Agent | `WorkoutAgentPort` (mock in tests) |
| Nutrition Agent | `NutritionAgentPort` (mock in tests) |
| Recovery Agent | `RecoveryAgentPort` (mock in tests) |
| Goal Agent | `GoalAgentPort` (mock until Goal Agent lands) |
| Coach Supervisor Context | `SupervisorPort` (mock in tests) |

| Produces | Types |
|----------|-------|
| Unified context | `UnifiedCoachingContext`, `ContextSnapshot`, `ContextSummary` |
| Decision handoff | `DecisionEngineContext`, `ContextPackage` |

---

## Design Rules

- No OpenAI SDK
- No Prompt Builder
- No Tool Runtime
- No AI reasoning
- No business calculations
- No networking
- No persistence
- No UI
- Context fusion only
