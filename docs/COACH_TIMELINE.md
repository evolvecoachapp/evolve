# Coach Timeline & Decision Journal

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-28  
**Purpose:** Document the chronological reasoning history of the AI Coach (decision journal).  
**Source of Truth:** Yes — for Sprint 25.4 Coach Timeline foundation on mobile.

Related: [COACH_CONVERSATION.md](./COACH_CONVERSATION.md), [COACHING_SESSION.md](./COACHING_SESSION.md), [PLAN_HISTORY.md](./PLAN_HISTORY.md), [PROACTIVE_INSIGHTS.md](./PROACTIVE_INSIGHTS.md), [EXPLAINABILITY_ENGINE.md](./EXPLAINABILITY_ENGINE.md), [ARCHITECTURE.md](./ARCHITECTURE.md), [DECISIONS.md](./DECISIONS.md) (ADR-086, ADR-088).

---

## Goal

The Timeline is **not** chat history, **not** an event log, and **not** analytics.

It is the chronological reasoning history of the AI Coach. Every meaningful coaching decision becomes an explainable journal entry that Conversation can cite without hallucinating.

---

## Flow

```
Conversation
      ↓
Coach Decision
      ↓
Decision Journal Entry
      ↓
Timeline
      ↓
Coach Memory
      ↓
Conversation continues
```

---

## Module

`app/src/features/coach-timeline/`

- Models: `CoachTimeline`, `CoachTimelineEntry`, `CoachTimelineEvent`, `CoachTimelineSummary`, `CoachTimelineSnapshot`, `CoachDecisionReason`, `TimelineFilter`, `TimelineQuery`, `TimelineResult`
- Store: in-memory append-only `CoachTimelineStore`
- Services (single responsibility each): `appendTimelineEntry`, `buildTimelineSummary`, `queryTimeline`, `filterTimeline`, `groupTimelineEvents`, `validateTimeline`, `CoachTimelineService`
- Application API: `appendTimelineEntry`, `queryTimeline`, `buildTimelineSummary`, `getCoachTimeline`
- Builders: integration helpers + timeline-grounded conversation replies

**Does not:** persist to DB, introduce an event bus, redesign UI, or mutate prior entries.

---

## Event Categories

`WORKOUT_CREATED` | `WORKOUT_MODIFIED` | `WORKOUT_RESTORED` | `NUTRITION_CREATED` | `NUTRITION_MODIFIED` | `NUTRITION_RESTORED` | `GOAL_CHANGED` | `GOAL_PROGRESS` | `RECOVERY_ADJUSTMENT` | `FATIGUE_DETECTED` | `INJURY_REPORTED` | `PROGRAM_PHASE_CHANGED` | `COACH_DECISION` | `USER_REQUEST` | `SYSTEM_EVENT` | `UNKNOWN`

---

## Entry Contract

Every immutable entry includes: unique id, timestamp, event category, short summary, detailed explanation, decision reason (decision / recommendation / reason / impact / expected outcome), affected domain, related plan version, conversation reference, confidence, metadata.

---

## Summaries (deterministic)

- Last 7 days
- Current training block
- Current cut
- Current bulk
- Recent recovery decisions
- Recent workout modifications
- Latest coach decisions

---

## Automatic Integration (orchestration hooks)

Appends happen after successful completion via existing orchestration (no event bus):

| Trigger | Hook |
|---------|------|
| Workout create / attach | Coach Conversation `attachWorkoutPlan` |
| Workout modification | Coach Conversation `processTurn` |
| Workout / Nutrition restore | Plan Restore `restore` |
| Nutrition create / modify | Nutrition Agent service |
| Recovery strategy change | Recovery Agent service |
| Goal progress / change | Goal Progress Engine service |
| Decision Engine decisions | Decision Engine `buildDecision` / `resolveDecision` |
| Important user requests | Coach Conversation important intents |

---

## Conversation

Intent `timeline_query` answers:

- Why did you lower my volume?
- When did we remove deadlifts?
- What changed this week?
- Why is my diet different?
- Show me the latest adjustments.

Responses are assembled **only** from Timeline entries.

---

## Composition Root

Registers `CoachTimelineService` and injects it into Coach Conversation, Plan Restore, Decision Engine, Nutrition Agent, Recovery Agent, Proactive Insights, and Explainable Coaching Session.
