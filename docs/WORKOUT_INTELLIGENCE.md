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
2. **Workout Agent** — conversational / planning orchestrator that specializes workout dialogues and prepares decisions without replacing domain engines.

```
Workout Agent (orchestrator)
        │
        ├── Reasoning (deterministic knowledge organization)
        ├── Planning (proposals only)
        ├── Strategies / Policies / Selectors
        └── Delegates to Workout Domain when execution is required
                 │
                 ▼
        Action Engine → Tool Runtime → Domain Tool Adapters → Workout Domain
```

---

## Responsibilities

| Layer | Owns | Does not own |
|-------|------|--------------|
| **Workout Agent** | Intent/objective resolution, strategy selection, plan proposals, explanations | Prompts, providers, tool execution, persistence |
| **Workout Domain** | Exercise selection, programming, progression math, assembly, session truth | Conversational orchestration |
| **Tool Runtime** | Adapter orchestration for ActionPlans | Domain business rules |
| **Coach Intelligence** | Coaching context preparation | Workout-specific planning |

---

## Flow

1. User makes a training request.
2. Conversation Runtime prepares Conversation Context / Memory.
3. Workout Agent reasons + plans → `WorkoutAgentResult`.
4. Downstream Coach / Prompt / Provider path may generate language.
5. Response Formatter → Action Engine → Tool Runtime may execute domain tools.
6. Workout Domain remains source of truth for executable training artifacts.

---

## Principle

> The Workout Agent is an orchestrator, not a replacement for the Workout Domain.
