# Athlete Daily Brief

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-28  
**Purpose:** Document Athlete Daily Brief composition — deterministic daily coaching brief over existing coaching knowledge.  
**Source of Truth:** Yes — for Sprint 27.2 Athlete Daily Brief on mobile.

Related: [HOME_EXPERIENCE.md](./HOME_EXPERIENCE.md), [COACHING_SESSION.md](./COACHING_SESSION.md), [PROACTIVE_INSIGHTS.md](./PROACTIVE_INSIGHTS.md), [COACH_TIMELINE.md](./COACH_TIMELINE.md), [PLAN_HISTORY.md](./PLAN_HISTORY.md), [ARCHITECTURE.md](./ARCHITECTURE.md), [DECISIONS.md](./DECISIONS.md) (ADR-090).

---

## Goal

Every time the athlete opens EVOLVE, the Coach automatically generates a deterministic daily coaching brief.

The Daily Brief is **NOT** a chat response.  
It is **NOT** a notification.  
It is **NOT** an LLM summary.

It is a deterministic composition of existing coaching knowledge.

**No new AI engines. No duplicated business logic. Compose existing domain modules only.**

---

## Flow

```
Athlete State
        │
        ▼
Home Experience
        │
        ▼
Coach Timeline
        │
        ▼
Plan History
        │
        ▼
Recovery
        │
        ▼
Goal Progress
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
Daily Brief
        │
        ▼
Dashboard
```

---

## Module

`app/src/features/daily-brief/`

Composition layer only.

- Models: `DailyBrief`, `DailyBriefSummary`, `DailyBriefWorkout`, `DailyBriefNutrition`, `DailyBriefRecovery`, `DailyBriefGoals`, `DailyBriefInsights`, `DailyBriefCoachMessage`, `DailyBriefPriority`, `DailyBriefConfidence`, `DailyBriefResult`
- Services (single responsibility): `buildWorkoutSection`, `buildNutritionSection`, `buildRecoverySection`, `buildGoalSection`, `buildInsightSection`, `buildCoachMessage`, `calculatePriority`, `calculateConfidence`, `buildDailyBrief`, `validateDailyBrief`, `DailyBriefService`
- Application API: `composeDailyBrief`, dashboard getters (`getDailyBrief`, `getCoachMessage`, `getWorkoutSection`, `getNutritionSection`, `getRecoverySection`, `getGoalSection`, `getInsightSection`), `validateDailyBriefForAthlete`

**Does not:** persist to DB, introduce an event bus, run a scheduler, send notifications, call an LLM, redesign UI, invent evidence, or duplicate Workout / Nutrition / Recovery / Goal / Timeline / Insights / Session / Home Experience engines.

---

## Sections

| Section | Sources |
|---------|---------|
| Workout | Workout Pipeline, today's workout, current phase, recent modifications |
| Nutrition | Nutrition Pipeline, today's nutrition, calories, macros, recent changes |
| Recovery | Recovery Engine, fatigue, sleep, recovery state |
| Goals | Goal Progress, current goal, today's progress, milestones |
| Insights | Proactive Insights, critical insights, top recommendation |
| Coach Message | Explainable Coaching Session, Timeline, current recommendation, expected outcome, confidence |

---

## Priority

Deterministic levels: `LOW` | `NORMAL` | `HIGH` | `CRITICAL`.

Derived only from composed evidence (insight severity, recovery status/fatigue, goal severity, section presence). Never assigned by an LLM.

---

## Confidence

Calculated only from available evidence (present sections + insight items + source domains).

Never generated. Never inferred by an LLM.

---

## Dashboard API (presentation only)

- `getDailyBrief()`
- `getCoachMessage()`
- `getWorkoutSection()`
- `getNutritionSection()`
- `getRecoverySection()`
- `getGoalSection()`
- `getInsightSection()`

No UI redesign.

---

## Conversation Integration

No conversation changes. The Daily Brief is generated independently from chat.

---

## Composition Root

Registers `DailyBriefService` (depends on `HomeExperienceService` + `CoachTimelineService` + `PlanHistoryService` + `ProactiveInsightsService` + `ExplainableCoachingSessionService`).

---

## Downstream

Weekly Coach Report (Sprint 27.3) composes Daily Brief and the same coaching domains into a weekly coaching review ([WEEKLY_REPORT.md](./WEEKLY_REPORT.md), ADR-091).

Athlete Intelligence Workspace (Sprint 28.1) projects Daily Brief without transformation into the single premium coaching read model ([INTELLIGENCE_WORKSPACE.md](./INTELLIGENCE_WORKSPACE.md), ADR-092).
