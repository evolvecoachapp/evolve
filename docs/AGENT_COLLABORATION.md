# Agent Collaboration Foundation

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-24  
**Purpose:** Document the Agent Collaboration Foundation — deterministic orchestration between Coach Agent and specialist agents.  
**Source of Truth:** Yes — for Agent Collaboration layout, lifecycle, execution flow, boundaries, and public API on mobile.

Related: [ARCHITECTURE.md](./ARCHITECTURE.md), [COACH_AGENT.md](./COACH_AGENT.md), [AGENT_RUNTIME.md](./AGENT_RUNTIME.md), [AGENT_FRAMEWORK.md](./AGENT_FRAMEWORK.md), [DECISIONS.md](./DECISIONS.md) (ADR-066).

---

## Responsibilities

Agent Collaboration owns **orchestration only** between Coach Agent and specialist agents (Workout / Nutrition / Recovery).

It **does**:

- collaboration planning
- participant selection
- execution planning
- deterministic dispatch
- execution lifecycle coordination
- execution metadata collection
- deterministic aggregation
- collaboration snapshots

It **does not**:

- AI / autonomous decision making / prompts
- Prompt Builder / Providers / Tool Calling
- Networking / Persistence
- Conversation Memory
- Workout / Nutrition / Recovery business logic

Business logic remains inside specialist agents. Collaboration invokes injectable participant handlers (default shell returns orchestration metadata only).

Module: `app/src/features/agent-collaboration/`.

---

## Architecture Summary

```
Coach Agent
      ↓
Agent Collaboration
      ↓
Planning
      ↓
Dispatch
      ↓
Execution
      ↓
Aggregation
      ↓
Coach Result
```

Placement relative to Agent Runtime:

```
Coach Agent
      ↓
Agent Collaboration          ← this module (Sprint 21.5)
      ↓
Specialist participant handlers (Workout / Nutrition / Recovery)
```

Agent Runtime remains the single-agent execution entry point. Agent Collaboration coordinates **multi-specialist** ordered collaboration for the Coach Agent.

---

## Lifecycle

```
CollaborationRequest
  → validate
  → plan (participants + tasks + batches + policies)
  → dispatch (sequential, deterministic)
  → collect ExecutionResult(s)
  → aggregate (order + provenance + metadata)
  → CollaborationSnapshot / CollaborationResult
```

Statuses: `idle` → `validating` → `planning` → `dispatching` → `executing` → `aggregating` → `completed` | `failed`.

---

## Execution Flow

1. **Receive** immutable `CollaborationRequest` from Coach Agent
2. **Validate** request shape
3. **Select** eligible specialist participants (policies)
4. **Order** participants (`workout` → `nutrition` → `recovery` by default)
5. **Plan** immutable `CollaborationPlan` (tasks + sequential `ExecutionBatch`)
6. **Dispatch** each task in order via injectable handlers (no retries / queues / concurrency frameworks)
7. **Propagate** errors deterministically (`stopOnError` default `true`)
8. **Aggregate** results preserving order, provenance, and metadata
9. **Snapshot** immutable `CollaborationSnapshot` for Coach consumption
10. **Return** frozen `CollaborationResult`

---

## Module Boundaries

| Layer | Role |
|-------|------|
| `models/` | Immutable request / plan / participant / task / batch / result / aggregation / snapshot / event / error |
| `planning/` | `CollaborationPlanner`, `ParticipantSelector`, `ExecutionPlanner` — never executes |
| `dispatch/` | `CollaborationDispatcher` — sequential deterministic invocation |
| `execution/` | `CollaborationEngine` — lifecycle coordination |
| `aggregation/` | `ResultAggregator` — deterministic merge only |
| `builders/` | Plan / AggregationContext / Snapshot / Request / Result |
| `validators/` | Request / Plan / Participants / Aggregation inputs |
| `policies/` | Ordering / Duplicate / Eligibility / Aggregation rules |
| `services/` | `AgentCollaborationService` |
| `application/` | Minimal public API |
| `utils/` | Freeze + deterministic sort helpers |

---

## Public API

| Function | Role |
|----------|------|
| `createCollaborationPlan` | Coach request → immutable plan |
| `dispatchCollaboration` | Invoke planned participants in order |
| `executeCollaboration` | Full lifecycle: plan → dispatch → aggregate → snapshot |
| `aggregateResults` | Deterministic merge of execution results |
| `buildCollaborationSnapshot` | Immutable collaboration snapshot |

Prefer a shared `AgentCollaborationService` instance when chaining plan → dispatch → aggregate.

---

## Extension Points

| Extension | How |
|-----------|-----|
| Custom participant handlers | `service.registerHandler(agentId, handler)` or `handlers` map in deps |
| Role order | Inject `ExecutionOrderingPolicy` with custom `roleOrder` |
| Eligibility | Inject `ParticipantEligibilityPolicy` with `allowedRoles` |
| Aggregation rules | Inject `AggregationRulesPolicy` (must remain deterministic — no AI/scoring) |
| Agent id mapping | `ParticipantSelector` `agentIdByRole` |

Future work may wire handlers to Agent Runtime / domain agents without changing the public application API.

---

## Non-Goals

Agent Collaboration does **not**:

- call AI providers or generate prompts
- score, rank, or infer across specialist outputs
- introduce networking, persistence, or conversation memory
- embed Workout / Nutrition / Recovery domain logic
- replace Agent Runtime single-agent execution
- introduce retries, queues, or concurrency abstractions
