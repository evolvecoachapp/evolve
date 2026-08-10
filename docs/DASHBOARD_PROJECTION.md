# Dashboard Projection

**Project:** EVOLVE  
**Sprint:** 32.6 — Unified Workspace → Dashboard Projection  
**Status:** Accepted  
**ADR:** [ADR-120](./DECISIONS.md)  
**Module:** `app/src/integrations/dashboard-projection`

---

## Purpose

Deterministic projection layer that translates immutable Unified Workspace snapshots into immutable Dashboard read models. Unified Workspace remains the sole source; Dashboard is a read-model consumer only.

This sprint completes Phase 32. No new business logic, persistence, networking, event bus, runtime scheduler, or calculations are introduced.

---

## Dependency Flow

```
Unified Workspace Service (source / producer)
        │
        ▼
Dashboard Projector
        │
        ▼
Dashboard Projection (read model)
        │
        ▼
Dashboard ViewModel (future wiring)
        │
        ▼
Dashboard UI
```

Dashboard must consume only Unified Workspace projections. It must never directly consume Workout, Nutrition, Recovery, Goal Progress, or Coach Timeline.

---

## Module Structure

```
integrations/dashboard-projection/
  models/          — immutable projection models
  mappers/         — Unified Workspace → Dashboard card projection
  validation/      — workspace input validation
  projector/       — DashboardProjector
  application/     — projection use cases
  composition/     — integration wiring factory
  testSupport/     — shared fixtures
  __tests__/       — projection / validation / mapper / composition / immutability / integration
  index.ts
```

---

## Models

| Model | Responsibility |
|-------|---------------|
| `DashboardProjection` | Immutable Dashboard read model projected from Unified Workspace |
| `DashboardProjectionResult` | Projection outcome with dashboard read model reference |
| `DashboardProjectionSnapshot` | Projector diagnostic snapshot |
| `DashboardProjectionIdentity` | Presentation identity inputs for athlete header |
| Card models | Workout, nutrition, recovery, coach, athlete, quick action cards |

All models are immutable (`Object.freeze`).

---

## Projector

`DashboardProjector` validates immutable Unified Workspace snapshots, maps workspace sections into Dashboard cards via mappers, and returns `DashboardProjectionResult`.

Workspace section mapping:

| Workspace Section | Dashboard Card |
|-------------------|----------------|
| `header` / `summary` / `snapshot` | Athlete header card |
| `workout` | Workout summary card |
| `nutrition` | Nutrition summary card |
| `recovery` | Recovery summary card |
| `coach` | Coach summary card |
| availability flags | Quick actions |

---

## Application APIs

| API | Responsibility |
|-----|---------------|
| `projectWorkspaceToDashboard` | Project a Unified Workspace snapshot |
| `projectAthleteWorkspaceToDashboard` | Project latest workspace for an athlete |

---

## Validation

Rejects:

- missing workspace
- missing workspace id
- missing athlete id
- invalid workspace (missing header or metadata)
- duplicate workspace id
- missing identity

---

## Composition Root

`DashboardProjectionFactory` registers `DashboardProjector` using:

- `UnifiedWorkspaceService` (shared singleton source boundary)

```typescript
resolveService("DashboardProjector")
// or
getCompositionRoot().getDashboardProjector()
```

---

## Design Constraints

- Unified Workspace remains producer; Dashboard is consumer only
- No circular dependencies (`dashboard-projection` imports Unified Workspace contracts only)
- Previous integrations and features are unchanged
- Projection only — no persistence, networking, event bus, or scheduler
- No direct consumption of Workout, Nutrition, Recovery, Goal Progress, or Coach Timeline

---

## Related Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [COMPOSITION_ROOT.md](./COMPOSITION_ROOT.md)
- [PROJECT_STATE.md](./PROJECT_STATE.md)
- [CHANGELOG.md](./CHANGELOG.md)
