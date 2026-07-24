# Supervisor Runtime

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-24  
**Purpose:** Describe the Coach Supervisor runtime path and how Routing Engine fits before Collaboration.  
**Source of Truth:** Partial — runtime orchestration lives in [COACH_SUPERVISOR.md](./COACH_SUPERVISOR.md); routing foundation is [SUPERVISOR_ROUTING.md](./SUPERVISOR_ROUTING.md).

Related: [COACH_SUPERVISOR.md](./COACH_SUPERVISOR.md), [SUPERVISOR_ROUTING.md](./SUPERVISOR_ROUTING.md), [MULTI_AGENT_ROUTING.md](./MULTI_AGENT_ROUTING.md), [MULTI_AGENT_RUNTIME.md](./MULTI_AGENT_RUNTIME.md), [AGENT_PLATFORM.md](./AGENT_PLATFORM.md), [COACH_AGENT.md](./COACH_AGENT.md), [AGENT_RUNTIME.md](./AGENT_RUNTIME.md), [AGENT_COLLABORATION.md](./AGENT_COLLABORATION.md), [AGENT_CAPABILITY.md](./AGENT_CAPABILITY.md).

---

## Supervisor Path

```
User Request
      ↓
Conversation Runtime
      ↓
Coaching Session Runtime         ← Sprint 22.0 (session lifecycle; coordinates Supervisor)
      ↓
Agent Runtime / Coach Supervisor ← Sprint 21.8 foundation (implemented)
      ↓
Supervisor Routing Engine        ← Sprint 21.7 foundation (plan only)
      ↓
Capability Registry              ← Sprint 21.6
      ↓
RoutingPlan / RoutingSnapshot
      ↓
Agent Collaboration              ← consumes plan via CollaborationPort
      ↓
Specialist Agents
      ↓
Aggregation
      ↓
UnifiedCoachResponse
```

---

## Current Status (Sprint 21.8)

| Component | Status |
|-----------|--------|
| Coach Supervisor (`features/coach-supervisor`) | Implemented — foundation |
| Supervisor Routing Engine (`features/supervisor-routing`) | Implemented — consumed via `RoutingPort` |
| Capability Registry | Implemented — used by routing |
| Agent Collaboration | Implemented — consumed via `CollaborationPort` |
| Specialist business logic inside Supervisor | Forbidden (by design) |

---

## Boundaries

Supervisor Runtime orchestration:

- accepts a user/coach request
- calls routing via port (`buildRoutingPlan` / mock)
- builds coordination plan
- hands plan to Agent Collaboration via port
- aggregates structural summaries into `UnifiedCoachResponse`

Coach Supervisor remains:

- no AI / prompts / providers
- no networking / persistence
- no workout / nutrition / recovery / goal / business calculations

---

## Related APIs

| Module | Public entry |
|--------|----------------|
| Coaching Session Runtime | `startSession`, `continueSession`, `endSession`, `describeSession`, `validateSession` |
| Coach Supervisor | `processCoachRequest`, `buildCoordinationPlan`, `aggregateResults`, `describeSupervisorCapabilities`, `validateSupervisorPlan` |
| Supervisor Routing | `buildRoutingPlan`, `resolveRouting`, `validateRoutingPlan`, `describeRouting`, `buildRoutingSnapshot` |
| Agent Capability | `registerCapability`, `resolveCapability`, … |
| Agent Collaboration | `createCollaborationPlan`, `dispatchCollaboration`, … |
| Agent Runtime | `executeAgent`, … |

See also: [COACHING_SESSION_RUNTIME.md](./COACHING_SESSION_RUNTIME.md), [SESSION_LIFECYCLE.md](./SESSION_LIFECYCLE.md), [AI_RUNTIME.md](./AI_RUNTIME.md).
