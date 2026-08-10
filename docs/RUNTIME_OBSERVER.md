# Runtime Change Observer

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-08-10  
**Purpose:** Document the Runtime Change Observer — automatic write-through persistence whenever Athlete Identity, Runtime Environment, or Unified Workspace in-memory state changes (Sprint 33.7).  
**Source of Truth:** Yes — for observer layout and automatic persistence rules on mobile.

Related: [ARCHITECTURE.md](./ARCHITECTURE.md), [RUNTIME_WRITE_THROUGH.md](./RUNTIME_WRITE_THROUGH.md), [RUNTIME_SESSION.md](./RUNTIME_SESSION.md), [COMPOSITION_ROOT.md](./COMPOSITION_ROOT.md), [DECISIONS.md](./DECISIONS.md) (ADR-127).

---

## Architecture Summary

```
Runtime Services (Athlete Identity / Runtime Environment / Unified Workspace)
  ↓ build() success
Runtime Change Observer
  ↓ persistRuntime()
Runtime Write-Through Pipeline
  ↓
Repository Adapters
  ↓
Persistence Contracts
  ↓
(SQLite implementation hidden)
```

The Runtime Change Observer is responsible **only** for:

- Validating runtime bootstrap readiness before observation starts
- Wrapping runtime composition service `build()` entry points externally (no service-internal hooks)
- Triggering `persistRuntime()` on each successful state mutation
- Resetting write-through lifecycle state before each automatic persist (enables repeated persists)
- Observer lifecycle and immutable observer state

It must **not**:

- Access SQLite directly
- Modify runtime composition service business logic
- Execute analytics, timeline, or dashboard logic
- Perform networking, retries, debouncing, or batching
- Introduce hooks inside composition service `build()` implementations

Module: `app/src/runtime/runtime-observer/`.

---

## Components

| Component | Responsibility |
|-----------|----------------|
| `RuntimeObserver` | Installs external build wrappers; triggers write-through on successful mutations |
| `RuntimeObserverState` | Immutable process-wide observer snapshot |
| `RuntimeObserverResult` | Success payload (phases, watched services) |
| `RuntimeObserverStatus` | `idle` \| `observing` \| `ready` \| `failed` |
| `RuntimeObserverService` | Read-only facade resolved from Composition Root (`RuntimeObserverService` token) |
| `RuntimeObserverFactory` | Composition Root factory (wiring only) |
| `RuntimeObserverValidation` | State, start-guard, and bootstrap-ready validation |
| `RuntimeObserverError` | Typed observer failures |

---

## Application APIs

| API | Path | Purpose |
|-----|------|---------|
| `observeRuntime()` | `application/observeRuntime.ts` | Idempotent sync entry — start observation |
| `getRuntimeObserverStatus()` | `application/getRuntimeObserverStatus.ts` | Current lifecycle status |

---

## Composition Root Registration

`RuntimeObserverService` is registered as token #63 in `ServiceMap` via `RuntimeObserverFactory`.

The service reads from the process-wide observer state holder — it does not cache stale snapshots.

---

## Behavior Rules

| Rule | Detail |
|------|--------|
| Prerequisite | Runtime bootstrap must reach `ready` |
| Watched services | `AthleteIdentityService`, `RuntimeEnvironmentService`, `UnifiedWorkspaceService` |
| Trigger | Successful `build()` on any watched service |
| Persistence | Calls `resetRuntimeWriteThrough()` then `persistRuntime()` — no retry, debounce, or batching |
| Idempotency | `observeRuntime()` returns the same frozen result when observation is already active |
| Failed builds | Unsuccessful `build()` results do not trigger persistence |
| External wrapping | ADR-124 rejected internal service hooks; observer wraps `build()` externally only |

---

## Phase 33 Scope Boundary

Sprint 33.7 makes runtime persistence automatic via external observation. Richer domain-to-record mapping, conflict resolution, and session-scoped observer startup wiring belong to later sprints.

---

## Testing

| File | Covers |
|------|--------|
| `__tests__/observer.test.ts` | Automatic persist trigger, lifecycle, write-through reset, composition integration, unwrap on reset |
| `__tests__/validation.test.ts` | State invariants, start guards |
| `__tests__/immutability.test.ts` | `Object.isFrozen` on state/result/phases |
| `__tests__/composition.test.ts` | `RuntimeObserverService` registered, initial `idle` state |

---

## Related Documentation

- [RUNTIME_WRITE_THROUGH.md](./RUNTIME_WRITE_THROUGH.md) — persistence pipeline invoked by observer
- [RUNTIME_SESSION.md](./RUNTIME_SESSION.md) — startup orchestration prerequisite
- [COMPOSITION_ROOT.md](./COMPOSITION_ROOT.md) — service registration
