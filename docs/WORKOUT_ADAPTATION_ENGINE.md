# Workout Adaptation Engine

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-26  
**Purpose:** Document the Workout Adaptation Engine — deterministic adaptation of an existing workout blueprint according to Continuous Adaptation decisions.  
**Source of Truth:** Yes — for Workout Adaptation Engine layout, evaluation / planning / adapters / comparison / policies, boundaries, and public API on mobile.

Related: [CONTINUOUS_ADAPTATION_ENGINE.md](./CONTINUOUS_ADAPTATION_ENGINE.md), [WORKOUT_PIPELINE.md](./WORKOUT_PIPELINE.md), [WORKOUT_RUNTIME.md](./WORKOUT_RUNTIME.md), [ADAPTIVE_COACHING.md](./ADAPTIVE_COACHING.md), [REASONING_PIPELINE.md](./REASONING_PIPELINE.md), [AI_RUNTIME.md](./AI_RUNTIME.md), [ARCHITECTURE.md](./ARCHITECTURE.md), [DECISIONS.md](./DECISIONS.md) (ADR-077).

---

## Responsibilities

Workout Adaptation Engine owns **existing-blueprint adaptation only**.

It **does**:

- adapt an existing workout blueprint using Continuous Adaptation decision keys / signal keys
- evaluate volume / intensity / frequency / recovery / fatigue / progression / plateau / consistency via fixed ordinal tables
- plan deterministic step / target key structures (no execution)
- map plan + evaluation keys → immutable modification / adjustment records (adapters)
- compare blueprint / session / exercise / progress / history key sets
- produce immutable `WorkoutAdaptation`, `UpdatedWorkoutBlueprint`, `WorkoutRuntimeInput`, packages, and snapshots
- expose a narrow public application API

It **does not**:

- generate workouts from scratch / empty blueprints
- change athlete goals
- invent load / rep / set prescriptions via calculations
- perform AI reasoning, prediction, inference, or heuristics
- call AI providers / Prompt Builder / Tool Runtime / Action Engine
- persist state, network, or render UI

Module: `app/src/features/workout-adaptation/`.

---

## Architecture Summary

```
Workout Blueprint + Workout Runtime + Athlete State +
Continuous Adaptation Decision + Coach Context
      ↓
Workout Adaptation Engine
  ├── Evaluation   (fixed ordinals / flags)
  ├── Planning     (step / target keys only)
  ├── Adapters     (key → modification records)
  ├── Comparison   (immutable key diffs)
  ├── Policies     (safety / recovery / consistency / progression / regression)
  └── Validators   (integrity / consistency / package)
      ↓
Updated Workout Blueprint
      ↓
Workout Runtime
```

---

## Module Boundaries

| Layer | Role |
|-------|------|
| `models/` | Immutable workout adaptation / modification / package / result types |
| `adaptation/` | `WorkoutAdaptationEngine` / `WorkoutAdaptationCoordinator` / `WorkoutAdaptationSession` |
| `evaluation/` | Volume / intensity / frequency / recovery / fatigue / progression / plateau / consistency (fixed tables) |
| `planning/` | Workout / exercise / progression / regression / session / week planners (structures only) |
| `application/` | Adapters (internal) + narrow public API |
| `comparison/` | Blueprint / session / exercise / progress / history comparators |
| `builders/` | Adaptation / package / summary / snapshot / descriptor / result builders |
| `validators/` | Blueprint / adaptation / exercise / weekly / dependencies / history / snapshot / package |
| `policies/` | Adaptation / safety / recovery / consistency / progression / regression |
| `selectors/` | Workout / exercise / week / session / progression |
| `contracts/` | Blueprint / Runtime / Athlete State / Continuous Adaptation / Coach Context ports (+ mocks) |
| `services/` | `WorkoutAdaptationEngineService` facade |

---

## Public API

| Function | Purpose |
|----------|---------|
| `adaptWorkout` | Resolve → evaluate → plan → adapt → package → policy → validate → freeze |
| `compareWorkout` | Compare prior snapshot / blueprint keys after adapt path |
| `describeWorkoutAdaptation` | Describe engine capabilities / boundaries |
| `createWorkoutSnapshot` | Create point-in-time `WorkoutSnapshot` from adapt path |
| `validateWorkoutAdaptation` | Validate workout adaptation package integrity |

Root export: models + application + `WorkoutAdaptationEngineService` only — internal modules are not part of the public surface.

Adapters live under `application/` but are **not** re-exported from `application/index.ts` or the root.

---

## Integration

| Consumes | Via |
|----------|-----|
| Workout Blueprint | `WorkoutBlueprintPort` (structure keys; mock in tests) |
| Workout Runtime | `WorkoutRuntimePort` (runtime keys; mock in tests) |
| Athlete State Engine | `AthleteStatePort` (state / signal keys; mock in tests) |
| Continuous Adaptation Engine | `ContinuousAdaptationPort` (decision ids / keys; mock in tests) |
| Coach Context | `CoachContextPort` (context / focus; mock in tests) |

| Produces | Types |
|----------|-------|
| Adaptation | `WorkoutAdaptation`, `WorkoutPackage`, `WorkoutSnapshot`, `WorkoutSummary` |
| Blueprint handoff | `UpdatedWorkoutBlueprint` (structure keys only) |
| Runtime handoff | `WorkoutRuntimeInput` |

`UpdatedWorkoutBlueprint` carries **structure keys only** (`id`, `athleteId`, `blueprintId`, `dayKeys`, `exerciseKeys`, `sessionKeys`, `weekKeys`, `modificationIds`, `metadata`, `createdAt`) — not full workout generation.

---

## Coordinator Pipeline

`WorkoutAdaptationCoordinator.adapt(input)`:

1. Validate `athleteId` + `blueprintId` present
2. Resolve upstream via ports (or use input refs/keys)
3. Run evaluators on signal/decision keys → evaluation bundle
4. Run planners → plan bundle
5. Run adapters → modifications/adjustments
6. Build `WorkoutAdaptation` + `UpdatedWorkoutBlueprint` + `WorkoutRuntimeInput`
7. Apply policies (safety / recovery / consistency / progression / regression / adaptation)
8. Validate package
9. Freeze everything
10. Return `WorkoutResult`

---

## Rules

- Adaptation happens downstream of Continuous Adaptation Engine and upstream of Workout Runtime
- Requires an existing blueprint id and structure keys — empty blueprint without port resolution fails
- No AI reasoning, prediction, inference, heuristics, prompts, or provider SDKs
- No workout generation from scratch
- No athlete goal mutation
- No networking or persistence
- Evaluation / planning / adapters use structured codes, keys, and fixed ordinal tables only
