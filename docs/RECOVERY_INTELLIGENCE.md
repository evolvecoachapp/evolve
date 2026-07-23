# Recovery Intelligence

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-23  
**Purpose:** Document how Recovery Intelligence spans domain engines and the Recovery Agent.  
**Source of Truth:** Yes — for the split between Recovery Domain engines and Recovery Agent orchestration, plus Recovery Metrics / Future Readiness Model placeholders on mobile.

Related: [ARCHITECTURE.md](./ARCHITECTURE.md), [RECOVERY_AGENT.md](./RECOVERY_AGENT.md), [AGENT_RUNTIME.md](./AGENT_RUNTIME.md), [ATHLETE_HISTORY.md](./ATHLETE_HISTORY.md), [PERFORMANCE_ENGINE.md](./PERFORMANCE_ENGINE.md), [COACH_INTELLIGENCE.md](./COACH_INTELLIGENCE.md), [DECISIONS.md](./DECISIONS.md) (ADR-044, ADR-062).

---

## Overview

Recovery Intelligence in EVOLVE has two complementary layers:

1. **Recovery Domain** (`features/recovery-intelligence`) — deterministic recovery snapshots, training-load metrics, and assessments (source of truth for executable recovery artifacts).
2. **Recovery Agent** (`features/recovery-agent`) — conversational / planning orchestrator that specializes recovery dialogues (fatigue, readiness, sleep, stress, deload) without replacing domain engines.

```
Recovery Agent (orchestrator)
        │
        ├── Reasoning (deterministic knowledge organization)
        ├── Planning (proposals only)
        ├── Strategies / Policies / Selectors
        └── Delegates to Recovery Domain when execution is required
                 │
                 ▼
        Action Engine → Tool Runtime → Domain Tool Adapters → Recovery Domain
```

---

## Responsibilities

| Layer | Owns | Does not own |
|-------|------|--------------|
| **Recovery Agent** | Intent/goal resolution, strategy selection, plan proposals, explanations | Prompts, providers, tool execution, persistence |
| **Recovery Domain** | Training-load / fatigue / recovery-window math, snapshots | Conversational orchestration |
| **Tool Runtime** | Adapter orchestration for ActionPlans | Domain business rules |
| **Coach Intelligence** | Coaching context preparation | Recovery-specific planning |

---

## Domain Architecture Summary

```
Athlete History
      ↓
Performance Snapshot
      ↓
Recovery Intelligence Engine
      ↓
Recovery Snapshot
      ↓
Future Consumers
```

This domain layer analyzes **completed training load context**.

It consumes:

- immutable `AthleteHistory`
- immutable `PerformanceSnapshot`
- optional immutable `WorkoutResult`
- optional `AchievementResult` — **reference metadata only**

It produces:

- immutable `RecoverySnapshot`
- immutable `RecoveryAssessment` / `RecoveryMetrics` / `RecoverySummary`

It is **not**:

- AI
- recommendations / coaching advice (agent owns conversational recommendations)
- persistence / networking
- history storage
- predictive models
- wearable integration

Module: `app/src/features/recovery-intelligence/`.

---

## Recovery Metrics

Deterministic metric groups only:

| Group | Fields (examples) |
|-------|-------------------|
| **TrainingLoad** | sessionLoad, volumeLoad, completed sets/reps, cumulativeTonnage, averageSessionLoad, relativeLoad, loadScore (0–100) |
| **DensityLoad** | durationMs/minutes, tonnage/sets/reps per minute, densityScore (0–100) |
| **FrequencyLoad** | windowDays, workoutsInWindow, performanceEntriesInWindow, frequencyScore (0–100) |
| **FatigueScore** | score (0–100), load/density/frequency components |
| **RecoveryWindow** | startAt, endAt, durationHours, durationMs (descriptive bounds) |
| **RecoveryStatus** | level (`fresh` / `moderate` / `elevated` / `high` / `insufficient_data`), score, label |

Supporting models:

- `RecoverySnapshot` — frozen analysis artifact
- `RecoveryMetrics` — aggregated metric groups + status + window
- `RecoveryAssessment` — status + metrics + indicators + evidence
- `RecoveryIndicator` — observational key/value signals
- `RecoveryEvidence` — source attributes
- `RecoveryContext` — athlete/session/history/snapshot metadata
- `RecoverySummary` — compact public summary
- `RecoveryEngineResult` — snapshot + assessment + summary + validation issues

### Calculator formulas (deterministic)

| Calculator | Rule |
|------------|------|
| `TrainingLoadCalculator` | `loadScore = clamp(sessionTonnage / 50, 0, 100)`; cumulative/average from history performance entries in lookback window |
| `DensityLoadCalculator` | `densityScore = clamp((tonnagePerMinute / 50) * 100, 0, 100)` (0 when rate null) |
| `FrequencyCalculator` | `frequencyScore = clamp(workoutsInWindow * (100 / 7), 0, 100)` |
| `FatigueCalculator` | `0.5·load + 0.25·density + 0.25·frequency` |
| `RecoveryWindowCalculator` | `durationHours = 12 + floor(score / 10) * 6` (12h–72h) |
| `RecoveryStatusCalculator` | 0–24 fresh · 25–49 moderate · 50–74 elevated · 75–100 high |

Calculators (one responsibility each):

- `TrainingLoadCalculator`
- `FatigueCalculator`
- `DensityLoadCalculator`
- `FrequencyCalculator`
- `RecoveryWindowCalculator`
- `RecoveryStatusCalculator`

---

## Engine Responsibilities

`RecoveryIntelligenceEngine.analyze()`:

1. Soft-validate input alignment (history / performance / workout / achievement ids)  
2. Compute load metrics via isolated calculators  
3. Aggregate fatigue, recovery window, and status  
4. Build `RecoveryMetrics` + `RecoveryAssessment` + `RecoverySummary`  
5. Create `RecoverySnapshot` and validate snapshot integrity  
6. Return frozen `RecoveryEngineResult`

---

## Public Application API

| Function | Role |
|----------|------|
| `analyzeRecovery(options)` | Analyze recovery → snapshot + assessment + summary |
| `createRecoverySnapshot(parts, options?)` | Snapshot from analysis parts |
| `summarizeRecovery(snapshot \| parts)` | Public summary extraction |

Engine internals are not part of the public API surface.

---

## Recovery Snapshot

`RecoverySnapshot` is a frozen point-in-time recovery analysis:

- embedded `RecoveryMetrics` + `RecoveryAssessment` + `RecoverySummary`
- stable ids for future consumers (readiness, Coach, export)

Snapshots are **in-memory domain objects only** — not persistence.

`RecoveryWindow` is a **descriptive duration metric**, not a coaching recommendation.

---

## Future Readiness Model

Readiness scoring / next-session readiness is **reserved in architecture only**.

Future sprints may:

1. Consume `RecoverySnapshot` as an input signal to a Readiness Model  
2. Combine recovery metrics with other non-predictive domain facts  
3. Expose readiness summaries to Coach / Timeline consumers  

This foundation intentionally provides **no readiness scores, predictions, sleep inputs, or wearable adapters**.

Placeholder contract (not implemented):

| Concern | Future |
|---------|--------|
| Input | `RecoverySnapshot` (+ optional other domain facts) |
| Output | Immutable readiness assessment artifact |
| Rules | Deterministic; no AI; no recommendations in this foundation |

---

## Explicit Non-Goals

No AI, recommendations, persistence, networking, history storage, predictive models, sleep analysis, wearable integration, or Coach AI dependency. Does not modify Athlete History, Performance Engine, Achievement Engine, or Workout Runtime.
