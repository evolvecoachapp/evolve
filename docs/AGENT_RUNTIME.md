# Agent Runtime

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-23  
**Purpose:** Document the Agent Runtime Foundation — the single execution entry point that coordinates specialized agents through common contracts.  
**Source of Truth:** Yes — for Agent Runtime orchestration, registry, selection, and public API.

Related: [ARCHITECTURE.md](./ARCHITECTURE.md), [AGENT_FRAMEWORK.md](./AGENT_FRAMEWORK.md), [AGENT_LIFECYCLE.md](./AGENT_LIFECYCLE.md), [AGENT_REGISTRY.md](./AGENT_REGISTRY.md), [WORKOUT_AGENT.md](./WORKOUT_AGENT.md), [NUTRITION_AGENT.md](./NUTRITION_AGENT.md), [RECOVERY_AGENT.md](./RECOVERY_AGENT.md), [DECISIONS.md](./DECISIONS.md) (ADR-063).

---

## Purpose

Agent Runtime is the orchestration tier that coordinates specialized domain agents (`IAgent` implementations) and is the **single execution entry point** for agent-based workflows.

It contains **no** business logic, provider logic, networking, persistence, prompts, or memory — only runtime orchestration through common contracts.

Module: `app/src/features/agent-runtime/`.

---

## Architecture

```
User Request
      ↓
Agent Runtime
      ↓
Agent Registry
      ↓
Agent Selection
      ↓
Agent Execution
      ↓
Agent Result
```

Placement in the broader pipeline:

```
User Request
      ↓
Conversation Runtime
      ↓
Agent Runtime                         ← this module (Sprint 21.4)
      ↓
Agent Framework contracts (IAgent)    ← Sprint 21.1
      ↓
Domain Agent (Workout / Nutrition / Recovery)
      ↓
Planning → Domain → Agent Result
```

Workout Agent specialized path:

```
Agent Runtime → Workout Framework Agent → Planning → Workout Domain → Workout Result
```

---

## Runtime Lifecycle

1. **Receive** immutable `AgentRuntimeRequest`
2. **Validate** request + registry integrity
3. **Select** agent (role / capability / priority / fallback)
4. **Plan** immutable `AgentExecutionPlan`
5. **Execute** via registered executor (or default shell executor)
6. **Collect** `AgentExecutionResult` + runtime events
7. **Return** immutable `AgentRuntimeResponse` (includes snapshot + summary)

Lifecycle statuses: `idle` → `validating` → `selecting` → `planning` → `executing` → `collecting` → `completed` | `failed`.

---

## Registry

`AgentRegistry` is **immutable**:

- `register` / `unregister` return a **new** registry instance
- Lookup by **identifier**, **role**, and **capability**
- List registered agents / entries
- Capability index for integrity checks

Consumes existing `IAgent` (including `RecoveryFrameworkAgent`) without modifying domain agents.

---

## Selection Flow

`AgentSelector` is pure deterministic selection (no AI):

1. Explicit `agentId` (if present)
2. `role` (priority-ranked among matches)
3. `capability` (priority-ranked among matches)
4. `fallbackRole`
5. `fallbackCapability`
6. Exact `priority` match (last resort)

Priority ties break by stable `agentId` sort.

---

## Module Layout

| Folder | Role |
|--------|------|
| `models/` | Immutable request / response / context / state / plan / result / snapshot / event / error |
| `runtime/` | `AgentRuntime` — orchestration entry |
| `registry/` | Immutable `AgentRegistry` |
| `selectors/` | Deterministic `AgentSelector` |
| `coordinators/` | Execution / Lifecycle / Response / Event |
| `builders/` | Request / Context / Response builders |
| `validators/` | Request, registry, selected agent, plan, lifecycle, response |
| `services/` | `AgentRuntimeService` |
| `application/` | Public API only |
| `utils/` | Freeze / formatting / statistics / helpers |

---

## Public API

| Function | Role |
|----------|------|
| `executeAgent` | Run complete runtime flow → immutable `AgentRuntimeResponse` |
| `listAgents` | List registered `IAgent` instances |
| `describeAgent` | Immutable `AgentRuntimeDescriptor` |
| `registerAgent` | Register `IAgent` (+ optional executor) |
| `unregisterAgent` | Remove agent from runtime registry |

Runtime internals (coordinators, selectors, registry mutations) are not part of the public application surface.

---

## Integration

| Consumer | Integration |
|----------|-------------|
| **IAgent** | Register any framework agent |
| **WorkoutFrameworkAgent** | Register via `WorkoutAgentService.registerWithRuntime` (+ domain executor) |
| **RecoveryFrameworkAgent** | Register without modifying recovery-agent |
| Nutrition / Goal / Coach Supervisor | Same `IAgent` + optional executor |

Domain agents supply optional `AgentRuntimeExecutor` handlers. Without a handler, the runtime uses a **shell executor** that returns orchestration metadata only (no domain logic).

---

## Future Multi-Agent Collaboration

Placeholders for later sprints (not implemented here):

- Multi-agent execution plans (ordered / parallel fan-out)
- Collaboration policies (handoff, supervisor arbitration)
- Shared runtime context across agents
- Event subscribers for Conversation / Coach pipelines

Current foundation executes **one selected agent per request**.

---

## Non-Goals

Agent Runtime does **not**:

- contain domain / business logic
- generate prompts or call providers
- execute tools (Tool Runtime owns that)
- introduce networking or persistence
- own conversation memory
- replace Agent Framework contracts (`IAgent`, lifecycle, framework registry)
