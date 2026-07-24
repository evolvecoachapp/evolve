# Athlete State Engine

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-25  
**Purpose:** Document the Athlete State Engine — immutable single source of truth for current athlete state representation.  
**Source of Truth:** Yes — for Athlete State Engine layout, aggregation, evolution, boundaries, and public API on mobile.

Related: [STATE_MANAGEMENT.md](./STATE_MANAGEMENT.md), [AI_RUNTIME.md](./AI_RUNTIME.md), [ARCHITECTURE.md](./ARCHITECTURE.md), [AGENT_PLATFORM.md](./AGENT_PLATFORM.md), [COACHING_SESSION_RUNTIME.md](./COACHING_SESSION_RUNTIME.md), [COACH_SUPERVISOR.md](./COACH_SUPERVISOR.md), [DECISIONS.md](./DECISIONS.md) (ADR-071).

---

## Responsibilities

Athlete State Engine owns **immutable athlete state representation and deterministic evolution only**.

It **does**:

- aggregate specialist contributions (workout / nutrition / recovery / goal / session) into a unified `AthleteState`
- evolve state versions, history, timeline, and snapshots deterministically
- produce `AthleteSnapshot`, `StateSummary`, and `CoachSupervisorContext`
- expose a narrow public application API

It **does not**:

- perform business calculations or domain scoring
- perform AI reasoning / prompts / provider calls
- persist state
- network
- render UI
- duplicate specialist agent business logic

Module: `app/src/features/athlete-state/`.

---

## Architecture Summary

```
Workout Agent
Nutrition Agent
Recovery Agent
Goal Agent
      ↓
Athlete State Engine
      ↓
Coach Supervisor
      ↓
Unified Coach Response
```

---

## Module Boundaries

| Layer | Role |
|-------|------|
| `models/` | Immutable athlete / slice / version / history / snapshot / result types |
| `state/` | `AthleteStateEngine` / `AthleteStateCoordinator` / `AthleteStateManager` / session |
| `aggregation/` | Deterministic profile / training / recovery / nutrition / … aggregators |
| `evolution/` | Version manager, transition planner, change tracker, evolution engine |
| `builders/` | State / snapshot / timeline / summary / result / supervisor context |
| `validators/` | Integrity / version / timeline / snapshot / measurements / goals / … |
| `policies/` | Integrity / transition / consistency / version / snapshot / safety |
| `selectors/` | Metric / state / history / goal / snapshot / timeline selectors |
| `contracts/` | Specialist + coaching-session ports (+ mocks) |
| `application/` | Narrow public API |
| `services/` | `AthleteStateService` facade |

---

## Public API

| Function | Purpose |
|----------|---------|
| `buildAthleteState` | Create initial immutable athlete state (optionally from contributions / ports) |
| `updateAthleteState` | Evolve existing state from specialist contributions |
| `createSnapshot` | Capture point-in-time `AthleteSnapshot` |
| `describeAthleteState` | Describe engine capabilities |
| `validateAthleteState` | Validate stored / requested athlete state |

Root export: models + application + `AthleteStateService` only — internal modules are not part of the public surface.

---

## Integration

| Consumes | Via |
|----------|-----|
| Workout Agent | `WorkoutAgentPort` (mock in tests) |
| Nutrition Agent | `NutritionAgentPort` (mock in tests) |
| Recovery Agent | `RecoveryAgentPort` (mock in tests) |
| Goal Agent | `GoalAgentPort` (mock until Goal Agent lands) |
| Coaching Session Runtime | `CoachingSessionPort` (mock in tests) |

| Produces | Types |
|----------|-------|
| Athlete state | `AthleteState`, `AthleteSnapshot`, `StateSummary` |
| Supervisor handoff | `CoachSupervisorContext` |

---

## Design Rules

- No OpenAI SDK
- No Prompt Builder
- No AI reasoning
- No business calculations
- No networking
- No persistence
- No UI
- State management only
