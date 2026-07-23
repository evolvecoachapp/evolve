# AI Execution Pipeline

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-23  
**Purpose:** Document the AI Execution Pipeline foundation (Sprint 19.4).  
**Source of Truth:** Yes — for AI Execution Pipeline layout, Execution Lifecycle, Future Retry, and Future Tool Calling on mobile. Streaming is documented in [STREAMING_FOUNDATION.md](./STREAMING_FOUNDATION.md).

Related: [ARCHITECTURE.md](./ARCHITECTURE.md), [AI_PROVIDER_ABSTRACTION.md](./AI_PROVIDER_ABSTRACTION.md), [OPENAI_PROVIDER.md](./OPENAI_PROVIDER.md), [PROMPT_COMPOSITION.md](./PROMPT_COMPOSITION.md), [AI_SYSTEM.md](./AI_SYSTEM.md), [DECISIONS.md](./DECISIONS.md) (ADR-051).

---

## Architecture Summary

```
Prompt Package
      ↓
AI Execution Pipeline
      ↓
AI Provider
      ↓
AI Response
```

This layer orchestrates AI execution independently of any provider.

It consumes:

- immutable `PromptPackage` (required)
- AI Provider Abstraction (`IAIProviderRegistry`, standardized `AIResponse`)
- provider-agnostic executors (e.g. wrapped OpenAI Provider)

It produces:

- immutable `AIExecutionRequest` / `AIExecutionContext` / `AIExecutionResult`
- lifecycle + trace + metrics + summary

It is **not**:

- business / coaching logic
- provider-specific mapping or SDK usage
- streaming
- retry algorithms
- tool calling
- memory
- HTTP

Module: `app/src/features/ai-execution/`.

---

## AI Execution Pipeline

`AIExecutionPipeline` responsibilities:

1. Validate request  
2. Create execution context  
3. Resolve provider (+ executor)  
4. Execute provider  
5. Collect metrics  
6. Build result  

Stages (one responsibility each):

| Stage | Role |
|-------|------|
| **ValidationStage** | Validate execution request |
| **ContextStage** | Create pipeline execution context |
| **ProviderResolutionStage** | Resolve registry provider + executor |
| **ExecutionStage** | Invoke provider-agnostic executor |
| **ResultStage** | Build immutable result |
| **LifecycleStage** | Finalize lifecycle events / status |

No provider-specific code lives in the pipeline.

### Models

| Model | Role |
|-------|------|
| **AIExecutionRequest** | Immutable pipeline request over PromptPackage |
| **AIExecutionResult** | Immutable outcome (response / error / metrics / trace) |
| **AIExecutionContext** | Pipeline lifecycle context (distinct from ai-provider prep context) |
| **AIExecutionStage** | Named stage identifiers |
| **AIExecutionState** | Status + stage snapshot |
| **AIExecutionStatus** | pending → … → succeeded / failed / cancelled / timed_out |
| **AIExecutionLifecycle** | Completed stages + events |
| **AIExecutionTrace** | Ordered stage steps |
| **AIExecutionMetrics** | Duration / latency / token usage placeholders |
| **AIExecutionMetadata** | Tags + attributes |
| **AIExecutionError** | Hard pipeline failure |
| **AIExecutionEvent** | Lifecycle event |
| **AIExecutionCancellation** | Cancellation descriptor (policy only) |
| **AIExecutionTimeout** | Timeout descriptor (policy only) |
| **AIExecutionPolicy** | Retry / timeout / cancellation / execution policy bundle |
| **AIExecutionSummary** | Compact result summary |

### Policies (interfaces only)

| Policy | Role |
|--------|------|
| `RetryPolicy` | enabled / maxAttempts / backoffMs — **no algorithm yet** |
| `TimeoutPolicy` | enabled / timeoutMs — **no enforcement yet** |
| `CancellationPolicy` | enabled / token — **no algorithm yet** |
| `ExecutionPolicy` | allowStreaming / allowTools / requireProvider (streaming & tools off) |

