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
2. **Nutrition Agent** — specialized framework agent that orchestrates Nutrition Domain capabilities without replacing domain engines.

```
Agent Runtime
      ↓
Nutrition Framework Agent
      ↓
Nutrition Domain Gateway
      ↓
NutritionCapabilitySelector
      ↓
Nutrition Domain (ports / contracts)
      ↓
NutritionAgentResult
```

---

## Responsibilities

| Layer | Owns | Does not own |
|-------|------|--------------|
| **Nutrition Agent** | Intent resolution, capability selection, plan proposals, domain invocation records | Prompts, providers, tool execution, persistence, domain algorithms |
| **Nutrition Domain** | Target calculation, meal logging, adherence math, domain services | Conversational orchestration |
| **NutritionDomainGateway** | Translate agent requests ↔ domain ports; skip when payloads missing | Business calculations |
| **Tool Runtime** | Adapter orchestration for ActionPlans | Domain business rules |

---

## Flow

1. User / runtime makes a nutrition request.
2. Nutrition Framework Agent builds execution context.
3. Capability selector resolves intent → Nutrition Domain capabilities.
4. Domain gateway plans / invokes ports when payloads are supplied.
5. Immutable `NutritionAgentResult` (with `domainInvocations`) is returned.
6. Nutrition Domain remains source of truth for executable nutrition artifacts.

---

## Principle

> The Nutrition Agent is an orchestrator, not a replacement for the Nutrition Domain.
