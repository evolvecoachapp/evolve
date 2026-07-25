# Decision Engine

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-25  
**Purpose:** Document the Decision Engine — deterministic orchestration from UnifiedCoachingContext to immutable CoachingDecisions.  
**Source of Truth:** Yes — for Decision Engine layout, analysis / evaluation / planning / resolution, boundaries, and public API on mobile.

Related: [DECISION_PIPELINE.md](./DECISION_PIPELINE.md), [CONTEXT_FUSION_ENGINE.md](./CONTEXT_FUSION_ENGINE.md), [AI_RUNTIME.md](./AI_RUNTIME.md), [ARCHITECTURE.md](./ARCHITECTURE.md), [COACHING_SESSION_RUNTIME.md](./COACHING_SESSION_RUNTIME.md), [STATE_MANAGEMENT.md](./STATE_MANAGEMENT.md), [DECISIONS.md](./DECISIONS.md) (ADR-073).

---

## Responsibilities

Decision Engine owns **deterministic decision orchestration only**.

It **does**:

- transform `UnifiedCoachingContext` / `DecisionEngineContext` into one or more immutable `CoachingDecision`s
- run structural analysis, evaluation, planning, and resolution
- produce `DecisionPackage`, `DecisionGraph`, `DecisionSummary`, and `RecommendationEngineInput`
- expose a narrow public application API

It **does not**:

- perform AI reasoning / prompts / provider calls
- generate natural language
- perform domain / business calculations
- execute actions
- fuse upstream runtime sources (Context Fusion owns that)
- persist state, network, or render UI

Module: `app/src/features/decision-engine/`.

Legacy rule-based recommendations under `features/decisionEngine/` are separate and out of scope for this foundation.

---

## Architecture Summary

```
UnifiedCoachingContext
      ↓
Decision Engine
      ↓
CoachingDecision
      ↓
Recommendation Engine
      ↓
Coach Supervisor
```

---

## Module Boundaries

| Layer | Role |
|-------|------|
| `models/` | Immutable decision / candidate / plan / graph / package / result types |
| `decision/` | `DecisionEngine` / `DecisionCoordinator` / `DecisionSession` / `DecisionState` |
| `analysis/` | Deterministic training / nutrition / recovery / goal / lifestyle / risk / priority / dependency / context analysis |
| `evaluation/` | Priority / constraint / consistency / conflict / dependency / confidence / risk / impact evaluators |
| `planning/` | Decision / execution / priority / dependency / resolution planners (no execution) |
| `resolution/` | Conflict / priority / dependency / decision / merge resolvers |
| `builders/` | Decision / package / summary / graph builders |
| `validators/` | Integrity / dependencies / priorities / conflicts / constraints / consistency / graph / package |
| `policies/` | Decision / priority / consistency / conflict / dependency / safety |
| `selectors/` | Decision / priority / dependency / outcome / recommendation |
| `contracts/` | Context Fusion / Athlete State / Coach Supervisor ports (+ mocks) |
| `application/` | Narrow public API |
| `services/` | `DecisionEngineService` facade |

---

## Public API

| Function | Purpose |
|----------|---------|
| `buildDecision` | Analyze fused context → immutable `CoachingDecision`s / `DecisionPackage` |
| `evaluateDecision` | Re-evaluate candidates in the current package |
| `resolveDecision` | Resolve conflicts into final decisions |
| `describeDecision` | Describe engine capabilities |
| `validateDecision` | Validate decision package integrity |

Root export: models + application + `DecisionEngineService` only — internal modules are not part of the public surface.

---

## Integration

| Consumes | Via |
|----------|-----|
| Context Fusion Engine | `ContextFusionPort` → `UnifiedCoachingContext` / `DecisionEngineContext` (mock in tests) |
| Athlete State Engine | `AthleteStatePort` (presence flag; mock in tests) |
| Coach Supervisor | `CoachSupervisorPort` (focus areas; mock in tests) |

| Produces | Types |
|----------|-------|
| Decisions | `CoachingDecision`, `DecisionPackage`, `DecisionSnapshot`, `DecisionSummary` |
| Downstream handoff | `RecommendationEngineInput` |

---

## Design Rules

- No OpenAI SDK
- No Prompt Builder
- No Tool Runtime
- No Action Engine
- No AI reasoning
- No domain calculations
- No persistence
- No networking
- Decision orchestration only
