# Workout Intelligence

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-23  
**Purpose:** Document how Workout Intelligence spans domain engines and the Workout Agent.  
**Source of Truth:** Yes — for the split between Workout Domain engines and Workout Agent orchestration.

Related: [WORKOUT_AGENT.md](./WORKOUT_AGENT.md), [AGENT_RUNTIME.md](./AGENT_RUNTIME.md), [ARCHITECTURE.md](./ARCHITECTURE.md), [COACH_INTELLIGENCE.md](./COACH_INTELLIGENCE.md).

---

## Overview

Workout Intelligence in EVOLVE has two complementary layers:

1. **Workout Domain engines** — deterministic training pipeline (blueprint → selection → programming → progression → adaptation → assembly → runtime).
2. **Workout Agent** — specialized framework agent that orchestrates planning and domain invocation without replacing domain engines.

```
Agent Runtime
      ↓
Workout Framework Agent
      ↓
Planning (intent / strategy / planners / policies)
      ↓
Workout Domain Gateway
      ├── Program Generation
      ├── Programming Engine
      ├── Progression Engine
      ├── Training Adaptation Engine
      ├── Workout Assembly Engine
      ├── Exercise Knowledge Base
      └── Decision Intelligence
      ↓
WorkoutAgentResult
```

---

## Responsibilities

| Layer | Owns | Does not own |
|-------|------|--------------|
| **Workout Agent** | Intent/objective resolution, strategy selection, domain capability selection, plan proposals, explanations, `adaptWorkout` orchestration | Prompts, providers, tool execution, persistence, domain math |
| **Workout Domain** | Exercise selection, programming, progression math, assembly, session truth | Conversational / agent orchestration |
| **Agent Runtime** | Registry, selection, execution entry | Domain business rules |
| **Tool Runtime** | Adapter orchestration for ActionPlans | Domain business rules |

---

## Flow

1. Agent Runtime selects `WorkoutFrameworkAgent`.
2. Workout Agent builds context and plans.
3. Domain gateway selects / invokes existing engines when payloads are present.
4. Immutable `WorkoutAgentResult` (with `domainInvocations`) is returned.

---

## Principle

> The Workout Agent is an orchestrator, not a replacement for the Workout Domain.
