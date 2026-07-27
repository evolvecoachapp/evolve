# Home Experience

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-28  
**Purpose:** Document Home Experience composition — Home as a deterministic intelligence hub over existing coaching knowledge.  
**Source of Truth:** Yes — for Sprint 27.1 Home Experience on mobile.

Related: [COACHING_SESSION.md](./COACHING_SESSION.md), [PROACTIVE_INSIGHTS.md](./PROACTIVE_INSIGHTS.md), [COACH_TIMELINE.md](./COACH_TIMELINE.md), [PLAN_HISTORY.md](./PLAN_HISTORY.md), [ARCHITECTURE.md](./ARCHITECTURE.md), [DECISIONS.md](./DECISIONS.md) (ADR-089).

---

## Goal

Transform the Home screen into the central intelligence hub of EVOLVE.

Home must no longer be a collection of widgets. It becomes a deterministic composition of all existing coaching knowledge.

**No new AI engines. No duplicated business logic. Compose existing domain modules only.**

---

## Flow

```
Athlete State
        │
        ▼
Coach Timeline
        │
        ▼
Plan History
        │
        ▼
Goal Progress
        │
        ▼
Recovery
        │
        ▼
Workout
        │
        ▼
Nutrition
        │
        ▼
Proactive Insights
        │
        ▼
Explainable Coaching Session
        │
        ▼
Home Experience
        │
        ▼
Dashboard
```

---

## Module

`app/src/features/home-experience/`

Composition layer only.

- Models: `HomeExperience`, `HomeSummary`, `HomeWorkoutCard`, `HomeNutritionCard`, `HomeRecoveryCard`, `HomeGoalCard`, `HomeInsightCard`, `HomeTimelineCard`, `HomeCoachCard`, `HomeQuickAction`, `HomeExperienceResult`
- Services (single responsibility): `buildWorkoutCard`, `buildNutritionCard`, `buildRecoveryCard`, `buildGoalCard`, `buildInsightCard`, `buildTimelineCard`, `buildCoachCard`, `buildQuickActions`, `buildHomeExperience`, `validateHomeExperience`, `HomeExperienceService`
- Application API: `composeHomeExperience`, dashboard getters (`getHomeExperience`, `getHomeSummary`, `getQuickActions`, `getCoachCard`, `getInsightCards`), `validateHomeExperienceForAthlete`

**Does not:** persist to DB, introduce an event bus, run a scheduler, call an LLM, redesign UI, invent evidence, or duplicate Workout / Nutrition / Recovery / Goal / Timeline / Insights / Session engines.

Distinct from `features/home` UI providers (`HomeDashboard` mock/backend/local) — this module owns domain composition for the dashboard, not presentation widgets.

---

## Cards

| Card | Sources |
|------|---------|
| Workout | Workout Pipeline, Plan History, latest modifications, current phase |
| Nutrition | Nutrition Pipeline, current macros, latest changes |
| Recovery | Recovery Engine, fatigue, sleep signals |
| Goal | Goal Progress, current goal, progress, milestones |
| Insight | Proactive Insights, critical/top recommendations |
| Timeline | Coach Timeline, recent decisions, modifications, restores |
| Coach | Latest Explainable Coaching Session, recommendation, expected outcome, confidence |

---

## Quick Actions

Deterministic (no LLM): Resume Workout, Continue Nutrition, Review Goal, See Timeline, View Insights, Restore Previous Plan.

Enabled only when the corresponding composed evidence is present.

---

## Dashboard API (presentation only)

- `getHomeExperience()`
- `getHomeSummary()`
- `getQuickActions()`
- `getCoachCard()`
- `getInsightCards()`

No UI redesign.

---

## Conversation Integration

No conversation changes. Conversation continues to use existing orchestration. This sprint is dashboard composition only.

---

## Composition Root

Registers `HomeExperienceService` (depends on `CoachTimelineService` + `PlanHistoryService` + `ProactiveInsightsService` + `ExplainableCoachingSessionService`).
