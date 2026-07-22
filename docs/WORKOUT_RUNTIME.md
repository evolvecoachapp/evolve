# Workout Runtime

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-22  
**Purpose:** Document the Workout Runtime domain — live execution state of a generated WorkoutSession (Sprint 18.0).  
**Source of Truth:** Yes — for Workout Runtime layout and rules on mobile.

Related: [ARCHITECTURE.md](./ARCHITECTURE.md), [AI_SYSTEM.md](./AI_SYSTEM.md), [DECISIONS.md](./DECISIONS.md) (ADR-038), [DECISION_INTELLIGENCE.md](./DECISION_INTELLIGENCE.md).

---

## Architecture Summary

```
WorkoutSession          (immutable, from Workout Assembly / Program Generation)
        ↓
WorkoutRuntime          (mutable in-engine snapshot graph)
        ↓
ExerciseRuntime
        ↓
SetRuntime
        ↓
SessionState / WorkoutState
        ↓
WorkoutResult           (immutable terminal outcome)
```

This domain represents a workout **while it is actively being performed**.

It is **not**:

- Program Generation or any pipeline engine
- UI
- Persistence / networking
- Timers / rest countdowns
- Analytics / history
- AI

Module: `app/src/features/workout-runtime/`.

---

## Session Lifecycle

| State | Meaning |
|-------|---------|
| `NotStarted` | Seeded runtime before `start` |
| `Running` | Active performance |
| `Paused` | Temporarily suspended |
| `Completed` | All exercises finished or skipped |
| `Cancelled` | Abandoned before completion |

### Valid transitions

```
NotStarted → Running | Cancelled
Running    → Paused | Completed | Cancelled
Paused     → Running | Completed | Cancelled
Completed  → (terminal)
Cancelled  → (terminal)
```

Transitions are validated; invalid operations throw `WorkoutRuntimeError`.

---

## Runtime State Model

| Model | Role |
|-------|------|
| `WorkoutRuntime` | Full in-memory runtime graph for one session |
| `ExerciseRuntime` | Per-exercise state, set list, progress |
| `SetRuntime` | Per-set state + weight / reps / RPE / RIR / notes |
| `WorkoutProgress` | Aggregate completion counters + percent |
| `WorkoutRuntimeSummary` | Public snapshot (safe application output) |
| `WorkoutResult` | Frozen terminal outcome |
| `WorkoutRuntimeEvent` | Append-only in-memory event log (not telemetry) |
| `WorkoutRuntimeMetrics` | Structural counters |
| `WorkoutRuntimeConfiguration` | Auto-complete knobs + fixed timestamp |

`SessionState` is an alias of `WorkoutState`.

Source `WorkoutSession` remains immutable — runtime never mutates assembly/program-generation outputs.

---

## Engine

`WorkoutRuntimeEngine` responsibilities:

- Start / pause / resume / finish (complete) / cancel
- Track current exercise and current set
- Advance to next set / next exercise
- Calculate completion percentage
- Skip exercise

No timers. No persistence.

---

## Public API

Application layer (`features/workout-runtime/application`):

| Function | Result |
|----------|--------|
| `startWorkout(session, config?)` | Opaque `ActiveWorkout` handle |
| `pauseWorkout(workout)` | `WorkoutRuntimeSummary` |
| `resumeWorkout(workout)` | `WorkoutRuntimeSummary` |
| `completeWorkout(workout)` | `WorkoutResult` |
| `skipExercise(workout)` | `WorkoutRuntimeSummary` |
| `completeSet(workout, input?)` | `WorkoutRuntimeSummary` |

Internal `WorkoutRuntime` / engine are not part of the public application contract. `ActiveWorkout` exposes only summary/progress/state accessors.

---

## Design Rules

- Consumes immutable `WorkoutSession` only
- Does **not** modify Program Generation, Assembly, or upstream engines
- No UI, persistence, networking, timers, analytics, or history
- Validators cover state transitions, set/exercise progression, completion, and invalid operations

---

## Tests

Lifecycle, state transitions, exercise progression, set progression, completion, validators, application API, regression — under `features/workout-runtime/__tests__/`.
