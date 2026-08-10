# Runtime Bootstrap Gate

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-08-10  
**Purpose:** Document the application Runtime Bootstrap gate — Composition Root lifecycle at app startup (Sprint 33.1B).  
**Source of Truth:** Yes — for Runtime Bootstrap layout and startup gate rules on mobile.

Related: [ARCHITECTURE.md](./ARCHITECTURE.md), [COMPOSITION_ROOT.md](./COMPOSITION_ROOT.md), [DECISIONS.md](./DECISIONS.md) (ADR-121).

---

## Architecture Summary

```
App Launch
  ↓
AuthProvider (session bootstrap)
  ↓
RuntimeBootstrapProvider (authenticated users only)
  ↓
RuntimeBootstrap.bootstrap()
  ↓
CompositionRoot.create()
  ↓
ServiceRegistry.assertIntegrity()
  ↓
BootstrapState (frozen)
  ↓
Authenticated Navigation
  ↓
Home
```

The Runtime Bootstrap gate is responsible **only** for:

- Composition Root creation
- Service Registry validation
- Runtime initialization lifecycle
- Exposing hydration/bootstrap state

It must **not**:

- Restore persisted state
- Initialize repositories
- Read SQLite
- Perform network requests
- Execute business logic

Module: `app/src/runtime/bootstrap/`.

---

## Components

| Component | Responsibility |
|-----------|----------------|
| `RuntimeBootstrap` | Orchestrates bootstrap lifecycle (create root → validate → freeze state) |
| `BootstrapState` | Immutable process-wide bootstrap snapshot |
| `BootstrapResult` | Success payload (token count, phases, validatedAt) |
| `BootstrapStatus` | `idle` \| `bootstrapping` \| `ready` \| `failed` |
| `RuntimeInitialization` | Ordered phase markers recorded on success |
| `RuntimeBootstrapService` | Read-only facade resolved from Composition Root |
| `RuntimeBootstrapFactory` | Composition Root factory (wiring only) |
| `RuntimeBootstrapValidation` | State and start-guard validation |
| `RuntimeBootstrapError` | Typed bootstrap failures |
| `RuntimeBootstrapProvider` | React gate — mirrors Auth `isBootstrapping` for authenticated routes |

---

## Application APIs

| API | Path | Purpose |
|-----|------|---------|
| `bootstrapRuntime()` | `application/bootstrapRuntime.ts` | Idempotent async bootstrap entry |
| `getBootstrapStatus()` | `application/getBootstrapStatus.ts` | Current lifecycle status |

---

## Startup Integration

1. `app/_layout.tsx` mounts `AuthProvider` → `RuntimeBootstrapProvider`.
2. `RuntimeBootstrapProvider` triggers `bootstrapRuntime()` when auth completes and the user is authenticated.
3. `app/index.tsx` and `app/(app)/_layout.tsx` block navigation while `isRuntimeBootstrapping` (authenticated users only).
4. Unauthenticated onboarding routes skip runtime bootstrap.

---

## Composition Root Registration

`RuntimeBootstrapService` is registered as token #58 in `ServiceMap` via `RuntimeBootstrapFactory`.

The service reads from the process-wide bootstrap state holder — it does not cache stale snapshots.

---

## Phase 33 Scope

Sprint 33.1B establishes the bootstrap gate only. Later sprints (33.2+) add durable SQLite, repository hydration, and Home restore — without changing this gate's responsibilities.

---

## Testing

Colocated tests under `app/src/runtime/bootstrap/__tests__/`:

- Bootstrap lifecycle
- Composition Root registration
- Immutable state/result
- Startup provider integration
