# Plan History

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-28  
**Purpose:** Document immutable versioned plan snapshots for Workout and Nutrition lineages.  
**Source of Truth:** Yes — for Sprint 25.2 plan versioning foundation on mobile.

Related: [WORKOUT_PIPELINE.md](./WORKOUT_PIPELINE.md), [NUTRITION_PIPELINE.md](./NUTRITION_PIPELINE.md), [COACH_CONVERSATION.md](./COACH_CONVERSATION.md), [COACH_TIMELINE.md](./COACH_TIMELINE.md), [PROACTIVE_INSIGHTS.md](./PROACTIVE_INSIGHTS.md), [COACHING_SESSION.md](./COACHING_SESSION.md), [ARCHITECTURE.md](./ARCHITECTURE.md), [DECISIONS.md](./DECISIONS.md) (ADR-083, ADR-085, ADR-086, ADR-087, ADR-088).

---

## Goal

Active Workout and Nutrition plans are versioned as **append-only immutable snapshots**. History never mutates or deletes prior versions. Restore (Sprint 25.3) republishes a prior snapshot as a **new** version.

---

## Flow

```
Plan created / modified / restored
      ↓
Plan History.publishVersion
      ↓
Immutable PlanSnapshot + PlanVersion
      ↓
Lineage history (v1…vn)
```

---

## Module

`app/src/features/plan-history/`

- Models: `PlanType`, `PlanChangeReason`, `PlanVersion`, `PlanSnapshot`, `PlanHistory`, `PublishPlanVersionRequest`
- Store: in-memory append-only `PlanHistoryStore`
- Service: `PlanHistoryService`
- Application API: `publishPlanVersion`, `getPlanHistory`
- Integrity: deterministic checksum (`computeSnapshotChecksum`); corrupted snapshots flagged and rejected by restore

**Does not:** persist to DB, network, regenerate plans, adapt plans, or own UI.

---

## Change Reasons

`initial` | `generated` | `modified` | `restored` | `adapted` | `manual`

---

## Versioning Rules

- Each publish increments `versionNumber` by 1
- Snapshots are frozen after publish
- Restore never overwrites — it publishes `changeReason: restored` as `n+1`
- Example: v1 → v2 → v3 → restore v1 → **v4** (v1–v3 remain)

---

## Integration

- Coach Conversation attaches / modifies workouts → publishes history
- Plan Restore resolves targets against history and publishes restored versions
- Coach Timeline journals create / modify / restore decisions for explainability
- Composition Root: `PlanHistoryService`
