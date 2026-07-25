# Goal Progress Engine

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-26  
**Purpose:** Document the Goal Progress Engine — deterministic evaluation of athlete progress toward active goals.  
**Source of Truth:** Yes — for Goal Progress Engine layout, evaluation / tracking / comparison / timeline / policies, boundaries, and public API on mobile.

Related: [GOAL_EVALUATION_PIPELINE.md](./GOAL_EVALUATION_PIPELINE.md), [CONTINUOUS_ADAPTATION_ENGINE.md](./CONTINUOUS_ADAPTATION_ENGINE.md), [ADAPTIVE_COACHING.md](./ADAPTIVE_COACHING.md), [REASONING_PIPELINE.md](./REASONING_PIPELINE.md), [AI_RUNTIME.md](./AI_RUNTIME.md), [ARCHITECTURE.md](./ARCHITECTURE.md), [DECISIONS.md](./DECISIONS.md) (ADR-080).

---

## Responsibilities

Goal Progress Engine owns **goal progress evaluation only**.

It **does**:

- continuously evaluate athlete progress toward active goals using structured keys / flags / windows
- track goals, milestones, achievements, adherence, consistency, and history (observation only)
- evaluate strength / body composition / weight / performance / recovery / adherence / consistency / milestones via fixed ordinal tables
- compare goals / snapshots / timelines / history / milestones / progress (immutable key diffs)
- organize historical timelines / windows / history (no forecasting)
- produce immutable `GoalProgressState`, `GoalProgress`, `GoalPackage`, snapshots, and `ContinuousAdaptationInput` handoff
- expose a narrow public application API

It **does not**:

- adapt workout plans
- adapt nutrition plans
- adapt recovery plans
- mutate athlete goals
- perform AI reasoning, prediction, inference, or heuristics
- call AI providers / Prompt Builder / Tool Runtime / Action Engine
- persist state, network, or render UI

Module: `app/src/features/goal-progress/`.

---

## Architecture Summary

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
Goal Progress Engine
  ├── Tracking     (observation keys only)
  ├── Evaluation   (fixed ordinals / flags)
  ├── Comparison   (immutable key diffs)
  ├── Timeline     (historical organization only)
  ├── Policies     (safety / consistency / milestone / tracking)
  └── Validators   (integrity / milestones / history / package)
      ↓
GoalProgressState / GoalPackage
      ↓
ContinuousAdaptationInput → Continuous Adaptation Engine
```

---

## Module Boundaries

| Layer | Role |
|-------|------|
| `models/` | Immutable goal progress / milestone / package / result types |
| `progress/` | `GoalProgressEngine` / `GoalProgressCoordinator` / `GoalProgressSession` |
| `tracking/` | Goal / milestone / achievement / history / consistency / adherence trackers |
| `evaluation/` | Strength / body composition / weight / performance / recovery / adherence / consistency / milestone |
| `comparison/` | Goal / snapshot / timeline / history / milestone / progress comparators |
| `timeline/` | Goal / milestone / history / snapshot / window builders (historical only) |
| `builders/` | Progress / package / summary / snapshot / descriptor / result / handoff |
| `validators/` | Integrity / milestones / history / snapshot / timeline / dependencies / package |
| `policies/` | Progress / consistency / milestone / tracking / safety |
| `selectors/` | Goal / milestone / history / progress / timeline |
| `contracts/` | Athlete State / Workout / Nutrition / Recovery Adaptation / Decision / Recommendation ports (+ mocks) |
| `application/` | Narrow public API |
| `services/` | `GoalProgressEngineService` facade |

---

## Public API

| Function | Purpose |
|----------|---------|
| `evaluateGoalProgress` | Track + evaluate → immutable `GoalProgress` / `GoalPackage` / `GoalProgressState` |
| `trackGoalProgress` | Track goal signal presence only |
| `describeGoalProgress` | Describe engine capabilities / boundaries |
| `createGoalSnapshot` | Create point-in-time `GoalSnapshot` |
| `validateGoalProgress` | Validate goal progress package integrity |

Root export: models + application + `GoalProgressEngineService` only — internal modules are not part of the public surface.

---

## Integration

| Consumes | Via |
|----------|-----|
| Athlete State Engine | `AthleteStatePort` (state keys; mock in tests) |
| Workout Adaptation Engine | `WorkoutAdaptationPort` (adaptation keys; mock in tests) |
| Nutrition Adaptation Engine | `NutritionAdaptationPort` (adaptation keys; mock in tests) |
| Recovery Adaptation Engine | `RecoveryAdaptationPort` (adaptation keys; mock in tests) |
| Decision Engine | `DecisionEnginePort` → decision history (mock in tests) |
| Recommendation Engine | `RecommendationEnginePort` → recommendation history (mock in tests) |

| Produces | Types |
|----------|-------|
| Progress | `GoalProgress`, `GoalProgressState`, `GoalPackage`, `GoalSnapshot`, `GoalSummary` |
| Milestones | `GoalMilestone`, `GoalCheckpoint`, `GoalAchievement` |
| Timeline | `GoalTimeline`, `GoalHistory`, `GoalTrend` |
| Handoff | `ContinuousAdaptationInput` (structure keys only) |

---

## Coordinator Pipeline

`GoalProgressCoordinator.evaluate(input)`:

1. Validate `athleteId` present
2. Resolve upstream via ports (or use input refs/keys)
3. Run trackers → observations
4. Run evaluators → achievements / checkpoints / milestones
5. Aggregate evaluation bundle (fixed ordinals)
6. Build `GoalProgress` + package + snapshot + timeline + history
7. Build `ContinuousAdaptationInput` handoff
8. Apply policies (safety / consistency / milestone / tracking / progress)
9. Validate package
10. Freeze everything
11. Return `GoalResult`

---

## Rules

- Evaluation happens downstream of domain adaptation engines and feeds Continuous Adaptation Engine
- No AI reasoning, prediction, inference, heuristics, prompts, or provider SDKs
- No workout / nutrition / recovery plan adaptation
- No athlete goal mutation
- No networking or persistence
- Evaluation / tracking use structured codes, keys, and fixed ordinal tables only
