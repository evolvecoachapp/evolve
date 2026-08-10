# Dashboard Restore Pipeline

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-08-10  
**Purpose:** Document the Dashboard Restore Pipeline — projecting Unified Workspace snapshots into the Home dashboard read model after Repository Hydration (Sprint 33.3).  
**Source of Truth:** Yes — for Dashboard Restore layout and restore rules on mobile.

Related: [ARCHITECTURE.md](./ARCHITECTURE.md), [RUNTIME_HYDRATION.md](./RUNTIME_HYDRATION.md), [DASHBOARD_PROJECTION.md](./DASHBOARD_PROJECTION.md), [HOME_DASHBOARD_ARCHITECTURE.md](./HOME_DASHBOARD_ARCHITECTURE.md), [COMPOSITION_ROOT.md](./COMPOSITION_ROOT.md), [DECISIONS.md](./DECISIONS.md) (ADR-123).

---

## Architecture Summary

```
Repository Hydration (ready)
  ↓
UnifiedWorkspaceService
  ↓
DashboardProjector
  ↓
DashboardRestorePipeline
  ↓
HomeDashboard (read model)
  ↓
HomeDashboardViewModel
  ↓
Dashboard UI
```

The Dashboard Restore Pipeline is responsible **only** for:

- Validating repository hydration readiness
- Reading cached Unified Workspace snapshots
- Projecting workspace into Dashboard read models via `DashboardProjector`
- Mapping projections into the Home dashboard read model
- Applying restored dashboards to `HomeDashboardViewModel` when provided
- Restore lifecycle and immutable restore state

It must **not**:

- Access repositories or persistence contracts
- Access SQLite directly
- Implement persistence logic
- Execute business logic, analytics calculations, or timeline modifications
- Perform networking

Module: `app/src/runtime/dashboard-restore/`.

---

## Components

| Component | Responsibility |
|-----------|----------------|
| `DashboardRestorePipeline` | Orchestrates restore lifecycle (validate hydration → resolve workspace → project → map → freeze state) |
| `DashboardRestoreRestoration` | Workspace → projection → Home dashboard structural mapping |
| `DashboardRestoreState` | Immutable process-wide restore snapshot |
| `DashboardRestoreResult` | Success payload (counts, phases, primary dashboard) |
| `DashboardRestoreStatus` | `idle` \| `restoring` \| `ready` \| `failed` |
| `DashboardRestoreService` | Read-only facade resolved from Composition Root (`DashboardRestoreService` token) |
| `DashboardRestoreFactory` | Composition Root factory (wiring only) |
| `DashboardRestoreValidation` | State, start-guard, and hydration-ready validation |
| `DashboardRestoreError` | Typed restore failures |

---

## Application APIs

| API | Path | Purpose |
|-----|------|---------|
| `restoreDashboard()` | `application/restoreDashboard.ts` | Idempotent async restore entry |
| `getDashboardRestoreStatus()` | `application/getDashboardRestoreStatus.ts` | Current lifecycle status |

---

## Composition Root Registration

`DashboardRestoreService` is registered as token #60 in `ServiceMap` via `DashboardRestoreFactory`.

The service reads from the process-wide restore state holder — it does not cache stale snapshots.

---

## Behavior Rules

| Rule | Detail |
|------|--------|
| Prerequisite | Repository hydration must reach `ready` with a non-null result |
| Idempotency | `restoreDashboard()` returns the same frozen result promise on subsequent calls |
| Empty workspace | Missing workspace snapshots succeed with an empty Home dashboard (`isEmpty: true`) |
| No athlete IDs | Restore with zero athlete IDs succeeds with a single empty dashboard |
| ViewModel wiring | Optional `homeDashboardViewModel` dependency applies the primary restored dashboard |
| Determinism | Fixed clocks in tests; structural mapping only — no calculations |

---

## Phase 33 Scope Boundary

Sprint 33.3 restores the Dashboard read model from Unified Workspace only. Richer hydration-to-workspace mapping and automatic post-hydration orchestration belong to later sprints.

---

## Testing

| File | Covers |
|------|--------|
| `__tests__/restore.test.ts` | Full restore lifecycle, empty workspace, duplicate guard, hydration prerequisite, ViewModel wiring, idempotent application API |
| `__tests__/validation.test.ts` | State invariants, start guards, hydration readiness |
| `__tests__/immutability.test.ts` | `Object.isFrozen` on state/result/phases/dashboard |
| `__tests__/composition.test.ts` | `DashboardRestoreService` registered, initial `idle` state |

---

## Related Documentation

- [RUNTIME_HYDRATION.md](./RUNTIME_HYDRATION.md) — prerequisite pipeline
- [DASHBOARD_PROJECTION.md](./DASHBOARD_PROJECTION.md) — workspace → dashboard projection
- [HOME_DASHBOARD_ARCHITECTURE.md](./HOME_DASHBOARD_ARCHITECTURE.md) — Home dashboard ViewModel and UI