### Provider execution boundary

Concrete providers are **not** imported into pipeline stages.

`IAIProviderExecutor` is a provider-agnostic adapter:

- Pipeline resolves executor by `providerId`
- OpenAI (and future vendors) are wrapped externally: `executor.execute(...)` → `OpenAIProvider.execute(...)`
- Previous domains are not modified

---

## Execution Lifecycle

```
pending
  → validating
  → preparing
  → resolving_provider
  → executing
  → building_result
  → succeeded | failed | cancelled | timed_out
```

Trace records each stage with status, timestamps, and soft validation issues.  
Lifecycle accumulates completed stages and completion events.  
Failures are returned as immutable `AIExecutionResult` (not uncaught throws from the public API).

---

## Public Application API

| Function | Role |
|----------|------|
| `executeAI(options)` | PromptPackage → pipeline → `AIExecutionResult` |
| `createExecutionContext(options)` | Build context without executing |
| `summarizeExecution(options)` | Compact `AIExecutionSummary` |

Pipeline / stage internals are not part of the public API surface.

---

## Future Streaming

Implemented as a dedicated layer in Sprint 20.0 — see [STREAMING_FOUNDATION.md](./STREAMING_FOUNDATION.md).

| Concern | Status |
|---------|--------|
| Policy | `ExecutionPolicy.allowStreaming` remains gated in the pipeline; Streaming Foundation owns stream lifecycle |
| Request options | Non-streaming `executeAI` path unchanged; streaming uses `startStream` |
| Stages | Chunk aggregation lives in Streaming Foundation (not pipeline stages) |
| Provider | Streaming Foundation consumes provider-agnostic `IStreamSource` (wraps `IAIStreamingProvider` externally) |
| Rules | Keep non-streaming path in the pipeline; no HTTP/SSE inside the pipeline |

---

## Future Retry

Reserved architecture only in this sprint.

| Concern | Future |
|---------|--------|
| Policy | Implement algorithms against `RetryPolicy` |
| Metrics | Increment `attemptCount` per attempt |
| Trace | Record per-attempt steps |
| Rules | Keep retry logic out of providers; pipeline owns attempts |

---

## Future Tool Calling

Tool execution is owned by [TOOL_CALLING_FOUNDATION.md](./TOOL_CALLING_FOUNDATION.md) (Sprint 20.1).

| Concern | Status / Future |
|---------|-----------------|
| Foundation | Implemented in `features/tool-calling` |
| Policy | Flip `ExecutionPolicy.allowTools` when pipeline tool-loop is wired |
| Stages | Optional tool-loop stage after provider response (future) |
| Provider | Capability-gated tools via abstraction contracts |
| Rules | No tool registry / execution inside AI Execution Pipeline — delegate to Tool Calling Foundation |

---

## Action Engine Handoff

Downstream of provider execution, Response Formatter produces `CoachResponse`, then [ACTION_ENGINE.md](./ACTION_ENGINE.md) prepares an immutable `ActionPlan` for Future Tool Runtime. AI Execution Pipeline does **not** plan or execute domain actions — Action Engine owns planning; Tool Calling / Domain Tool Adapters own future execution.

| Concern | Owner |
|---------|-------|
| Prompt → AIResponse | AI Execution Pipeline |
| AIResponse → CoachResponse | Response Formatter |
| CoachResponse → ActionPlan | Action Engine |
| ActionPlan → domain tools | Future Tool Runtime + Domain Tool Adapters |

See also: [ACTION_PLANNING.md](./ACTION_PLANNING.md).

---

## Explicit Non-Goals

No streaming implementation inside the pipeline (see Streaming Foundation). No retry implementation. No tool calling. No memory. No HTTP. No provider-specific code. Pipeline only. Does not modify Prompt Composition, AI Provider Abstraction, or OpenAI Provider. Does not implement Action Engine planning.
