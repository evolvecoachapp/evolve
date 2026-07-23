# Agent Framework

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-23  
**Purpose:** Document the Agent Framework foundation (Sprint 21.1).  
**Source of Truth:** Yes — for shared agent contracts, lifecycle, registry, factory, and public API.

Related: [ARCHITECTURE.md](./ARCHITECTURE.md), [AGENT_LIFECYCLE.md](./AGENT_LIFECYCLE.md), [AGENT_REGISTRY.md](./AGENT_REGISTRY.md), [AGENT_RUNTIME.md](./AGENT_RUNTIME.md), [WORKOUT_AGENT.md](./WORKOUT_AGENT.md), [DECISIONS.md](./DECISIONS.md) (ADR-060).

---

## Architecture Summary

```
User Request
      ↓
Agent Runtime
      ↓
Agent Framework (IAgent contracts)
      ↓
Workout Framework Agent / Nutrition / Recovery / Goal / Coach Supervisor
      ↓
Planning → Domain → Agent Result
```

Workout Agent execution path (specialized):

```
Agent Runtime → Workout Framework Agent → Planning → Workout Domain → Workout Result
```

Module: `app/src/features/agent-framework/`.

The Agent Framework defines the common contracts, lifecycle, and orchestration model shared by every intelligent agent in EVOLVE.

It contains **no** domain-specific logic, prompts, providers, networking, or persistence — immutable agent infrastructure only.

---

## Module Layout

| Folder | Role |
|--------|------|
| `contracts/` | `IAgent`, `IAgentFactory`, `IAgentRegistry`, lifecycle / capability / result contracts |
| `models/` | Immutable `Agent`, `AgentDescriptor`, `AgentContext`, `AgentRequest`, `AgentSnapshot`, … |
| `lifecycle/` | `AgentLifecycle`, `AgentStateMachine`, `AgentInitializer`, `AgentHealthChecker`, `AgentShutdown` |
| `registry/` | `AgentRegistry`, `CapabilityRegistry`, `RoleRegistry`, `MetadataRegistry` |
| `factory/` | `AgentFactory` — resolve by id / role / capability / default |
| `capabilities/` | Immutable capability definitions (WorkoutPlanning, NutritionPlanning, …) |
| `builders/` | Context / Descriptor / Package builders |
| `validators/` | Registration, capabilities, dependencies, configuration, context, lifecycle, metadata |
| `selectors/` | Agent / Capability / Role / Priority / Dependency selectors |
| `policies/` | Registration / Dependency / Priority / Availability / Health policies |
| `services/` | `AgentFrameworkService` |
| `application/` | Public API only |
| `utils/` | `FreezeAgent`, statistics / capability / formatting / metadata helpers |

---

## Public API

| Function | Role |
|----------|------|
| `registerAgent` | Register an `IAgent` contract |
| `resolveAgent` | Resolve by id, role, capability, or default |
| `listAgents` | List registered agents |
| `describeAgent` | Immutable `AgentSnapshot` |
| `validateAgent` | Soft registration validation |

Internals (registries, factory, lifecycle) are not part of the public application surface.

---

## Integration

| Consumer | Integration |
|----------|-------------|
| **Workout Agent** | Implements `IAgent` via `WorkoutFrameworkAgent`; `registerWithFramework` + `registerWithRuntime` |
| **Nutrition / Recovery Agents** | Same `IAgent` adapter pattern |
| Future Goal / Coach Supervisor | Extend `IAgent` + register with framework / runtime |

---

## Non-Goals

- No OpenAI / provider SDKs
- No Prompt Builder
- No Tool Runtime
- No business / domain logic
- No networking
- No persistence

---

## Related Docs

- [AGENT_LIFECYCLE.md](./AGENT_LIFECYCLE.md) — state machine + initialize / shutdown
- [AGENT_REGISTRY.md](./AGENT_REGISTRY.md) — registration surfaces
- [WORKOUT_AGENT.md](./WORKOUT_AGENT.md) — first migrated domain agent
