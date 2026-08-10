# Runtime Session Orchestrator

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-08-10  
**Purpose:** Document the Runtime Session Orchestrator — coordinating the complete startup lifecycle (bootstrap → hydration → dashboard restore) through existing runtime pipelines (Sprint 33.5).  
**Source of Truth:** Yes — for runtime session orchestration on mobile.

Related: [ARCHITECTURE.md](./ARCHITECTURE.md), [RUNTIME_BOOTSTRAP.md](./RUNTIME_BOOTSTRAP.md), [RUNTIME_HYDRATION.md](./RUNTIME_HYDRATION.md), [DASHBOARD_RESTORE.md](./DASHBOARD_RESTORE.md), [COMPOSITION_ROOT.md](./COMPOSITION_ROOT.md), [DECISIONS.md](./DECISIONS.md) (ADR-125).

---

## Architecture Summary

```
Application Startup
  ↓
RuntimeSessionOrchestrator
  ├── RuntimeBootstrap
  ├── RepositoryHydration
  └── DashboardRestore
  ↓
RuntimeSessionResult
  ↓
Home
```

The Runtime Session Orchestrator is responsible **only** for:

- Coordinating existing runtime pipelines in deterministic order
- Session lifecycle and immutable session state
- Idempotent application entry (`startRuntimeSession`)
- Failure propagation without retries

It must **not**:

- Contain business logic
- Access SQLite directly
- Implement repository logic
- Perform persistence
- Perform networking
- Retry failed steps
- Duplicate bootstrap, hydration, or restore pipeline logic

Module: `app/src/runtime/session/`.

---

## Components

| Component | Responsibility |
|-----------|----------------|
| `RuntimeSessionOrchestrator` | Sequences bootstrap → hydrate → restore; stops immediately on failure |
| `RuntimeSessionState` | Immutable process-wide session snapshot |
| `RuntimeSessionResult` | Success payload (sub-pipeline results, phases) |
| `RuntimeSessionStatus` | `idle` \| `starting` \| `ready` \| `failed` |
| `RuntimeSessionService` | Read-only facade resolved from Composition Root (`RuntimeSessionService` token) |
| `RuntimeSessionFactory` | Composition Root factory (wiring only) |
| `RuntimeSessionValidation` | State and start-guard validation |
| `RuntimeSessionError` | Typed session failures |

---

## Application APIs

| API | Path | Purpose |
|-----|------|---------|
| `startRuntimeSession()` | `application/startRuntimeSession.ts` | Idempotent async startup entry |
| `getRuntimeSessionStatus()` | `application/getRuntimeSessionStatus.ts` | Current lifecycle status |

---

## Composition Root Registration

`RuntimeSessionService` is registered as token #62 in `ServiceMap` via `RuntimeSessionFactory`.

The service reads from the process-wide session state holder — it does not cache stale snapshots.

---

## Behavior Rules

| Rule | Detail |
|------|--------|
| Execution order | Bootstrap → Hydration → Dashboard Restore — always sequential |
| Failure handling | Stop immediately; no retries |
| Idempotency | `startRuntimeSession()` returns cached result promise when `ready` |
| Prerequisites | Each sub-pipeline enforces its own readiness guards |
| Persistence | None — orchestration only |
| Write-through | Not invoked — remains on-demand via `persistRuntime()` |

---

## Phase 33 Scope Boundary

Sprint 33.5 introduces a single orchestration entry point for runtime startup. App launch wiring (`RuntimeBootstrapProvider` → full session), automatic post-mutation write-through orchestration, and richer session recovery belong to later sprints.

---

## Testing

| File | Covers |
|------|--------|
| `__tests__/orchestration.test.ts` | Full lifecycle, execution order, idempotency, failure propagation |
| `__tests__/validation.test.ts` | State invariants, start guards |
| `__tests__/immutability.test.ts` | `Object.isFrozen` on state/result/phases |
| `__tests__/composition.test.ts` | `RuntimeSessionService` registered, initial `idle` state |

---

## Related Documentation

- [RUNTIME_BOOTSTRAP.md](./RUNTIME_BOOTSTRAP.md) — first pipeline step
- [RUNTIME_HYDRATION.md](./RUNTIME_HYDRATION.md) — second pipeline step
- [DASHBOARD_RESTORE.md](./DASHBOARD_RESTORE.md) — third pipeline step
- [RUNTIME_WRITE_THROUGH.md](./RUNTIME_WRITE_THROUGH.md) — parallel on-demand persist (not in startup chain)
- [COMPOSITION_ROOT.md](./COMPOSITION_ROOT.md) — service registration
