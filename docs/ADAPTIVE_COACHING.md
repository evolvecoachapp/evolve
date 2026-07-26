# Adaptive Coaching

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-26  
**Purpose:** Describe the adaptive coaching stack — continuous opportunity detection feeding domain adaptation engines and goal progress evaluation.  
**Source of Truth:** Partial — subsystem details live in linked docs.

Related: [CONTINUOUS_ADAPTATION_ENGINE.md](./CONTINUOUS_ADAPTATION_ENGINE.md), [WORKOUT_ADAPTATION_ENGINE.md](./WORKOUT_ADAPTATION_ENGINE.md), [NUTRITION_ADAPTATION_ENGINE.md](./NUTRITION_ADAPTATION_ENGINE.md), [RECOVERY_ADAPTATION_ENGINE.md](./RECOVERY_ADAPTATION_ENGINE.md), [GOAL_PROGRESS_ENGINE.md](./GOAL_PROGRESS_ENGINE.md), [WORKOUT_PIPELINE.md](./WORKOUT_PIPELINE.md), [NUTRITION_PIPELINE.md](./NUTRITION_PIPELINE.md), [RECOVERY_PIPELINE.md](./RECOVERY_PIPELINE.md), [GOAL_EVALUATION_PIPELINE.md](./GOAL_EVALUATION_PIPELINE.md), [EXPLAINABILITY_ENGINE.md](./EXPLAINABILITY_ENGINE.md), [REASONING_PIPELINE.md](./REASONING_PIPELINE.md), [AI_RUNTIME.md](./AI_RUNTIME.md), [ARCHITECTURE.md](./ARCHITECTURE.md), [DECISIONS.md](./DECISIONS.md) (ADR-076, ADR-077, ADR-078, ADR-079, ADR-080).

---

## Adaptive Coaching Path (Sprint 24.4)

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
Recovery Adaptation Engine       ← Sprint 24.3 (adapts existing Recovery Plan)
      ↓
Updated Workout Blueprint → Workout Runtime
Updated Nutrition Plan → Nutrition Runtime
Updated Recovery Plan → Recovery Runtime

Athlete State Engine
      +
Workout / Nutrition / Recovery Adaptation Engines
      +
Decision History + Recommendation History
      ↓
Goal Progress Engine             ← Sprint 24.4 (evaluates progress only)
      ↓
GoalProgressState → ContinuousAdaptationInput → Continuous Adaptation Engine
```

---

## Ownership

| Stage | Module | Owns |
|-------|--------|------|
| Opportunity detection | `features/continuous-adaptation` | Whether meaningful adaptation opportunities exist; immutable `AdaptationDecision` |
| Workout plan adaptation | `features/workout-adaptation` | How an existing blueprint is adjusted (keys / modifications); immutable `WorkoutAdaptation` / `UpdatedWorkoutBlueprint` |
| Nutrition plan adaptation | `features/nutrition-adaptation` | How an existing nutrition plan is adjusted (keys / modifications); immutable `NutritionAdaptation` / `UpdatedNutritionPlan` |
| Recovery plan adaptation | `features/recovery-adaptation` | How an existing recovery plan is adjusted (keys / modifications); immutable `RecoveryAdaptation` / `UpdatedRecoveryPlan` |
| Goal progress evaluation | `features/goal-progress` | Whether/how much progress has been made toward active goals; immutable `GoalProgress` / `GoalProgressState` |
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

Recovery Adaptation Engine (Sprint 24.3):

- **consumes** Continuous Adaptation handoff / decision keys + existing Recovery Plan / Runtime / Athlete State / Coach Context
- **owns** deterministic plan adaptation (evaluation → planning → adapters → package)
- **produces** `UpdatedRecoveryPlan` / `RecoveryAdaptationPackage` / `RecoveryRuntimeInput`
- **does not** generate recovery from scratch, change athlete goals, or perform AI reasoning

Goal Progress Engine (Sprint 24.4):

- **consumes** Athlete State / Workout / Nutrition / Recovery Adaptation Engines / Decision History / Recommendation History via ports
- **owns** deterministic goal progress evaluation (tracking → evaluation → comparison → timeline → package)
- **produces** `GoalProgressState` / `GoalPackage` / `ContinuousAdaptationInput`
- **does not** adapt workout / nutrition / recovery plans, mutate athlete goals, or perform AI reasoning

---

## Distinction from Training Adaptation Engine

| Concern | Continuous Adaptation (23.1) | Workout Adaptation (24.1) | Nutrition Adaptation (24.2) | Recovery Adaptation (24.3) | Goal Progress (24.4) | Training Adaptation (17.5) |
|---------|------------------------------|--------------------------|-----------------------------|----------------------------|-----------------------|----------------------------|
| Scope | Cross-domain opportunity detection over time | Existing blueprint structure adaptation | Existing nutrition plan structure adaptation | Existing recovery plan structure adaptation | Goal progress evaluation only | Workout readiness / adaptation recommendations |
| Output | `AdaptationDecision` + handoff inputs | `UpdatedWorkoutBlueprint` / `WorkoutAdaptation` | `UpdatedNutritionPlan` / `NutritionAdaptation` | `UpdatedRecoveryPlan` / `RecoveryAdaptation` | `GoalProgressState` / `GoalPackage` | `TrainingAdaptationResult` / `AdaptationRecommendation` |
| Plan mutation | Never | Blueprint structure keys / modification records only | Plan structure keys / modification records only | Plan structure keys / modification records only | Never (evaluation only) | Never (recommendations only) |
| Upstream | Athlete State / Fusion / Decision / Recommendation / Explainability | Blueprint / Runtime / Athlete State / Continuous Adaptation / Coach Context | Plan / Runtime / Athlete State / Continuous Adaptation / Coach Context | Plan / Runtime / Athlete State / Continuous Adaptation / Coach Context | Athlete State / Workout / Nutrition / Recovery Adaptation / Decision / Recommendation history | Workout progression / recovery / constraints |

---

## Rules

- Detection before adaptation — Continuous Adaptation Engine never changes plans
- Workout Adaptation adapts existing blueprints only — never generates from scratch
- Nutrition Adaptation adapts existing plans only — never generates from scratch
- Recovery Adaptation adapts existing plans only — never generates from scratch
- Goal Progress Engine evaluates only — never adapts plans and never mutates goals
- No AI / prompts / providers / networking / persistence / UI in detection, domain adaptation, or goal evaluation layers
- Handoff inputs from Continuous Adaptation remain structure-only contracts for domain engines; Goal Progress Engine's `ContinuousAdaptationInput` handoff back to Continuous Adaptation is likewise structure-only
