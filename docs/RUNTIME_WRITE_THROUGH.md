# Runtime Write-Through Pipeline

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-08-10  
**Purpose:** Document the Runtime Write-Through Pipeline — persisting in-memory runtime state through repository contracts whenever composition services hold updated snapshots (Sprint 33.4).  
**Source of Truth:** Yes — for write-through layout and persistence rules on mobile.

Related: [ARCHITECTURE.md](./ARCHITECTURE.md), [RUNTIME_BOOTSTRAP.md](./RUNTIME_BOOTSTRAP.md), [RUNTIME_HYDRATION.md](./RUNTIME_HYDRATION.md), [COMPOSITION_ROOT.md](./COMPOSITION_ROOT.md), [DECISIONS.md](./DECISIONS.md) (ADR-124).

---

## Architecture Summary

```
Application
  ↓
Runtime Services (Athlete Identity / Runtime Environment / Unified Workspace)
  ↓
RuntimeWriteThroughPipeline
  ↓
Repository Adapters
  ↓
Persistence Contracts
  ↓
(SQLite implementation hidden)
```

The Runtime Write-Through Pipeline is responsible **only** for:

- Validating runtime bootstrap readiness
- Observing snapshots from Athlete Identity, Runtime Environment, and Unified Workspace services
- Mapping observed identifiers into `PersistenceRecord` shapes
- Persisting through repository contract `save()` only
- Write-through lifecycle and immutable persist state

It must **not**:

- Access SQLite directly
- Implement persistence adapters
- Modify runtime composition service state
- Execute business logic, analytics calculations, or timeline modifications
- Update Dashboard or Home read models
- Perform networking or retry logic

Module: `app/src/runtime/write-through/`.

---

## Components

| Component | Responsibility |
|-----------|----------------|
| `RuntimeWriteThroughPipeline` | Orchestrates persist lifecycle (validate bootstrap → observe runtime → save via repositories → freeze state) |
| `RuntimeWriteThroughPersistence` | Runtime service observation and repository contract writes |
| `RuntimeWriteThroughState` | Immutable process-wide write-through snapshot |
| `RuntimeWriteThroughResult` | Success payload (record counts, phases) |
| `RuntimeWriteThroughStatus` | `idle` \| `persisting` \| `ready` \| `failed` |
| `RuntimeWriteThroughService` | Read-only facade resolved from Composition Root (`RuntimeWriteThroughService` token) |
| `RuntimeWriteThroughFactory` | Composition Root factory (wiring only) |
| `RuntimeWriteThroughValidation` | State, start-guard, and bootstrap-ready validation |
| `RuntimeWriteThroughError` | Typed persist failures |

---

## Application APIs

| API | Path | Purpose |
|-----|------|---------|
| `persistRuntime()` | `application/persistRuntime.ts` | Idempotent async persist entry |
| `getWriteThroughStatus()` | `application/getWriteThroughStatus.ts` | Current lifecycle status |

---

## Composition Root Registration

`RuntimeWriteThroughService` is registered as token #61 in `ServiceMap` via `RuntimeWriteThroughFactory`.

The service reads from the process-wide write-through state holder — it does not cache stale snapshots.

---

## Behavior Rules

| Rule | Detail |
|------|--------|
| Prerequisite | Runtime bootstrap must reach `ready` |
| Idempotency | `persistRuntime()` returns the same frozen result promise on subsequent calls |
| Observation | Structural identifiers only — no domain interpretation |
| Empty runtime | Missing identity/runtime/workspace snapshots succeed with zero record counts |
| Repository rejection | Deterministic `repository_contract_failed` error; runtime services remain unchanged |
| Determinism | Fixed clocks in tests; identifier mapping only — no calculations |

---

## Phase 33 Scope Boundary

Sprint 33.4 persists Athlete Identity, Runtime Environment, and Unified Workspace through repository contracts only. Richer domain-to-record mapping, automatic post-mutation orchestration, and conflict resolution belong to later sprints.

---

## Testing

| File | Covers |
|------|--------|
| `__tests__/persist.test.ts` | Full persist lifecycle, empty runtime, duplicate guard, bootstrap prerequisite, repository rejection, idempotent application API |
| `__tests__/validation.test.ts` | State invariants, start guards, bootstrap readiness, repository contract usage |
| `__tests__/immutability.test.ts` | `Object.isFrozen` on state/result/phases |
| `__tests__/composition.test.ts` | `RuntimeWriteThroughService` registered, initial `idle` state |

---

## Related Documentation

- [RUNTIME_BOOTSTRAP.md](./RUNTIME_BOOTSTRAP.md) — prerequisite gate
- [RUNTIME_HYDRATION.md](./RUNTIME_HYDRATION.md) — inverse hydration pipeline
- [COMPOSITION_ROOT.md](./COMPOSITION_ROOT.md) — service registration
