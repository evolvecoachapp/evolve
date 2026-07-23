# Action Engine

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-23  
**Purpose:** Document the AI Action Engine foundation (Sprint 20.3 / Sprint 20.0 scope).  
**Source of Truth:** Yes — for Action Engine layout, ActionPlan model, Action Planning, and Execution Pipeline contracts on mobile.

Related: [ARCHITECTURE.md](./ARCHITECTURE.md), [ACTION_PLANNING.md](./ACTION_PLANNING.md), [RESPONSE_FORMATTER.md](./RESPONSE_FORMATTER.md), [AI_EXECUTION_PIPELINE.md](./AI_EXECUTION_PIPELINE.md), [TOOL_CALLING_FOUNDATION.md](./TOOL_CALLING_FOUNDATION.md), [DOMAIN_TOOL_ADAPTERS.md](./DOMAIN_TOOL_ADAPTERS.md), [DECISIONS.md](./DECISIONS.md) (ADR-057).

---

## Architecture Summary

```
CoachResponse
      ↓
Action Engine
      ↓
ActionPlan
      ↓
Tool Runtime
      ↓
Domain Tool Adapters
      ↓
Domain Platform
```

Module: `app/src/features/action-engine/`.

Transforms an immutable `CoachResponse` into an immutable `ActionPlan`.

It consumes:

- immutable `CoachResponse` from Response Formatter

It produces:

- immutable `ActionPlan` / `ActionPackage` / `ActionSnapshot` / `ActionExecutionPlan`
- planning validation + summary + metrics

It is **not**:

- domain execution
- networking
- persistence
- provider SDK usage
- AI calls
- business / coaching logic
- tool invocation

It only prepares immutable execution plans for future runtimes.

---

## Action Plan

`ActionPlan` is the structured planning contract between AI reasoning and executable application behavior.

| Model | Role |
|-------|------|
| **ActionPlan** | Immutable root execution plan |
| **ActionStep** | Single planned step |
| **ActionIntent** | High-level planning intent |
| **ActionType** | Action taxonomy |
| **ActionTarget** | Target resource descriptor |
| **ActionArgument** | Named step argument |
| **ActionConstraint** | Planning constraint |
| **ActionPriority** | Priority level |
| **ActionDependency** | Dependency edge |
| **ActionStatus** | Plan-time status |
| **ActionMetadata** | Tags / attributes |
| **ActionSummary** | Compact summary |
| **ActionSnapshot** | Plan + summary + statistics |
| **ActionExecutionPlan** | Ordered handoff for future runtime |
| **ActionProposal** | Ranked candidates |
| **ActionCandidate** | Pre-selection candidate |
| **ActionValidation** | Integrity validation result |
| **ActionStatistics** | Aggregate counts |
| **ActionContext** | Planning context from CoachResponse |
| **ActionPackage** | Full pipeline package |

All models are immutable (`readonly` + `Object.freeze`).

---

## Action Planning

See [ACTION_PLANNING.md](./ACTION_PLANNING.md) for planner / selector / policy detail.

Pipeline:

```
CoachResponse
      ↓
ActionContext
      ↓
PlannerSelector → domain planners / CompositePlanner
      ↓
ActionSteps
      ↓
Policies (conflict / priority / dependency / safety / execution)
      ↓
ActionPlanBuilder
      ↓
Validators
      ↓
ActionPackage (+ optional ActionExecutionPlan)
```

---

## Execution Pipeline

Contracts only — Action Engine does **not** execute.

```
ActionPlan
      ↓
ExecutionPolicy.canPrepare
      ↓
PlanningActionExecutor.prepare
      ↓
ExecutionRequest + ActionExecutionPlan
      ↓
Tool Runtime (implements ActionExecutor.execute)
      ↓
Domain Tool Adapters
```

See [TOOL_RUNTIME.md](./TOOL_RUNTIME.md).

| Contract | Role |
|----------|------|
| **ActionExecutor** | Prepare / future execute interface |
| **ExecutionContext** | Runtime context |
| **ExecutionStrategy** | Ordering strategy |
| **ExecutionRequest** | Prepared request |
| **ExecutionResult** | Future result shape |

---

## Module Layout

| Folder | Role |
|--------|------|
| **models/** | Immutable ActionPlan models |
| **actions/** | Immutable action definitions (metadata only) |
| **planners/** | Deterministic planners → ActionSteps |
| **builders/** | Immutable builders |
| **validators/** | Integrity validation (no execution checks) |
| **selectors/** | Deterministic selectors |
| **policies/** | Structural policies (no business logic) |
| **executors/** | Execution abstractions (contracts only) |
| **services/** | `ActionEngineService` coordination |
| **application/** | Public API surface |
| **utils/** | Freeze / dependency / priority / metrics helpers |

---

## Application API

| Function | Role |
|----------|------|
| `buildActionPlan(options)` | `CoachResponse` → `ActionPackage` |
| `validateActionPlan(options)` | `ActionPlan` → `ActionValidation` |
| `summarizeActionPlan(options)` | `ActionPlan` → `ActionSummary` |
| `estimateExecution(options)` | `ActionPlan` → `PlanMetrics` |
| `describeActions(options)` | `ActionPlan` → brief step descriptions |

Internals (planners, selectors, policies) are not part of the public application surface.

---

## Integration

| Direction | Contract |
|-----------|----------|
| Consumes | `CoachResponse` (`features/response-formatter`) |
| Produces | `ActionPlan` / `ActionPackage` |
| Compatible with | Conversation Memory, Response Formatter, Tool Runtime, Future Agent Runtime |
| Must not | Execute domain tools, call providers, persist state |

---

## Design Rules

- No domain execution
- No networking
- No persistence
- No provider SDK
- No AI calls
- No business logic
- Only immutable action planning
