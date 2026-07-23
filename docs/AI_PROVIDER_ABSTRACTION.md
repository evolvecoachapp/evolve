# AI Provider Abstraction

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-23  
**Purpose:** Document the AI Provider Abstraction foundation (Sprint 19.2).  
**Source of Truth:** Yes — for AI Provider Abstraction layout, Provider Registry, Provider Factory, Contracts, Future OpenAI Integration, and Future Multi-provider Support on mobile.

Related: [ARCHITECTURE.md](./ARCHITECTURE.md), [PROMPT_COMPOSITION.md](./PROMPT_COMPOSITION.md), [AI_SYSTEM.md](./AI_SYSTEM.md), [DECISIONS.md](./DECISIONS.md) (ADR-049).

---

## Architecture Summary

```
Prompt Package
      ↓
AI Provider Abstraction
      ↓
Unified AI Response
      ↓
Future Response Formatter
```

This layer defines a common contract for all future AI providers.

It consumes:

- immutable `PromptPackage` (required)

It produces:

- immutable `AIRequest`
- resolved provider contracts
- immutable `AIProviderResult` (from preparation or wrapped `AIResponse`)

It is **not**:

- an OpenAI / Anthropic / Gemini / Ollama implementation
- networking / HTTP
- SDK integration
- live model execution

Module: `app/src/features/ai-provider/`.

---

## AI Provider Layer

| Folder | Role |
|--------|------|
| **contracts/** | Provider + capability extension interfaces |
| **models/** | Immutable request / response / provider descriptors |
| **registry/** | Metadata registries (no concrete providers) |
| **factory/** | Resolve providers by id / model / capability / default |
| **selectors/** | Query providers, capabilities, models, pricing |
| **builders/** | Fluent immutable builders |
| **validators/** | Soft + hard validation helpers |
| **engine/** | Orchestration primitives (prepare / resolve / context) |
| **services/** | Facade over engine + factory + registries |
| **application/** | Narrow public API |
| **utils/** | Freeze, normalize usage, estimate tokens/pricing, stats |

Deterministic orchestration facts only — no networking.

---

## Contracts

| Interface | Role |
|-----------|------|
| `IAIProvider` | Core provider contract |
| `IAIProviderFactory` | Resolve by id / model / capability / default |
| `IAIProviderRegistry` | Register / resolve / list / availability |
| `IAIStreamingProvider` / `StreamingProvider` | Streaming-capable extension |
| `IToolCallingProvider` / `ToolCallingProvider` | Tool-calling extension |
| `IVisionProvider` / `VisionProvider` | Vision extension |
| `IEmbeddingProvider` / `EmbeddingProvider` | Embedding extension |
| `IReasoningProvider` / `ReasoningProvider` | Reasoning extension |
| `IFunctionCallingProvider` / `FunctionCallingProvider` | Function-calling extension |
| `IAIHealthProvider` | Health descriptor extension |
| `IAIModelProvider` | Model catalog extension |

Immutable data contracts (models): `AIProviderCapabilities`, `AIProviderConfiguration`, `AIProviderHealth`, `AIProviderStatistics`, `AIProviderLimits`, `AIProviderPricing`, `AIProviderMetadata`.

No concrete vendor adapters ship in this sprint.

---

## Provider Registry

| Type | Role |
|------|------|
| `AIProviderRegistry` | Contract registry — register / resolve / list / availability |
| `ProviderRegistry` | Metadata facade composing descriptors + capability/model catalogs |
| `ProviderDescriptor` | Immutable registration metadata snapshot |
| `CapabilityRegistry` | Which providers declare which capabilities |
| `ModelRegistry` | Model catalog metadata only |

Does **not** ship concrete providers. Tests use in-memory stubs only.

---

## Provider Factory

`AIProviderFactory` resolves registered contracts by:

1. **id** — `resolveById`
2. **model** — `resolveByModel`
3. **capability** — `resolveByCapability`
4. **default** — `resolveDefault` / `setDefaultProviderId`

No vendor SDKs. No HTTP. Resolves registered contracts only.

---

## Models (immutable)

`AIRequest`, `AIResponse`, `AIMessage`, `AIChoice`, `AIUsage`, `AITokenUsage`, `AIError`, `AIProviderResult`, `AIProviderStatus`, `AIProviderSnapshot`, `AIProviderFeatures`, `AIModel`, `AIModelVersion`, `AIContextWindow`, `AITemperature`, `AITopP`, `AIMaxTokens`, `AIStopSequence`, `AIResponseFormat`, `AIStreamingChunk`, `AIToolCall`, `AIToolResult`, `AIExecutionResult`, `AIRequestMetadata`, `AIResponseMetadata`, plus existing orchestration models (`AIExecutionContext`, `AIExecutionOptions`, …).

---

## Public Application API

| Function | Role |
|----------|------|
| `createAIRequest(options)` | PromptPackage → immutable AIRequest |
| `validateProvider(providerId, service?)` | Soft-validate registered provider |
| `resolveProvider(providerId, service?)` | Resolve registered provider contract |
| `listProviders(service?)` | List registered contracts |
| `describeProvider(providerId, service?)` | Immutable provider snapshot |
| `prepareAIRequest(options)` | Compatibility alias of `createAIRequest` |
| `createExecutionContext(options)` | Prepare execution context (no execution) |
| `toProviderResult(options)` | AIResponse → AIProviderResult (no networking) |

Engine internals are not part of the public API surface.

---

## Integration

| Direction | Contract |
|-----------|----------|
| Consumes | `PromptPackage` → produces `AIRequest` |
| Consumes | `AIResponse` → produces `AIProviderResult` |

No networking. No persistence. No HTTP.

---

## OpenAI Integration

Implemented in Sprint 19.3 — see [OPENAI_PROVIDER.md](./OPENAI_PROVIDER.md).

| Concern | Status |
|---------|--------|
| Adapter | `features/openai-provider` implements `IAIProvider` + health/model + `execute()` |
| Registry | Concrete provider can `registry.register(openAIProvider)` |
| Mapping | `PromptPackage` blocks → OpenAI message roles **inside** adapter |
| Response | Vendor payload → standardized `AIResponse` |
| Rules | Abstraction remains vendor-neutral; OpenAI SDK stays in `OpenAIClient` |
| Streaming | Reserved — Future Streaming Support in OpenAI Provider docs |

---

## Future Multi-provider Support

| Concern | Future |
|---------|--------|
| Providers | OpenAI / Anthropic / Gemini / Ollama (+ others) |
| Selection | Factory + selectors by id / model / capability / pricing |
| Failover | Registry availability + status (`degraded` / `unavailable`) |
| Aggregation | `aggregateCapabilities()` / `CapabilityRegistry.aggregate()` |
| Rules | Consumers depend on contracts + standardized response — never vendor SDKs |

---

## Explicit Non-Goals

No OpenAI, Anthropic, Gemini, or Ollama implementations. No HTTP, networking, or SDKs. Does not modify Prompt Composition. Does not execute providers.
