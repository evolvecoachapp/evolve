# Supervisor Routing Engine Foundation

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-24  
**Purpose:** Document the Supervisor Routing Engine — deterministic multi-agent routing plans for Coach Supervisor.  
**Source of Truth:** Yes — for Supervisor Routing layout, lifecycle, boundaries, and public API on mobile.

Related: [ARCHITECTURE.md](./ARCHITECTURE.md), [MULTI_AGENT_ROUTING.md](./MULTI_AGENT_ROUTING.md), [SUPERVISOR_RUNTIME.md](./SUPERVISOR_RUNTIME.md), [AGENT_CAPABILITY.md](./AGENT_CAPABILITY.md), [AGENT_COLLABORATION.md](./AGENT_COLLABORATION.md), [COACH_AGENT.md](./COACH_AGENT.md), [DECISIONS.md](./DECISIONS.md) (ADR-068).

---

## Responsibilities

Supervisor Routing owns **routing plans only** — transforming a user/coach request into an immutable multi-agent routing plan.

It **does**:

- analyze request metadata, required capabilities, and routing rules
- resolve capabilities via Capability Registry (exact match)
- build dependency graphs and deterministic execution order
- validate plans (cycles, uniqueness, consistency, graph integrity)
- produce `RoutingPlan` / `RoutingSnapshot` for Supervisor Runtime / Collaboration consumers

It **does not**:

- execute agents
- call AI providers / generate prompts
- perform business logic
- perform collaboration / dispatch / aggregation
- networking / persistence / UI
- ranking algorithms or heuristic scoring

Module: `app/src/features/supervisor-routing/`.

---

## Architecture Summary

```
User Request
      ↓
Routing Engine
      ↓
Capability Registry
      ↓
Routing Plan
      ↓
Agent Collaboration
      ↓
Specialist Agents
```

Placement relative to Coach Supervisor:

```
Coach Supervisor
      ↓
Supervisor Routing Engine     ← this module (Sprint 21.7) — foundation only
      ↓
Capability Registry           ← Sprint 21.6
      ↓
Agent Collaboration           ← consumes RoutingPlan later
      ↓
Specialist Agents
```

This sprint introduces the foundation module only. Coach Supervisor / Collaboration execution are **not** modified yet.

---

## Lifecycle

```
RoutingRequest
  → validate request
  → resolve capabilities (Capability Registry, exact match)
  → select agents / priorities / dependencies / phases
  → plan graph + execution order
  → immutable RoutingPlan
  → validate / describe / snapshot
  → RoutingResult
```

Routing plans are immutable after creation. Resolution is exact-match only (no scoring, ranking, heuristics, or AI).

---

## Module Boundaries

| Layer | Role |
|-------|------|
| `models/` | Immutable request / context / plan / graph / step / snapshot / result |
| `routing/` | `RoutingEngine` / `RoutingCoordinator` / session / state (orchestration only) |
| `planner/` | Deterministic planners (capability / dependency / priority / phase / order / graph) |
| `resolver/` | Exact Capability Registry resolution |
| `selectors/` | Capability / agent / priority / dependency / execution / phase |
| `builders/` | Plan / graph / context / summary / snapshot / result |
| `validators/` | Plan / dependencies / cycles / capabilities / order / graph / uniqueness / consistency |
| `policies/` | Routing / dependency / priority / capability / execution / consistency |
| `contracts/` | `CapabilityRegistryPort` + mock registry |
| `services/` | `SupervisorRoutingService` |
| `application/` | Minimal public API |
| `utils/` | Freeze + graph / dependency / priority / statistics helpers |

---

## Public API

| Function | Role |
|----------|------|
| `buildRoutingPlan` | Build an immutable multi-agent routing plan |
| `resolveRouting` | Resolve required capabilities / candidate agents |
| `validateRoutingPlan` | Validate plan integrity |
| `describeRouting` | Human-readable plan description |
| `buildRoutingSnapshot` | Immutable routing snapshot |

Prefer a shared `SupervisorRoutingService` instance when chaining resolve → plan → snapshot.

---

## Extension Points

| Extension | How |
|-----------|-----|
| Capability Registry | Inject `CapabilityRegistryPort` (mock or Agent Capability store adapter) |
| Planners / selectors / policies | Inject replacements into engine / planner deps |
| Constraints | Declare `RoutingConstraint` on the request (`forbid_agent`, `max_targets`, …) |

Future sprints may wire Coach Supervisor → Routing Engine → Collaboration without changing this public application API.

---

## Non-Goals

Supervisor Routing does **not**:

- call AI providers or generate prompts
- score, rank, or heuristically select agents
- introduce networking, persistence, or conversation memory
- execute Workout / Nutrition / Recovery agents
- run Agent Collaboration dispatch / aggregation
- modify Coach Agent or Agent Collaboration in this sprint
