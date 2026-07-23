# Agent Capability Registry Foundation

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-24  
**Purpose:** Document the Agent Capability Registry Foundation — deterministic capability definitions, registration, lookup, and resolution for Coach Agent.  
**Source of Truth:** Yes — for Agent Capability layout, lifecycle, boundaries, and public API on mobile.

Related: [ARCHITECTURE.md](./ARCHITECTURE.md), [AGENT_COLLABORATION.md](./AGENT_COLLABORATION.md), [COACH_AGENT.md](./COACH_AGENT.md), [AGENT_RUNTIME.md](./AGENT_RUNTIME.md), [AGENT_FRAMEWORK.md](./AGENT_FRAMEWORK.md), [DECISIONS.md](./DECISIONS.md) (ADR-067).

---

## Responsibilities

Agent Capability owns the **capability registry only** — the single source of truth describing what every agent can do.

It **does**:

- capability definitions
- capability registration
- capability lookup
- deterministic capability resolution
- capability metadata
- capability validation
- registry snapshots
- registry querying

It **does not**:

- execute agents
- AI / prompts / provider selection
- networking / persistence / memory
- business logic
- dependency injection containers
- plugin loading

Coach Agent must reason in capabilities (e.g. `GenerateWorkout`, `AnalyzeNutrition`, `EvaluateRecovery`), not concrete specialist agent names.

Module: `app/src/features/agent-capability/`.

---

## Architecture Summary

```
Coach Agent
      ↓
Capability Resolver
      ↓
Capability Registry
      ↓
Agent Collaboration
      ↓
Specialist Agents
```

Placement relative to Collaboration / Runtime:

```
Coach Agent
      ↓
Agent Capability Registry     ← this module (Sprint 21.6) — foundation only
      ↓
Agent Collaboration           ← future consumer of resolved owners
      ↓
Specialist participant handlers
```

This sprint introduces the foundation module only. Coach Agent behaviour and collaboration flow are **not** modified yet.

---

## Lifecycle

```
CapabilityRegistrationInput
  → validate
  → register (immutable CapabilityRegistration)
  → store in CapabilityRegistryStore
  → resolve / query / snapshot / validate
  → CapabilityResult
```

Registration is immutable after creation. Resolution is exact-match only (no scoring, ranking, heuristics, or AI).

---

## Module Boundaries

| Layer | Role |
|-------|------|
| `models/` | Immutable capability / registration / registry / match / resolution / snapshot / query / result |
| `registry/` | `CapabilityRegistryStore` — registration, lookup, snapshots (never executes) |
| `resolver/` | `CapabilityResolver` — deterministic exact resolution |
| `registration/` | `CapabilityRegistrar` — create + register immutable registrations |
| `querying/` | `CapabilityQueryEngine` — find / list / exists (no execution) |
| `builders/` | Descriptor / Registration / Registry / Resolution / Snapshot / Result |
| `validators/` | Identifiers / descriptors / registrations / duplicates / registry consistency |
| `policies/` | Duplicate handling / ownership / uniqueness / consistency |
| `services/` | `AgentCapabilityService` |
| `application/` | Minimal public API |
| `utils/` | Freeze + deterministic sort helpers |

---

## Public API

| Function | Role |
|----------|------|
| `registerCapability` | Register an immutable capability for an owning agent |
| `resolveCapability` | Deterministically resolve a capability to its owner |
| `findCapability` | Lookup a single capability by id |
| `findCapabilities` | List capabilities (all or by agent) |
| `buildCapabilitySnapshot` | Immutable registry snapshot |
| `validateRegistry` | Validate registry consistency |

Prefer a shared `AgentCapabilityService` instance when chaining register → resolve → snapshot.

---

## Extension Points

| Extension | How |
|-----------|-----|
| Duplicate handling | Inject `DuplicateHandlingPolicy` (`reject` / `ignore` / `keep_first`) |
| Ownership rules | Inject / replace `CapabilityOwnershipPolicy` |
| Uniqueness rules | Inject / replace `CapabilityUniquenessPolicy` |
| Consistency checks | Inject / replace `RegistryConsistencyPolicy` |
| Well-known capabilities | Extend `WellKnownCapabilityIds` or register custom ids |

Future sprints may wire Coach Agent → Capability Resolver → Agent Collaboration without changing this public application API.

---

## Non-Goals

Agent Capability does **not**:

- call AI providers or generate prompts
- score, rank, or heuristically select capabilities
- introduce networking, persistence, or conversation memory
- execute Workout / Nutrition / Recovery agents
- replace Agent Framework capability definitions (framework contracts remain)
- modify Coach Agent or Agent Collaboration in this sprint
