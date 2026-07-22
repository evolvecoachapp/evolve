# Insight Engine

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-23  
**Purpose:** Document the Insight Engine domain foundation (Sprint 18.7).  
**Source of Truth:** Yes — for Insight Engine layout, Insight Model, and Future Coach Integration placeholders on mobile.

Related: [ARCHITECTURE.md](./ARCHITECTURE.md), [PERFORMANCE_ENGINE.md](./PERFORMANCE_ENGINE.md), [ACHIEVEMENT_ENGINE.md](./ACHIEVEMENT_ENGINE.md), [ATHLETE_HISTORY.md](./ATHLETE_HISTORY.md), [RECOVERY_INTELLIGENCE.md](./RECOVERY_INTELLIGENCE.md), [DECISIONS.md](./DECISIONS.md) (ADR-045).

---

## Architecture Summary

```
Performance Snapshot
      ↓
Achievement Result
      ↓
Recovery Snapshot
      ↓
Athlete History
      ↓
Insight Engine
      ↓
Insight Snapshot
      ↓
Future Consumers
```

This layer aggregates **deterministic domain knowledge** from upstream engines.

It consumes:

- immutable `PerformanceSnapshot`
- immutable `AchievementResult`
- immutable `RecoverySnapshot`
- immutable `AthleteHistory`

It produces:

- immutable `InsightSnapshot`
- immutable `InsightCollection` / `InsightSummary`
- frozen `InsightEngineResult`

It is **not**:

- AI
- recommendations / coaching advice
- conversational responses
- prompt generation / LLM
- persistence / networking

Module: `app/src/features/insight-engine/`.

---

## Insight Model

Deterministic insight facts only:

| Model | Role |
|-------|------|
| **Insight** | Single immutable domain fact (type, category, severity, priority, statement, reason, evidence) |
| **InsightType** | Extensible type enum (`performance`, `achievement`, `recovery`, `history`, `summary` + reserved future types) |
| **InsightCategory** | Observational category (grade, volume, fatigue, personal_record, …) |
| **InsightSeverity** | Observational level (`info` / `notable` / `elevated` / `critical`) |
| **InsightPriority** | Ranking score 1–100 (higher = more prominent when sorted) |
| **InsightStatus** | Lifecycle within a snapshot (`active` / `superseded` / `invalid`) |
| **InsightContext** | Upstream ids + generation timestamp |
| **InsightEvidence** | Source attribution |
| **InsightReason** | Deterministic reason code + factual statement |
| **InsightMetadata** | Tags + attributes |
| **InsightCollection** | Ordered frozen list + counts by type |
| **InsightSummary** | Compact public summary |
| **InsightSnapshot** | Frozen aggregation artifact |
| **InsightEngineResult** | Snapshot + collection + summary + validation issues |

`statement` is a **domain fact**, never a recommendation or conversational reply.

### Insight types (active + reserved)

| Type | Status |
|------|--------|
| `performance` | Active — Sprint 18.7 |
| `achievement` | Active — Sprint 18.7 |
| `recovery` | Active — Sprint 18.7 |
| `history` | Active — Sprint 18.7 |
| `summary` | Active — Sprint 18.7 |
| `nutrition` | Reserved — architecture support only |
| `sleep` | Reserved — architecture support only |
| `bodyweight` | Reserved — architecture support only |
| `goal` | Reserved — architecture support only |
| `coach` | Reserved — architecture support only |

### Generators (one responsibility each)

| Generator | Emits |
|-----------|--------|
| `PerformanceInsightGenerator` | Grade, tonnage, completion facts |
| `AchievementInsightGenerator` | Unlock count, personal-record count |
| `RecoveryInsightGenerator` | Status, fatigue score, recovery window duration |
| `HistoryInsightGenerator` | Entry count, type composition |
| `SummaryInsightGenerator` | Aggregate domain-insight count |

---

## Engine Responsibilities

`InsightEngine.generate()`:

1. Soft-validate upstream id alignment  
2. Run isolated generators (performance → achievement → recovery → history)  
3. Run summary generator over domain insights  
4. Aggregate, normalize priorities, sort  
5. Build `InsightCollection` + `InsightSummary` + `InsightSnapshot`  
6. Validate snapshot integrity  
7. Return frozen `InsightEngineResult`

---

## Public Application API

| Function | Role |
|----------|------|
| `generateInsights(options)` | Generate insights → snapshot + collection + summary |
| `createInsightSnapshot(parts, options?)` | Snapshot from collection parts |
| `summarizeInsights(snapshot \| parts)` | Public summary extraction |

Engine internals are not part of the public API surface.

---

## Insight Snapshot

`InsightSnapshot` is a frozen point-in-time insight aggregation:

- embedded `InsightCollection` + `InsightSummary`
- stable ids for future consumers (Coach, Timeline, export)

Snapshots are **in-memory domain objects only** — not persistence.

---

## Future Coach Integration

Coach / conversational consumption of insights is **reserved in architecture only**.

Future sprints may:

1. Consume `InsightSnapshot` as structured context for Coach  
2. Map selected insights into Coach memory / prompt inputs **outside** this engine  
3. Keep generation of insights deterministic here; keep language generation in Coach layers  

This foundation intentionally provides **no AI prompts, LLM calls, recommendations, or conversation logic**.

Placeholder contract (not implemented):

| Concern | Future |
|---------|--------|
| Input | `InsightSnapshot` (read-only) |
| Consumer | Coach Intelligence / Conversation layers |
| Rules | Insight Engine remains deterministic and non-AI; Coach owns language |

---

## Explicit Non-Goals

No AI, recommendations, persistence, networking, prompt generation, LLM, or conversation logic. Does not modify Performance Engine, Achievement Engine, Recovery Intelligence, or Athlete History.
