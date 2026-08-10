# Recovery Progress Integration

**Project:** EVOLVE  
**Sprint:** 32.3 — Recovery → Progress Analytics Integration  
**Status:** Accepted  
**ADR:** [ADR-117](./DECISIONS.md)  
**Module:** `app/src/integrations/recovery-progress`

---

## Purpose

Deterministic integration layer that publishes immutable recovery progress events and updates Progress Analytics read models through existing contracts. The Recovery feature never depends directly on Progress Analytics.

No analytics calculations, persistence, networking, backend, synchronization, or event sourcing are introduced in this sprint.

---

## Dependency Flow

```
Recovery Feature
        │
        ▼
Recovery Progress Integration
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
integrations/recovery-progress/
  events/          — supported event type constants
  models/          — immutable integration models
  mappers/         — recovery domain → payload → ProgressAnalyticsService DTO
  validation/      — event validation
  publishers/      — RecoveryProgressPublisher
  subscribers/     — RecoveryProgressSubscriber
  application/     — publish use cases
  composition/     — integration wiring factory
  __tests__/       — publisher / subscriber / mapper / application / validation / composition / immutability / integration
  index.ts
```

---

## Models

| Model | Responsibility |
|-------|---------------|
| `RecoveryProgressEvent` | Immutable integration event |
| `RecoveryProgressSnapshot` | Publisher snapshot |
| `RecoveryMetric` | Metric representation |
| `RecoveryAnalyticsPayload` | Recovery domain projection |
| `RecoveryProgressMetadata` | Event metadata |
| `RecoveryProgressResult` | Publish result |

All models are immutable (`Object.freeze`).

---

## Supported Events

`RecoveryDayStarted` · `RecoveryAssessed` · `SleepLogged` · `StressUpdated` · `ReadinessUpdated` · `HRVLogged` · `FatigueUpdated` · `RecoveryGoalAchieved`

Represent only — no analytics calculations.

---

## Publisher

`RecoveryProgressPublisher` validates and publishes immutable events to registered subscribers. Duplicate event ids are rejected.

---

## Subscriber

`RecoveryProgressSubscriber` consumes recovery events through `ProgressAnalyticsService.applyRecoveryProgressEvent`. No direct dependency on Progress Analytics internals.

---

## Application APIs

| API | Role |
|-----|------|
| `publishRecoveryProgress` | Generic publish |
| `publishRecoveryAssessed` | Recovery assessment event from recovery assessment |
| `publishSleepLogged` | Sleep logged event from sleep profile |
| `publishReadinessUpdated` | Readiness updated event from readiness state |

---

## Validation

Validates missing event, duplicate event id, invalid payload, missing metadata, and unsupported event type.

---

## Composition Root

`RecoveryProgressIntegrationFactory` registers:

- `RecoveryProgressPublisher`
- `RecoveryProgressSubscriber`

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
