# Agent Runtime

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-23  
**Purpose:** Document the Agent Runtime boundary introduced with the Workout Agent (Sprint 21.0).  
**Source of Truth:** Yes — for domain agent placement inside the AI Runtime pipeline.

Related: [ARCHITECTURE.md](./ARCHITECTURE.md), [WORKOUT_AGENT.md](./WORKOUT_AGENT.md), [WORKOUT_INTELLIGENCE.md](./WORKOUT_INTELLIGENCE.md), [AI_SYSTEM.md](./AI_SYSTEM.md), [DECISIONS.md](./DECISIONS.md) (ADR-059).

---

## Purpose

Agent Runtime is the orchestration tier where specialized domain agents sit between Conversation Runtime and downstream Coach / Prompt / Provider / Action / Tool pipelines.

Domain agents:

- specialize conversations (e.g. workouts)
- organize deterministic domain knowledge
- prepare decisions for Coach Intelligence / Prompt Builder
- consume Action / Tool results as feedback
- never own providers, networking, persistence, or UI

---

## Placement

```
User Request
      ↓
Conversation Runtime
      ↓
Domain Agent (e.g. Workout Agent)   ← Agent Runtime
      ↓
Coach Intelligence
      ↓
Prompt Builder
      ↓
AI Provider
      ↓
Response Formatter
      ↓
Action Engine
      ↓
Tool Runtime
      ↓
Domain Platform
```

---

## First Agent

| Agent | Module | Sprint |
|-------|--------|--------|
| **Workout Agent** | `features/workout-agent/` | 21.0 |

Future agents (nutrition, recovery, goals) should follow the same pattern:

- immutable result models
- deterministic reasoning + planning
- strategy / policy / selector architecture
- narrow public application API
- mockable downstream integration

---

## Non-Goals

Agent Runtime does **not**:

- replace Prompt Builder or AI Provider
- execute tools (Tool Runtime owns that)
- duplicate Workout Domain / Nutrition Domain business logic
- introduce networking or persistence
