# Agent Registry

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-23  
**Purpose:** Document Agent Framework registration surfaces (Sprint 21.1).  
**Source of Truth:** Yes — for agent / capability / role / metadata registration.

Related: [AGENT_FRAMEWORK.md](./AGENT_FRAMEWORK.md), [AGENT_LIFECYCLE.md](./AGENT_LIFECYCLE.md), [ARCHITECTURE.md](./ARCHITECTURE.md).

---

## Purpose

Registries store **contracts and mappings only**. They never own concrete domain agent business logic.

---

## Registries

| Registry | Stores |
|----------|--------|
| `AgentRegistry` | `IAgent` contracts by id |
| `CapabilityRegistry` | Immutable capability definitions |
| `RoleRegistry` | Role → agent id mappings |
| `MetadataRegistry` | Agent metadata + registeredAt |

---

## Factory Resolution

`AgentFactory` resolves registered agents by:

1. **id**
2. **role**
3. **capability**
4. **default** (configured default, else first available)

Unavailable / disabled / shutdown agents fail availability validation.

---

## Registration Flow

```
IAgent
  ↓ validateRegistration
AgentRegistry.register
  ↓
RoleRegistry.syncFromAgent
MetadataRegistry.register
AgentLifecycle.initialize → ready
```

---

## Rules

- No concrete domain agents inside framework registries
- Duplicate id registration throws
- Soft validation via `validateAgent` public API
- Hard validation on `register` for identity / configuration integrity
