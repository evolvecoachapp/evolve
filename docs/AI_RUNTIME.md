# AI Runtime

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-26  
**Purpose:** Describe the mobile AI / coach runtime stack, including Coaching Session Runtime, Athlete State, Context Fusion, Decision Engine, Recommendation Engine, Explainability Engine, Continuous Adaptation Engine, and Workout Adaptation Engine placement.  
**Source of Truth:** Partial — subsystem details live in linked docs; high-level Coach design in [AI_SYSTEM.md](./AI_SYSTEM.md).

Related: [ARCHITECTURE.md](./ARCHITECTURE.md), [COACHING_SESSION_RUNTIME.md](./COACHING_SESSION_RUNTIME.md), [ATHLETE_STATE_ENGINE.md](./ATHLETE_STATE_ENGINE.md), [CONTEXT_FUSION_ENGINE.md](./CONTEXT_FUSION_ENGINE.md), [DECISION_ENGINE.md](./DECISION_ENGINE.md), [RECOMMENDATION_ENGINE.md](./RECOMMENDATION_ENGINE.md), [EXPLAINABILITY_ENGINE.md](./EXPLAINABILITY_ENGINE.md), [CONTINUOUS_ADAPTATION_ENGINE.md](./CONTINUOUS_ADAPTATION_ENGINE.md), [WORKOUT_ADAPTATION_ENGINE.md](./WORKOUT_ADAPTATION_ENGINE.md), [WORKOUT_PIPELINE.md](./WORKOUT_PIPELINE.md), [ADAPTIVE_COACHING.md](./ADAPTIVE_COACHING.md), [REASONING_PIPELINE.md](./REASONING_PIPELINE.md), [DECISION_PIPELINE.md](./DECISION_PIPELINE.md), [STATE_MANAGEMENT.md](./STATE_MANAGEMENT.md), [SESSION_LIFECYCLE.md](./SESSION_LIFECYCLE.md), [COACH_SUPERVISOR.md](./COACH_SUPERVISOR.md), [SUPERVISOR_RUNTIME.md](./SUPERVISOR_RUNTIME.md), [MULTI_AGENT_RUNTIME.md](./MULTI_AGENT_RUNTIME.md), [AGENT_RUNTIME.md](./AGENT_RUNTIME.md), [AGENT_PLATFORM.md](./AGENT_PLATFORM.md).

---

## Coach Interaction Path (Sprint 24.1)

```
User
  ↓
Conversation Runtime
  ↓
Coaching Session Runtime          ← Sprint 22.0 (session lifecycle + immutable context)
  ↓
Specialist Agents (Workout / Nutrition / Recovery / Goal)
  ↓
Athlete State Engine              ← Sprint 22.1 (immutable athlete truth)
  ↓
Context Fusion Engine             ← Sprint 22.2 (immutable UnifiedCoachingContext)
  ↓
Decision Engine                   ← Sprint 22.3 (CoachingDecision / DecisionPackage)
  ↓
Recommendation Engine             ← Sprint 22.4 (CoachingRecommendation / RecommendationPackage)
  ↓
Explainability Engine             ← Sprint 22.5 (CoachingExplanation / ExplanationPackage / LLMFormatterInput)
  ↓
Continuous Adaptation Engine      ← Sprint 23.1 (AdaptationDecision / opportunity detection)
  ↓
Workout Adaptation Engine         ← Sprint 24.1 (UpdatedWorkoutBlueprint / WorkoutRuntimeInput)
  ↓
Coach Supervisor                  ← Sprint 21.8 (multi-agent orchestration)
  ↓
Supervisor Routing / Capability Registry / Agent Collaboration
  ↓
Aggregation
  ↓
Unified Coach Response
  ↓
SessionResult / AthleteState / UnifiedCoachingContext / CoachingDecision / CoachingRecommendation / CoachingExplanation / AdaptationDecision / UpdatedWorkoutBlueprint
```

---

## Layer Responsibilities

