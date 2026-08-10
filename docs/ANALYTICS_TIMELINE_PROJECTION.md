# Analytics Timeline Projection

**Project:** EVOLVE  
**Sprint:** 32.5 — Progress Analytics → Coach Timeline Projection  
**Status:** Accepted  
**ADR:** [ADR-119](./DECISIONS.md)  
**Module:** `app/src/integrations/analytics-timeline`

---

## Purpose

Deterministic projection layer that translates immutable Progress Analytics events into immutable Coach Timeline entries. Progress Analytics remains the source; Coach Timeline is a read-model consumer only.

This sprint intentionally differs from Sprints 32.1–32.4. No analytics publisher is introduced.

No analytics calculations, persistence, networking, backend, synchronization, event bus, runtime scheduler, or Coach Timeline redesign are introduced in this sprint.

---

## Dependency Flow

```
Progress Analytics Service (source / producer)
        │
        ▼
Analytics Timeline Projector
        │
        ▼
Coach Timeline Service (consumer / read model)
```

Progress Analytics ingest DTOs are the contract boundary. The projector validates, maps, and appends timeline entries through `CoachTimelineService.appendEntry`.

---

## Module Structure

```
integrations/analytics-timeline/
  events/          — supported analytics event type constants
  models/          — immutable projection models
  mappers/         — analytics ingest DTO → timeline append request
  validation/      — event validation
  projector/       — AnalyticsTimelineProjector
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
| `AnalyticsTimelineEvent` | Discriminated union of immutable Progress Analytics ingest events |
| `AnalyticsTimelineProjectionResult` | Projection outcome with timeline entry reference |
| `AnalyticsTimelineProjectionSnapshot` | Projector diagnostic snapshot |

All models are immutable (`Object.freeze`).

---

## Supported Events

All Progress Analytics ingest event types across domains:

**Workout:** `WorkoutStarted` · `WorkoutCompleted` · `WorkoutCancelled` · `WorkoutSkipped` · `ExerciseCompleted` · `SetCompleted` · `PersonalRecordAchieved` · `WorkoutVolumeUpdated`

**Nutrition:** `NutritionDayStarted` · `MealLogged` · `MealRemoved` · `DailyNutritionCompleted` · `HydrationLogged` · `MacroTargetUpdated` · `NutritionGoalAchieved` · `NutritionAdherenceUpdated`

**Recovery:** `RecoveryDayStarted` · `RecoveryAssessed` · `SleepLogged` · `StressUpdated` · `ReadinessUpdated` · `HRVLogged` · `FatigueUpdated` · `RecoveryGoalAchieved`

**Goal:** `GoalTrackingStarted` · `GoalProgressUpdated` · `GoalMilestoneReached` · `GoalTargetUpdated` · `GoalCompleted` · `GoalDeviationDetected` · `GoalAdherenceUpdated` · `GoalAchieved`

Represent only — no analytics calculations.

---

## Projector

`AnalyticsTimelineProjector` validates immutable analytics events, maps them to `AppendTimelineEntryRequest`, and appends entries via `CoachTimelineService`.

Timeline entry IDs follow `tl:analytics:{source}:{eventId}` for deterministic idempotency.

Domain → category mapping examples:

| Source | Event | Timeline Category |
|--------|-------|-------------------|
| goal | `GoalProgressUpdated` | `GOAL_PROGRESS` |
| goal | `GoalCompleted` | `GOAL_CHANGED` |
| workout | `WorkoutCompleted` | `WORKOUT_CREATED` |
| nutrition | `MealLogged` | `NUTRITION_MODIFIED` |
| recovery | `RecoveryAssessed` | `RECOVERY_ADJUSTMENT` |
| recovery | `FatigueUpdated` | `FATIGUE_DETECTED` |

---

## Application APIs

| API | Responsibility |
|-----|---------------|
| `projectAnalyticsEventToTimeline` | Project any supported analytics event |
| `projectGoalProgressIngestToTimeline` | Project goal ingest events |
| `projectWorkoutProgressIngestToTimeline` | Project workout ingest events |
| `projectNutritionProgressIngestToTimeline` | Project nutrition ingest events |
| `projectRecoveryProgressIngestToTimeline` | Project recovery ingest events |

---

## Validation

Rejects:

- missing event
- duplicate event id
- invalid payload
- missing metadata
- unsupported event type
- missing athlete id

---

## Composition Root

`AnalyticsTimelineIntegrationFactory` registers `AnalyticsTimelineProjector` using:

- `ProgressAnalyticsService` (contract reference / source boundary)
- `CoachTimelineService` (shared singleton consumer)

```typescript
resolveService("AnalyticsTimelineProjector")
// or
getCompositionRoot().getAnalyticsTimelineProjector()
```

---

## Design Constraints

- Progress Analytics remains producer; Coach Timeline is consumer only
- No circular dependencies (`analytics-timeline` imports Progress Analytics and Coach Timeline contracts only)
- Previous integrations (32.1–32.4) are unchanged
- Coach Timeline and Progress Analytics features are not redesigned
- Projection only — no persistence, networking, event bus, or scheduler

---

## Related Documentation

- [PROGRESS_ANALYTICS_ARCHITECTURE.md](./PROGRESS_ANALYTICS_ARCHITECTURE.md)
- [COACH_TIMELINE.md](./COACH_TIMELINE.md)
- [COMPOSITION_ROOT.md](./COMPOSITION_ROOT.md)
- [ARCHITECTURE.md](./ARCHITECTURE.md)
