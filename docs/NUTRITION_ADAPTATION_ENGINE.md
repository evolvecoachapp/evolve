# Nutrition Adaptation Engine

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-26  
**Purpose:** Document the Nutrition Adaptation Engine — deterministic adaptation of an existing nutrition plan according to Continuous Adaptation decisions.  
**Source of Truth:** Yes — for Nutrition Adaptation Engine layout, evaluation / planning / adapters / comparison / policies, boundaries, and public API on mobile.

Related: [CONTINUOUS_ADAPTATION_ENGINE.md](./CONTINUOUS_ADAPTATION_ENGINE.md), [NUTRITION_PIPELINE.md](./NUTRITION_PIPELINE.md), [ADAPTIVE_COACHING.md](./ADAPTIVE_COACHING.md), [REASONING_PIPELINE.md](./REASONING_PIPELINE.md), [AI_RUNTIME.md](./AI_RUNTIME.md), [ARCHITECTURE.md](./ARCHITECTURE.md), [DECISIONS.md](./DECISIONS.md) (ADR-078).

---

## Responsibilities

Nutrition Adaptation Engine owns **existing-plan adaptation only**.

It **does**:

- adapt an existing nutrition plan using Continuous Adaptation decision keys / signal keys
- evaluate calorie / macro / hydration / meal timing / recovery nutrition / adherence / consistency via fixed ordinal tables
- plan deterministic step / target key structures (no execution)
- map plan + evaluation keys → immutable modification / adjustment records (adapters)
- compare plan / meal / macro / progress / history key sets
- produce immutable `NutritionAdaptation`, `UpdatedNutritionPlan`, `NutritionRuntimeInput`, packages, and snapshots
- expose a narrow public application API

It **does not**:

- generate nutrition plans from scratch / empty plans
- change athlete goals
- invent calorie / macro prescriptions via calculations
- perform AI reasoning, prediction, inference, or heuristics
- call AI providers / Prompt Builder / Tool Runtime / Action Engine
- persist state, network, or render UI

Module: `app/src/features/nutrition-adaptation/`.

---

## Architecture Summary

```
Nutrition Plan + Nutrition Runtime + Athlete State +
Continuous Adaptation Decision + Coach Context
      ↓
Nutrition Adaptation Engine
  ├── Evaluation   (fixed ordinals / flags)
  ├── Planning     (step / target keys only)
  ├── Adapters     (key → modification records)
  ├── Comparison   (immutable key diffs)
  ├── Policies     (safety / recovery / consistency / hydration / adherence)
  └── Validators   (integrity / consistency / package)
      ↓
Updated Nutrition Plan
      ↓
Nutrition Runtime
```

---

## Module Boundaries

| Layer | Role |
|-------|------|
| `models/` | Immutable nutrition adaptation / modification / package / result types |
| `adaptation/` | `NutritionAdaptationEngine` / `NutritionAdaptationCoordinator` / `NutritionAdaptationSession` |
| `evaluation/` | Calorie / macro / hydration / meal timing / recovery nutrition / adherence / consistency |
| `planning/` | Nutrition / meal / macro / timing / hydration / week planners (structures only) |
| `application/` | Adapters (internal) + narrow public API |
| `comparison/` | Plan / meal / macro / progress / history comparators |
| `builders/` | Adaptation / package / summary / snapshot / descriptor / result builders |
| `validators/` | Plan / adaptation / meal / macro / weekly / dependencies / history / snapshot / package |
| `policies/` | Adaptation / safety / recovery / consistency / hydration / adherence |
| `selectors/` | Nutrition / meal / macro / timing / week |
| `contracts/` | Plan / Runtime / Athlete State / Continuous Adaptation / Coach Context ports (+ mocks) |
| `services/` | `NutritionAdaptationEngineService` facade |

---

## Public API

| Function | Purpose |
|----------|---------|
| `adaptNutrition` | Resolve → evaluate → plan → adapt → package → policy → validate → freeze |
| `compareNutrition` | Compare prior snapshot / plan keys after adapt path |
| `describeNutritionAdaptation` | Describe engine capabilities / boundaries |
| `createNutritionSnapshot` | Create point-in-time `NutritionSnapshot` from adapt path |
| `validateNutritionAdaptation` | Validate nutrition adaptation package integrity |

Root export: models + application + `NutritionAdaptationEngineService` only — internal modules are not part of the public surface.

Adapters live under `application/` but are **not** re-exported from `application/index.ts` or the root.

---

## Integration

| Consumes | Via |
|----------|-----|
| Nutrition Plan | `NutritionPlanPort` (structure keys; mock in tests) |
| Nutrition Runtime | `NutritionRuntimePort` (runtime keys; mock in tests) |
| Athlete State Engine | `AthleteStatePort` (state / signal keys; mock in tests) |
| Continuous Adaptation Engine | `ContinuousAdaptationPort` (decision ids / keys; mock in tests) |
| Coach Context | `CoachContextPort` (context / focus; mock in tests) |

| Produces | Types |
|----------|-------|
| Adaptation | `NutritionAdaptation`, `NutritionPackage`, `NutritionSnapshot`, `NutritionSummary` |
| Plan handoff | `UpdatedNutritionPlan` (structure keys only) |
| Runtime handoff | `NutritionRuntimeInput` |

`UpdatedNutritionPlan` carries **structure keys only** (`id`, `athleteId`, `planId`, `dayKeys`, `mealKeys`, `macroKeys`, `timingKeys`, `weekKeys`, `modificationIds`, `metadata`, `createdAt`) — not full nutrition generation.

---

## Coordinator Pipeline

`NutritionAdaptationCoordinator.adapt(input)`:

1. Validate `athleteId` + `planId` present
2. Resolve upstream via ports (or use input refs/keys)
3. Run evaluators on signal/decision keys → evaluation bundle
4. Run planners → plan bundle
5. Run adapters → modifications/adjustments
6. Build `NutritionAdaptation` + `UpdatedNutritionPlan` + `NutritionRuntimeInput`
7. Apply policies (safety / recovery / consistency / hydration / adherence / adaptation)
8. Validate package
9. Freeze everything
10. Return `NutritionResult`

---

## Rules

- Adaptation happens downstream of Continuous Adaptation Engine and upstream of Nutrition Runtime
- Requires an existing plan id and structure keys — empty plan without port resolution fails
- No AI reasoning, prediction, inference, heuristics, prompts, or provider SDKs
- No nutrition generation from scratch
- No athlete goal mutation
- No networking or persistence
- Evaluation / planning / adapters use structured codes, keys, and fixed ordinal tables only
