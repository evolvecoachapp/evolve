# Goal Evaluation Pipeline

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-26  
**Purpose:** Document the Goal Evaluation Pipeline path and where the Goal Progress Engine sits relative to upstream domain engines and the Continuous Adaptation Engine.  
**Source of Truth:** Partial — subsystem details live in linked docs.

Related: [GOAL_PROGRESS_ENGINE.md](./GOAL_PROGRESS_ENGINE.md), [CONTINUOUS_ADAPTATION_ENGINE.md](./CONTINUOUS_ADAPTATION_ENGINE.md), [WORKOUT_ADAPTATION_ENGINE.md](./WORKOUT_ADAPTATION_ENGINE.md), [NUTRITION_ADAPTATION_ENGINE.md](./NUTRITION_ADAPTATION_ENGINE.md), [RECOVERY_ADAPTATION_ENGINE.md](./RECOVERY_ADAPTATION_ENGINE.md), [ADAPTIVE_COACHING.md](./ADAPTIVE_COACHING.md), [ARCHITECTURE.md](./ARCHITECTURE.md).

---

## Pipeline Path

```
Athlete State Engine
      +
Workout Adaptation Engine
      +
Nutrition Adaptation Engine
      +
Recovery Adaptation Engine
      +
Decision History
      +
Recommendation History
      ↓
Goal Progress Engine              ← evaluation only, no plan adaptation
      ↓
GoalProgressState / GoalPackage
      ↓
ContinuousAdaptationInput
      ↓
Continuous Adaptation Engine
```

The Goal Progress Engine is **not** an adaptation engine. It never changes workout, nutrition, or recovery plans, and it never mutates athlete goals. It only evaluates progress toward existing goals using structured keys from upstream engines and history, and hands a structure-only input back to the Continuous Adaptation Engine for opportunity detection.

---

## Goal Progress Placement

| Stage | Owns |
|-------|------|
| Workout / Nutrition / Recovery Adaptation Engines | How existing plans are structurally adjusted |
| Decision History / Recommendation History | Prior coaching decisions and recommendations |
| Goal Progress Engine | Whether/how much progress has been made toward active goals (evaluation only) |
| Continuous Adaptation Engine | Whether meaningful adaptation opportunities exist across domains, including goal progress signals |

```
Athlete State
+ Workout Adaptation Engine
+ Nutrition Adaptation Engine
+ Recovery Adaptation Engine
+ Decision History
+ Recommendation History
      ↓
Goal Progress Engine
      ↓
GoalProgressState → ContinuousAdaptationInput → Continuous Adaptation Engine
```

---

## Boundaries

- Goal Progress Engine evaluates only — never adapts workout / nutrition / recovery plans
- Never mutates athlete goals
- No AI reasoning / prediction / prompts / providers in the evaluation layer
- No networking or persistence in the evaluation layer
- Structure keys only on `ContinuousAdaptationInput` handoff

---

## Rules

- Goal Progress Engine sits **after** the domain adaptation engines and **before** the Continuous Adaptation Engine
- Consumes Athlete State / Workout / Nutrition / Recovery Adaptation / Decision / Recommendation history via ports (mocked in tests)
- Parallel to Workout / Nutrition / Recovery Adaptation Engines in architectural role, but evaluates progress rather than adapting plans
