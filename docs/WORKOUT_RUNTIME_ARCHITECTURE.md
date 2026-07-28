# Workout Runtime Architecture

**Project:** EVOLVE  
**Sprint:** 31.2 — Workout Runtime Experience  
**Status:** Accepted  
**ADR:** [ADR-107](./DECISIONS.md)  
**Module:** `app/src/features/workout-runtime`

---

## Purpose

Transform the Workout tab from a presentation/preview screen into the operational workout execution experience of EVOLVE, without embedding business logic in React components and without modifying the Sprint 18.0 Workout Runtime engine foundation.

---

## Dependency Flow

```
React UI (screens / components)
        ↓
WorkoutRuntimeViewModel
        ↓
Application Use Cases
  (loadWorkoutRuntime / completeWorkoutSet / updateWorkoutSet /
   navigateWorkout / finishWorkout / refreshWorkoutRuntime /
   rest timer helpers)
        ↓
Mappers (DTO → immutable presentation read models)
        ↓
WorkoutRuntimeExperienceService (provider contract)
        ↓
Mock / Backend / Local providers
```

UI never imports providers, mocks, or infrastructure directly.

The Sprint 18.0 engine (`WorkoutRuntimeEngine`, opaque `ActiveWorkout`, domain `WorkoutRuntime` graph) remains intact and separate. Product presentation models live under `models/experience/`.

---

## Module Structure

```
features/workout-runtime/
  application/     — engine APIs (18.0) + experience use cases (31.2)
  hooks/           — ViewModel / navigation / timer / progress bindings
  viewmodels/      — WorkoutRuntimeViewModel
  components/      — presentation-only runtime UI
  models/          — engine domain models (18.0)
  models/experience/ — immutable presentation read models (31.2)
  mappers/         — provider DTO → experience models
  screens/         — WorkoutRuntimeScreen composition
  providers/       — Mock / Backend / Local experience providers
  services/        — engine service (18.0)
  services/experience/ — experience service factory (31.2)
  types/           — experience provider DTO contract
  mocks/           — seed data for Mock provider only
  runtime/         — WorkoutRuntimeEngine (untouched)
  builders/ validators/ utils/ integration/  — engine (untouched)
  index.ts
```

---

## Models (Experience)

Immutable (`readonly` + `Object.freeze` at construction):

| Model | Role |
|-------|------|
| `WorkoutRuntime` | Aggregate operational read model |
| `WorkoutExercise` | Exercise order + sets + progress |
| `WorkoutSet` | Weight / reps / RPE / status |
| `WorkoutProgress` | Completed / remaining / ETA |
| `WorkoutTimer` | Rest timer state |
| `WorkoutStatistics` | Volume / avg RPE / duration |
| `WorkoutNotes` | Session notes |
| `WorkoutRuntimeState` | idle / ready / active / resting / paused / completed / empty |
| `WorkoutLoadingState` | idle / loading / refreshing |
| `WorkoutErrorState` | retryable error envelope |

Provider DTOs remain under `types/` and are never rendered directly.

Engine domain models (`models/WorkoutRuntime.ts`, `ExerciseRuntime`, `SetRuntime`, …) are unchanged.

---

## Application APIs (Experience)

| API | Responsibility |
|-----|----------------|
| `loadWorkoutRuntime` | Fetch provider DTO → map full runtime |
| `refreshWorkoutRuntime` | Same path as load (explicit refresh) |
| `completeWorkoutSet` | Complete current set, advance, start rest |
| `updateWorkoutSet` | Edit weight / reps / RPE / notes |
| `navigateWorkout` | Next / previous / skip / jump to index |
| `finishWorkout` | Persist finish via provider + mark completed |
| `startRestTimer` / `pauseRestTimer` / `resumeRestTimer` / `tickRestTimer` | Rest timer transitions |

All accept an injectable `WorkoutRuntimeExperienceService` where I/O is required. Default resolves via `workoutRuntimeExperienceService` (`EXPO_PUBLIC_WORKOUT_RUNTIME_PROVIDER`).

---

## ViewModel

`WorkoutRuntimeViewModel` owns:

- `loadWorkout` / `refresh`
- `currentExercise` / `currentSet`
- `completeSet` / `skipExercise` / `nextExercise` / `previousExercise` / `goToExercise`
- `updateWeight` / `updateRepetitions` / `updateRPE` / `updateNotes`
- `startRestTimer` / `pauseRestTimer` / `resumeRestTimer` / ticks
- `finishWorkout` + finish dialog visibility
- loading / error / empty flags
- subscriber notifications for hooks

No UI imports. No React.

---

## Hooks

| Hook | Role |
|------|------|
| `useWorkoutRuntime` | Subscribe to ViewModel |
| `useWorkoutNavigation` | Exercise navigation + future destinations |
| `useRestTimer` | Rest + duration tick orchestration |
| `useWorkoutProgress` | Progress / statistics projection |
| `usePullToRefresh` | RefreshControl orchestration |

---

## Screen Composition

`WorkoutRuntimeScreen` composes only:

- `WorkoutRuntimeHeader`
- `WorkoutProgressBar`
- `ExerciseCarousel` / `ExerciseCard`
- `SetList` / `SetRow`
- `WeightInput` / `RepetitionInput` / `RPESelector`
- `NotesCard` / `RestTimerCard`
- `WorkoutStatisticsCard`
- `WorkoutBottomBar` / `FinishWorkoutDialog`
- `SkeletonWorkout` / `EmptyWorkout` / `ErrorWorkout`

Route: `app/(app)/(tabs)/workout.tsx` → `WorkoutRuntimeScreen`.

Future navigation prepared (not implemented as new screens):

- History → `/(app)/workout/history`
- Statistics → `/(app)/workout/analytics`
- Exercise details → `/(app)/workout/exercise/:id`

---

## Replaceability

| Today | Later |
|-------|--------|
| `MockWorkoutRuntimeService` | Repository / backend / engine-backed provider |
| Seeded `mocks/workoutRuntimeData.ts` | Live assembled session + engine state |

UI, ViewModel, and Application signatures stay stable when providers are swapped.

---

## Constraints

- No business logic in React components
- No repository / infrastructure calls from components
- No mock data inside components
- No duplicated UI state (ViewModel is source of truth)
- Sprint 18.0 engine APIs and models remain untouched
- Strict TypeScript
- Design system reuse only — no visual redesign
- Large touch targets for one-handed usage

---

## Testing

Integration coverage under `features/workout-runtime/__tests__/experience/`:

- Application APIs (load / complete / update / navigate / timer / finish)
- ViewModel load / error / refresh / empty / runtime flow
- Hooks
