# Unified Athlete Workspace

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-28  
**Purpose:** Document Unified Athlete Workspace composition — the canonical immutable read model aggregating every athlete artifact for future sync, portal, dashboard, export, cache, and analytics consumers.  
**Source of Truth:** Yes — for Sprint 28.3 Unified Athlete Workspace on mobile.

Related: [ATHLETE_SNAPSHOT.md](./ATHLETE_SNAPSHOT.md), [INTELLIGENCE_WORKSPACE.md](./INTELLIGENCE_WORKSPACE.md), [WEEKLY_REPORT.md](./WEEKLY_REPORT.md), [HOME_EXPERIENCE.md](./HOME_EXPERIENCE.md), [DAILY_BRIEF.md](./DAILY_BRIEF.md), [COACHING_SESSION.md](./COACHING_SESSION.md), [COACH_TIMELINE.md](./COACH_TIMELINE.md), [ARCHITECTURE.md](./ARCHITECTURE.md), [DECISIONS.md](./DECISIONS.md) (ADR-094).

---

## Purpose

The Unified Athlete Workspace is the canonical read model of the athlete.

It is:

- A deterministic composition layer
- An immutable aggregate of existing athlete artifacts
- The single read model for future Cloud Sync, Coach Portal, Web Dashboard, Mobile Dashboard, Export, Offline Cache, and Analytics

It is **not**:

- A new intelligence engine
- Business logic
- AI / LLM behavior
- Persistence
- A database model
- A cache
- An event bus
- A scheduler

---

## Composition Flow

Athlete State  
↓  
Home Experience  
↓  
Daily Brief  
↓  
Weekly Report  
↓  
Coach Timeline  
↓  
Explainable Coaching Session  
↓  
Athlete Snapshot  
↓  
Unified Athlete Workspace  
↓  
Consumers

---

## Models

`Workspace`, `WorkspaceHeader`, `WorkspaceSummary`, `WorkspaceHealth`, `WorkspaceGoals`, `WorkspaceWorkout`, `WorkspaceNutrition`, `WorkspaceRecovery`, `WorkspaceInsights`, `WorkspaceTimeline`, `WorkspaceCoach`, `WorkspaceSnapshot`, `WorkspaceMetadata`, `WorkspaceResult`

All models are immutable and project existing artifacts only.

---

## Projections

| Projection | Sources |
|-----------|---------|
| Header | Athlete State, Goal Progress, Home Experience |
| Summary | Home Experience, Daily Brief, Weekly Report, Athlete Snapshot availability |
| Health | Athlete State, Home recovery signals |
| Goals | Goal Progress, Home goal card |
| Workout | Home workout card |
| Nutrition | Home nutrition card |
| Recovery | Home recovery card, Athlete State |
| Insights | Proactive Insights, Home insight cards |
| Timeline | Coach Timeline, latest events / decisions / restores |
| Coach | Explainable Coaching Session |
| Snapshot | Athlete Snapshot (no transformation) |
| Metadata | generatedAt, version, workspaceId, weekStart, weekEnd, schemaVersion |

---

## Application APIs

- `getWorkspace()`
- `getWorkspaceSummary()`
- `getWorkspaceHealth()`
- `getWorkspaceInsights()`
- `getWorkspaceCoach()`

These are presentation-facing getters only. They do not introduce new domain logic.

---

## Validation

Validation checks:

- Missing artifacts (snapshot, timeline, coaching session)
- Invalid references (athleteId / snapshotId / sessionId / workspaceId consistency)
- Inconsistent timestamps
- Duplicate IDs (timeline entries, insights)
- Null immutable fields / freeze integrity

---

## Composition Root

Registers `UnifiedWorkspaceService` (depends on `AthleteStateService` + `HomeExperienceService` + `DailyBriefService` + `WeeklyCoachReportService` + `CoachTimelineService` + `ProactiveInsightsService` + `ExplainableCoachingSessionService` + `AthleteSnapshotService`).

---

## Constraints

**Does not:** create new engines, duplicate business logic, persist to DB, add a cache layer, add an event bus, add a scheduler, call an LLM, or redesign UI.
