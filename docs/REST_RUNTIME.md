# Rest Runtime

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-22  
**Purpose:** Document the Rest Runtime domain — deterministic rest-period state for live workouts (Sprint 18.1).  
**Source of Truth:** Yes — for Rest Runtime layout, time model, and state machine on mobile.

Related: [ARCHITECTURE.md](./ARCHITECTURE.md), [WORKOUT_RUNTIME.md](./WORKOUT_RUNTIME.md), [DOMAIN_EVENTS.md](./DOMAIN_EVENTS.md), [DECISIONS.md](./DECISIONS.md) (ADR-039).

---

## Architecture Summary

```
Workout Runtime
        ↓
Rest Runtime
        ↓
Rest Session
        ↓
Rest Result
```

This domain manages workout rest periods **independently of the UI**.

It is **not**:

- UI / countdowns on screen
- Platform timers (`setTimeout` / `setInterval`)
- Persistence / networking
- Notifications / Live Activities
- Analytics / recovery analysis
- AI / Coach

Module: `app/src/features/rest-runtime/`.

`WorkoutRuntime` may own an optional `RestRuntime` instance. Rest Runtime never imports Workout Runtime (no circular dependencies).

Lifecycle actions emit immutable [Domain Events](./DOMAIN_EVENTS.md) (Sprint 18.2) via an optional/session `DomainEventSystem` — emission only; timing rules unchanged. Expire maps to `rest_completed` in the domain-event model.

---

## Time Model

The engine is **deterministic** and **timer-free**.

| Rule | Detail |
|------|--------|
| No platform timers | Never calls `setTimeout` or `setInterval` |
| Injected elapsed | Callers supply elapsed active duration via `updateElapsedTime(elapsedMs)` |
| Active time only | While `Paused`, elapsed updates are rejected; the caller freezes the clock |
| Target / remaining / overtime | Derived from `targetDurationMs` and injected `elapsedMs` |
| Completion % | `min(100, round(elapsed / target * 100))` |

Timestamps for events come from `RestConfiguration.fixedTimestamp` (tests) or a caller-supplied fixed value — not from a wall-clock scheduler inside the engine.

---

## Runtime State Machine

| State | Meaning |
|-------|---------|
| `Idle` | Seeded runtime before `start` |
| `Running` | Rest is actively counting (via injected elapsed) |
| `Paused` | Temporarily suspended; elapsed frozen |
| `Completed` | Manually finished (early or on-time) |
| `Cancelled` | Abandoned |
| `Expired` | Target reached (auto-expire or explicit expire) |

### Valid transitions

```
Idle      → Running | Cancelled
Running   → Paused | Completed | Cancelled | Expired
Paused    → Running | Completed | Cancelled | Expired
Completed → (terminal)
Cancelled → (terminal)
Expired   → (terminal)
```

Transitions are validated; invalid operations throw `RestRuntimeError`.

### Derived status (`RestStatus`)

| Status | When |
|--------|------|
| `Idle` | Lifecycle Idle |
| `Counting` | Running, remaining > 0 |
| `OnTarget` | Running, remaining = 0, not overtime |
| `Overtime` | Running, elapsed > target |
| `Paused` | Lifecycle Paused |
| `Finished` | Completed or Expired |
| `Cancelled` | Lifecycle Cancelled |

---

## Runtime State Model

| Model | Role |
|-------|------|
| `RestSession` | Immutable seed (reason, target, optional workout link) |
| `RestRuntime` | In-memory runtime graph for one rest period |
| `RestConfiguration` | Target duration, overtime/expire knobs, fixed timestamp |
| `RestProgress` | Elapsed / remaining / overtime / completion % |
| `RestMetrics` | Structural counters (pause/update/event counts) |
| `RestSummary` | Public snapshot (safe application output) |
| `RestResult` | Frozen terminal outcome |
| `RestEvent` | Append-only in-memory event log (not telemetry) |
| `RestReason` / `RestTarget` / `RestDuration` | Session intent and duration values |
| `RestState` / `RestStatus` | Lifecycle vs derived timing status |

Source `RestSession` remains immutable — runtime never mutates it.

---

## Engine

`RestRuntimeEngine` responsibilities:

- Start / pause / resume / cancel / complete / expire
- Track elapsed, remaining, target, overtime, completion %
- Auto-expire when `autoExpireOnTarget` and elapsed ≥ target

No platform timer implementation. Elapsed time is injected.

---

## Public API

Application layer (`features/rest-runtime/application`):

| Function | Result |
|----------|--------|
| `startRest(session, config?)` | Opaque `ActiveRest` handle |
| `pauseRest(rest)` | `RestSummary` |
| `resumeRest(rest)` | `RestSummary` |
| `cancelRest(rest)` | `RestResult` |
| `completeRest(rest)` | `RestResult` |
| `updateElapsedTime(rest, elapsedMs)` | `RestSummary` |

Internal `RestRuntime` / engine are not part of the public application contract. `ActiveRest` exposes only summary/progress/state/elapsed accessors.

---

## Future Timer Integration

This foundation intentionally omits platform scheduling. Later sprints may add:

| Integration | Role |
|-------------|------|
| UI countdown hooks | Drive `updateElapsedTime` from animation frames or a single external ticker |
| Notifications / Live Activities | Observe `RestSummary` / `RestResult` — never own the state machine |
| Adaptive rest | Adjust `RestTarget` / configuration before `startRest` |
| Recovery analysis / Coach AI | Consume frozen `RestResult` metrics — no engine coupling |
| Workout Runtime binding | Attach via `WorkoutRuntime.restRuntime` / `withRestRuntime` |

External timers remain **adapters**. The Rest Runtime domain stays the source of truth for rest state.

---

## Design Rules

- Workout Runtime → Rest Runtime ownership only (no reverse imports)
- Deterministic: same injected elapsed → same progress/status
- No UI, timers, persistence, networking, AI, notifications, or analytics
- Validators cover state transitions, duration consistency, completion, expiration, invalid operations

---

## Tests

Lifecycle, state transitions, progress, remaining time, overtime, validators, application API, regression — under `features/rest-runtime/__tests__/`.
