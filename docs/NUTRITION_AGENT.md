# Nutrition Agent

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-23  
**Purpose:** Document the Nutrition Agent foundation (Sprint 21.2).  
**Source of Truth:** Yes — for Nutrition Agent layout, reasoning / planning layers, and public API on mobile.

Related: [ARCHITECTURE.md](./ARCHITECTURE.md), [AGENT_FRAMEWORK.md](./AGENT_FRAMEWORK.md), [AGENT_RUNTIME.md](./AGENT_RUNTIME.md), [NUTRITION_INTELLIGENCE.md](./NUTRITION_INTELLIGENCE.md), [COACH_INTELLIGENCE.md](./COACH_INTELLIGENCE.md), [CONVERSATION_ORCHESTRATOR.md](./CONVERSATION_ORCHESTRATOR.md), [ACTION_ENGINE.md](./ACTION_ENGINE.md), [TOOL_RUNTIME.md](./TOOL_RUNTIME.md), [DECISIONS.md](./DECISIONS.md) (ADR-061).

---

## Architecture Summary

```
User Request
      ↓
Conversation Runtime
      ↓
Nutrition Agent
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
Nutrition Domain
```

Module: `app/src/features/nutrition-agent/`.

The Nutrition Agent is the intelligent nutrition specialist of EVOLVE. It specializes in nutritional reasoning, meal planning, macro distribution, dietary strategy, supplementation guidance, body composition support, and nutritional education.

It extends the Agent Framework via `NutritionFrameworkAgent` (`IAgent` adapter) and registers through the Agent Registry.

It consumes the complete AI Runtime but **owns no infrastructure**.

It does **not**:

- generate prompts
- call providers directly
- execute tools directly
- network / persist / render UI
- duplicate Nutrition Domain business logic

It **orchestrates** existing components and organizes domain knowledge before AI interaction.

---

## Integration

### Consumes

| Input | Source |
|-------|--------|
| Conversation Context | Conversation Orchestrator |
| Conversation Memory | Coach memory (turn counts / history) |
| CoachResponse | Response Formatter (optional handoff) |
| ActionPlan | Action Engine (optional handoff) |
| ToolExecutionResult | Tool Runtime (optional feedback) |
| Nutrition Domain facts | Existing nutrition modules (delegated, not duplicated) |
| Workout Agent contracts | Shared context only |

### Produces

| Output | Role |
|--------|------|
| **NutritionAgentResult** | Immutable primary agent output |
| NutritionPlan | Planning-only proposal |
| NutritionDecision / Recommendations / Explanation | Decision surface |
| NutritionValidation | Integrity checks |

---

## Module Layout

| Folder | Role |
|--------|------|
| `models/` | Immutable agent models |
| `agent/` | NutritionAgent, Engine, Coordinator, Session, State |
| `framework/` | `NutritionFrameworkAgent` — Agent Framework `IAgent` adapter |
| `orchestrator/` | Runtime artifact wiring |
| `reasoning/` | Deterministic reasoners (no AI) |
| `planning/` | Planners (no execution) |
| `strategies/` | Fat Loss / Muscle Gain / Maintenance / Recomp / Performance / Powerlifting / Hypertrophy / General Health / Contest Prep |
| `policies/` | Safety / Calorie / Macro / Meal / Hydration / Supplement / Adherence / Recovery Nutrition |
| `selectors/` | Intent / Goal / Strategy / Meal / Macro / Supplement / Recommendation / Preference / Constraint / Planner |
| `builders/` | Context / Plan / Recommendation / Meal / Macro builders |
| `validators/` | Calories / macros / meals / protein / fat / carbs / fiber / hydration / supplements / diet / constraints / preferences / safety |
| `services/` | NutritionAgentService (`asFrameworkAgent` / `registerWithFramework`) |
| `application/` | Public API only |
| `utils/` | Calorie/Macro/Meal/Hydration/BodyComposition helpers, FreezeNutritionState |

---

## Reasoning Layer

Deterministic modules that organize domain knowledge **before** AI interaction:

- CalorieReasoner, MacroReasoner, MealTimingReasoner
- BodyCompositionReasoner, EnergyBalanceReasoner
- ProteinReasoner, CarbohydrateReasoner, FatReasoner, FiberReasoner
- HydrationReasoner, SupplementReasoner, AdherenceReasoner
- EducationReasoner, GoalReasoner

No AI. No provider logic.

---

## Planning Layer

Planners produce planning decisions only:

- NutritionPlanner, MealPlanner, MacroPlanner, CaloriePlanner
- HydrationPlanner, SupplementPlanner, DietPhasePlanner
- RefeedPlanner, ReverseDietPlanner, CutPlanner, BulkPlanner, MaintenancePlanner

No execution. No tool calls.

---

## Public API

```ts
processNutritionRequest()
buildNutritionPlan()
evaluateNutrition()
describeNutritionCapabilities()
validateNutritionPlan()
```

Internals (reasoners, planners, policies, engine) are not part of the public surface.

---

## Design Rules

- No OpenAI SDK / provider-specific logic
- No networking / persistence / UI
- No business logic duplication — delegate to existing Nutrition Domain modules whenever possible
- Nutrition Agent is an **orchestrator**, not a replacement for the Nutrition Domain
