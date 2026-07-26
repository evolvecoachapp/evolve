# Continuous Adaptation Engine

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-26  
**Purpose:** Document the Continuous Adaptation Engine — deterministic detection of meaningful adaptation opportunities over time.  
**Source of Truth:** Yes — for Continuous Adaptation Engine layout, monitoring / detection / evaluation / comparison / timeline, boundaries, and public API on mobile.

Related: [ADAPTIVE_COACHING.md](./ADAPTIVE_COACHING.md), [WORKOUT_ADAPTATION_ENGINE.md](./WORKOUT_ADAPTATION_ENGINE.md), [WORKOUT_PIPELINE.md](./WORKOUT_PIPELINE.md), [GOAL_PROGRESS_ENGINE.md](./GOAL_PROGRESS_ENGINE.md), [GOAL_EVALUATION_PIPELINE.md](./GOAL_EVALUATION_PIPELINE.md), [EXPLAINABILITY_ENGINE.md](./EXPLAINABILITY_ENGINE.md), [RECOMMENDATION_ENGINE.md](./RECOMMENDATION_ENGINE.md), [DECISION_ENGINE.md](./DECISION_ENGINE.md), [REASONING_PIPELINE.md](./REASONING_PIPELINE.md), [AI_RUNTIME.md](./AI_RUNTIME.md), [ARCHITECTURE.md](./ARCHITECTURE.md), [ATHLETE_STATE_ENGINE.md](./ATHLETE_STATE_ENGINE.md), [CONTEXT_FUSION_ENGINE.md](./CONTEXT_FUSION_ENGINE.md), [STATE_MANAGEMENT.md](./STATE_MANAGEMENT.md), [DECISIONS.md](./DECISIONS.md) (ADR-076, ADR-080).

---

## Responsibilities

Continuous Adaptation Engine owns **adaptation opportunity detection only**.

It **does**:

- continuously evaluate athlete evolution signals over time (structured keys / flags / windows)
- monitor state, performance, recovery, nutrition, goals, adherence, history, and timeline presence
- detect plateau / regression / progress / recovery / consistency / adherence / trend signals
- evaluate priority / severity / dependency / consistency / risk using fixed tables only
- compare snapshots, timelines, goals, decisions, and recommendations (immutable key diffs)
- organize historical timelines / windows / history (no forecasting)
- produce immutable `AdaptationDecision`s, packages, snapshots, and downstream handoff inputs
- expose a narrow public application API

It **does not**:

- modify workout plans
- modify nutrition plans
- modify recovery protocols
- generate recommendations
- perform AI reasoning, prediction, inference, or heuristics
- call AI providers / Prompt Builder / Tool Runtime / Action Engine
- perform domain / business calculations
- persist state, network, or render UI

Module: `app/src/features/continuous-adaptation/`.

Training Adaptation Engine (`features/training-adaptation`) remains workout-readiness adaptation recommendations and is separate from this continuous opportunity-detection engine.

---

## Architecture Summary

```
Athlete State Engine
      +
Context Fusion Engine
      +
Decision Engine
      +
Recommendation Engine
      +
Explainability Engine
      ↓
Continuous Adaptation Engine
      ↓
AdaptationDecision
      ↓
Workout Adaptation Engine   ← Sprint 24.1 (`features/workout-adaptation`)
Nutrition Adaptation Engine (NutritionAdaptationInput) ← Sprint 24.2
Recovery Adaptation Engine  (RecoveryAdaptationInput)  ← Sprint 24.3
Goal Progress Engine        (GoalProgressInput)        ← Sprint 24.4 (`features/goal-progress`)
```

Goal Progress Engine (Sprint 24.4) also feeds back into this engine: it produces its own `ContinuousAdaptationInput` handoff (from `features/goal-progress`) after evaluating progress, which this engine can consume as an additional signal source alongside Athlete State / Context Fusion / Decision / Recommendation / Explainability. See [GOAL_PROGRESS_ENGINE.md](./GOAL_PROGRESS_ENGINE.md) and [GOAL_EVALUATION_PIPELINE.md](./GOAL_EVALUATION_PIPELINE.md).