| Layer | Module | Responsibility |
|-------|--------|----------------|
| Conversation Runtime | `features/conversation*` | Conversation turn lifecycle — not replaced by session runtime |
| Coaching Session Runtime | `features/coaching-session` | Session lifecycle, immutable context, supervisor coordination |
| Athlete State Engine | `features/athlete-state` | Immutable current athlete truth; aggregation + evolution only |
| Context Fusion Engine | `features/context-fusion` | Fuse runtimes/agents into `UnifiedCoachingContext` only |
| Decision Engine | `features/decision-engine` | Orchestrate fused context → immutable `CoachingDecision`s |
| Recommendation Engine | `features/recommendation-engine` | Orchestrate decisions → immutable `CoachingRecommendation`s |
| Explainability Engine | `features/explainability-engine` | Orchestrate decisions + recommendations → immutable `CoachingExplanation`s |
| Continuous Adaptation Engine | `features/continuous-adaptation` | Detect meaningful adaptation opportunities → immutable `AdaptationDecision`s |
| Workout Adaptation Engine | `features/workout-adaptation` | Adapt existing Workout Blueprint → immutable `UpdatedWorkoutBlueprint` / `WorkoutRuntimeInput` |
| Coach Supervisor | `features/coach-supervisor` | Multi-agent orchestration → `UnifiedCoachResponse` |
| Supervisor Routing | `features/supervisor-routing` | Deterministic routing plans |
| Capability Registry | `features/agent-capability` | Capability resolve / register |
| Agent Collaboration | `features/agent-collaboration` | Specialist dispatch / aggregation contracts |
| Agent Runtime | `features/agent-runtime` | Agent selection / execution entry |
| Agent Framework | `features/agent-framework` | Shared `IAgent` contracts / lifecycle |

---

## Boundaries

Coaching Session Runtime:

- **owns** coaching session lifecycle and immutable session context
- **coordinates** Coach Supervisor during a session (via port)
- **does not** perform business / domain logic
- **does not** replace Conversation Runtime
- **does not** call providers, build prompts, run tools, network, or persist

Athlete State Engine:

- **owns** immutable current athlete state representation and deterministic evolution
- **aggregates** specialist / session contributions (no calculations)
- **produces** `AthleteState` / `AthleteSnapshot` / `StateSummary` / `CoachSupervisorContext`
- **does not** perform AI reasoning, business calculations, persistence, or networking

Context Fusion Engine:

- **owns** immutable fusion of conversation / session / athlete / specialist / supervisor sources
- **resolves** conflicts deterministically by fixed priority
- **produces** `UnifiedCoachingContext` / `ContextSnapshot` / `ContextSummary` / `DecisionEngineContext`
- **does not** perform AI reasoning, business calculations, persistence, or networking

Decision Engine:

- **owns** deterministic orchestration from fused context to coaching decisions
- **analyzes / evaluates / plans / resolves** structurally (no domain math, no AI, no NL)
- **produces** `CoachingDecision` / `DecisionPackage` / `DecisionSummary` / `RecommendationEngineInput`
- **does not** fuse sources, call providers, execute actions, persist, or network

Recommendation Engine:

- **owns** deterministic orchestration from coaching decisions to structured recommendations
- **plans / prioritizes / packages** structurally (no domain math, no AI, no NL, no action execution)
- **produces** `CoachingRecommendation` / `RecommendationPackage` / `RecommendationSummary` / `ExplainabilityInput`
- **does not** call providers, generate NL, execute actions, modify athlete state, persist, or network

Explainability Engine:

- **owns** deterministic orchestration from decisions + recommendations into structured explanations
- **gathers evidence / builds reasoning traces / packages graphs** structurally (no domain math, no AI, no NL)
- **produces** `CoachingExplanation` / `ExplanationPackage` / `ExplanationSummary` / `LLMFormatterInput`
- **does not** change decisions, call providers, generate NL, execute actions, persist, or network

Continuous Adaptation Engine:

- **owns** deterministic detection of meaningful adaptation opportunities over time
- **monitors / detects / evaluates / compares** structurally (keys / flags / fixed ordinals only)
- **produces** `AdaptationDecision` / `AdaptationPackage` / handoff inputs for domain adaptation engines
- **does not** modify workout / nutrition / recovery plans, generate recommendations, call providers, persist, or network

