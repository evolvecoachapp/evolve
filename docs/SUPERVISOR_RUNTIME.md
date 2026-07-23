# Supervisor Runtime

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-24  
**Purpose:** Describe the Coach Supervisor runtime path and how Routing Engine fits before Collaboration.  
**Source of Truth:** Partial — runtime execution remains in Agent Runtime / Collaboration; routing foundation is [SUPERVISOR_ROUTING.md](./SUPERVISOR_ROUTING.md).

Related: [SUPERVISOR_ROUTING.md](./SUPERVISOR_ROUTING.md), [MULTI_AGENT_ROUTING.md](./MULTI_AGENT_ROUTING.md), [COACH_AGENT.md](./COACH_AGENT.md), [AGENT_RUNTIME.md](./AGENT_RUNTIME.md), [AGENT_COLLABORATION.md](./AGENT_COLLABORATION.md), [AGENT_CAPABILITY.md](./AGENT_CAPABILITY.md).

---

## Supervisor Path (Target)

```
User Request
      ↓
Agent Runtime                    (select / execute Coach Supervisor agent)
      ↓
Coach Supervisor
      ↓
Supervisor Routing Engine        ← Sprint 21.7 foundation (plan only)
      ↓
Capability Registry              ← Sprint 21.6
      ↓
RoutingPlan / RoutingSnapshot
      ↓
Agent Collaboration              (future consumer of routing plan)
      ↓
Specialist Agents
```

---

## Current Status (Sprint 21.7)

| Component | Status |
|-----------|--------|
| Supervisor Routing Engine (`features/supervisor-routing`) | Implemented — foundation |
| Capability Registry | Implemented — consumed via port / adapter |
| Coach Supervisor wiring to Routing Engine | Not modified yet |
| Collaboration consumption of `RoutingPlan` | Future sprint |
| Agent execution inside Routing | Forbidden (by design) |

---

## Boundaries

Supervisor Runtime orchestration may later:

- accept a user/coach request
- call `buildRoutingPlan` / `resolveRouting`
- hand `RoutingPlan` to Agent Collaboration

Supervisor Routing itself remains:

- no AI / prompts / providers
- no networking / persistence
- no collaboration execution
- no specialist business logic

---

## Related APIs

| Module | Public entry |
|--------|----------------|
| Supervisor Routing | `buildRoutingPlan`, `resolveRouting`, `validateRoutingPlan`, `describeRouting`, `buildRoutingSnapshot` |
| Agent Capability | `registerCapability`, `resolveCapability`, … |
| Agent Collaboration | `createCollaborationPlan`, `dispatchCollaboration`, … |
| Agent Runtime | `executeAgent`, … |