---

## Module Boundaries

| Layer | Role |
|-------|------|
| `models/` | Immutable adaptation / decision / opportunity / trigger / timeline / package / result types |
| `adaptation/` | `ContinuousAdaptationEngine` / `AdaptationCoordinator` / `AdaptationSession` |
| `monitoring/` | State / performance / recovery / nutrition / goal / adherence / history / timeline monitors (observation only) |
| `detection/` | Plateau / regression / progress / recovery / consistency / adherence / trend detectors (signal presence only) |
| `evaluation/` | Adaptation / priority / severity / dependency / consistency / risk evaluators (fixed tables only) |
| `comparison/` | State / snapshot / timeline / goal / decision / recommendation comparators |
| `timeline/` | Timeline / history / trend / snapshot / window builders (historical organization only) |
| `builders/` | Adaptation / decision / summary / package / snapshot / handoff builders |
| `validators/` | Integrity / timeline / trigger / dependencies / history / snapshot / package |
| `policies/` | Adaptation / monitoring / detection / consistency / priority / safety |
| `selectors/` | Adaptation / trigger / history / timeline / priority |
| `contracts/` | Athlete State / Context Fusion / Decision / Recommendation / Explainability ports (+ mocks) |
| `application/` | Narrow public API |
| `services/` | `ContinuousAdaptationEngineService` facade |

---

## Public API

| Function | Purpose |
|----------|---------|
| `evaluateAdaptation` | Monitor + detect + evaluate → immutable `AdaptationDecision`s / `AdaptationPackage` |
| `detectAdaptation` | Detect adaptation signal presence only |
| `describeAdaptation` | Describe engine capabilities |
| `createAdaptationSnapshot` | Create point-in-time `AdaptationSnapshot` |
| `validateAdaptation` | Validate adaptation package integrity |

Root export: models + application + `ContinuousAdaptationEngineService` only — internal modules are not part of the public surface.

---

## Integration

| Consumes | Via |
|----------|-----|
| Athlete State Engine | `AthleteStatePort` (presence / state keys; mock in tests) |
| Context Fusion Engine | `ContextFusionPort` (context / focus; mock in tests) |
| Decision Engine | `DecisionEnginePort` → `CoachingDecision` (mock in tests) |
| Recommendation Engine | `RecommendationEnginePort` → `CoachingRecommendation` (mock in tests) |
| Explainability Engine | `ExplainabilityEnginePort` → explanation references (mock in tests) |

| Produces | Types |
|----------|-------|
| Decisions | `AdaptationDecision`, `AdaptationPackage`, `AdaptationSnapshot`, `AdaptationSummary` |
| Opportunities | `AdaptationOpportunity`, `AdaptationCandidate`, `AdaptationTrigger` |
| Timeline | `AdaptationTimeline`, `AdaptationHistory`, `AdaptationWindow` |
| Downstream handoffs | `WorkoutAdaptationInput`, `NutritionAdaptationInput`, `RecoveryAdaptationInput`, `GoalProgressInput` |

Handoff inputs are **structured opportunity packages only** — they do not modify plans. Workout Adaptation Engine (Sprint 24.1) consumes the workout handoff and owns blueprint adaptation separately. Goal Progress Engine (Sprint 24.4, `features/goal-progress`) consumes the `GoalProgressInput` handoff for its own evaluation and, in turn, produces a `ContinuousAdaptationInput` handoff back to this engine — see [GOAL_PROGRESS_ENGINE.md](./GOAL_PROGRESS_ENGINE.md).

---

## Rules

- Adaptation detection happens downstream of Explainability Engine and upstream of domain adaptation engines
- No AI reasoning, prediction, inference, heuristics, prompts, or provider SDKs
- No mutation of athlete plans (workout / nutrition / recovery)
- No recommendation generation
- No action execution or athlete-state mutation
- No business / domain calculations
- No networking or persistence
- Monitoring / detection / evaluation use structured codes, keys, and fixed ordinal tables only
