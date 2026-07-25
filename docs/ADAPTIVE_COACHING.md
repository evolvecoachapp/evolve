# Adaptive Coaching

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-25  
**Purpose:** Describe the adaptive coaching stack — continuous opportunity detection feeding future domain adaptation engines.  
**Source of Truth:** Partial — subsystem details live in linked docs.

Related: [CONTINUOUS_ADAPTATION_ENGINE.md](./CONTINUOUS_ADAPTATION_ENGINE.md), [EXPLAINABILITY_ENGINE.md](./EXPLAINABILITY_ENGINE.md), [REASONING_PIPELINE.md](./REASONING_PIPELINE.md), [AI_RUNTIME.md](./AI_RUNTIME.md), [ARCHITECTURE.md](./ARCHITECTURE.md), [DECISIONS.md](./DECISIONS.md) (ADR-076).

---

## Adaptive Coaching Path (Sprint 23.1)

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
Workout Adaptation Engine        ← future (consumes WorkoutAdaptationInput)
Nutrition Adaptation Engine      ← future (consumes NutritionAdaptationInput)
Recovery Adaptation Engine       ← future (consumes RecoveryAdaptationInput)
Goal Progress Engine             ← future (consumes GoalProgressInput)
```

---

## Ownership

| Stage | Module | Owns |
|-------|--------|------|
| Opportunity detection | `features/continuous-adaptation` | Whether meaningful adaptation opportunities exist; immutable `AdaptationDecision` |
| Workout plan adaptation | future Workout Adaptation Engine | How workouts change (not this sprint) |
| Nutrition plan adaptation | future Nutrition Adaptation Engine | How nutrition changes (not this sprint) |
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

Downstream adaptation engines (future):

- **consume** handoff inputs (`WorkoutAdaptationInput`, …)
- **own** plan / protocol modifications
- remain out of scope for Sprint 23.1

---

## Distinction from Training Adaptation Engine

| Concern | Continuous Adaptation (23.1) | Training Adaptation (17.5) |
|---------|------------------------------|----------------------------|
| Scope | Cross-domain opportunity detection over time | Workout readiness / adaptation recommendations |
| Output | `AdaptationDecision` + handoff inputs | `TrainingAdaptationResult` / `AdaptationRecommendation` |
| Plan mutation | Never | Never (recommendations only) |
| Upstream | Athlete State / Fusion / Decision / Recommendation / Explainability | Workout progression / recovery / constraints |

---

## Rules

- Detection before adaptation — Continuous Adaptation Engine never changes plans
- No AI / prompts / providers / networking / persistence / UI in the detection layer
- Handoff inputs are structure-only contracts for future engines
