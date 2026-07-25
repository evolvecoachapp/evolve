# Adaptive Coaching

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-26  
**Purpose:** Describe the adaptive coaching stack — continuous opportunity detection feeding domain adaptation engines.  
**Source of Truth:** Partial — subsystem details live in linked docs.

Related: [CONTINUOUS_ADAPTATION_ENGINE.md](./CONTINUOUS_ADAPTATION_ENGINE.md), [WORKOUT_ADAPTATION_ENGINE.md](./WORKOUT_ADAPTATION_ENGINE.md), [NUTRITION_ADAPTATION_ENGINE.md](./NUTRITION_ADAPTATION_ENGINE.md), [WORKOUT_PIPELINE.md](./WORKOUT_PIPELINE.md), [NUTRITION_PIPELINE.md](./NUTRITION_PIPELINE.md), [EXPLAINABILITY_ENGINE.md](./EXPLAINABILITY_ENGINE.md), [REASONING_PIPELINE.md](./REASONING_PIPELINE.md), [AI_RUNTIME.md](./AI_RUNTIME.md), [ARCHITECTURE.md](./ARCHITECTURE.md), [DECISIONS.md](./DECISIONS.md) (ADR-076, ADR-077, ADR-078).

---

## Adaptive Coaching Path (Sprint 24.2)

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
Continuous Adaptation Engine     ← Sprint 23.1 (opportunity detection only)
      ↓
AdaptationDecision
      ↓
Workout Adaptation Engine        ← Sprint 24.1 (adapts existing Workout Blueprint)
Nutrition Adaptation Engine      ← Sprint 24.2 (adapts existing Nutrition Plan)
Recovery Adaptation Engine       ← future (consumes RecoveryAdaptationInput)
Goal Progress Engine             ← future (consumes GoalProgressInput)
      ↓
Updated Workout Blueprint → Workout Runtime
Updated Nutrition Plan → Nutrition Runtime
```

---

## Ownership

| Stage | Module | Owns |
|-------|--------|------|
| Opportunity detection | `features/continuous-adaptation` | Whether meaningful adaptation opportunities exist; immutable `AdaptationDecision` |
| Workout plan adaptation | `features/workout-adaptation` | How an existing blueprint is adjusted (keys / modifications); immutable `WorkoutAdaptation` / `UpdatedWorkoutBlueprint` |
| Nutrition plan adaptation | `features/nutrition-adaptation` | How an existing nutrition plan is adjusted (keys / modifications); immutable `NutritionAdaptation` / `UpdatedNutritionPlan` |
| Recovery protocol adaptation | future Recovery Adaptation Engine | How recovery changes (not this sprint) |
| Goal progress tracking | future Goal Progress Engine | Goal progress evaluation (not this sprint) |
| Training readiness adaptations | `features/training-adaptation` | Workout-domain readiness recommendations (Sprint 17.5; separate) |

---

## Boundaries

Continuous Adaptation Engine:

- **owns** detection of meaningful adaptation opportunities over time
- **produces** `AdaptationDecision` + structured handoff inputs
- **does not** modify workout / nutrition / recovery plans
- **does not** generate recommendations
- **does not** perform AI reasoning, prediction, or business calculations

Workout Adaptation Engine (Sprint 24.1):

- **consumes** Continuous Adaptation handoff / decision keys + existing Workout Blueprint / Runtime / Athlete State / Coach Context
- **owns** deterministic blueprint adaptation (evaluation → planning → adapters → package)
- **produces** `UpdatedWorkoutBlueprint` / `WorkoutAdaptationPackage` / `WorkoutRuntimeInput`
- **does not** generate workouts from scratch, change athlete goals, or perform AI reasoning

Nutrition Adaptation Engine (Sprint 24.2):

- **consumes** Continuous Adaptation handoff / decision keys + existing Nutrition Plan / Runtime / Athlete State / Coach Context
- **owns** deterministic plan adaptation (evaluation → planning → adapters → package)
- **produces** `UpdatedNutritionPlan` / `NutritionAdaptationPackage` / `NutritionRuntimeInput`
- **does not** generate nutrition from scratch, change athlete goals, or perform AI reasoning

Other downstream adaptation engines (future):

- **consume** handoff inputs (`RecoveryAdaptationInput`, …)
- **own** protocol modifications
- remain out of scope for Sprint 24.2

---

## Distinction from Training Adaptation Engine

| Concern | Continuous Adaptation (23.1) | Workout Adaptation (24.1) | Nutrition Adaptation (24.2) | Training Adaptation (17.5) |
|---------|------------------------------|--------------------------|-----------------------------|----------------------------|
| Scope | Cross-domain opportunity detection over time | Existing blueprint structure adaptation | Existing nutrition plan structure adaptation | Workout readiness / adaptation recommendations |
| Output | `AdaptationDecision` + handoff inputs | `UpdatedWorkoutBlueprint` / `WorkoutAdaptation` | `UpdatedNutritionPlan` / `NutritionAdaptation` | `TrainingAdaptationResult` / `AdaptationRecommendation` |
| Plan mutation | Never | Blueprint structure keys / modification records only | Plan structure keys / modification records only | Never (recommendations only) |
| Upstream | Athlete State / Fusion / Decision / Recommendation / Explainability | Blueprint / Runtime / Athlete State / Continuous Adaptation / Coach Context | Plan / Runtime / Athlete State / Continuous Adaptation / Coach Context | Workout progression / recovery / constraints |

---

## Rules

- Detection before adaptation — Continuous Adaptation Engine never changes plans
- Workout Adaptation adapts existing blueprints only — never generates from scratch
- Nutrition Adaptation adapts existing plans only — never generates from scratch
- No AI / prompts / providers / networking / persistence / UI in detection or domain adaptation layers
- Handoff inputs from Continuous Adaptation remain structure-only contracts for domain engines
