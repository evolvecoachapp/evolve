# Agent Platform

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-26  
**Purpose:** Index the EVOLVE multi-agent platform layers and how Coach Supervisor sits above specialists.  
**Source of Truth:** Partial — detailed behavior lives in linked subsystem docs.

Related: [AGENT_FRAMEWORK.md](./AGENT_FRAMEWORK.md), [AGENT_RUNTIME.md](./AGENT_RUNTIME.md), [COACHING_SESSION_RUNTIME.md](./COACHING_SESSION_RUNTIME.md), [ATHLETE_STATE_ENGINE.md](./ATHLETE_STATE_ENGINE.md), [CONTEXT_FUSION_ENGINE.md](./CONTEXT_FUSION_ENGINE.md), [DECISION_PIPELINE.md](./DECISION_PIPELINE.md), [STATE_MANAGEMENT.md](./STATE_MANAGEMENT.md), [AI_RUNTIME.md](./AI_RUNTIME.md), [CONTINUOUS_ADAPTATION_ENGINE.md](./CONTINUOUS_ADAPTATION_ENGINE.md), [WORKOUT_ADAPTATION_ENGINE.md](./WORKOUT_ADAPTATION_ENGINE.md), [COACH_SUPERVISOR.md](./COACH_SUPERVISOR.md), [SUPERVISOR_ROUTING.md](./SUPERVISOR_ROUTING.md), [AGENT_CAPABILITY.md](./AGENT_CAPABILITY.md), [AGENT_COLLABORATION.md](./AGENT_COLLABORATION.md), [ARCHITECTURE.md](./ARCHITECTURE.md).

---

## Platform Stack

```
Conversation Runtime
      ↓
Coaching Session Runtime         ← Sprint 22.0 (session lifecycle)
      ↓
Specialist Agents (Workout / Nutrition / Recovery / Goal)
      ↓
Athlete State Engine             ← Sprint 22.1 (immutable athlete truth)
      ↓
Context Fusion Engine            ← Sprint 22.2 (UnifiedCoachingContext)
      ↓
Decision Engine                  ← Sprint 22.3 (CoachingDecision orchestration)
      ↓
Recommendation Engine            ← Sprint 22.4 (CoachingRecommendation orchestration)
      ↓
Explainability Engine            ← Sprint 22.5 (CoachingExplanation orchestration)
      ↓
Continuous Adaptation Engine     ← Sprint 23.1 (AdaptationDecision / opportunity detection)
      ↓
Workout Adaptation Engine        ← Sprint 24.1 (UpdatedWorkoutBlueprint / WorkoutRuntimeInput)
      ↓
Coach Supervisor                 ← Sprint 21.8 (central multi-agent orchestrator)
      ↓
Supervisor Routing Engine        ← Sprint 21.7
      ↓
Agent Capability Registry        ← Sprint 21.6
      ↓
Agent Collaboration              ← Sprint 21.5
      ↓
Domain engines (no orchestration here)
```

Supporting infrastructure:

| Layer | Module | Role |
|-------|--------|------|
| Coaching Session Runtime | `features/coaching-session` | Session lifecycle + immutable context; coordinates Supervisor |
| Athlete State Engine | `features/athlete-state` | Immutable current athlete truth; specialist aggregation |
| Context Fusion Engine | `features/context-fusion` | Fuse runtimes/agents into `UnifiedCoachingContext` |
| Continuous Adaptation Engine | `features/continuous-adaptation` | Adaptation opportunity detection → `AdaptationDecision` |
| Workout Adaptation Engine | `features/workout-adaptation` | Existing blueprint adaptation → `UpdatedWorkoutBlueprint` |
| Agent Framework | `features/agent-framework` | Shared `IAgent` contracts, lifecycle, registry |
| Agent Runtime | `features/agent-runtime` | Single-agent execution entry |
| Coach Supervisor | `features/coach-supervisor` | Multi-agent orchestration → `UnifiedCoachResponse` |
| Supervisor Routing | `features/supervisor-routing` | Deterministic routing plans |
| Capability Registry | `features/agent-capability` | Capability → owner resolution |
| Agent Collaboration | `features/agent-collaboration` | Plan / dispatch / aggregate specialists |

---

## Coach Supervisor Placement

Coach Supervisor is the **only** module responsible for coordinating the complete multi-agent coach workflow end-to-end.

It:

- registers as `IAgent` with role `coach_supervisor`
- consumes Routing + Capability Registry + Collaboration via ports
- never owns domain business logic

Legacy `features/coach-agent` remains the earlier meta-agent path; Coach Supervisor is the Sprint 21.8 foundation for the Supervisor Runtime path.

---

## Boundaries

| Allowed | Forbidden |
|---------|-----------|
| Orchestration / planning / aggregation structure | Workout / nutrition / recovery / goal calculations |
| Deterministic ports + mocks | Provider SDKs / networking / persistence |
| Framework registration | Custom agent frameworks |
| Immutable models | Prompt Builder / Tool Runtime implementation |
