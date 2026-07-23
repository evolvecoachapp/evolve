# Agent Runtime

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-23  
**Purpose:** Document the Agent Runtime boundary for domain agents (Workout, Nutrition, Recovery, …).  
**Source of Truth:** Yes — for domain agent placement inside the AI Runtime pipeline.

Related: [ARCHITECTURE.md](./ARCHITECTURE.md), [WORKOUT_AGENT.md](./WORKOUT_AGENT.md), [NUTRITION_AGENT.md](./NUTRITION_AGENT.md), [RECOVERY_AGENT.md](./RECOVERY_AGENT.md), [WORKOUT_INTELLIGENCE.md](./WORKOUT_INTELLIGENCE.md), [NUTRITION_INTELLIGENCE.md](./NUTRITION_INTELLIGENCE.md), [RECOVERY_INTELLIGENCE.md](./RECOVERY_INTELLIGENCE.md), [AI_SYSTEM.md](./AI_SYSTEM.md), [DECISIONS.md](./DECISIONS.md) (ADR-059, ADR-061, ADR-062).

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
Agent Framework                     ← Sprint 21.1 shared contracts / registry
      ↓
Domain Agent (Workout / Nutrition / Recovery)  ← Agent Runtime
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

Shared infrastructure: [AGENT_FRAMEWORK.md](./AGENT_FRAMEWORK.md), [AGENT_LIFECYCLE.md](./AGENT_LIFECYCLE.md), [AGENT_REGISTRY.md](./AGENT_REGISTRY.md).

---

## Domain Agents

| Agent | Module | Sprint |
|-------|--------|--------|
| **Workout Agent** | `features/workout-agent/` | 21.0 (migrated onto Agent Framework in 21.1) |
| **Nutrition Agent** | `features/nutrition-agent/` | 21.2 |
| **Recovery Agent** | `features/recovery-agent/` | 21.3 |

Future agents (goals, coach supervisor) must extend the Agent Framework:

- implement `IAgent`
- register via `registerAgent`
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
- duplicate Workout Domain / Nutrition Domain / Recovery Domain business logic
- introduce networking or persistence
