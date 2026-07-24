# AI Runtime

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-25  
**Purpose:** Describe the mobile AI / coach runtime stack, including Coaching Session Runtime placement.  
**Source of Truth:** Partial — subsystem details live in linked docs; high-level Coach design in [AI_SYSTEM.md](./AI_SYSTEM.md).

Related: [ARCHITECTURE.md](./ARCHITECTURE.md), [COACHING_SESSION_RUNTIME.md](./COACHING_SESSION_RUNTIME.md), [SESSION_LIFECYCLE.md](./SESSION_LIFECYCLE.md), [COACH_SUPERVISOR.md](./COACH_SUPERVISOR.md), [SUPERVISOR_RUNTIME.md](./SUPERVISOR_RUNTIME.md), [MULTI_AGENT_RUNTIME.md](./MULTI_AGENT_RUNTIME.md), [AGENT_RUNTIME.md](./AGENT_RUNTIME.md), [AGENT_PLATFORM.md](./AGENT_PLATFORM.md).

---

## Coach Interaction Path (Sprint 22.0)

```
User
  ↓
Conversation Runtime
  ↓
Coaching Session Runtime          ← Sprint 22.0 (session lifecycle + immutable context)
  ↓
Coach Supervisor                  ← Sprint 21.8 (multi-agent orchestration)
  ↓
Supervisor Routing / Capability Registry / Agent Collaboration
  ↓
Specialist Agents (Workout / Nutrition / Recovery / …)
  ↓
Aggregation
  ↓
Unified Coach Response
  ↓
SessionResult / SessionContext / SessionSummary
```

---

## Layer Responsibilities

| Layer | Module | Responsibility |
|-------|--------|----------------|
| Conversation Runtime | `features/conversation*` | Conversation turn lifecycle — not replaced by session runtime |
| Coaching Session Runtime | `features/coaching-session` | Session lifecycle, immutable context, supervisor coordination |
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

Coach Supervisor remains responsible for Routing → Collaboration → Aggregation into a unified coach response.

---

## Public Entry Points

| Module | API |
|--------|-----|
| Coaching Session Runtime | `startSession`, `continueSession`, `endSession`, `describeSession`, `validateSession` |
| Coach Supervisor | `processCoachRequest`, `buildCoordinationPlan`, `aggregateResults`, `describeSupervisorCapabilities`, `validateSupervisorPlan` |

---

## Related Documents

- Session details: [COACHING_SESSION_RUNTIME.md](./COACHING_SESSION_RUNTIME.md)
- Transitions: [SESSION_LIFECYCLE.md](./SESSION_LIFECYCLE.md)
- Supervisor path: [SUPERVISOR_RUNTIME.md](./SUPERVISOR_RUNTIME.md)
- Broader Coach / LLM design: [AI_SYSTEM.md](./AI_SYSTEM.md)
`}