# Progress Analytics Architecture

**Project:** EVOLVE  
**Sprint:** 31.8 — Progress & Analytics Framework Foundation  
**Status:** Accepted  
**ADR:** [ADR-113](./DECISIONS.md)  
**Module:** `app/src/features/progress-analytics`

---

## Purpose

Establish the deterministic analytics domain that models athlete progress, historical trends, body measurements, training statistics, recovery metrics, and performance summaries. This sprint creates the framework foundation — no real analytics are calculated, no chart libraries are introduced, no wearable or health APIs are integrated.

Future providers (Workout Engine, Nutrition Engine, Recovery Engine, Wearables, Backend, AI Coach) must feed this framework without changing the Domain.

---

## Dependency Flow

```
React UI (screens / components)
        ↓
ProgressAnalyticsViewModel
        ↓
Application Use Cases
  (loadAnalytics / refreshAnalytics /
   loadWorkoutHistory / loadBodyMeasurements /
   loadStrengthProgress / loadNutritionStatistics /
   loadRecoveryStatistics / loadGoalProgress /
   loadPersonalRecords / loadAnalyticsSnapshot)
        ↓
Mappers (DTO → immutable presentation read models)
        ↓
ProgressAnalyticsService (provider contract)
        ↓
Mock / Backend / Local providers
        ↓
(future) Workout / Nutrition / Recovery Engines /
Wearables / Backend / AI Coach
```

UI never imports providers, mocks, repositories, or infrastructure adapters directly.

---

## Module Structure

```
features/progress-analytics/
  application/     — analytics use cases
  hooks/           — ViewModel bindings
  viewmodels/      — ProgressAnalyticsViewModel
  components/      — presentation-only analytics UI
  models/          — immutable presentation read models
  mappers/         — provider DTO → experience models
  providers/       — Mock / Backend / Local experience providers
  services/        — provider contract + factory
  screens/         — ProgressAnalyticsScreen composition
  __tests__/       — application / viewmodel / hooks / mapper / provider / service / immutability
  index.ts
```

---

## Models

| Model | Responsibility |
|-------|---------------|
| `AthleteProgress` | Aggregate analytics read model |
| `ProgressSummary` | Headline progress surface |
| `WorkoutHistory` | Historical workout entries |
| `WorkoutStatistics` | Aggregate workout stats |
| `StrengthProgress` | Strength / estimated 1RM surface |
| `VolumeProgress` | Training volume surface |
| `BodyMeasurement` | Circumference / site measurement |
| `BodyComposition` | Body fat / lean mass surface |
| `BodyWeightHistory` | Weight timeline |
| `NutritionStatistics` | Nutrition adherence surface |
| `RecoveryStatistics` | Recovery score / readiness surface |
| `SleepStatistics` | Sleep duration / quality surface |
| `PerformanceTrend` | Category trend projection |
| `GoalProgress` | Goal completion projection |
| `PersonalRecord` | Personal record item |
| `TrainingConsistency` | Adherence / streak surface |
| `ProgressChart` | Chart-ready data (line/bar/area/radar/scatter) |
| `AnalyticsPeriod` | today / week / month / quarter / year / custom |
| `AnalyticsFilter` | Period + categories + chart toggle |
| `AnalyticsSnapshot` | Point-in-time analytics snapshot |
| `AnalyticsLoadingState` | idle / loading / refreshing |
| `AnalyticsErrorState` | message / code / retryable |

All models are immutable (`Object.freeze`).

---

## Analytics Categories

workout · strength · hypertrophy · nutrition · recovery · sleep · body_weight · measurements · consistency · goals

Represent only — no calculation logic.

---

## Analytics Periods

today · week · month · quarter · year · custom

Represent only — no date-range engines.

---

## Charts

`ProgressChart` represents chart data only (no rendering, no Victory/Recharts/D3):

- Line
- Bar
- Area
- Radar
- Scatter

---

## Service Contract

`ProgressAnalyticsService` defines the provider abstraction:

- `getAnalytics(filter?)` → full analytics aggregate
- `getWorkoutHistory(period?)` → workout history
- `getBodyMeasurements(period?)` → measurements
- `getStrengthProgress(period?)` → strength progress
- `getNutritionStatistics(period?)` → nutrition stats
- `getRecoveryStatistics(period?)` → recovery stats
- `getGoalProgress(period?)` → goals
- `getPersonalRecords(period?)` → PRs
- `getAnalyticsSnapshot(period?)` → snapshot

Provider is selected via `EXPO_PUBLIC_PROGRESS_ANALYTICS_PROVIDER` (mock | backend | local).

---

## Providers

| Provider | Status |
|----------|--------|
| `MockProgressAnalyticsService` | Operational — realistic mock data |
| `BackendProgressAnalyticsService` | Stub — throws `ProgressAnalyticsError` |
| `LocalProgressAnalyticsService` | Stub — throws `ProgressAnalyticsError` |

---

## ViewModel

`ProgressAnalyticsViewModel` owns:
- Full analytics aggregate slices
- Loading / error / empty state
- Specialized slice loaders
- Subscriber notification pattern

---

## Hooks

| Hook | Projection |
|------|-----------|
| `useAnalytics()` | Full analytics with load/refresh |
| `useWorkoutHistory()` | Workout history |
| `useStrengthProgress()` | Strength progress |
| `useBodyMeasurements()` | Measurements / composition / weight |
| `useGoalProgress()` | Goals |
| `useAnalyticsSnapshot()` | Snapshot |

---

## Components

| Component | Role |
|-----------|------|
| `AnalyticsHeader` | Hero section with summary stats |
| `ProgressSummaryCard` | Summary overview |
| `WorkoutHistoryCard` | Workout history list |
| `StrengthProgressCard` | Strength surface |
| `BodyMeasurementsCard` | Measurements / composition / weight |
| `NutritionStatisticsCard` | Nutrition surface |
| `RecoveryStatisticsCard` | Recovery surface |
| `GoalProgressCard` | Goals list |
| `PersonalRecordsCard` | PR list |
| `AnalyticsChartCard` | Chart data presentation (no library) |
| `AnalyticsFilterCard` | Filter / period display |
| `AnalyticsSkeleton` | Loading placeholder |
| `AnalyticsEmpty` | Empty state |
| `AnalyticsError` | Error state with retry |

---

## Screen

`ProgressAnalyticsScreen` composes all components. Presentation only.

Navigation destinations are prepared on models (`destination` fields) — no chart libraries, no animations, no route wiring required in this sprint.

---

## Constraints

- NO chart library (Victory, Recharts, D3)
- NO calculations, persistence, networking, backend
- NO wearable APIs (HealthKit, Google Fit, Garmin, WHOOP)
- Presentation and domain modeling only
- Strict TypeScript

---

## Future Integration Points

1. **Workout Engine** — feed workout history / volume / strength
2. **Nutrition Engine** — feed nutrition statistics
3. **Recovery Engine** — feed recovery / sleep statistics
4. **Wearables** — body composition / HRV / sleep providers
5. **Backend** — remote analytics aggregation
6. **AI Coach** — consume `AnalyticsSnapshot` for coaching context

---

## Test Coverage

- Application use case tests
- ViewModel tests
- Hook tests
- Mapper tests
- Provider tests
- Service factory tests
- Immutability tests
