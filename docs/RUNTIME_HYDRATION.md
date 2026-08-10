# Repository Hydration Pipeline

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-08-10  
**Purpose:** Document the Repository Hydration Pipeline — restoring in-memory runtime state from persistence contract repositories after Runtime Bootstrap (Sprint 33.2).  
**Source of Truth:** Yes — for Repository Hydration layout and restore rules on mobile.

Related: [ARCHITECTURE.md](./ARCHITECTURE.md), [RUNTIME_BOOTSTRAP.md](./RUNTIME_BOOTSTRAP.md), [COMPOSITION_ROOT.md](./COMPOSITION_ROOT.md), [DECISIONS.md](./DECISIONS.md) (ADR-122).

---

## Architecture Summary

```
Runtime Bootstrap (ready)
  ↓
RepositoryHydrationPipeline
  ↓
Repository Adapters (Persistence Contracts)
  ↓
AthleteIdentityService
  ↓
RuntimeEnvironmentService
  ↓
UnifiedWorkspaceService
  ↓
HydrationResult (frozen)
```

The Repository Hydration Pipeline is responsible **only** for:

- Restoring Athlete Identity from the identity repository contract
- Restoring Runtime Environment from the runtime repository contract
- Restoring Unified Workspace from the workspace repository contract
- Hydration lifecycle and immutable hydration state

It must **not**:

- Access SQLite directly
- Implement persistence logic
- Execute Dashboard, Home, or Timeline logic
- Perform networking
- Execute domain business logic beyond structural record-to-service wiring

Module: `app/src/runtime/hydration/`.

---

## Components

| Component | Responsibility |
|-----------|----------------|
| `RepositoryHydrationPipeline` | Orchestrates hydration lifecycle (validate bootstrap → read contracts → restore services → freeze state) |
| `HydrationState` | Immutable process-wide hydration snapshot |
| `HydrationResult` | Success payload (record counts, phases, restoredAt) |
| `HydrationStatus` | `idle` \| `hydrating` \| `ready` \| `failed` |
| `HydrationRestoration` | Structural record-to-service restoration (record identifiers only) |
| `HydrationService` | Read-only facade resolved from Composition Root (`RepositoryHydrationService` token) |
| `HydrationFactory` | Composition Root factory (wiring only) |
| `HydrationValidation` | State, start-guard, and bootstrap-ready validation |
| `HydrationError` | Typed hydration failures |

---

## Application APIs

| API | Path | Purpose |
|-----|------|---------|
| `hydrateRuntime()` | `application/hydrateRuntime.ts` | Idempotent async hydration entry |
| `getHydrationStatus()` | `application/getHydrationStatus.ts` | Current lifecycle status |

---

## Composition Root Registration

`RepositoryHydrationService` is registered as token #59 in `ServiceMap` via `RepositoryHydrationFactory` (`HydrationFactory`).

The service reads from the process-wide hydration state holder — it does not cache stale snapshots.

Repository adapters are resolved from the existing `RepositoryAdapters` bundle — hydration never imports infrastructure implementations directly.

---

## Behavior

- Hydration requires Runtime Bootstrap to reach `ready` status first.
- Repositories are accessed exclusively through Persistence Contract adapters (`identity`, `runtime`, `workspace`).
- Empty repository lists produce a successful hydration with zero restored records and an empty in-memory runtime.
- Hydration is deterministic and idempotent — duplicate starts are rejected; completed hydration returns the same result.

---

## Phase 33 Scope

Sprint 33.2 establishes the hydration pipeline only. Later sprints add Home restore and richer record mapping — without changing this pipeline's contract boundaries.

---

## Testing

Colocated tests under `app/src/runtime/hydration/__tests__/`:

- Hydration lifecycle
- Repository contract usage
- Hydration state and validation
- Immutable state/result
- Composition Root registration
