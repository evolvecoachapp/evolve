# Goal Progress Integration

**Project:** EVOLVE  
**Sprint:** 32.4 — Goal Progress → Progress Analytics Integration  
**Status:** Accepted  
**ADR:** [ADR-118](./DECISIONS.md)  
**Module:** `app/src/integrations/goal-progress`

---

## Purpose

Deterministic integration layer that publishes immutable goal progress events and updates Progress Analytics read models through existing contracts. The Goal Progress feature never depends directly on Progress Analytics.

No analytics calculations, persistence, networking, backend, synchronization, or event sourcing are introduced in this sprint.

---

## Dependency Flow

```
Goal Progress Feature
        │
        ▼
Goal Progress Integration
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
integrations/goal-progress/
  events/          — supported event type constants
  models/          — immutable integration models
  mappers/         — goal domain → payload → ProgressAnalyticsService DTO
  validation/      — event validation
  publishers/      — GoalProgressPublisher
  subscribers/     — GoalProgressSubscriber
  application/     — publish use cases
  composition/     — integration wiring factory
  __tests__/       — publisher / subscriber / mapper / application / validation / composition / immutability / integration
  index.ts
```

---

## Models

| Model | Responsibility |
|-------|---------------|
| `GoalProgressEvent` | Immutable integration event |
| `GoalProgressSnapshot` | Publisher snapshot |
| `GoalMetric` | Metric representation |
| `GoalAnalyticsPayload` | Goal domain projection |
| `GoalProgressMetadata` | Event metadata |
| `GoalProgressResult` | Publish result |

All models are immutable (`Object.freeze`).

---

## Supported Events

`GoalTrackingStarted` · `GoalProgressUpdated` · `GoalMilestoneReached` · `GoalTargetUpdated` · `GoalCompleted` · `GoalDeviationDetected` · `GoalAdherenceUpdated` · `GoalAchieved`

Represent only — no analytics calculations.

---

## Publisher

`GoalProgressPublisher` validates and publishes immutable events to registered subscribers. Duplicate event ids are rejected.

---

## Subscriber

`GoalProgressSubscriber` consumes goal events through `ProgressAnalyticsService.applyGoalProgressEvent`. No direct dependency on Progress Analytics internals.

---

## Application APIs

| API | Role |
|-----|------|
| `publishGoalProgress` | Generic publish |
| `publishGoalProgressUpdated` | Goal progress updated event from goal progress evaluation |
| `publishGoalMilestoneReached` | Goal milestone reached event from goal milestone |
| `publishGoalCompleted` | Goal completed event from goal snapshot |

---

## Validation

Validates missing event, duplicate event id, invalid payload, missing metadata, and unsupported event type.

---

## Composition Root

`GoalProgressIntegrationFactory` registers:

- `GoalProgressPublisher`
- `GoalProgressSubscriber`

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
