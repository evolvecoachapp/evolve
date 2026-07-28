# Weekly Coach Report

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-28  
**Purpose:** Document Weekly Coach Report composition — deterministic weekly coaching review over existing coaching knowledge.  
**Source of Truth:** Yes — for Sprint 27.3 Weekly Coach Report on mobile.

Related: [DAILY_BRIEF.md](./DAILY_BRIEF.md), [HOME_EXPERIENCE.md](./HOME_EXPERIENCE.md), [COACHING_SESSION.md](./COACHING_SESSION.md), [PROACTIVE_INSIGHTS.md](./PROACTIVE_INSIGHTS.md), [COACH_TIMELINE.md](./COACH_TIMELINE.md), [PLAN_HISTORY.md](./PLAN_HISTORY.md), [ARCHITECTURE.md](./ARCHITECTURE.md), [DECISIONS.md](./DECISIONS.md) (ADR-091).

---

## Goal

The Weekly Coach Report is a deterministic composition of the athlete's week.

It is **NOT** a PDF.  
It is **NOT** a UI.  
It is **NOT** an LLM summary.

It is a structured domain artifact that represents the complete coaching review for the current week.

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
Workout
        │
        ▼
Nutrition
        │
        ▼
Recovery
        │
        ▼
Goal Progress
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
Weekly Coach Report
        │
        ▼
Dashboard / Export
```

---

## Module

`app/src/features/weekly-report/`

Composition layer only.

- Models: `WeeklyCoachReport`, `WeeklyExecutiveSummary`, `WeeklyWorkoutReport`, `WeeklyNutritionReport`, `WeeklyRecoveryReport`, `WeeklyGoalReport`, `WeeklyInsightReport`, `WeeklyDecisionReport`, `WeeklyRecommendationReport`, `WeeklyEvidence`, `WeeklyConfidence`, `WeeklyReportResult`
- Services (single responsibility): `buildExecutiveSummary`, `buildWorkoutReport`, `buildNutritionReport`, `buildRecoveryReport`, `buildGoalReport`, `buildInsightReport`, `buildDecisionReport`, `buildRecommendationReport`, `buildEvidence`, `calculateWeeklyConfidence`, `buildWeeklyCoachReport`, `validateWeeklyCoachReport`, `WeeklyCoachReportService`
- Application API: `composeWeeklyCoachReport`, dashboard getters (`getWeeklyCoachReport`, `getExecutiveSummary`, `getWorkoutReport`, `getNutritionReport`, `getRecoveryReport`, `getGoalReport`, `getDecisionReport`, `getRecommendationReport`), `validateWeeklyCoachReportForAthlete`

**Does not:** generate PDFs, redesign UI, persist to DB, introduce a scheduler, send notifications, run background jobs, call an LLM, invent evidence, or duplicate Workout / Nutrition / Recovery / Goal / Timeline / Insights / Session / Daily Brief / Decision / Recommendation engines.

---

## Sections

| Section | Sources |
|---------|---------|
| Executive Summary | Daily Brief, Home Experience, Explainable Coaching Session, athlete status, weekly highlights |
| Workout | Workout Pipeline, completed workouts, plan modifications, current phase, compliance |
| Nutrition | Nutrition Pipeline, weekly adherence, macro changes, calories, compliance |
| Recovery | Recovery Engine, weekly fatigue, sleep trend, recovery trend |
| Goals | Goal Progress, milestones, progress, remaining objectives |
| Insights | Proactive Insights, weekly patterns, important findings, top insights |
| Decisions | Coach Timeline, weekly decisions, plan restores, program modifications, coach interventions |
| Recommendations | Explainable Coaching Session, Decision Engine, Recommendation Engine, expected outcome, focus for next week |

---

Athlete Intelligence Workspace (Sprint 28.1) projects Weekly Coach Report without transformation into the single premium coaching read model ([INTELLIGENCE_WORKSPACE.md](./INTELLIGENCE_WORKSPACE.md), ADR-092).

---

## Evidence

Collects all evidence references used by the report.

Never generate evidence. Only project existing evidence.

---

## Confidence

Calculated only from available evidence.

Deterministic. Never generated. Never inferred by an LLM.

---

## Dashboard API (presentation only)

- `getWeeklyCoachReport()`
- `getExecutiveSummary()`
- `getWorkoutReport()`
- `getNutritionReport()`
- `getRecoveryReport()`
- `getGoalReport()`
- `getDecisionReport()`
- `getRecommendationReport()`

No UI work. No PDF generation. Domain only.

---

## Conversation Integration

No conversation changes. No LLM prompt changes.

---

## Composition Root

Registers `WeeklyCoachReportService` (depends on `DailyBriefService` + `HomeExperienceService` + `CoachTimelineService` + `PlanHistoryService` + `ProactiveInsightsService` + `ExplainableCoachingSessionService`).
