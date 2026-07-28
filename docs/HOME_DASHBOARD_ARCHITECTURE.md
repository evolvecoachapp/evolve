# Home Dashboard Architecture

**Project:** EVOLVE  
**Sprint:** 31.1 — Real Home Dashboard  
**Status:** Accepted  
**ADR:** [ADR-106](./DECISIONS.md)  
**Module:** `app/src/features/home`

---

## Purpose

Transform Home from a presentation/demo screen into the operational dashboard hub of EVOLVE, without embedding business logic in React components.

---

## Dependency Flow

```
React UI (screens / components)
        ↓
HomeDashboardViewModel
        ↓
Application APIs
  (loadHomeDashboard / refreshHomeDashboard / loadQuickActions / loadAthleteSnapshot)
        ↓
Mappers (DTO → immutable read models)
        ↓
HomeService (provider contract)
        ↓
Mock / Backend / Local providers
```

UI never imports providers, mocks, or infrastructure directly.

---

## Module Structure

```
features/home/
  application/     — use cases
  hooks/           — ViewModel / refresh / quick-actions bindings
  viewmodels/      — HomeDashboardViewModel
  components/      — presentation-only cards and states
  models/          — immutable Home read models
  mappers/         — provider DTO → models
  screens/         — HomeDashboardScreen composition
  providers/       — Mock / Backend / Local (existing)
  services/        — HomeService factory (existing)
  types/           — provider DTO contract (existing)
  mocks/           — seed data for Mock provider only
  index.ts
```

---

## Models

Immutable (`readonly` + `Object.freeze` at construction):

| Model | Role |
|-------|------|
| `HomeDashboard` | Aggregate read model |
| `AthleteSnapshotCard` | Greeting, avatar initials, streak, weekly stats |
| `WorkoutSummaryCard` | Today's workout |
| `NutritionSummaryCard` | Calories / protein / carbs / fat |
| `RecoverySummaryCard` | Recovery score + tip |
| `CoachSummaryCard` | Coach insight |
| `QuickAction` | Navigation placeholder actions |
| `HomeLoadingState` | idle / loading / refreshing |
| `HomeErrorState` | retryable error envelope |

Provider DTOs remain under `types/homeDashboard.ts` and are never rendered directly.

---

## Application APIs

| API | Responsibility |
|-----|----------------|
| `loadHomeDashboard` | Fetch provider DTO → map full dashboard |
| `refreshHomeDashboard` | Same path as load (explicit refresh semantics) |
| `loadQuickActions` | Derive quick actions from provider DTO |
| `loadAthleteSnapshot` | Map athlete snapshot card |

All accept an injectable `HomeService` for tests. Default resolves via `homeService` singleton (`EXPO_PUBLIC_HOME_PROVIDER`).

---

## ViewModel

`HomeDashboardViewModel` owns:

- load / refresh
- athlete snapshot
- today's workout
- nutrition / recovery / coach summaries
- quick actions
- loading / error / empty flags
- subscriber notifications for hooks

No UI imports. No React.

---

## Hooks

| Hook | Role |
|------|------|
| `useHomeDashboard` | Subscribe to ViewModel |
| `usePullToRefresh` | RefreshControl orchestration |
| `useQuickActions` | Standalone quick-actions load |
| `useHome` | Legacy facade over `useHomeDashboard` |

---

## Screen Composition

`HomeDashboardScreen` composes only:

- `HomeDashboardHeader`
- `WorkoutCard` / `NutritionCard` / `RecoveryCard`
- `AthleteSnapshotCard` (weekly progress)
- `CoachCard`
- `QuickActionsGrid`
- `SkeletonDashboard` / `EmptyDashboard` / `ErrorDashboard`
- existing `RecommendationWidget` (Today's Intelligence)

Route: `app/(app)/(tabs)/index.tsx` → `HomeDashboardScreen`.

---

## Replaceability

| Today | Later |
|-------|--------|
| `MockHomeService` | Real repository / backend provider behind `HomeService` |
| Seeded `mocks/dashboardData.ts` | Live athlete data |

UI, ViewModel, and Application signatures stay stable when providers are swapped.

---

## Constraints

- No business logic in React components
- No repository / infrastructure calls from components
- No mock data inside components
- No duplicated UI state (ViewModel is source of truth)
- Strict TypeScript
- Design system reuse only — no visual redesign

---

## Testing

Integration coverage under `features/home/__tests__/`:

- Application APIs
- ViewModel load / error / refresh / empty
- Hooks
- Screen composition (loading / empty / error / success)
