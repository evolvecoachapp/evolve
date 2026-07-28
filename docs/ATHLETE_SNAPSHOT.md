# Athlete Snapshot

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-28  
**Purpose:** Document Athlete Snapshot composition — the immutable point-in-time athlete representation composed from existing EVOLVE artifacts.  
**Source of Truth:** Yes — for Sprint 28.2 Athlete Snapshot on mobile.

Related: [INTELLIGENCE_WORKSPACE.md](./INTELLIGENCE_WORKSPACE.md), [WEEKLY_REPORT.md](./WEEKLY_REPORT.md), [COACHING_SESSION.md](./COACHING_SESSION.md), [COACH_TIMELINE.md](./COACH_TIMELINE.md), [ARCHITECTURE.md](./ARCHITECTURE.md), [DECISIONS.md](./DECISIONS.md) (ADR-093).

---

## Purpose

The Athlete Snapshot is the immutable point-in-time representation of the athlete.

It is:

- A composition layer
- A deterministic snapshot
- Immutable
- Built only from existing EVOLVE domain artifacts

It is **not**:

- Persistence
- A database model
- An ORM entity
- An event store
- A cache
- A cloud sync layer
- A UI artifact
- An LLM artifact

---

## Composition Flow

Athlete State  
↓  
Home Experience  
↓  
Daily Brief  
↓  
Weekly Coach Report  
↓  
Athlete Workspace  
↓  
Coach Timeline  
↓  
Explainable Coaching Session  
↓  
Athlete Snapshot  
↓  
Future: Cloud / Offline / Cache / Restore / Export / Analytics

---

## Models

`AthleteSnapshot`, `SnapshotIdentity`, `SnapshotState`, `SnapshotWorkspace`, `SnapshotTimeline`, `SnapshotCoach`, `SnapshotMetadata`, `SnapshotVersion`, `SnapshotEvidence`, `SnapshotIntegrity`, `SnapshotResult`

All models are immutable and reference existing artifacts only.

---

## Snapshot Composition

| Projection | Sources |
|-----------|---------|
| Identity | Athlete id, deterministic snapshot id, createdAt |
| State | Athlete State, current phase, goal progress, recovery state |
| Workspace | Athlete Workspace (no transformation) |
| Timeline | Coach Timeline, latest events, latest decisions, latest restores |
| Coach | Explainable Coaching Session, recommendation, confidence, expected outcome, evidence refs |
| Metadata | generatedAt, weekStart, weekEnd, applicationVersion, schemaVersion |
| Version | snapshotVersion, workspaceVersion, timelineVersion, coachVersion |
| Evidence | Workspace id, Timeline entry ids, Coaching Session evidence ids/keys, plan version references |

---

## Dashboard APIs

- `getCurrentSnapshot()`
- `getSnapshotIdentity()`
- `getSnapshotState()`
- `getSnapshotWorkspace()`
- `getSnapshotTimeline()`
- `getSnapshotCoach()`

These are presentation-facing getters only. They do not introduce new domain logic.

---

## Integrity

Integrity validation checks:

- Required projections exist
- Version compatibility is present for workspace, timeline, and coach projections
- Evidence references remain consistent with the current timeline and coaching session
- Immutable model integrity is preserved

---

## Composition Root

Registers `AthleteSnapshotService` (depends on `AthleteStateService` + `AthleteWorkspaceService` + `CoachTimelineService` + `ExplainableCoachingSessionService` + `WeeklyCoachReportService`).

---

## Constraints

**Does not:** create new engines, duplicate business logic, persist to DB, add a cache layer, add cloud sync, call an LLM, or redesign UI.
