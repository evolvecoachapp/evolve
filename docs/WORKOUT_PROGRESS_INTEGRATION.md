# Workout Progress Integration

**Project:** EVOLVE  
**Sprint:** 32.1 — Workout → Progress Analytics Integration  
**Status:** Accepted  
**ADR:** [ADR-115](./DECISIONS.md)  
**Module:** `app/src/integrations/workout-progress`

---

## Purpose

Deterministic integration layer that publishes immutable workout progress events and updates Progress Analytics read models through existing contracts. The Workout feature never depends directly on Progress Analytics.

No analytics calculations, persistence, networking, backend, synchronization, or event sourcing are introduced in this sprint.

---

## Dependency Flow

```
Workout Feature
        │
        ▼
Workout Progress Integration
        │
        ▼
Progress Analytics Contract
        │
        ▼
Progress Analytics Service
        │
        ▼
Mock Analytics Provider
```

---

## Module Structure

```
integrations/workout-progress/
  events/          — supported event type constants
  models/          — immutable integration models
  mappers/         — workout domain → payload → ProgressAnalyticsService DTO
  validation/      — event validation
  publishers/      — WorkoutProgressPublisher
  subscribers/     — ProgressAnalyticsSubscriber
  application/     — publish use cases
  composition/     — integration wiring factory
  __tests__/       — publisher / subscriber / mapper / application / validation / composition / immutability / integration
  index.ts
```

---

## Models

| Model | Responsibility |
|-------|---------------|
| `WorkoutProgressEvent` | Immutable integration event |
| `WorkoutProgressSnapshot` | Publisher snapshot |
| `WorkoutMetric` | Metric representation |
| `WorkoutAnalyticsPayload` | Workout domain projection |
| `WorkoutProgressMetadata` | Event metadata |
| `WorkoutProgressResult` | Publish result |

All models are immutable (`Object.freeze`).

---

## Supported Events

`WorkoutStarted` · `WorkoutCompleted` · `WorkoutCancelled` · `WorkoutSkipped` · `ExerciseCompleted` · `SetCompleted` · `PersonalRecordAchieved` · `WorkoutVolumeUpdated`

Represent only — no analytics calculations.

---

## Publisher

`WorkoutProgressPublisher` validates and publishes immutable events to registered subscribers. Duplicate event ids are rejected.

---

## Subscriber

`ProgressAnalyticsSubscriber` consumes workout events through `ProgressAnalyticsService.applyWorkoutProgressEvent`. No direct dependency on Progress Analytics internals.

---

## Application APIs

| API | Role |
|-----|------|
| `publishWorkoutProgress` | Generic publish |
| `publishWorkoutCompletion` | Completion event from session summary |
| `publishWorkoutCancellation` | Cancellation event from session |
| `publishPersonalRecord` | Personal record event |

---

## Validation

Validates missing event, duplicate event id, invalid payload, missing metadata, and unsupported event type.

---

## Composition Root

`WorkoutProgressIntegrationFactory` registers:

- `WorkoutProgressPublisher`
- `ProgressAnalyticsSubscriber`

via `CompositionRoot` using `ProgressAnalyticsService` contract only.

---

## Constraints

- NO analytics calculations
- NO repository changes
- NO persistence
- NO networking
- NO backend
- NO synchronization
- NO event sourcing
- NO direct imports from Progress Analytics internals
- Contract-only communication
- Strict TypeScript

---

## Test Coverage

Publisher · Subscriber · Mapper · Application · Validation · Composition Root · Immutability · Integration
