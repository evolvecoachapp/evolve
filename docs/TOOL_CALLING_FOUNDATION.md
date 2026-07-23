# Tool Calling Foundation

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-23  
**Purpose:** Document the Tool Calling Foundation (Sprint 20.1).  
**Source of Truth:** Yes — for Tool Calling Foundation layout, Tool Registry, Execution Flow, and Future Domain Tool Integration on mobile.

Related: [ARCHITECTURE.md](./ARCHITECTURE.md), [STREAMING_FOUNDATION.md](./STREAMING_FOUNDATION.md), [AI_EXECUTION_PIPELINE.md](./AI_EXECUTION_PIPELINE.md), [AI_PROVIDER_ABSTRACTION.md](./AI_PROVIDER_ABSTRACTION.md), [AI_SYSTEM.md](./AI_SYSTEM.md), [DECISIONS.md](./DECISIONS.md) (ADR-053).

---

## Architecture Summary

```
Streaming Engine
      ↓
Tool Calling Engine
      ↓
Tool Registry
      ↓
Tool Executor
      ↓
Domain Tools
      ↓
Tool Result
      ↓
AI Response
```

This layer allows AI providers to invoke domain capabilities through a **provider-independent** tool execution layer.

- The LLM **never** executes business logic directly.
- The LLM **only** requests tool execution.
- The **domain** remains the source of truth.

It consumes:

- Streaming Foundation (optional `streamId` on execution context)
- AI Execution Pipeline (optional `executionRequestId` link)
- AI Provider Abstraction (provider-agnostic tool-call requests only)

It produces:

- immutable `ToolCallRequest` / `ToolEngineResult` / `ToolCallResponse`
- registry snapshots + tool descriptors
- immutable execution results

It is **not**:

- OpenAI (or any vendor) function-calling SDK usage
- Workout / Recovery / Nutrition / Coach domain implementations
- business logic inside the foundation
- provider-specific mapping

Module: `app/src/features/tool-calling/`.

---

## Tool Calling Engine

`ToolCallingEngine` responsibilities:

1. Validate tool request  
2. Resolve tool from registry  
3. Prepare execution context  
4. Invoke executor  
5. Collect execution result  

No provider-specific code lives in the engine.

### Models

| Model | Role |
|-------|------|
| **ToolDefinition** | Full immutable catalog entry (id, schema, category, capabilities) |
| **ToolDescriptor** | Lightweight catalog view |
| **ToolCategory** | query / mutation / utility / system / domain / unknown |
| **ToolCapability** | Capability tags (foundation + reserved domain tags) |
| **ToolCall** | Immutable call requested by an AI layer |
| **ToolCallRequest** | Call + context + metadata |
| **ToolCallResponse** | Completed call response |
| **ToolExecution** | Execution record |
| **ToolExecutionContext** | Conversation / stream / execution links + `now` |
| **ToolExecutionStatus** | pending → … → succeeded / failed / cancelled |
| **ToolExecutionResult** | Output / error / status / duration |
| **ToolExecutionMetadata** | Tags + attributes + version |
| **ToolExecutionError** | Immutable error snapshot |
| **ToolInput** / **ToolOutput** | Parameter map / data payload |
| **ToolParameter** / **ToolSchema** | Schema descriptors |
| **ToolResult** | Legacy Conversation/Workflow result shape (preserved) |
| **FoundationToolResult** | Executor orchestration result |
| **ToolRegistrySnapshot** | Frozen registry view |
| **ToolEngineResult** | Engine return value |

### Contracts

| Contract | Role |
|----------|------|
| **ITool** | Domain tool interface (no implementations in foundation) |
| **IToolExecutor** | Execute tool → immutable result |
| **IToolRegistry** | Register / resolve / list / availability / category |
| **IToolValidator** | Validation surface |
| **IToolProvider** | Optional seeding provider (not an AI vendor) |

### Registry

`FoundationToolRegistry` / `InMemoryToolRegistry` responsibilities:

- Register tools  
- Resolve tools  
- List tools / descriptors / definitions  
- Validate availability  
- Group by category  
- Snapshot  

No business logic.

Legacy `AITool` registration remains for Conversation / Workflow compatibility and is adapted into `ITool` for foundation resolve paths.

### Executor

`FoundationToolExecutor` responsibilities:

- Execute tool  
- Return immutable `FoundationToolResult`  
- No domain implementation — orchestration only  

### Validators

| Validator | Role |
|-----------|------|
| Tool id | Non-empty, normalized format |
| Parameters | Required / unknown against schema |
| Schemas | Parameter name/type integrity |
| Execution context | `now` + attributes shape |
| Registry integrity | Uniqueness / id / definition alignment |
| Execution result | Status / output / error consistency |
| Call request | Request + call + input + context |

### Builders

| Builder | Role |
|---------|------|
| **ToolCallBuilder** | Immutable `ToolCall` |
| **ToolExecutionContextBuilder** | Immutable context |
| **ToolResultBuilder** | Immutable `ToolExecutionResult` |
| **ToolCallRequestBuilder** | Immutable request |

---

## Execution Flow

```
ToolCallRequest
  → validateCallRequest
  → registry.resolve(toolId)
  → validate parameters vs ToolSchema
  → prepare ToolExecutionContext
  → FoundationToolExecutor.execute(ITool)
  → ToolExecutionResult
  → ToolEngineResult (response + execution + descriptor)
```

Failures (invalid request, missing tool, invalid parameters, tool throw) return immutable failed `ToolEngineResult` — they do not throw for normal execution failures after request acceptance.

---

## Public Application API

| Function | Role |
|----------|------|
| `executeTool(options)` | Execute tool → `ToolEngineResult` |
| `listTools(options)` | List `ToolDescriptor`s |
| `describeTool(options)` | Describe one tool |
| `snapshotRegistry(options)` | Immutable registry snapshot |

Engine / executor internals are not part of the public API surface.

Legacy `executeToolRequest(executor, request, context)` remains for Conversation / Workflow.

---

## Tool Registry

The registry is the catalog boundary between AI tool requests and domain tools.

- Registration happens before freeze  
- Lookups never mutate  
- Category grouping and capability listing are catalog operations only  
- Domain tools are registered by future composition roots — **not** implemented in this foundation  

---

## Future Domain Tool Integration

Reserved architecture only in this sprint.

| Concern | Future |
|---------|--------|
| Workout tools | Register `ITool` adapters over Workout Runtime / Assembly |
| Recovery tools | Register Recovery Intelligence query tools |
| Nutrition tools | Register nutrition domain tools |
| Coach tools | Register Coach Intelligence / notes tools |
| Composition | Wire tools in Composition Root — keep foundation free of domain logic |
| Streaming | Optional tool-call / tool-result stream events (Streaming Foundation) |
| Providers | Map vendor function-calls → `ToolCallRequest` outside this module |

Existing placeholder `AITool` classes under `tools/placeholders/` remain for legacy workflow tests only; they are **not** the Sprint 20.1 foundation surface.

---

## Explicit Non-Goals

No Workout implementation. No Recovery implementation. No Nutrition implementation. No Coach implementation. No business logic. No provider-specific logic. Foundation only. Does not modify Streaming Foundation, AI Execution Pipeline, or AI Provider Abstraction internals.
