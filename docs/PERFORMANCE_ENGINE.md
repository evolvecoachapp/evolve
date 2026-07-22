# Performance Engine

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-22  
**Purpose:** Document the Performance Engine for single-session workout analytics (Sprint 18.3).  
**Source of Truth:** Yes — for Performance Engine layout, Metric Model, and Future Trend Analysis on mobile.

Related: [ARCHITECTURE.md](./ARCHITECTURE.md), [DOMAIN_EVENTS.md](./DOMAIN_EVENTS.md), [WORKOUT_RUNTIME.md](./WORKOUT_RUNTIME.md), [DECISIONS.md](./DECISIONS.md) (ADR-041).

---

## Architecture Summary

```
Domain Events
      ↓
Workout Result
      ↓
Performance Engine
      ↓
Performance Snapshot
      ↓
Future Consumers
```

This layer analyzes **completed workout execution**.

It consumes:

- immutable `WorkoutResult`
- immutable `EventStream` (Domain Events)
- optional `DecisionReport` (reference metadata only)

It produces an immutable **Performance Snapshot**.

It is **not**:

- AI
- persistence / networking
- multi-session history
- personal records
- recovery scoring
- recommendations
- workout execution mutation
- program generation mutation

Module: `app/src/features/performance-engine/`.

---

## Metric Model

Single-session metrics only:

| Group | Fields (examples) |
|-------|-------------------|
| **Volume** | tonnage, volumeLoad, completed sets/reps, loaded vs unloaded sets |
| **Intensity** | average/max weight, RPE, RIR (null when no samples) |
| **Density** | durationMs/minutes, tonnage/sets/reps per minute (null when duration is 0) |
| **Completion** | exercise/set/workout completion percents from `WorkoutResult.progress` |

Supporting models:

- `PerformanceSnapshot` — frozen analysis artifact
- `PerformanceMetrics` — volume + intensity + density + completion
- `ExercisePerformance` / `MovementPerformance` / `SessionPerformance`
- `PerformanceGrade` — heuristic letter grade (`A`–`F` / `Incomplete`)
- `PerformanceSummary` — compact public summary
- `PerformanceContext` — session/runtime/event metadata (+ optional decision report id)
- `PerformanceEngineResult` — snapshot + summary + validation issues
- `PerformanceTrend` — **placeholder** (`available: false`, `single_session_only`)

Calculators (one responsibility each):

- `VolumeCalculator`
- `IntensityCalculator`
- `DensityCalculator`
- `CompletionCalculator`
- `DurationCalculator`

---

## Engine Responsibilities

`PerformanceEngine.analyze()`:

1. Validate completed workout + execution data  
2. Extract set/exercise samples from `EventStream`  
3. Calculate volume, tonnage, sets, repetitions  
4. Calculate intensity averages  
5. Calculate completion ratios  
6. Calculate density from execution duration (`startedAt` → `completedAt`/`cancelledAt`)  
7. Build exercise/movement rows  
8. Grade + summarize  
9. Freeze immutable `PerformanceSnapshot`

No trend analysis across sessions.

---

## Public Application API

| Function | Role |
|----------|------|
| `analyzeWorkoutPerformance(result, stream, options?)` | Full single-session analysis |
| `summarizePerformance(snapshot)` | Public summary extraction |
| `gradePerformance(snapshot)` | Single-session heuristic grade |

Engine internals are not part of the public API surface.

---

## Future Trend Analysis

`PerformanceTrend` is intentionally a single-session placeholder:

```ts
{ available: false, sessionCount: 1, message: "single_session_only" }
```

Future sprints may introduce multi-session trends, personal records, and recovery-aware scoring — **out of scope** for Sprint 18.3.

---

## Explicit Non-Goals

No persistence, AI, networking, history store, multi-session analysis, personal records, recovery, recommendations, Timeline, or Coach AI dependency.
