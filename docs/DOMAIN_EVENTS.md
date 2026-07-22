# Domain Events

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-22  
**Purpose:** Document the Domain Event System for workout execution (Sprint 18.2).  
**Source of Truth:** Yes — for Domain Events layout, Event Stream, and Subscriber Model on mobile.

Related: [ARCHITECTURE.md](./ARCHITECTURE.md), [WORKOUT_RUNTIME.md](./WORKOUT_RUNTIME.md), [REST_RUNTIME.md](./REST_RUNTIME.md), [DECISIONS.md](./DECISIONS.md) (ADR-040).

---

## Architecture Summary

```
Workout Runtime
        ↓
Rest Runtime
        ↓
Domain Events
        ↓
Event Stream
        ↓
Future Subscribers
```

This layer records **immutable domain events** for every meaningful action during a live workout.

It is **not**:

- an event bus / message bus
- a queue, broker, Kafka, or RabbitMQ
- async messaging infrastructure
- persistence / networking
- analytics / AI implementation
- UI

Module: `app/src/core/domain-events/`.

---

## Domain Events

Strongly typed, immutable events with metadata + context:

| Event | Category | Source |
|-------|----------|--------|
| `workout_started` / `paused` / `resumed` / `completed` / `cancelled` | `workout` | `workout-runtime` |
| `exercise_started` / `completed` / `skipped` | `exercise` | `workout-runtime` |
| `set_started` / `set_completed` | `set` | `workout-runtime` |
| `rest_started` / `paused` / `resumed` / `completed` / `cancelled` | `rest` | `rest-runtime` |

Shared fields: `id`, `type`, `category`, `severity`, `source`, `sequence`, `timestamp`, `metadata`, `context`, `message`, typed `payload`.

Supporting models: `EventMetadata`, `EventContext`, `EventCategory`, `EventSeverity`, `EventSource`, `EventSequence`.

---

## Event Stream

`EventStream` is an immutable, ordered snapshot of published events for one session.

| Responsibility | Detail |
|----------------|--------|
| Append | Via `EventStreamStore` — validated monotonic sequences |
| Retrieve | Ordered read-only collection |
| Filter | By category, source, or type |
| Ordering | Deterministic `sequence` 1..N |
| Persistence | **None** — in-memory only |

---

## Dispatcher

`DomainEventDispatcher` publishes synchronously:

1. Freeze event  
2. Validate  
3. Append to stream  
4. Notify subscribers **in subscription order**

No async processing. No queues. No mutation after publish.

The dispatcher is **internal** — application consumers use the public API only.

---

## Subscriber Model

Subscriber **interfaces only** (no implementations in this sprint):

| Interface | Future consumer |
|-----------|-----------------|
| `PerformanceSubscriber` | Performance Engine |
| `TimelineSubscriber` | Timeline |
| `CoachSubscriber` | Coach AI |
| `AnalyticsSubscriber` | Analytics |
| `AchievementSubscriber` | Achievements |
| `RecoverySubscriber` | Recovery |

Base contract: `DomainEventSubscriber` with synchronous `onEvent(event)`.

---

## Public Application API

| Function | Role |
|----------|------|
| `publishEvent(event, system?)` | Publish an immutable domain event |
| `subscribe(subscriber, system?)` | Register a synchronous subscriber |
| `unsubscribe(id, system?)` | Remove a subscriber |
| `getEventStream(system?)` | Read-only stream snapshot |
| `summarizeEvents(system?)` | Aggregate counts / summary text |

`createDomainEventSystem()` creates a session-scoped system (preferred for runtime integration).

---

## Runtime Integration

- **Workout Runtime** emits workout / exercise / set events on lifecycle actions.
- **Rest Runtime** emits rest lifecycle events (expire maps to `rest_completed`).
- Emission is additive — **no business logic changes**.
- Engines accept an optional `DomainEventSystem`; each instance owns a default system when omitted.
- `ActiveWorkout.getDomainEventSystem()` / `ActiveRest.getDomainEventSystem()` expose the stream for consumers/tests.

---

## Future Consumers

Downstream modules will subscribe without changing runtime engines:

- Performance Engine ← Sprint 18.3 (implemented as consumer of Event Stream + WorkoutResult)
- Timeline  
- Coach AI  
- Recovery  
- Achievements  
- Analytics  

---

## Explicit Non-Goals

No persistence, networking, async queues, brokers, Kafka/RabbitMQ, analytics implementations, or subscriber implementations.
