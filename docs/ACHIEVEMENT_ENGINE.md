# Achievement Engine

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-22  
**Purpose:** Document the Achievement Engine foundation and Personal Records (Sprint 18.4).  
**Source of Truth:** Yes — for Achievement Engine layout, Personal Records, and future category extension on mobile.

Related: [ARCHITECTURE.md](./ARCHITECTURE.md), [PERFORMANCE_ENGINE.md](./PERFORMANCE_ENGINE.md), [DOMAIN_EVENTS.md](./DOMAIN_EVENTS.md), [DECISIONS.md](./DECISIONS.md) (ADR-042).

---

## Architecture Summary

```
Performance Snapshot
      ↓
Achievement Engine
      ↓
Achievement Result
      ↓
Achievement Events
      ↓
Future Consumers
```

This layer detects **immutable achievements** from completed workout analytics.

It consumes:

- immutable `PerformanceSnapshot`
- immutable `WorkoutResult`
- injected `PersonalRecordBaselineProvider` (comparison source only)
- `DomainEventStream` — **architecture reference only** (not required at runtime)

It produces:

- immutable `AchievementResult` / `AchievementEngineResult`
- immutable `AchievementEvent`s (`achievement_unlocked`, `personal_record_unlocked`)

It is **not**:

- AI
- persistence / networking
- history storage implementation
- gamification / badges / streaks implementation
- recommendations
- a subscriber of the Domain Event dispatcher (yet)

Module: `app/src/features/achievement-engine/`.

---

## Extensible Achievement Model

Core models use open string identifiers for `AchievementType` and `AchievementCategory` so future categories can be added **without redesigning** existing achievement shapes.

| Concern | Model |
|---------|--------|
| Core achievement | `Achievement` (immutable) |
| Type / category / level / status | Open string + known constants |
| Evidence / rule / metadata / context | Extensible attribute bags |
| Public outputs | `AchievementResult`, `AchievementSummary`, `AchievementEngineResult` |
| Events | `AchievementUnlockedEvent`, `PersonalRecordUnlockedEvent` |

Reserved category constants (architecture support only — **not implemented** this sprint):

- `milestones`
- `badges`
- `goals`
- `challenges`
- `streaks`

---

## Personal Records

Sprint 18.4 implements **Personal Records** only.

### Detected PR kinds

| PersonalRecordType | Source metric |
|--------------------|---------------|
| `highest_weight` | `intensity.maxWeight` |
| `highest_volume` | `volume.volumeLoad` |
| `highest_tonnage` | `volume.tonnage` |
| `highest_repetitions` | `volume.totalCompletedRepetitions` |
| `highest_completed_sets` | `volume.totalCompletedSets` |
| `highest_density` | `density.tonnagePerMinute` |
| `highest_session_volume` | `session.metrics.volume.tonnage` |
| `highest_exercise_volume` | per-exercise `tonnage` |

### Comparison rules

- Compares **only** against the injected `PersonalRecordBaselineProvider`
- Unlocks when `current > baseline`
- When baseline is `null`, a positive current value is treated as **first recorded value**
- History persistence / retrieval is **out of scope**

### Detectors (one responsibility each)

- `WeightPRDetector`
- `VolumePRDetector`
- `TonnagePRDetector`
- `RepetitionPRDetector`
- `CompletedSetsPRDetector`
- `DensityPRDetector`
- `SessionVolumeDetector`
- `ExerciseVolumeDetector`

---

## Engine Responsibilities

`AchievementEngine.evaluate()`:

1. Validate snapshot ↔ workout result alignment  
2. Run Personal Record detectors against injected baselines  
3. Aggregate / dedupe / sort achievements  
4. Validate integrity, duplicates, evidence, rules, metadata  
5. Emit immutable achievement events  
6. Build summary + freeze `AchievementEngineResult`

---

## Public Application API

| Function | Role |
|----------|------|
| `evaluateAchievements(snapshot, result, baselineProvider, options?)` | Full evaluation |
| `detectPersonalRecords(snapshot, result, baselineProvider, options?)` | PR-only detection |
| `summarizeAchievements(result)` | Public summary extraction |

Engine internals are not part of the public API surface.

---

## Future Milestones

Future sprints may add a **Milestones** category (e.g. total sessions completed, cumulative volume thresholds) by:

1. Registering new `AchievementType` / category constants  
2. Adding milestone detectors alongside existing PR detectors  
3. Emitting the same `AchievementUnlockedEvent` contract  

No change to core `Achievement` fields is required.

---

## Future Gamification

Badges, goals, challenges, and streaks are **reserved in architecture only**.

They must remain:

- separate detectors / rules  
- immutable achievement instances  
- non-AI, non-persistent until a dedicated persistence sprint  

Gamification UX, leaderboards, and reward economies are **out of scope**.

---

## Explicit Non-Goals

No persistence, AI, networking, history store, badge implementation, streak implementation, goal tracking, challenge engine, recommendations, Timeline, or Coach AI dependency. Does not modify Performance Engine or Workout Runtime.
