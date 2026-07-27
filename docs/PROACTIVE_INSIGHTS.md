# Proactive Coach Insights

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-28  
**Purpose:** Document deterministic proactive coaching insights derived from existing domain evidence.  
**Source of Truth:** Yes — for Sprint 25.5 Proactive Coach Insights foundation on mobile.

Related: [COACH_TIMELINE.md](./COACH_TIMELINE.md), [COACH_CONVERSATION.md](./COACH_CONVERSATION.md), [COACHING_SESSION.md](./COACHING_SESSION.md), [PLAN_HISTORY.md](./PLAN_HISTORY.md), [ARCHITECTURE.md](./ARCHITECTURE.md), [DECISIONS.md](./DECISIONS.md) (ADR-087, ADR-088).

---

## Goal

The Coach must no longer wait for the athlete to ask for help.

It continuously analyzes existing coaching knowledge and proactively produces coaching insights.

**No LLM reasoning. No hallucinations.** Only deterministic analysis built on existing domain data.

---

## Flow

```
Athlete State
      │
      ▼
Timeline
      │
      ▼
Plan History
      │
      ▼
Goal Progress
      │
      ▼
Recovery State
      │
      ▼
Insight Analysis
      │
      ▼
Coach Insight
      │
      ▼
Conversation / Dashboard
```

---

## Module

`app/src/features/proactive-insights/`

- Models: `CoachInsight`, `CoachInsightType`, `CoachInsightSeverity`, `CoachInsightReason`, `CoachInsightEvidence`, `CoachInsightRecommendation`, `CoachInsightSnapshot`, `CoachInsightSummary`, `InsightAnalysisResult`, `InsightQuery`, `InsightFilter`
- Services (single responsibility each): `analyzeTimeline`, `analyzeGoalProgress`, `analyzeWorkoutPatterns`, `analyzeNutritionPatterns`, `analyzeRecoveryPatterns`, `buildCoachInsights`, `prioritizeInsights`, `filterInsights`, `validateInsights`, `ProactiveInsightsService`
- Application API: dashboard getters (`getTopInsights`, `getLatestInsights`, `getCriticalInsights`, domain getters) + analyze/query/validate
- Builders: insight-grounded conversation replies

**Does not:** persist to DB, introduce an event bus, run a background scheduler, call an LLM, redesign UI, or invent unsupported advice.

Distinct from Sprint 18.7 Insight Engine (`features/insight-engine`): that module produces observational performance/achievement/recovery/history **domain fact snapshots**. Proactive Insights is the coach-facing product layer that surfaces actionable notices from Timeline + Goal/Recovery/Plan/Decision signals.

---

## Insight Types

`FATIGUE_PATTERN` | `RECOVERY_DECLINE` | `WORKOUT_COMPLIANCE` | `NUTRITION_COMPLIANCE` | `GOAL_STALL` | `GOAL_ACCELERATION` | `TRAINING_VOLUME` | `TRAINING_INTENSITY` | `MISSED_SESSIONS` | `MISSED_MEALS` | `RECOVERY_IMPROVEMENT` | `PROGRAM_CONSISTENCY` | `PREFERENCE_PATTERN` | `MODIFICATION_PATTERN` | `RESTORE_PATTERN` | `LONG_TERM_PROGRESS` | `PLATEAU_RISK` | `OVERREACH_RISK` | `UNDERTRAINING_RISK` | `UNKNOWN`

---

## Insight Contract

Every immutable insight includes: unique id, timestamp, type, severity, evidence, reason, recommendation, confidence, related timeline entries, affected domain, expected outcome.

Severity (`LOW` | `MEDIUM` | `HIGH` | `CRITICAL`) and confidence are deterministic functions of evidence count.

---

## Conversation

Intent `coach_insight` answers:

- Anything I should know?
- Do you see any problems?
- How am I progressing?
- What should I improve?
- What patterns do you notice?

Responses are assembled **only** from generated insights.

---

## Dashboard API (presentation only)

- Top Insights
- Latest Insights
- Critical Insights
- Recovery Insights
- Goal Insights
- Workout Insights
- Nutrition Insights

No UI redesign.

---

## Composition Root

Registers `ProactiveInsightsService` (depends on `CoachTimelineService` + `PlanHistoryService`) and injects it into Coach Conversation.

Explainable Coaching Session (Sprint 26.1) consumes generated insights as evidence when composing session artifacts ([COACHING_SESSION.md](./COACHING_SESSION.md), ADR-088).

Home Experience (Sprint 27.1) surfaces critical/top insights on the Home dashboard via composition only ([HOME_EXPERIENCE.md](./HOME_EXPERIENCE.md), ADR-089).

Athlete Daily Brief (Sprint 27.2) surfaces critical insights and the top recommendation in the Daily Brief insights section ([DAILY_BRIEF.md](./DAILY_BRIEF.md), ADR-090).

Weekly Coach Report (Sprint 27.3) surfaces weekly patterns, important findings, and top insights in the Weekly Coach Report insights section ([WEEKLY_REPORT.md](./WEEKLY_REPORT.md), ADR-091).
