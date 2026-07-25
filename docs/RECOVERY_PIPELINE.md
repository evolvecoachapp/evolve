# Recovery Pipeline

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-26  
**Purpose:** Document the AI Recovery Pipeline path and where the Recovery Adaptation Engine sits relative to Continuous Adaptation and Recovery Runtime.  
**Source of Truth:** Partial — subsystem details live in linked docs.

Related: [RECOVERY_ADAPTATION_ENGINE.md](./RECOVERY_ADAPTATION_ENGINE.md), [CONTINUOUS_ADAPTATION_ENGINE.md](./CONTINUOUS_ADAPTATION_ENGINE.md), [ADAPTIVE_COACHING.md](./ADAPTIVE_COACHING.md), [WORKOUT_PIPELINE.md](./WORKOUT_PIPELINE.md), [NUTRITION_PIPELINE.md](./NUTRITION_PIPELINE.md), [ARCHITECTURE.md](./ARCHITECTURE.md).

---

## Pipeline Path

```
Athlete State / Context Fusion / Decision / Recommendation / Explainability
      ↓
Continuous Adaptation Engine          ← opportunity detection only
      ↓
AdaptationDecision (recovery handoff keys)
      ↓
Recovery Adaptation Engine            ← adapts EXISTING Recovery Plan
      ↓
Updated Recovery Plan
      ↓
Recovery Runtime
```

The Recovery Adaptation Engine is **not** a generation engine. Upstream recovery plan generation remains separate. This stage only applies Continuous Adaptation decisions to an already-existing plan before runtime handoff.

---

## Recovery Adaptation Placement

| Stage | Owns |
|-------|------|
| Continuous Adaptation | Whether recovery adaptation opportunities exist |
| Recovery Adaptation Engine | How an existing plan structure is adjusted (keys / modifications) |
| Recovery Runtime | Execution / logging of the updated plan |

```
Recovery Plan
+ Recovery Runtime
+ Athlete State
+ Continuous Adaptation Decision
+ Coach Context
      ↓
Recovery Adaptation Engine
      ↓
Updated Recovery Plan → Recovery Runtime
```

---

## Boundaries

- Recovery Adaptation adapts existing plans only — never generates from scratch
- No AI reasoning / prompts / providers in the adaptation layer
- No networking or persistence in the adaptation layer
- Structure keys only on `UpdatedRecoveryPlan` / `RecoveryRuntimeInput`

---

## Rules

- Recovery Adaptation sits **after** Continuous Adaptation and **before** Recovery Runtime
- Requires existing `planId` + structure keys (or port resolution)
- Parallel to Workout / Nutrition Adaptation Engines (domain-specific, same architectural role)
