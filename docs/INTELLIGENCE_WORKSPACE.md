# Athlete Intelligence Workspace

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-28  
**Purpose:** Document Athlete Intelligence Workspace composition — the single immutable read model of the athlete's current premium coaching state.  
**Source of Truth:** Yes — for Sprint 28.1 Athlete Intelligence Workspace on mobile.

Related: [HOME_EXPERIENCE.md](./HOME_EXPERIENCE.md), [DAILY_BRIEF.md](./DAILY_BRIEF.md), [WEEKLY_REPORT.md](./WEEKLY_REPORT.md), [COACHING_SESSION.md](./COACHING_SESSION.md), [PROACTIVE_INSIGHTS.md](./PROACTIVE_INSIGHTS.md), [COACH_TIMELINE.md](./COACH_TIMELINE.md), [PLAN_HISTORY.md](./PLAN_HISTORY.md), [ATHLETE_SNAPSHOT.md](./ATHLETE_SNAPSHOT.md), [UNIFIED_WORKSPACE.md](./UNIFIED_WORKSPACE.md), [ARCHITECTURE.md](./ARCHITECTURE.md), [DECISIONS.md](./DECISIONS.md) (ADR-092).

---

## Purpose

The Athlete Intelligence Workspace is the single immutable read model representing the complete current athlete state for premium coaching consumers.

It is:

- A composition layer
- A read model
- Immutable
- Deterministic
- Built only from existing EVOLVE coaching artifacts

It is **not**:

- A new engine
- A dashboard
- A UI
- An API redesign
- An LLM feature
- A persistence layer
- A cache
- A scheduler

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
Coach Timeline  
↓  
Proactive Insights  
↓  
Explainable Coaching Session  
↓  
Athlete Intelligence Workspace  
↓  
Dashboard / UI / APIs

---

## Models

`AthleteWorkspace`, `WorkspaceOverview`, `WorkspaceStatus`, `WorkspaceHome`, `WorkspaceDailyBrief`, `WorkspaceWeeklyReport`, `WorkspaceTimeline`, `WorkspaceInsights`, `WorkspaceCoach`, `WorkspaceMetadata`, `WorkspaceResult`

All models are immutable and only project existing artifacts.

---

## Projections

| Projection | Sources |
|-----------|---------|
| Overview | Home Experience, Daily Brief, Weekly Coach Report |
| Status | Athlete State, recovery status, goal progress, current phase |
| Home | Home Experience (no transformation) |
| Daily Brief | Daily Brief (no transformation) |
| Weekly Report | Weekly Coach Report (no transformation) |
| Timeline | Coach Timeline, latest decisions, latest restores, Plan History |
| Insights | Proactive Insights, current patterns, critical findings |
| Coach | Explainable Coaching Session, recommendation summary, confidence, evidence |
| Metadata | generatedAt, version, workspaceId, weekStart, weekEnd |

---

## Dashboard APIs

- `getAthleteWorkspace()`
- `getWorkspaceOverview()`
- `getWorkspaceStatus()`
- `getWorkspaceTimeline()`
- `getWorkspaceInsights()`
- `getWorkspaceCoach()`

These are presentation-facing getters only. They do not introduce new domain logic.

---

## Composition Root

Registers `AthleteWorkspaceService` (depends on `AthleteStateService` + `HomeExperienceService` + `DailyBriefService` + `WeeklyCoachReportService` + `CoachTimelineService` + `PlanHistoryService` + `PlanRestoreService` + `ProactiveInsightsService` + `ExplainableCoachingSessionService`).

---

## Downstream Consumer

Athlete Snapshot (Sprint 28.2) projects Athlete Workspace without transformation as the immutable snapshot workspace projection ([ATHLETE_SNAPSHOT.md](./ATHLETE_SNAPSHOT.md), ADR-093).

---

## Constraints

**Does not:** create new engines, duplicate business logic, persist to DB, cache derived state, schedule background jobs, redesign UI, call an LLM, or modify existing domain behavior.
