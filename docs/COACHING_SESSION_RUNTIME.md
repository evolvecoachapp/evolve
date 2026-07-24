# Coaching Session Runtime

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-25  
**Purpose:** Document the Coaching Session Runtime — orchestration layer between Conversation Runtime and Coach Supervisor.  
**Source of Truth:** Yes — for Coaching Session Runtime layout, lifecycle, boundaries, and public API on mobile.

Related: [SESSION_LIFECYCLE.md](./SESSION_LIFECYCLE.md), [AI_RUNTIME.md](./AI_RUNTIME.md), [ARCHITECTURE.md](./ARCHITECTURE.md), [COACH_SUPERVISOR.md](./COACH_SUPERVISOR.md), [SUPERVISOR_RUNTIME.md](./SUPERVISOR_RUNTIME.md), [DECISIONS.md](./DECISIONS.md) (ADR-070).

---

## Responsibilities

Coaching Session Runtime owns **session orchestration only** — the lifecycle of a complete coaching interaction.

It **does**:

- accept start / continue / end session requests (from Conversation Runtime)
- maintain immutable session context, history, checkpoints, and timeline
- coordinate Coach Supervisor per turn via `CoachSupervisorPort`
- produce `SessionResult` / `SessionContext` / `SessionSummary`
- expose a narrow public application API

It **does not**:

- perform workout / nutrition / recovery / goal / business logic
- execute domain logic
- replace Conversation Runtime
- call AI providers / generate prompts
- networking / persistence / UI

Module: `app/src/features/coaching-session/`.

---

## Architecture Summary

```
User
  ↓
Conversation Runtime
  ↓
Coaching Session Runtime
  ↓
Coach Supervisor
  ↓
Multi-Agent Platform
  ↓
Unified Coach Response
```

---

## Lifecycle

```
SessionRequest (start)
  → validate request / transition
  → plan session interaction
  → invoke Coach Supervisor (port)
  → build response / context / checkpoint
  → SessionResult (active)

SessionRequest (continue)
  → validate active session
  → invoke Coach Supervisor
  → append history / update checkpoint
  → SessionResult (active)

SessionRequest (end)
  → validate transition
  → finalize lifecycle
  → SessionSummary / SessionSnapshot
  → SessionResult (completed)
```

Plans, context, history, checkpoints, and responses are immutable after creation.

---

## Module Boundaries

| Layer | Role |
|-------|------|
| `models/` | Immutable session / context / lifecycle / history / response / result |
| `session/` | Engine / coordinator / manager — orchestration only |
| `lifecycle/` | State machine + lifecycle manager |
| `context/` | Immutable context / history / checkpoint builders + manager |
| `planning/` | Deterministic planners (no execution, no AI) |
| `builders/` | Session / response / summary / timeline / snapshot / result |
| `validators/` | Request / lifecycle / transitions / history / context / response |
| `policies/` | Lifecycle / context / continuation / consistency / safety |
| `contracts/` | `CoachSupervisorPort` / `ConversationRuntimePort` (+ mocks) |
| `application/` | Narrow public API |
| `services/` | `CoachingSessionService` facade |

---

## Public API

| Function | Purpose |
|----------|---------|
| `startSession` | Start a coaching session and invoke Coach Supervisor |
| `continueSession` | Continue an active session turn |
| `endSession` | End a session and produce summary / snapshot |
| `describeSession` | Describe runtime capabilities |
| `validateSession` | Validate a session request / existing session |

Root export: models + application + `CoachingSessionService` only — internal modules are not part of the public surface.

---

## Integration

| Consumes | Via |
|----------|-----|
| Conversation Runtime | `ConversationRuntimePort` (descriptor only) + request fields |
| Coach Supervisor | `CoachSupervisorPort` (mock in tests) |

| Produces | Types |
|----------|-------|
| Session outputs | `SessionResult`, `SessionContext`, `SessionSummary` |

Athlete State Engine (Sprint 22.1) consumes coaching-session contributions via `CoachingSessionPort` and produces `AthleteState` / `CoachSupervisorContext` for supervisor handoff. See [ATHLETE_STATE_ENGINE.md](./ATHLETE_STATE_ENGINE.md).

---

## Design Rules

- No OpenAI SDK
- No Prompt Builder logic
- No Tool Runtime
- No business logic
- No networking
- No persistence
- Session orchestration only
}