# Coach Conversation

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-28  
**Purpose:** Document the Intelligent Coach Conversation product path — contextual coaching replies grounded in WorkoutPlan + session context, including adaptive modification, plan restore, timeline explainability, proactive insights, and explainable coaching sessions.  
**Source of Truth:** Yes — for Sprint 24.2 / 24.3 / 25.3 / 25.4 / 25.5 / 26.1 product conversation experience on mobile.

Related: [COACHING_SESSION_RUNTIME.md](./COACHING_SESSION_RUNTIME.md), [COACHING_SESSION.md](./COACHING_SESSION.md), [WORKOUT_PIPELINE.md](./WORKOUT_PIPELINE.md), [PLAN_HISTORY.md](./PLAN_HISTORY.md), [COACH_TIMELINE.md](./COACH_TIMELINE.md), [PROACTIVE_INSIGHTS.md](./PROACTIVE_INSIGHTS.md), [CONVERSATION_MEMORY.md](./CONVERSATION_MEMORY.md), [SUPERVISOR_ROUTING.md](./SUPERVISOR_ROUTING.md), [AI_RUNTIME.md](./AI_RUNTIME.md), [ARCHITECTURE.md](./ARCHITECTURE.md), [COMPOSITION_ROOT.md](./COMPOSITION_ROOT.md), [DECISIONS.md](./DECISIONS.md) (ADR-081, ADR-082, ADR-083, ADR-085, ADR-086, ADR-087, ADR-088).

---

## Goal

Conversation is the primary interface to the coaching system. After a WorkoutPlan is generated, the Coach answers follow-ups that explain the plan, surgically modify the active plan, or **restore a prior immutable version** — without new engines and without regenerating the entire program.

---

## Flow

```
User message
  ↓
Conversation Runtime                 ← persist turn (sendCoachingReply adapter)
  ↓
Coach Conversation (product)         ← Sprint 24.2 / 24.3 / 25.3 orchestration
  ↓
Intent Routing (deterministic)
  ↓
Coaching Session Runtime
  ↓
Supervisor Routing                   ← capability plan
  ↓
Coach Supervisor
  ↓
[if workout_modification]
  WorkoutPlan → Modification Request → Workout Agent → Validation → Updated WorkoutPlan
  ↓
[if plan_restore]
  Plan History → Resolve Target → Preview → Validate → Restore Snapshot → Publish New Version
  ↓
Active WorkoutPlan + Recommendations + Memory + Session
  ↓
Explainable Coaching Session (Sprint 26.1)  ← evidence package from existing systems
  ↓
Deterministic coaching response
```

Generate Workout remains the Workout Generation Pipeline (Sprint 24.1). After generation, the plan is **attached** to the conversation via `CoachConversationService.attachWorkoutPlan` (also publishes Plan History). Adaptive modifications and restores re-attach the living WorkoutPlan.

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
| `workout_modification` | Surgically modify the active WorkoutPlan (Sprint 24.3) |
| `plan_restore` | Restore a prior immutable plan version as a new version (Sprint 25.3) |
| `timeline_query` | Answer why/when/what-changed from Coach Timeline entries only (Sprint 25.4) |
| `coach_insight` | Surface proactive insights from generated evidence only (Sprint 25.5) |
| `general_coaching` | General coaching guidance |
| `unknown` | Deterministic fallback |

Modification kinds (routed inside the pipeline): replace/remove/add exercise, reduce/increase duration, reduce/increase intensity, modify volume, equipment unavailable, injury limitation, fatigue/recovery adjustment, focus muscle group. Unknown adaptive requests fall back deterministically.

Restore examples: "Undo my last workout change", "Restore yesterday's workout", "Bring back my original diet", "I liked the previous version better".

Timeline examples: "Why did you lower my volume?", "When did we remove deadlifts?", "What changed this week?", "Why is my diet different?", "Show me the latest adjustments."

Proactive insight examples: "Anything I should know?", "Do you see any problems?", "How am I progressing?", "What should I improve?", "What patterns do you notice?"

Intents map to Supervisor capability requirements (`GenerateWorkout`, `EvaluateRecovery`, …). Supervisor Routing is reused for capability planning. Restore intents are detected before timeline, insights, and modification.

---

## Adaptive Modification Replies

When `workout_modification` succeeds, the coach reply explains:

- what changed
- why it changed
- what remained unchanged
- impact on progression
- impact on recovery

Explanations reference the **updated** WorkoutPlan summary (exercise count, duration, title).

---

## Plan Restore Replies

When `plan_restore` succeeds, the coach reply explains:

- what has been restored
- what changes were reverted
- why
- impact on progression
- that history remains immutable (new version published)

---

## Context Sources (no duplication)

Every reply is assembled from:

- Conversation turn (message + conversation id)
- Active `WorkoutPlan` (when attached — may be post-modification / post-restore)
- Optional `WorkoutModificationResult` on modification turns
- Optional `PlanRestoreResult` on restore turns
- Athlete / recommendation facts already on the plan (`recommendationPackage`, notes, progression)
- Current Coaching Session result (Sprint 22.0 lifecycle)
- Explainable Coaching Session (Sprint 26.1) — evidence package from Timeline / Decision / Recommendation / Insights / Plan
- Conversation Memory hints (prior intent / plan / reply summaries)

`ActiveWorkoutPlanStore` holds conversation/session references only — it does not own plan generation, modification, or history logic.

---

## Public API

Module: `app/src/features/coach-conversation/`

- `processCoachConversationTurn` → `CoachConversationResult` (includes `modification` / `restore` / `explainableSession` when applicable)
- `attachWorkoutPlanToConversation`
- Composition Root token: `CoachConversationService` (injected with `WorkoutGenerationPipelineService`, `PlanHistoryService`, `PlanRestoreService`, `CoachTimelineService`, `ProactiveInsightsService`, `ExplainableCoachingSessionService`)
- Coach Screen: Generate Workout → Modify / Restore via chat → Updated Workout → conversation continues via `useCoachConversation` + `useGenerateWorkout`

Conversation Runtime compatibility:

- Legacy AI streaming path remains when `coachConversation` is not injected
- Coaching path uses `ConversationService.sendCoachingReply` (no provider call)

---

## Boundaries

**Does:**

- orchestrate existing Session / Supervisor Routing / Supervisor / Memory / Workout Pipeline modification / Plan Restore / Timeline / Insights / Explainable Session composition
- route intents deterministically (restore before modification before explanation)
- attach and reference WorkoutPlan for explanations and living-plan updates
- publish plan versions into Plan History on attach / modify
- compose an Explainable Coaching Session on every turn
- produce immutable `CoachConversationResult`

**Does not:**

- introduce new engines
- bypass Session or Supervisor
- put business logic in Coach Screen
- call Workout Agent directly from UI
- regenerate the full WorkoutPlan for adaptive or restore requests
- mutate or delete plan history

---

## Compatibility

Existing conversation UI components continue to render `ConversationMessage` bubbles. Adapters bridge Composition Root services into hooks without redesigning Conversation Runtime. Existing workout rendering adapters continue to consume `WorkoutPlan`.
