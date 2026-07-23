# Multi-Agent Runtime

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-24  
**Purpose:** Describe the multi-agent runtime path owned by Coach Supervisor.  
**Source of Truth:** Partial — execution details in [COACH_SUPERVISOR.md](./COACH_SUPERVISOR.md) and [SUPERVISOR_RUNTIME.md](./SUPERVISOR_RUNTIME.md).

Related: [COACH_SUPERVISOR.md](./COACH_SUPERVISOR.md), [SUPERVISOR_RUNTIME.md](./SUPERVISOR_RUNTIME.md), [MULTI_AGENT_ROUTING.md](./MULTI_AGENT_ROUTING.md), [AGENT_COLLABORATION.md](./AGENT_COLLABORATION.md), [AGENT_PLATFORM.md](./AGENT_PLATFORM.md).

---

## Runtime Path

```
User Request
  → Coach Supervisor (processCoachRequest)
  → Routing Engine (capability → owner → order)
  → Capability Registry (exact match)
  → Agent Collaboration (dispatch specialists)
  → Specialist Agents
  → Aggregation (structural merge)
  → UnifiedCoachResponse
```

---

## Ownership

| Concern | Owner |
|---------|-------|
| End-to-end multi-agent orchestration | Coach Supervisor |
| Routing plan construction | Supervisor Routing |
| Capability → agent ownership | Agent Capability Registry |
| Specialist dispatch / collab aggregation | Agent Collaboration |
| Domain results | Workout / Nutrition / Recovery / Goal agents |
| Single-agent execution entry | Agent Runtime |

---

## Status (Sprint 21.8)

Coach Supervisor foundation is implemented with ports for Routing and Collaboration (mocks in tests). It produces immutable `UnifiedCoachResponse` without domain business logic, AI, networking, or persistence.
