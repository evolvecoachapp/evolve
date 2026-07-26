# Workout Pipeline

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-27  
**Purpose:** Document the intelligent Workout Generation Pipeline (canonical WorkoutPlan) and the Workout Adaptation path relative to Continuous Adaptation and Workout Runtime.  
**Source of Truth:** Partial — subsystem details live in linked docs.

Related: [WORKOUT_AGENT.md](./WORKOUT_AGENT.md), [WORKOUT_ADAPTATION_ENGINE.md](./WORKOUT_ADAPTATION_ENGINE.md), [CONTINUOUS_ADAPTATION_ENGINE.md](./CONTINUOUS_ADAPTATION_ENGINE.md), [WORKOUT_RUNTIME.md](./WORKOUT_RUNTIME.md), [DECISION_PIPELINE.md](./DECISION_PIPELINE.md), [REASONING_PIPELINE.md](./REASONING_PIPELINE.md), [AI_RUNTIME.md](./AI_RUNTIME.md), [ARCHITECTURE.md](./ARCHITECTURE.md), [COMPOSITION_ROOT.md](./COMPOSITION_ROOT.md).

---

## Intelligent Workout Generation Pipeline

Product path that transforms coaching context into a canonical **WorkoutPlan** for the UI.

```
Conversation Runtime
      ↓
Coaching Session Runtime
      ↓
Coach Supervisor
      ↓
Workout Agent                    ← planning intelligence
      ↓
Athlete State Engine
      ↓
Context Fusion Engine            ← UnifiedCoachingContext
      ↓
Decision Engine
      ↓
Recommendation Engine
      ↓
Workout Generation               ← Workout Agent → Program Generation (existing)
      ↓
WorkoutPlan                      ← canonical UI output
```

**Module:** `features/workout-generation-pipeline`  
**Orchestration only** — no new engines. Workout intelligence stays in the Workout Agent. Program Generation remains the Blueprint → … → Assembly coordinator.

### Stage Ownership (generation)

| Stage | Module | Owns |
|-------|--------|------|
| Conversation | `features/conversation*` | Turn / conversation context |
| Coaching Session | `features/coaching-session` | Session lifecycle + supervisor coordination |
| Coach Supervisor | `features/coach-supervisor` | Multi-agent coordination for generate capability |
| Workout Agent | `features/workout-agent` | Plan proposal + domain generation invocation |
| Athlete State | `features/athlete-state` | Immutable athlete truth |
| Context Fusion | `features/context-fusion` | `UnifiedCoachingContext` |
| Decision | `features/decision-engine` | `CoachingDecision` / `DecisionPackage` |
| Recommendation | `features/recommendation-engine` | `CoachingRecommendation` / `RecommendationPackage` |
| Workout Generation | Workout Agent → `features/program-generation` | Assembled `WorkoutSession` |
| WorkoutPlan | `features/workout-generation-pipeline` | Canonical immutable plan + validation + UI adapter |

### Public API

- `generateWorkoutPlan` → `WorkoutResult` (`plan: WorkoutPlan | null`)
- `validateGeneratedWorkoutPlan`
- Coach Screen: **Generate Workout** via `useGenerateWorkout` → Composition Root `WorkoutGenerationPipelineService`

### Compatibility

- `mapWorkoutPlanToWorkoutProgram` adapts `WorkoutPlan` → legacy UI `WorkoutProgram`
- Existing workout screens continue to use catalog/runtime models unchanged

---

## Workout Adaptation Pipeline

```
Athlete State Engine
      +
Context Fusion Engine
      ↓
Decision Engine → Recommendation Engine → Explainability Engine
      ↓
Continuous Adaptation Engine          ← opportunity detection (no plan mutation)
      ↓
AdaptationDecision / AdaptationPackage
      ↓
Workout Adaptation Engine             ← adapts EXISTING Workout Blueprint
  (decision keys + blueprint structure keys → modifications)
      ↓
Updated Workout Blueprint             ← structure keys + modification ids
      ↓
Workout Runtime                       ← live session execution
      ↓
WorkoutResult / Domain Events
```

The Workout Adaptation Engine is **not** a generation engine. Upstream program / blueprint generation and the Intelligent Workout Generation Pipeline produce or refine plans separately. Adaptation only applies Continuous Adaptation decisions to an already-existing blueprint before runtime handoff.

---

## Stage Ownership (adaptation)

| Stage | Module | Owns |
|-------|--------|------|
| Continuous opportunity detection | `features/continuous-adaptation` | Whether meaningful adaptation opportunities exist |
| Workout blueprint adaptation | `features/workout-adaptation` | How an existing blueprint structure is adjusted (keys / modifications) |
| Live session execution | `features/workout-runtime` | Mutable in-engine runtime graph while performing |

---

## Boundaries

| Generation pipeline | Adaptation pipeline |
|---------------------|---------------------|
| Orchestrates existing engines → WorkoutPlan | Adapts existing blueprint keys only |
| Workout Agent owns workout intelligence | No from-scratch generation |
| No new engines | No AI / prompts / provider SDKs |
| UI consumes WorkoutPlan | Runtime consumes WorkoutRuntimeInput |

---

## Rules

- Generation path must not bypass Session → Supervisor → Agent → Athlete State → Fusion → Decision → Recommendation → Generation
- Adaptation sits **after** Continuous Adaptation and **before** Workout Runtime
- Blueprint must already exist for adaptation — fails closed on missing / empty blueprint without resolvable keys
- Runtime receives structural handoff only (`WorkoutRuntimeInput`), not generation payloads
