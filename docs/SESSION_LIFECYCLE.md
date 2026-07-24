# Session Lifecycle

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-25  
**Purpose:** Describe Coaching Session Runtime lifecycle statuses, phases, and allowed transitions.  
**Source of Truth:** Partial — implementation lives in `features/coaching-session/lifecycle/`.

Related: [COACHING_SESSION_RUNTIME.md](./COACHING_SESSION_RUNTIME.md), [AI_RUNTIME.md](./AI_RUNTIME.md), [COACH_SUPERVISOR.md](./COACH_SUPERVISOR.md).

---

## Statuses

| Status | Meaning |
|--------|---------|
| `idle` | No active session |
| `starting` | Start accepted (transient) |
| `active` | Session open for turns |
| `continuing` | Continue turn in progress (transient) |
| `ending` | End accepted (transient) |
| `completed` | Session finalized successfully |
| `failed` | Session failed |

---

## Phases

| Phase | Meaning |
|-------|---------|
| `idle` | No interaction |
| `initialize` | Session creation |
| `interact` | First / primary interaction |
| `continue` | Follow-up turn |
| `finalize` | End / summary |

---

## Allowed Transitions

```
idle / completed / failed
        │ start
        ▼
      active  ←────── continue
        │
        │ end
        ▼
    completed
```

Deterministic rules (via `SessionStateMachine` + `LifecyclePolicy`):

- **start** — allowed from `idle`, `completed`, or `failed` (new session id)
- **continue** — allowed only from `active` / `continuing`
- **end** — allowed from `active` / `continuing` / `starting`
- Terminal statuses (`completed`, `failed`) reject further continue/end

---

## Lifecycle Stages

| Stage | When |
|-------|------|
| `created` | Lifecycle descriptor created |
| `started` | First successful start |
| `continued` | Subsequent successful turns |
| `ended` | Successful end |
| `failed` | Failure path |

---

## Checkpoints & History

Each successful start/continue turn:

1. Invokes Coach Supervisor (port)
2. Appends an immutable history entry
3. Creates an immutable checkpoint (`turnCount`, status, phase, last request/response ids)
4. Emits timeline events (`session_started` / `session_continued`, `supervisor_invoked`, `response_built`, `checkpoint_created`)

End finalizes lifecycle, appends `session_ended`, and builds `SessionSummary` / `SessionSnapshot`.

---

## Ownership

| Concern | Owner |
|---------|-------|
| Chat / conversation turns | Conversation Runtime |
| Coaching session lifecycle | Coaching Session Runtime |
| Multi-agent orchestration | Coach Supervisor |
| Domain calculations | Specialist agents / domains |
`}