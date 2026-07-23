# Coach Supervisor Foundation

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-24  
**Purpose:** Document the Coach Supervisor — central orchestrator of EVOLVE multi-agent workflow.  
**Source of Truth:** Yes — for Coach Supervisor layout, lifecycle, boundaries, and public API on mobile.

Related: [ARCHITECTURE.md](./ARCHITECTURE.md), [SUPERVISOR_RUNTIME.md](./SUPERVISOR_RUNTIME.md), [SUPERVISOR_ROUTING.md](./SUPERVISOR_ROUTING.md), [MULTI_AGENT_ROUTING.md](./MULTI_AGENT_ROUTING.md), [AGENT_COLLABORATION.md](./AGENT_COLLABORATION.md), [AGENT_FRAMEWORK.md](./AGENT_FRAMEWORK.md), [AGENT_PLATFORM.md](./AGENT_PLATFORM.md), [DECISIONS.md](./DECISIONS.md) (ADR-069).

---

## Responsibilities

Coach Supervisor owns **orchestration only** — coordinating specialist agents into a unified coach response.

It **does**:

- accept a user/coach request
- resolve routing via Supervisor Routing (port / mock)
- build an immutable coordination plan
- coordinate Agent Collaboration (port / mock)
- aggregate specialist execution summaries
- produce `UnifiedCoachResponse` / `CoachSupervisorResult`
- register as `IAgent` with role `coach_supervisor`

It **does not**:

- perform workout / nutrition / recovery / goal logic
- perform business calculations
- call AI providers / generate prompts
- networking / persistence / UI

Module: `app/src/features/coach-supervisor/`.

---

## Architecture Summary

```
User Request
      ↓
Coach Supervisor
      ↓
Routing Engine
      ↓
Capability Registry
      ↓
Agent Collaboration
      ↓
Specialist Agents
      ↓
Aggregation
      ↓
Unified Coach Response
```

---

## Lifecycle

```
CoachSupervisorRequest
  → validate request
  → route (RoutingPort → Capability Registry)
  → plan coordination (immutable CoachSupervisorPlan)
  → execute collaboration (CollaborationPort → specialists)
  → aggregate summaries
  → UnifiedCoachResponse
  → CoachSupervisorResult
```

Plans, aggregations, and responses are immutable after creation.

---

## Module Boundaries

| Layer | Role |
|-------|------|
| `models/` | Immutable request / context / plan / coordination / aggregation / response / result |
| `supervisor/` | Engine / coordinator / session / state / facade |
| `orchestrator/` | Thin orchestrator over engine |
| `planning/` | Deterministic planners (no execution) |
| `coordination/` | Routing / agent / capability / dependency / execution coordinators |
| `aggregation/` | Result / response / conflict / explanation / summary / diagnostics |
| `selectors/` | Agent / capability / execution / aggregation / priority |
| `builders/` | Context / plan / aggregation / response / result / snapshot |
| `validators/` | Request / plan / routing / aggregation / execution / response |
| `policies/` | Coordination / aggregation / execution / consistency / capability / safety |
| `framework/` | `CoachSupervisorFrameworkAgent` (`IAgent`, role `coach_supervisor`) |
| `contracts/` | `RoutingPort` / `CollaborationPort` (+ mocks) |
| `application/` | Narrow public API |
| `services/` | `CoachSupervisorService` facade |

---

## Public API

| Function | Purpose |
|----------|---------|
| `processCoachRequest` | Full orchestration → `UnifiedCoachResponse` |
| `buildCoordinationPlan` | Plan only |
| `aggregateResults` | Aggregate specialist summaries |
| `describeSupervisorCapabilities` | Immutable supervisor descriptor |
| `validateSupervisorPlan` | Validate plan integrity |

---

## Framework Integration

- Implements `IAgent` via `CoachSupervisorFrameworkAgent`
- `role = coach_supervisor` (`AgentRoles.COACH_SUPERVISOR`)
- Immutable capability keys (reasoning, explanation, planning, domain orchestration keys)
- Reuses Agent Framework lifecycle / registry — no custom framework

---

## Design Constraints

**No AI, prompts, provider SDKs, networking, persistence, UI, or domain business logic.**  
Orchestration only; downstream modules are consumed through ports (mocked in tests).
