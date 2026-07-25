# Nutrition Pipeline

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-26  
**Purpose:** Document the AI Nutrition Pipeline path and where the Nutrition Adaptation Engine sits relative to Continuous Adaptation and Nutrition Runtime.  
**Source of Truth:** Partial — subsystem details live in linked docs.

Related: [NUTRITION_ADAPTATION_ENGINE.md](./NUTRITION_ADAPTATION_ENGINE.md), [CONTINUOUS_ADAPTATION_ENGINE.md](./CONTINUOUS_ADAPTATION_ENGINE.md), [ADAPTIVE_COACHING.md](./ADAPTIVE_COACHING.md), [WORKOUT_PIPELINE.md](./WORKOUT_PIPELINE.md), [ARCHITECTURE.md](./ARCHITECTURE.md).

---

## Pipeline Path

```
Athlete State / Context Fusion / Decision / Recommendation / Explainability
      ↓
Continuous Adaptation Engine          ← opportunity detection only
      ↓
AdaptationDecision (nutrition handoff keys)
      ↓
Nutrition Adaptation Engine           ← adapts EXISTING Nutrition Plan
      ↓
Updated Nutrition Plan
      ↓
Nutrition Runtime
```

The Nutrition Adaptation Engine is **not** a generation engine. Upstream nutrition plan generation remains separate. This stage only applies Continuous Adaptation decisions to an already-existing plan before runtime handoff.

---

## Nutrition Adaptation Placement

| Stage | Owns |
|-------|------|
| Continuous Adaptation | Whether nutrition adaptation opportunities exist |
| Nutrition Adaptation Engine | How an existing plan structure is adjusted (keys / modifications) |
| Nutrition Runtime | Execution / logging of the updated plan |

```
Nutrition Plan
+ Nutrition Runtime
+ Athlete State
+ Continuous Adaptation Decision
+ Coach Context
      ↓
Nutrition Adaptation Engine
      ↓
Updated Nutrition Plan → Nutrition Runtime
```

---

## Boundaries

- Nutrition Adaptation adapts existing plans only — never generates from scratch
- No AI reasoning / prompts / providers in the adaptation layer
- No networking or persistence in the adaptation layer
- Structure keys only on `UpdatedNutritionPlan` / `NutritionRuntimeInput`

---

## Rules

- Nutrition Adaptation sits **after** Continuous Adaptation and **before** Nutrition Runtime
- Requires existing `planId` + structure keys (or port resolution)
- Parallel to Workout Adaptation Engine (domain-specific, same architectural role)
