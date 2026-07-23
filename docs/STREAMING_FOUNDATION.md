# Streaming Foundation

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-23  
**Purpose:** Document the Streaming Foundation (Sprint 20.0).  
**Source of Truth:** Yes — for Streaming Foundation layout, Stream Lifecycle, and Future Tool Calling Integration on mobile.

Related: [ARCHITECTURE.md](./ARCHITECTURE.md), [AI_EXECUTION_PIPELINE.md](./AI_EXECUTION_PIPELINE.md), [AI_PROVIDER_ABSTRACTION.md](./AI_PROVIDER_ABSTRACTION.md), [AI_SYSTEM.md](./AI_SYSTEM.md), [DECISIONS.md](./DECISIONS.md) (ADR-052).

---

## Architecture Summary

```
AI Execution Pipeline
      ↓
Streaming Engine
      ↓
Streaming Provider
      ↓
Provider Stream
      ↓
Stream State
```

This layer coordinates provider streaming independently of any AI provider.

It consumes:

- AI Execution Pipeline (optional `executionRequestId` link)
- AI Provider Abstraction (`AIProviderId`, streaming-capable source boundary)

It produces:

- immutable `StreamRequest` / `StreamState` / `StreamResponse` / `StreamSnapshot`
- lifecycle + events + metrics + trace + summary

It is **not**:

- OpenAI (or any vendor) streaming SDK usage
- memory
- tool calling
- conversation history
- provider-specific mapping
- HTTP / SSE transport

Module: `app/src/features/streaming/`.

---

## Streaming Engine

`StreamingEngine` responsibilities:

1. Start stream  
2. Receive events (chunks / tokens / lifecycle)  
3. Aggregate chunks  
4. Update immutable stream state  
5. Complete stream  
6. Handle cancellation / failure  

No provider-specific code lives in the engine.

Concrete providers are **not** imported. They are wrapped externally via `IStreamSource`:

- Engine resolves source by `providerId`
- Source yields provider-agnostic `StreamChunk` values
- OpenAI (and future vendors) adapt outside this module

### Models

| Model | Role |
|-------|------|
| **StreamRequest** | Immutable stream request (optional execution link) |
| **StreamResponse** | Aggregated immutable response |
| **StreamChunk** | Ordered text delta |
| **StreamToken** | Token derived from chunk delta (split aggregation only) |
| **StreamEvent** / **StreamEventType** | Event-driven lifecycle/progress events |
| **StreamState** | Immutable stream state snapshot |
| **StreamStatus** | pending → … → completed / cancelled / failed |
| **StreamLifecycle** | Events + timestamps |
| **StreamMetadata** | Tags + attributes |
| **StreamMetrics** | Chunk/token/content/duration metrics |
| **StreamTrace** | Ordered trace steps |
| **StreamCancellation** | Cancellation descriptor |
| **StreamCompletion** | Completion descriptor |
| **StreamSummary** | Compact summary |
| **StreamSnapshot** | State + response + summary |
| **StreamError** | Hard streaming failure |

### Events

| Event | When |
|-------|------|
| `stream_started` | Stream lifecycle begins |
| `chunk_received` | Chunk aggregated |
| `token_received` | Token(s) derived from chunk |
| `heartbeat` | Progress heartbeat while streaming |
| `progress_updated` | Content/chunk/token progress |
| `stream_completed` | Successful completion |
| `stream_cancelled` | Cancellation |
| `stream_failed` | Failure |

### Handlers

| Handler | Responsibility |
|---------|----------------|
| **LifecycleHandler** | Start / heartbeat / progress |
| **ChunkHandler** | Chunk aggregation + `chunk_received` |
| **TokenHandler** | Token aggregation + `token_received` |
| **CompletionHandler** | Successful completion |
| **CancellationHandler** | Cancellation |
| **ErrorHandler** | Failure |

### Aggregators

| Aggregator | Role |
|------------|------|
| **ChunkAggregator** | Ordered chunk list + content concat |
| **TokenAggregator** | Whitespace-split tokens from deltas |
| **SummaryAggregator** | Compact `StreamSummary` |

No business / coaching logic in aggregators.

### Validators

| Validator | Role |
|-----------|------|
| Chunk order | Indexes non-decreasing, no duplicates |
| State transitions | Allowed status graph |
| Completion integrity | Completed ⇒ completion fields |
| Cancellation | Cancelled ⇒ cancellation consistency |
| Lifecycle consistency | Terminal status ⇔ matching events |

---

## Stream Lifecycle

```
pending
  → starting
  → streaming
  → completing
  → completed

(from pending|starting|streaming)
  → cancelled | failed
```

Trace records lifecycle and chunk/token steps.  
Lifecycle accumulates events.  
Failures and cancellations are returned as immutable `StreamSnapshot` (public API does not throw for source failures after start).

---

## Public Application API

| Function | Role |
|----------|------|
| `startStream(options)` | Start stream → `StreamSnapshot` |
| `cancelStream(options)` | Cancel active stream by id |
| `summarizeStream(options)` | Compact `StreamSummary` |

Engine / handler internals are not part of the public API surface.

---

## Future Tool Calling Integration

Tool execution is owned by [TOOL_CALLING_FOUNDATION.md](./TOOL_CALLING_FOUNDATION.md) (Sprint 20.1).

| Concern | Status / Future |
|---------|-----------------|
| Foundation | Implemented in `features/tool-calling` (`executeTool` / registry / executor) |
| Events | Optional tool-call / tool-result stream events (still future on Streaming Foundation) |
| Handlers | ToolCallHandler after token/chunk aggregation (future) |
| State | Tool call buffers on `StreamState` (separate from content) (future) |
| Rules | Keep tool execution out of Streaming Foundation; Tool Calling Foundation owns tools |
| Provider | Capability-gated via AI Provider Abstraction; map vendor calls → `ToolCallRequest` externally |

---

## Explicit Non-Goals

No OpenAI streaming implementation. No memory. No tool calling. No conversation history. No provider-specific code. Streaming infrastructure only. Does not modify AI Execution Pipeline, AI Provider Abstraction, or OpenAI Provider.
