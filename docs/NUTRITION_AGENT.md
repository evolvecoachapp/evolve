# Nutrition Agent

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-23  
**Purpose:** Document the Nutrition Agent as a specialized framework agent that orchestrates the nutrition domain.  
**Source of Truth:** Yes — for Nutrition Agent layout, domain orchestration, reasoning / planning layers, and public API on mobile.

Related: [ARCHITECTURE.md](./ARCHITECTURE.md), [AGENT_FRAMEWORK.md](./AGENT_FRAMEWORK.md), [AGENT_RUNTIME.md](./AGENT_RUNTIME.md), [NUTRITION_INTELLIGENCE.md](./NUTRITION_INTELLIGENCE.md), [COACH_INTELLIGENCE.md](./COACH_INTELLIGENCE.md), [CONVERSATION_ORCHESTRATOR.md](./CONVERSATION_ORCHESTRATOR.md), [ACTION_ENGINE.md](./ACTION_ENGINE.md), [TOOL_RUNTIME.md](./TOOL_RUNTIME.md), [DECISIONS.md](./DECISIONS.md) (ADR-061).

---

## Architecture Summary

```
Agent Runtime
      ↓
Nutrition Framework Agent
      ↓
Nutrition Domain Gateway
      ↓
Domain Capability Selector
      ↓
Nutrition Domain
      ↓
NutritionAgentResult
```

Module: `app/src/features/nutrition-agent/`.

The Nutrition Agent is a specialized framework agent. It orchestrates existing (or future) nutrition domain capabilities and returns an immutable `NutritionAgentResult`.

It contains **no** business logic, provider logic, prompts, networking, persistence, or memory.

It **does**:

- receive nutrition requests
- build execution / planning context
- select domain capabilities
- invoke Nutrition Domain ports when payloads are supplied
- collect immutable orchestration results
- return `NutritionAgentResult`

It **does not**:

- generate prompts
- call AI providers
- execute tools directly
- network / persist / render UI
- duplicate domain calculations

---

## Execution Flow

1. **Agent Runtime** selects / executes `NutritionFrameworkAgent` (`IAgent`).
2. **Nutrition Framework Agent** adapts the immutable Nutrition Agent descriptor.
3. **Nutrition Domain Gateway** translates agent intent into domain orchestration.
4. **NutritionCapabilitySelector** resolves intent → capabilities (`GenerateNutritionPlan`, `AdjustMacros`, `AnalyzeNutrition`, `MealTiming`, `HydrationGuidance`, `SupplementGuidance`).
5. **Nutrition Domain** ports are invoked when matching payloads are present (otherwise skipped — contracts only when engines are not yet implemented).
6. **Nutrition Result** is frozen as `NutritionAgentResult` (includes `domainInvocations`).

---

## Capability Matrix

| Intent | Capabilities |
|--------|--------------|
| `plan_nutrition` | GenerateNutritionPlan, MealTiming, HydrationGuidance |
| `adjust_macros` | AdjustMacros, AnalyzeNutrition |
| `meal_timing` | MealTiming, GenerateNutritionPlan |
| `supplementation` | SupplementGuidance, AnalyzeNutrition |
| `hydration` | HydrationGuidance |
| `evaluate_plan` | AnalyzeNutrition, AdjustMacros |
| `body_composition` | AnalyzeNutrition, AdjustMacros, GenerateNutritionPlan |
| `education` / `unknown` | AnalyzeNutrition |

Future capabilities are appended to `NutritionCapabilities` and mapped in `NutritionCapabilitySelector` without changing existing entries.

---

## Integration

### Consumes (existing / future Nutrition Domain — not modified)

| Capability | Role |
|------------|------|
| GenerateNutritionPlan | Plan generation when `generatePlanRequest` + port provided |
| AdjustMacros | Macro adjustment when `adjustMacrosRequest` + port provided |
| AnalyzeNutrition | Analysis when `analyzeRequest` + port provided |
| MealTiming | Meal timing when `mealTimingRequest` + port provided |
| HydrationGuidance | Hydration when `hydrationRequest` + port provided |
| SupplementGuidance | Supplements when `supplementRequest` + port provided |

Also consumes Conversation Context / optional CoachResponse / ActionPlan / ToolExecutionResult for planning context only.

### Produces

| Output | Role |
|--------|------|
| **NutritionAgentResult** | Immutable primary agent output |
| NutritionPlan / NutritionPlanSummary | Planning-only proposal / summary |
| NutritionDomainInvocation[] | Selected / invoked / skipped domain capability records |
| NutritionEvaluation / NutritionValidation | Integrity checks |

---

## Module Layout

| Folder | Role |
|--------|------|
| `models/` | Immutable agent + domain invocation models |
| `agent/` | NutritionAgent facade, Engine, Coordinator, Session, State |
| `framework/` | `NutritionFrameworkAgent` — Agent Framework `IAgent` adapter |
| `orchestrator/` | Runtime wiring + `NutritionDomainGateway` |
| `reasoning/` | Deterministic reasoners (no AI) |
| `planning/` | Planners (no execution) |
| `strategies/` | Fat Loss / Muscle Gain / Maintenance / Recomp / Performance / … |
| `policies/` | Safety / Calorie / Macro / Meal / Hydration / Supplement / Adherence / Recovery Nutrition |
| `selectors/` | Intent / Goal / Strategy / Meal / Macro / Supplement / **NutritionCapabilitySelector** |
| `builders/` | Context / Plan / Recommendation / **Request** / **Result** builders |
| `validators/` | Request / capability / gateway / execution context / result / plan validators |
| `services/` | NutritionAgentService |
| `application/` | Public API only |
| `utils/` | Helpers, FreezeNutritionState |

---

## Public API

```ts
processNutritionRequest()
buildNutritionPlan()
adjustNutritionPlan()
evaluateNutrition()
describeNutritionCapabilities()
validateNutritionPlan()
```

Internals (reasoners, planners, policies, domain gateway, engine) are not part of the public surface.

---

## Design Rules

- No OpenAI SDK / provider-specific logic
- No networking / persistence / UI
- No business logic duplication — delegate to Nutrition Domain ports / contracts
- Nutrition Agent is an **orchestrator**, not a replacement for the Nutrition Domain
- Domain payloads are supplied by callers — the agent never fabricates engine inputs
