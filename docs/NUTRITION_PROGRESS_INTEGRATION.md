# Nutrition Progress Integration

**Project:** EVOLVE  
**Sprint:** 32.2 — Nutrition → Progress Analytics Integration  
**Status:** Accepted  
**ADR:** [ADR-116](./DECISIONS.md)  
**Module:** `app/src/integrations/nutrition-progress`

---

## Purpose

Deterministic integration layer that publishes immutable nutrition progress events and updates Progress Analytics read models through existing contracts. The Nutrition feature never depends directly on Progress Analytics.

No analytics calculations, persistence, networking, backend, synchronization, or event sourcing are introduced in this sprint.

---

## Dependency Flow

```
Nutrition Feature
        │
        ▼
Nutrition Progress Integration
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
integrations/nutrition-progress/
  events/          — supported event type constants
  models/          — immutable integration models
  mappers/         — nutrition domain → payload → ProgressAnalyticsService DTO
  validation/      — event validation
  publishers/      — NutritionProgressPublisher
  subscribers/     — NutritionProgressSubscriber
  application/     — publish use cases
  composition/     — integration wiring factory
  __tests__/       — publisher / subscriber / mapper / application / validation / composition / immutability / integration
  index.ts
```

---

## Models

| Model | Responsibility |
|-------|---------------|
| `NutritionProgressEvent` | Immutable integration event |
| `NutritionProgressSnapshot` | Publisher snapshot |
| `NutritionMetric` | Metric representation |
| `NutritionAnalyticsPayload` | Nutrition domain projection |
| `NutritionProgressMetadata` | Event metadata |
| `NutritionProgressResult` | Publish result |

All models are immutable (`Object.freeze`).

---

## Supported Events

`NutritionDayStarted` · `MealLogged` · `MealRemoved` · `DailyNutritionCompleted` · `HydrationLogged` · `MacroTargetUpdated` · `NutritionGoalAchieved` · `NutritionAdherenceUpdated`

Represent only — no analytics calculations.

---

## Publisher

`NutritionProgressPublisher` validates and publishes immutable events to registered subscribers. Duplicate event ids are rejected.

---

## Subscriber

`NutritionProgressSubscriber` consumes nutrition events through `ProgressAnalyticsService.applyNutritionProgressEvent`. No direct dependency on Progress Analytics internals.

---

## Application APIs

| API | Role |
|-----|------|
| `publishNutritionProgress` | Generic publish |
| `publishMealLogged` | Meal logged event from meal entry |
| `publishDailyNutritionCompleted` | Daily completion event from nutrition summary |
| `publishHydrationLogged` | Hydration logged event |

---

## Validation

Validates missing event, duplicate event id, invalid payload, missing metadata, and unsupported event type.

---

## Composition Root

`NutritionProgressIntegrationFactory` registers:

- `NutritionProgressPublisher`
- `NutritionProgressSubscriber`

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
