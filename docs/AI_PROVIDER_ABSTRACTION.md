# AI Provider Abstraction

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-23  
**Purpose:** Document the AI Provider Abstraction foundation (Sprint 19.2).  
**Source of Truth:** Yes — for AI Provider Abstraction layout, Provider Registry, Future OpenAI Integration, and Future Multi-provider Support on mobile.

Related: [ARCHITECTURE.md](./ARCHITECTURE.md), [PROMPT_COMPOSITION.md](./PROMPT_COMPOSITION.md), [AI_SYSTEM.md](./AI_SYSTEM.md), [DECISIONS.md](./DECISIONS.md) (ADR-049).

---

## Architecture Summary

```
Prompt Package
      ↓
AI Provider Abstraction
      ↓
Future Providers
(OpenAI / Anthropic / Gemini / Ollama)
      ↓
Standard AI Response
```

This layer defines a common contract for all future AI providers.

It consumes:

- immutable `PromptPackage` (required)

It produces:

- immutable `AIRequest`
- resolved `IAIProvider` contract
- immutable `AIExecutionContext`
- frozen `AIProviderResult` (preparation only)

It is **not**:

- an OpenAI / Anthropic / Gemini / Ollama implementation
- networking / HTTP
- SDK integration
- live model execution

Module: `app/src/features/ai-provider/`.

---

## AI Provider Abstraction

Deterministic orchestration facts only:

| Model | Role |
|-------|------|
| **AIRequest** | Immutable request prepared from `PromptPackage` |
| **AIResponse** | Standardized provider-agnostic response contract |
| **AIResponseChunk** | Standardized streaming chunk contract |
| **AIProvider** | Immutable provider descriptor snapshot |
| **AIProviderId** | Provider slug (+ reserved openai/anthropic/gemini/ollama) |
| **AIProviderCapabilities** | Capability flags (chat/streaming/tools/…) |
| **AIProviderConfiguration** | Enabled flag, defaults, limits, metadata |
| **AIProviderMetadata** | Tags + attributes |
| **AIProviderStatus** | registered / available / unavailable / degraded / disabled |
| **AIProviderHealth** | Descriptor-level health snapshot |
| **AIProviderLimits** | Token / rate / concurrency placeholders |
| **AIProviderError** | Hard orchestration failure |
| **AIProviderResult** | Prepared request + provider + context (+ null response) |
| **AIExecutionContext** | Ready-to-execute context (never executed here) |
| **AIExecutionOptions** | Temperature / tokens / stream / timeout knobs |
| **AITokenUsage** | Prompt / completion / total tokens |
| **AIFinishReason** | stop / length / content_filter / tool_calls / … |
| **AIModel** / **AIModelInfo** | Model selection + catalog descriptors |

### Contracts (interfaces only)

| Interface | Role |
|-----------|------|
| `IAIProvider` | Core provider contract |
| `IAIStreamingProvider` | Streaming-capable extension |
| `IAIHealthProvider` | Health descriptor extension |
| `IAIModelProvider` | Model catalog extension |
| `IAIProviderRegistry` | Register / resolve / list / availability |

No concrete vendor adapters ship in this sprint.

---

## Provider Registry

`AIProviderRegistry` responsibilities:

1. Register providers  
2. Resolve providers (case-normalized ids)  
3. List providers  
4. Validate availability (registered, enabled, chat-capable, not disabled)

Does **not** ship concrete providers. Tests use in-memory stubs only.

---

## Engine Responsibilities

`AIProviderEngine`:

1. Validate requests (`validateRequestIntegrity`, options, model selection)  
2. Resolve provider from registry  
3. Prepare immutable `AIExecutionContext`  
4. Return provider contract / `AIProviderResult`  

**No execution.** No HTTP. No SDK calls.

---

## Public Application API

| Function | Role |
|----------|------|
| `prepareAIRequest(options)` | PromptPackage → immutable AIRequest |
| `resolveProvider(providerId, service?)` | Resolve registered provider contract |
| `createExecutionContext(options)` | Prepare execution context (no execution) |

Engine internals are not part of the public API surface.

---

## Future OpenAI Integration

Reserved in architecture only.

| Concern | Future |
|---------|--------|
| Adapter | `IAIProvider` (+ streaming/health/model as needed) |
| Registry | `registry.register(openAIProvider)` |
| Mapping | `PromptPackage` blocks → OpenAI message roles **inside** adapter |
| Response | Vendor payload → standardized `AIResponse` / `AIResponseChunk` |
| Rules | Abstraction remains vendor-neutral; OpenAI SDK/HTTP stays in adapter |

---

## Future Multi-provider Support

| Concern | Future |
|---------|--------|
| Providers | OpenAI / Anthropic / Gemini / Ollama (+ others) |
| Selection | Resolve by `AIProviderId` + capabilities / health |
| Failover | Registry availability + status (`degraded` / `unavailable`) |
| Aggregation | `aggregateCapabilities()` across registered providers |
| Rules | Consumers depend on contracts + standardized response — never vendor SDKs |

---

## Explicit Non-Goals

No OpenAI, Anthropic, Gemini, or Ollama implementations. No HTTP, networking, or SDKs. Does not modify Prompt Composition. Does not execute providers.
