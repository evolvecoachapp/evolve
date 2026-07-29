# Progress Experience Architecture

**Project:** EVOLVE  
**Sprint:** 31.4 — Progress & Analytics Experience  
**Status:** Accepted  
**ADR:** [ADR-109](./DECISIONS.md)  
**Module:** `app/src/features/progress-experience`

---

## Purpose

Transform the Progress tab into EVOLVE's athlete analytics center: one premium performance dashboard that aggregates training, nutrition, recovery, body metrics, goals, records, and coaching into actionable insights.

This module is explicitly not a collection of chart-library widgets. It is a product experience layer over application services.

---

## Dependency Flow

```
React UI (screens / components)
        ↓
ProgressExperienceViewModel
        ↓
Application Use Cases
  (loadProgressDashboard / refreshProgressDashboard /
   loadStrengthProgress / loadVolumeProgress /
   loadRecoveryProgress / loadNutritionProgress /
   loadBodyMetrics / loadCoachInsights / changeTimeRange)
        ↓
Mappers (DTO → immutable presentation read models)
        ↓
ProgressExperienceService (provider contract)
        ↓
Mock / Backend / Local providers
        ↓
(future) repositories / persistence / backend / AI insights
```

UI never imports providers, mocks, repositories, or infrastructure adapters directly.

---

## Module Structure

```
features/progress-experience/
  application/     — dashboard use cases
  hooks/           — ViewModel bindings
  viewmodels/      — ProgressExperienceViewModel
  components/      — presentation-only analytics UI
  models/          — immutable presentation read models
  mappers/         — provider DTO → experience models
  providers/       — Mock / Backend / Local experience providers
  services/        — provider contract + factory
  screens/         — ProgressExperienceScreen composition
  __tests__/       — application / viewmodel / hooks
  index.ts
```

---

## Models

Immutable (`readonly` + `Object.freeze` at construction):

| Model | Role |
|-------|------|
| `ProgressDashboard` | Aggregate athlete analytics read model |
| `StrengthProgress` | Estimated 1RM + strength trend surface |
| `VolumeProgress` | Training volume trend surface |
| `RecoveryProgress` | Recovery score / sleep / readiness surface |
| `NutritionProgress` | Calories / protein adherence surface |
| `BodyMetrics` | Body-weight and body-fat-ready surface |
| `CoachInsightSummary` | Contextual coach analytics insight |
| `PersonalRecord` | Personal record item |
| `TrainingStreak` | Consistency projection |
| `GoalProgress` | Goal completion projection |
| `TimeRange` | 7d / 30d / 90d / 1y / all |
| `ProgressLoadingState` | idle / loading / refreshing |
| `ProgressErrorState` | retryable error envelope |
| `ChartPoint` / `ChartSeries` | Reusable chart-ready model contract |

Provider DTOs remain under `services/` and are never rendered directly.

---

## Application APIs

| API | Responsibility |
|-----|----------------|
| `loadProgressDashboard` | Fetch provider DTO → map full dashboard |
| `refreshProgressDashboard` | Explicit refresh path for dashboard |
| `loadStrengthProgress` | Fetch / map strength projection |
| `loadVolumeProgress` | Fetch / map volume projection |
| `loadRecoveryProgress` | Fetch / map recovery projection |
| `loadNutritionProgress` | Fetch / map nutrition projection |
| `loadBodyMetrics` | Fetch / map body metrics projection |
| `loadCoachInsights` | Fetch / map contextual coach insights |
| `changeTimeRange` | Normalize and validate selected range |

All accept an injectable `ProgressExperienceService`. Default resolves via `progressExperienceService` (`EXPO_PUBLIC_PROGRESS_EXPERIENCE_PROVIDER`).

---

## ViewModel

`ProgressExperienceViewModel` owns:

- `loadDashboard()` / `refresh()`
- `changeTimeRange()`
- `loadStrengthProgress()` / `loadVolumeProgress()`
- `loadRecoveryProgress()` / `loadNutritionProgress()`
- `loadBodyMetrics()` / `loadCoachInsights()`
- loading / error / empty flags
- subscriber notifications for hooks

No UI imports. No React. No repository or provider access from components.

---

## Hooks

| Hook | Role |
|------|------|
| `useProgressDashboard` | Subscribe to dashboard / refresh / load / time-range changes |
| `useTimeRange` | Subscribe to selected time range + options |
| `useCoachInsights` | Coach-insight projection only |

---

## Screen Composition

`ProgressExperienceScreen` composes only:

- `ProgressHeader`
- `TimeRangeSelector`
- `StrengthChartCard`
- `VolumeChartCard`
- `RecoveryChartCard`
- `NutritionChartCard`
- `BodyMetricsCard`
- `GoalProgressCard`
- `PersonalRecordsCard`
- `TrainingStreakCard`
- `CoachInsightsCard`
- `AnalyticsGrid`
- `ProgressSkeleton` / `ProgressEmpty` / `ProgressError`

Route: `app/(app)/(tabs)/progress.tsx` → `ProgressExperienceScreen`.

Prepared navigation placeholders (not implemented in this sprint):

- Detailed Analytics — `/(app)/progress/detailed-analytics`
- Exercise History — `/(app)/progress/exercise-history`
- Goal Details — `/(app)/progress/goal-details/:id`
- Body Metrics — `/(app)/progress/body-metrics`

---

## Provider Seam

| Provider | Behavior |
|----------|----------|
| `mock` (default) | Seeded analytics dashboard + deterministic time-range projections |
| `backend` | Placeholder — throws until backend analytics wiring exists |
| `local` | Placeholder — future repository / persistence-backed analytics bridge |

Env: `EXPO_PUBLIC_PROGRESS_EXPERIENCE_PROVIDER`.

Replacing Mock with persistence- or backend-backed analytics requires only a new provider implementation behind `ProgressExperienceService` — no UI, ViewModel, or Application contract changes.

---

## Design Constraints

- No business logic inside React
- No infrastructure / repository access from UI
- No provider code inside components
- No chart-specific dependency added in this sprint
- No mock data inside components
- No visual redesign; reuse the Design System
- Chart rendering remains placeholder-ready through reusable chart models
- Strict TypeScript throughout the module

---

## Testing

Integration coverage under `__tests__/`:

- Application layer (dashboard / section loaders / time range / error)
- ViewModel (loading / refresh / time range / empty / error / subscribers)
- Hooks (`useProgressDashboard` / `useTimeRange` / `useCoachInsights`)

---

## Related

- [ADR-109](./DECISIONS.md) — Progress Experience
- [ARCHITECTURE.md](./ARCHITECTURE.md) — system architecture summary
- [PROJECT_STATE.md](./PROJECT_STATE.md) — current sprint and module state
- [CHANGELOG.md](./CHANGELOG.md) — release history
