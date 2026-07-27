# Coach Conversation

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-27  
**Purpose:** Document the Intelligent Coach Conversation product path — contextual coaching replies grounded in WorkoutPlan + session context.  
**Source of Truth:** Yes — for Sprint 24.2 product conversation experience on mobile.

Related: [COACHING_SESSION_RUNTIME.md](./COACHING_SESSION_RUNTIME.md), [WORKOUT_PIPELINE.md](./WORKOUT_PIPELINE.md), [CONVERSATION_MEMORY.md](./CONVERSATION_MEMORY.md), [SUPERVISOR_ROUTING.md](./SUPERVISOR_ROUTING.md), [AI_RUNTIME.md](./AI_RUNTIME.md), [ARCHITECTURE.md](./ARCHITECTURE.md), [COMPOSITION_ROOT.md](./COMPOSITION_ROOT.md), [DECISIONS.md](./DECISIONS.md) (ADR-081).

---

## Goal

Conversation is the primary interface to the coaching system. After a WorkoutPlan is generated, the Coach answers follow-ups that explain the plan, exercises, progression, recovery, and recommendations using the active coaching session — without new engines.

---

## Flow

```
User message
  ↓
Conversation Runtime                 ← persist turn (sendCoachingReply adapter)
  ↓
Coach Conversation (product)         ← Sprint 24.2 orchestration
  ↓
Intent Routing (deterministic)
  ↓
Coaching Session Runtime
  ↓
Supervisor Routing                   ← capability plan
  ↓
Coach Supervisor
  ↓
Active WorkoutPlan + Recommendations + Memory + Session
  ↓
Deterministic coaching response
```

Generate Workout remains the Workout Generation Pipeline (Sprint 24.1). After generation, the plan is **attached** to the conversation via `CoachConversationService.attachWorkoutPlan`.

---

## Intent Catalog

| Intent | Purpose |
|--------|---------|
| `workout_explanation` | Explain today's workout / plan rationale |
| `workout_summary` | Summarize the active plan |
| `exercise_explanation` | Explain exercise choices |
| `progression_explanation` | Explain progression / deload cues |
| `recovery_explanation` | Explain recovery decisions |
| `recommendation_explanation` | Explain recommendation package |
| `general_coaching` | General coaching guidance |
| `unknown` | Deterministic fallback |

Intents map to Supervisor capability requirements (`GenerateWorkout`, `EvaluateRecovery`, …). Supervisor Routing is reused for capability planning.

---

## Context Sources (no duplication)

Every reply is assembled from:

- Conversation turn (message + conversation id)
- Active `WorkoutPlan` (when attached)
- Athlete / recommendation facts already on the plan (`recommendationPackage`, notes, progression)
- Current Coaching Session result
- Conversation Memory hints (prior intent / plan / reply summaries)

`ActiveWorkoutPlanStore` holds conversation/session references only — it does not own plan generation.

---

## Public API

Module: `app/src/features/coach-conversation/`

- `processCoachConversationTurn` → `CoachConversationResult`
- `attachWorkoutPlanToConversation`
- Composition Root token: `CoachConversationService`
- Coach Screen: Generate Workout → natural conversation via `useCoachConversation` + `useGenerateWorkout`

Conversation Runtime compatibility:

- Legacy AI streaming path remains when `coachConversation` is not injected
- Coaching path uses `ConversationService.sendCoachingReply` (no provider call)

---

## Boundaries

**Does:**

- orchestrate existing Session / Supervisor Routing / Supervisor / Memory
- route intents deterministically
- attach and reference WorkoutPlan for explanations
- produce immutable `CoachConversationResult`

**Does not:**

- introduce new engines
- bypass Session or Supervisor
- put business logic in Coach Screen
- call Workout Agent directly from UI

---

## Compatibility

Existing conversation UI components continue to render `ConversationMessage` bubbles. Adapters bridge Composition Root services into hooks without redesigning Conversation Runtime.
