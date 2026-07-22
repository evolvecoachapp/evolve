# Athlete History

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-23  
**Purpose:** Document the Athlete History domain foundation (Sprint 18.5).  
**Source of Truth:** Yes — for Athlete History layout, History Model, Offline Synchronization placeholders, and Timeline UI placeholders on mobile.

Related: [ARCHITECTURE.md](./ARCHITECTURE.md), [ACHIEVEMENT_ENGINE.md](./ACHIEVEMENT_ENGINE.md), [PERFORMANCE_ENGINE.md](./PERFORMANCE_ENGINE.md), [DOMAIN_EVENTS.md](./DOMAIN_EVENTS.md), [DECISIONS.md](./DECISIONS.md) (ADR-043).

---

## Architecture Summary

```
Workout Runtime
      ↓
Domain Events
      ↓
Performance Snapshot
      ↓
Achievement Result
      ↓
Athlete History
      ↓
History Snapshot
      ↓
Future Consumers
```

This layer organizes an athlete's journey as an **immutable chronological record**.

It aggregates domain facts from:

- immutable `WorkoutResult`
- immutable `PerformanceSnapshot`
- immutable `AchievementResult`
- optional `EventStream` — **architecture reference only** (not required at runtime)

It produces:

- immutable `AthleteHistory`
- immutable `HistorySnapshot`
- immutable `HistorySummary` / `HistoryStatistics`

It is **not**:

- a UI timeline
- persistence / history storage
- analytics
- AI
- networking
- a querying or filtering engine
- a calendar

Module: `app/src/features/athlete-history/`.

---

## History Model

| Concern | Model |
|---------|--------|
| Aggregate record | `AthleteHistory` (immutable) |
| Point-in-time freeze | `HistorySnapshot` |
| Chronological unit | `HistoryEntry` (+ specialized workout/performance/achievement entries) |
| Type / category | Open string + known constants |
| Links / evidence | `HistoryReference`, `HistoryEvidence` |
| Context / metadata | `HistoryContext`, `HistoryMetadata` |
| Public outputs | `HistorySummary`, `HistoryStatistics`, `HistoryEngineResult` |

### Entry types (implemented)

| Type | Source |
|------|--------|
| `workout` | `WorkoutResult` |
| `performance` | `PerformanceSnapshot` |
| `achievement` | unlocked `Achievement`s from `AchievementResult` |

### Extensible entry architecture (reserved)

Future entry types can be added **without redesigning** core `HistoryEntry` fields:

- `nutrition`
- `recovery`
- `sleep`
- `bodyweight`
- `coach`
- `goals`
- `milestones`
- `challenges`

Register new type/category constants and a dedicated aggregator beside existing ones.

---

## Engine Responsibilities

`AthleteHistoryEngine.build()`:

1. Soft-validate input alignment (runtime/session/snapshot ids)  
2. Aggregate domain facts via isolated aggregators  
3. Normalize (dedupe → chronological sort → freeze)  
4. Validate chronology, duplicates, references, timestamps, categories  
5. Build `AthleteHistory` + `HistoryStatistics` + `HistorySummary`  
6. Create `HistorySnapshot` and validate snapshot consistency  
7. Return frozen `HistoryEngineResult`

---

## Aggregators (one responsibility each)

- `WorkoutAggregator`
- `PerformanceAggregator`
- `AchievementAggregator`
- `HistoryStatisticsAggregator`
- `SummaryAggregator`

---

## Public Application API

| Function | Role |
|----------|------|
| `buildAthleteHistory(options)` | Build history + snapshot + summary |
| `createHistorySnapshot(history, options?)` | Snapshot an existing history |
| `summarizeHistory(history \| parts)` | Public summary extraction |

Engine internals are not part of the public API surface.

---

## History Snapshot

`HistorySnapshot` is a frozen point-in-time view of `AthleteHistory`:

- same chronological entries
- embedded `HistoryStatistics` + `HistorySummary`
- stable ids for future consumers (sync, timeline, export)

Snapshots are **in-memory domain objects only** — not persistence.

---

## Future Offline Synchronization

Offline sync is **reserved in architecture only**.

Future sprints may:

1. Persist `HistorySnapshot` payloads to device storage  
2. Reconcile local snapshots with cloud history feeds  
3. Replay immutable entries without re-running upstream engines  

This foundation intentionally provides **no storage adapters, queues, or sync protocols**.

---

## Future Timeline UI

Timeline UI is **out of scope**.

Athlete History must remain a domain model. A future Timeline screen may:

- read `HistorySnapshot` / `HistoryEntry` lists
- render chronological cards
- never own aggregation or validation logic

No calendar, filters, or rendering engine lives in this module.

---

## Explicit Non-Goals

No persistence, AI, networking, history storage, querying/filtering engine, timeline rendering, calendar, analytics platform, or Coach AI dependency. Does not modify Workout Runtime, Domain Events, Performance Engine, or Achievement Engine.
