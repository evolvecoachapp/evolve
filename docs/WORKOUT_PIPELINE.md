# Workout Pipeline

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-26  
**Purpose:** Document the AI Workout Pipeline path and where the Workout Adaptation Engine sits relative to Continuous Adaptation and Workout Runtime.  
**Source of Truth:** Partial — subsystem details live in linked docs.

Related: [WORKOUT_ADAPTATION_ENGINE.md](./WORKOUT_ADAPTATION_ENGINE.md), [CONTINUOUS_ADAPTATION_ENGINE.md](./CONTINUOUS_ADAPTATION_ENGINE.md), [WORKOUT_RUNTIME.md](./WORKOUT_RUNTIME.md), [REASONING_PIPELINE.md](./REASONING_PIPELINE.md), [AI_RUNTIME.md](./AI_RUNTIME.md), [ARCHITECTURE.md](./ARCHITECTURE.md).

---

## Pipeline Overview

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

The Workout Adaptation Engine is **not** a generation engine. Upstream program / blueprint generation remains separate. This stage only applies Continuous Adaptation decisions to an already-existing blueprint before runtime handoff.

---

## Stage Ownership

| Stage | Module | Owns |
|-------|--------|------|
| Continuous opportunity detection | `features/continuous-adaptation` | Whether meaningful adaptation opportunities exist |
| Workout blueprint adaptation | `features/workout-adaptation` | How an existing blueprint structure is adjusted (keys / modifications) |
| Live session execution | `features/workout-runtime` | Mutable in-engine runtime graph while performing |

---

## Workout Adaptation Placement

```
Continuous Adaptation Decision
      +
Existing Workout Blueprint
      +
Athlete State / Coach Context / Runtime refs
      ↓
Workout Adaptation Engine
      ↓
UpdatedWorkoutBlueprint → WorkoutRuntimeInput → Workout Runtime
```

### Inputs

- Workout Blueprint structure keys (`blueprintId`, day / exercise / session / week keys)
- Continuous Adaptation decision ids / keys
- Athlete State signal keys
- Coach Context focus / context keys
- Optional prior `WorkoutSnapshot` for comparison

### Outputs

- `WorkoutAdaptation` (immutable modification / adjustment records)
- `UpdatedWorkoutBlueprint` (structure keys + `modificationIds` only)
- `WorkoutRuntimeInput` (handoff to Workout Runtime)
- `WorkoutPackage` / `WorkoutSnapshot` / `WorkoutSummary`

---

## Boundaries

| Allowed | Not allowed |
|---------|-------------|
| Adapt existing blueprint structure keys | Generate workouts from empty / missing blueprint |
| Deterministic key → modification mapping | AI / prompts / provider SDKs |
| Fixed ordinal evaluation tables | Invent numeric prescriptions |
| Immutable packages / snapshots | Persistence / networking / UI |
| Handoff to Workout Runtime | Athlete goal changes |

---

## Related Engines (future / parallel)

Continuous Adaptation also produces handoff inputs for:

- Nutrition Adaptation Engine
- Recovery Adaptation Engine
- Goal Progress Engine

Those paths are parallel consumers of `AdaptationDecision` and are outside this Workout Pipeline document.

---

## Rules

- Workout Adaptation sits **after** Continuous Adaptation and **before** Workout Runtime
- Blueprint must already exist — adaptation fails closed on missing / empty blueprint without resolvable keys
- No AI in the adaptation stage
- Runtime receives structural handoff only (`WorkoutRuntimeInput`), not generation payloads
