# Tool Runtime

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-23  
**Purpose:** Document the Tool Runtime Engine foundation (Sprint 20.1).  
**Source of Truth:** Yes — for Tool Runtime layout, Execution Pipeline, and Execution Flow on mobile.

Related: [ARCHITECTURE.md](./ARCHITECTURE.md), [ACTION_ENGINE.md](./ACTION_ENGINE.md), [DOMAIN_TOOL_ADAPTERS.md](./DOMAIN_TOOL_ADAPTERS.md), [TOOL_CALLING_FOUNDATION.md](./TOOL_CALLING_FOUNDATION.md), [DECISIONS.md](./DECISIONS.md) (ADR-058).

---

## Architecture Summary

```
ActionPlan
      ↓
Tool Runtime
      ↓
Tool Resolver
      ↓
Execution Pipeline
      ↓
Domain Tool Adapters
      ↓
Domain Platform
      ↓
Tool Results
      ↓
Execution Result
```

Module: `app/src/features/tool-runtime/`.

Receives an immutable `ActionPlan` and coordinates `ActionStep` execution through existing Domain Tool Adapters.

It consumes:

- immutable `ActionPlan` from Action Engine
- Domain Tool Adapters (`IDomainToolAdapter`) — injected / mocked in tests

It produces:

- immutable `ToolExecutionPlan` / `ToolExecutionResult` / `ToolRuntimePackage`
- execution validation + summary + metrics

It is **not**:

- domain business logic
- direct domain service calls (adapters only)
- networking
- persistence
- provider SDKs / OpenAI
- Prompt Builder / Conversation logic

It only orchestrates execution.

---

## Tool Runtime

| Component | Role |
|-----------|------|
| **ToolRuntimeEngine** | Top-level orchestrator |
| **ExecutionPipeline** | Resolve order → dispatch → aggregate |
| **ExecutionCoordinator** | Aggregate pipeline outputs → `ToolExecutionResult` |
| **ExecutionScheduler** | Deterministic step ordering |
| **ExecutionContextManager** | Immutable execution state snapshots |

### Models

| Model | Role |
|-------|------|
| **ToolRuntime** | Runtime configuration descriptor |
| **ToolExecutionPlan** | Ordered runtime plan from ActionPlan |
| **ToolExecutionStep** | Resolved step + adapter/tool binding |
| **ToolExecutionRequest** | Pipeline input |
| **ToolExecutionContext** | Orchestration context (distinct from tool-calling context) |
| **ToolExecutionState** | Progress snapshot |
| **ToolExecutionStatus** | pending / ready / running / succeeded / failed / skipped / cancelled / blocked |
| **ToolExecutionResult** | Aggregate execution outcome |
| **ToolExecutionSummary** | Compact summary |
| **ToolExecutionSnapshot** | Plan + summary + statistics |
| **ToolExecutionStatistics** | Aggregate counts |
| **ToolExecutionMetadata** | Tags / attributes |
| **ToolResult** | success / failure / skipped |
| **ToolSuccess** / **ToolFailure** | Per-step payloads |
| **ToolDispatchResult** | Dispatcher routing outcome |
| **ToolPipelineResult** | Pipeline aggregate |
| **ToolRuntimePackage** | Full orchestration package |

All models are immutable (`readonly` + `Object.freeze`).

---

## Execution Pipeline

```
ToolExecutionRequest
      ↓
ExecutionScheduler (order)
      ↓
For each ToolExecutionStep
      ↓
ToolDispatcher (route only)
      ↓
Domain Tool Adapter.execute(ToolCallRequest)
      ↓
ToolResult
      ↓
FailurePolicy (abort / continue)
      ↓
ToolPipelineResult
      ↓
ExecutionCoordinator → ToolExecutionResult
```

Pipeline responsibilities:

1. Schedule steps (dependency order)
2. Skip unresolved / dependency-blocked steps
3. Dispatch resolved steps to adapters
4. Collect immutable `ToolResult`s
5. Aggregate into `ToolExecutionResult`

No business logic inside the pipeline.

---

## Execution Flow

```
1. buildExecutionPlan(ActionPlan)
      → ToolResolver maps ActionType → toolId → adapter
      → ToolExecutionPlan (immutable)

2. validateExecution(plan[, context])
      → integrity / dependencies / order / adapters / pipeline consistency

3. executeActionPlan(ActionPlan)
      → build plan + context + request
      → ExecutionPipeline.run
      → ToolRuntimePackage { plan, request, result, snapshot, validation }
```

Resolver architecture (no execution):

| Resolver | Role |
|----------|------|
| **ActionResolver** | ActionType → Domain Tool Id |
| **AdapterResolver** | toolId / adapterId → `IDomainToolAdapter` |
| **CapabilityResolver** | Availability check |
| **ToolResolver** | Facade: ActionStep → binding |

Dispatcher (routing only):

| Type | Role |
|------|------|
| **ToolDispatcher** | Route step → adapter.execute |
| **DispatchContext** | Routing context |
| **DispatchPolicy** | Accept / reject |
| **ToolDispatchResult** | Routing outcome |

---

## Module Layout

| Folder | Role |
|--------|------|
| **models/** | Immutable execution models |
| **runtime/** | Engine, coordinator, scheduler, context manager |
| **pipeline/** | Execution Pipeline |
| **resolver/** | Action / Adapter / Capability / Tool resolvers |
| **dispatch/** | Dispatcher + dispatch policy |
| **builders/** | Immutable builders |
| **validators/** | Plan / context / deps / order / adapters / integrity |
| **executors/** | Sequential / Parallel / Conditional / Composite (contracts) |
| **policies/** | Retry / Timeout / Ordering / Failure / Recovery / Safety |
| **selectors/** | Executor / Adapter / Pipeline / Policy / Strategy |
| **services/** | `ToolRuntimeService` |
| **application/** | Public API surface |
| **utils/** | Freeze / metrics / dependency / pipeline helpers |

---

## Application API

| Function | Role |
|----------|------|
| `executeActionPlan(options)` | `ActionPlan` → `ToolRuntimePackage` |
| `buildExecutionPlan(options)` | `ActionPlan` → `ToolExecutionPlan` |
| `validateExecution(options)` | plan → `ToolExecutionValidation` |
| `estimateExecution(options)` | plan → `ExecutionMetrics` |
| `describeRuntime(options)` | → `ToolRuntime` |

Internal engines, resolvers, and pipelines are not part of the public application surface.

---

## Integration

| Direction | Contract |
|-----------|----------|
| Consumes | `ActionPlan` (`features/action-engine`) |
| Uses | Domain Tool Adapters (`features/domain-tools`) |
| Produces | `ToolExecutionResult` / `ToolRuntimePackage` |
| Must not | Contain domain business logic, call providers, persist state, network |

Tests inject mock Domain Tool Adapters and never execute real domain services.

---

## Design Rules

- No OpenAI logic
- No Prompt Builder logic
- No Conversation logic
- No domain business logic
- No networking
- No persistence
- Only runtime orchestration