Workout Adaptation Engine:

- **owns** deterministic adaptation of an existing workout blueprint from Continuous Adaptation decisions
- **evaluates / plans / adapts** structurally (keys → modification records; no generation)
- **produces** `WorkoutAdaptation` / `UpdatedWorkoutBlueprint` / `WorkoutAdaptationPackage` / `WorkoutRuntimeInput`
- **does not** generate workouts from scratch, change athlete goals, call providers, persist, or network

Coach Supervisor remains responsible for Routing → Collaboration → Aggregation into a unified coach response.

---

## Public Entry Points

| Module | API |
|--------|-----|
| Coaching Session Runtime | `startSession`, `continueSession`, `endSession`, `describeSession`, `validateSession` |
| Athlete State Engine | `buildAthleteState`, `updateAthleteState`, `createSnapshot`, `describeAthleteState`, `validateAthleteState` |
| Context Fusion Engine | `buildUnifiedContext`, `mergeContexts`, `validateUnifiedContext`, `describeContext`, `createContextSnapshot` |
| Decision Engine | `buildDecision`, `evaluateDecision`, `resolveDecision`, `describeDecision`, `validateDecision` |
| Recommendation Engine | `buildRecommendations`, `prioritizeRecommendations`, `packageRecommendations`, `describeRecommendations`, `validateRecommendations` |
| Explainability Engine | `buildExplanation`, `validateExplanation`, `describeExplanation`, `createExplanationSnapshot`, `packageExplanation` |
| Continuous Adaptation Engine | `evaluateAdaptation`, `detectAdaptation`, `describeAdaptation`, `createAdaptationSnapshot`, `validateAdaptation` |
| Workout Adaptation Engine | `adaptWorkout`, `compareWorkout`, `describeWorkoutAdaptation`, `createWorkoutSnapshot`, `validateWorkoutAdaptation` |
| Coach Supervisor | `processCoachRequest`, `buildCoordinationPlan`, `aggregateResults`, `describeSupervisorCapabilities`, `validateSupervisorPlan` |

---

## Related Documents

- Session details: [COACHING_SESSION_RUNTIME.md](./COACHING_SESSION_RUNTIME.md)
- Athlete state: [ATHLETE_STATE_ENGINE.md](./ATHLETE_STATE_ENGINE.md)
- Context fusion: [CONTEXT_FUSION_ENGINE.md](./CONTEXT_FUSION_ENGINE.md)
- Decision engine: [DECISION_ENGINE.md](./DECISION_ENGINE.md)
- Recommendation engine: [RECOMMENDATION_ENGINE.md](./RECOMMENDATION_ENGINE.md)
- Explainability engine: [EXPLAINABILITY_ENGINE.md](./EXPLAINABILITY_ENGINE.md)
- Continuous adaptation: [CONTINUOUS_ADAPTATION_ENGINE.md](./CONTINUOUS_ADAPTATION_ENGINE.md)
- Workout adaptation: [WORKOUT_ADAPTATION_ENGINE.md](./WORKOUT_ADAPTATION_ENGINE.md)
- Workout pipeline: [WORKOUT_PIPELINE.md](./WORKOUT_PIPELINE.md)
- Adaptive coaching: [ADAPTIVE_COACHING.md](./ADAPTIVE_COACHING.md)
- Decision pipeline: [DECISION_PIPELINE.md](./DECISION_PIPELINE.md)
- Reasoning pipeline: [REASONING_PIPELINE.md](./REASONING_PIPELINE.md)
- State ownership: [STATE_MANAGEMENT.md](./STATE_MANAGEMENT.md)
- Transitions: [SESSION_LIFECYCLE.md](./SESSION_LIFECYCLE.md)
- Supervisor path: [SUPERVISOR_RUNTIME.md](./SUPERVISOR_RUNTIME.md)
- Broader Coach / LLM design: [AI_SYSTEM.md](./AI_SYSTEM.md)
