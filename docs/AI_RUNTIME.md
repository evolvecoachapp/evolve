# AI Runtime

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-25  
**Purpose:** Describe the mobile AI / coach runtime stack, including Coaching Session Runtime, Athlete State, Context Fusion, and Decision Engine placement.  
**Source of Truth:** Partial — subsystem details live in linked docs; high-level Coach design in [AI_SYSTEM.md](./AI_SYSTEM.md).

Related: [ARCHITECTURE.md](./ARCHITECTURE.md), [COACHING_SESSION_RUNTIME.md](./COACHING_SESSION_RUNTIME.md), [ATHLETE_STATE_ENGINE.md](./ATHLETE_STATE_ENGINE.md), [CONTEXT_FUSION_ENGINE.md](./CONTEXT_FUSION_ENGINE.md), [DECISION_ENGINE.md](./DECISION_ENGINE.md), [DECISION_PIPELINE.md](./DECISION_PIPELINE.md), [STATE_MANAGEMENT.md](./STATE_MANAGEMENT.md), [SESSION_LIFECYCLE.md](./SESSION_LIFECYCLE.md), [COACH_SUPERVISOR.md](./COACH_SUPERVISOR.md), [SUPERVISOR_RUNTIME.md](./SUPERVISOR_RUNTIME.md), [MULTI_AGENT_RUNTIME.md](./MULTI_AGENT_RUNTIME.md), [AGENT_RUNTIME.md](./AGENT_RUNTIME.md), [AGENT_PLATFORM.md](./AGENT_PLATFORM.md).

---

## Coach Interaction Path (Sprint 22.3)

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
Recommendation Engine             ← consumes RecommendationEngineInput
  ↓
Coach Supervisor                  ← Sprint 21.8 (multi-agent orchestration)
  ↓
Supervisor Routing / Capability Registry / Agent Collaboration
  ↓
Aggregation
  ↓
Unified Coach Response
  ↓
SessionResult / AthleteState / UnifiedCoachingContext / CoachingDecision
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

Coach Supervisor remains responsible for Routing → Collaboration → Aggregation into a unified coach response.

---

## Public Entry Points

| Module | API |
|--------|-----|
| Coaching Session Runtime | `startSession`, `continueSession`, `endSession`, `describeSession`, `validateSession` |
| Athlete State Engine | `buildAthleteState`, `updateAthleteState`, `createSnapshot`, `describeAthleteState`, `validateAthleteState` |
| Context Fusion Engine | `buildUnifiedContext`, `mergeContexts`, `validateUnifiedContext`, `describeContext`, `createContextSnapshot` |
| Decision Engine | `buildDecision`, `evaluateDecision`, `resolveDecision`, `describeDecision`, `validateDecision` |
| Coach Supervisor | `processCoachRequest`, `buildCoordinationPlan`, `aggregateResults`, `describeSupervisorCapabilities`, `validateSupervisorPlan` |

---

## Related Documents

- Session details: [COACHING_SESSION_RUNTIME.md](./COACHING_SESSION_RUNTIME.md)
- Athlete state: [ATHLETE_STATE_ENGINE.md](./ATHLETE_STATE_ENGINE.md)
- Context fusion: [CONTEXT_FUSION_ENGINE.md](./CONTEXT_FUSION_ENGINE.md)
- Decision pipeline: [DECISION_PIPELINE.md](./DECISION_PIPELINE.md)
- State ownership: [STATE_MANAGEMENT.md](./STATE_MANAGEMENT.md)
- Transitions: [SESSION_LIFECYCLE.md](./SESSION_LIFECYCLE.md)
- Supervisor path: [SUPERVISOR_RUNTIME.md](./SUPERVISOR_RUNTIME.md)
- Broader Coach / LLM design: [AI_SYSTEM.md](./AI_SYSTEM.md)
