# State Management

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-25  
**Purpose:** Index immutable state ownership across the mobile coaching stack.  
**Source of Truth:** Partial — subsystem details live in linked docs.

Related: [ATHLETE_STATE_ENGINE.md](./ATHLETE_STATE_ENGINE.md), [COACHING_SESSION_RUNTIME.md](./COACHING_SESSION_RUNTIME.md), [WORKOUT_RUNTIME.md](./WORKOUT_RUNTIME.md), [ATHLETE_HISTORY.md](./ATHLETE_HISTORY.md), [ARCHITECTURE.md](./ARCHITECTURE.md).

---

## Ownership Map

| Concern | Module | Immutable model(s) | Notes |
|---------|--------|--------------------|-------|
| Current athlete truth | `features/athlete-state` | `AthleteState`, `AthleteSnapshot` | Sprint 22.1 — aggregation + evolution only |
| Coaching interaction lifecycle | `features/coaching-session` | `SessionContext`, `SessionSnapshot` | Sprint 22.0 |
| Live workout execution | `features/workout-runtime` | workout session state | Runtime execution, not athlete aggregate |
| Chronological journey facts | `features/athlete-history` | history entries / snapshots | Historical record; not current truth |
| Athlete profile inputs | `features/athlete-context` | profile / preferences | Input profile; not unified state engine |

---

## Athlete State Engine Placement

```
Specialist Agents (Workout / Nutrition / Recovery / Goal)
      ↓
Athlete State Engine          ← current immutable athlete truth
      ↓
Coach Supervisor Context
      ↓
Coach Supervisor / Unified Coach Response
```

Athlete State Engine is the **single immutable source of truth** describing the current athlete. It does not calculate readiness scores, predict outcomes, persist data, or call AI.

---

## Rules

- Prefer immutable frozen models (`Object.freeze`) at module boundaries
- Evolution creates new versions; never mutate prior state
- Domain calculations stay in specialist / domain engines — not in state modules
- Persistence / networking remain outside these foundations
