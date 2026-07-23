# Agent Lifecycle

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-23  
**Purpose:** Document the Agent Framework lifecycle model (Sprint 21.1).  
**Source of Truth:** Yes — for framework agent status transitions (not domain execution pipelines).

Related: [AGENT_FRAMEWORK.md](./AGENT_FRAMEWORK.md), [AGENT_REGISTRY.md](./AGENT_REGISTRY.md), [ARCHITECTURE.md](./ARCHITECTURE.md).

---

## Purpose

Lifecycle owns **registration / readiness / shutdown** for agents. It does **not** execute domain requests.

Domain agents (e.g. Workout Agent) may keep their own session status machines for reasoning / planning; those are separate from this framework lifecycle.

---

## Status Model

```
unregistered → registered → initializing → ready ⇄ busy
                                         ⇄ degraded
ready / busy / degraded / failed → shutting_down → shutdown
```

| Status | Meaning |
|--------|---------|
| `unregistered` | Not in registry |
| `registered` | Registered, not yet initialized |
| `initializing` | Initialization in progress |
| `ready` | Available for resolution |
| `busy` | Reserved / in use (framework marker only) |
| `degraded` | Available with health warnings |
| `shutting_down` | Shutdown in progress |
| `shutdown` | Terminal |
| `failed` | Terminal failure (may re-initialize) |

---

## Components

| Component | Role |
|-----------|------|
| `AgentStateMachine` | Allowed transitions only |
| `AgentInitializer` | Bring agent to `ready` |
| `AgentHealthChecker` | Immutable health snapshot |
| `AgentShutdown` | Transition to `shutdown` |
| `AgentLifecycle` | Coordinate initialize / transition / shutdown / getState |

---

## Rules

- Lifecycle only — **no execution logic**
- All `AgentState` snapshots are frozen
- Invalid transitions throw
- Health checks never mutate agent internals
