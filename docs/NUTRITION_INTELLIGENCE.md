# Nutrition Intelligence

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-23  
**Purpose:** Document how Nutrition Intelligence spans domain engines and the Nutrition Agent.  
**Source of Truth:** Yes — for the split between Nutrition Domain engines and Nutrition Agent orchestration.

Related: [NUTRITION_AGENT.md](./NUTRITION_AGENT.md), [AGENT_RUNTIME.md](./AGENT_RUNTIME.md), [ARCHITECTURE.md](./ARCHITECTURE.md), [COACH_INTELLIGENCE.md](./COACH_INTELLIGENCE.md).

---

## Overview

Nutrition Intelligence in EVOLVE has two complementary layers:

1. **Nutrition Domain** — deterministic nutrition targets, logging, adherence, and domain services (source of truth for executable nutrition artifacts).
2. **Nutrition Agent** — conversational / planning orchestrator that specializes nutrition dialogues and prepares decisions without replacing domain engines.

```
Nutrition Agent (orchestrator)
        │
        ├── Reasoning (deterministic knowledge organization)
        ├── Planning (proposals only)
        ├── Strategies / Policies / Selectors
        └── Delegates to Nutrition Domain when execution is required
                 │
                 ▼
        Action Engine → Tool Runtime → Domain Tool Adapters → Nutrition Domain
```

---

## Responsibilities

| Layer | Owns | Does not own |
|-------|------|--------------|
| **Nutrition Agent** | Intent/goal resolution, strategy selection, plan proposals, explanations | Prompts, providers, tool execution, persistence |
| **Nutrition Domain** | Target calculation, meal logging, adherence math, domain services | Conversational orchestration |
| **Tool Runtime** | Adapter orchestration for ActionPlans | Domain business rules |
| **Coach Intelligence** | Coaching context preparation | Nutrition-specific planning |

---

## Flow

1. User makes a nutrition request.
2. Conversation Runtime prepares Conversation Context / Memory.
3. Nutrition Agent reasons + plans → `NutritionAgentResult`.
4. Downstream Coach / Prompt / Provider path may generate language.
5. Response Formatter → Action Engine → Tool Runtime may execute domain tools.
6. Nutrition Domain remains source of truth for executable nutrition artifacts.

---

## Principle

> The Nutrition Agent is an orchestrator, not a replacement for the Nutrition Domain.
