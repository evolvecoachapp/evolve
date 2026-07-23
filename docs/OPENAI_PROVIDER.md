# OpenAI Provider

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-23  
**Purpose:** Document the OpenAI Provider (Sprint 19.3).  
**Source of Truth:** Yes — for OpenAI Provider layout, Provider Flow, Configuration, Streaming, and Error Mapping on mobile.

Related: [ARCHITECTURE.md](./ARCHITECTURE.md), [AI_PROVIDER_ABSTRACTION.md](./AI_PROVIDER_ABSTRACTION.md), [PROMPT_COMPOSITION.md](./PROMPT_COMPOSITION.md), [AI_SYSTEM.md](./AI_SYSTEM.md), [DECISIONS.md](./DECISIONS.md) (ADR-050).

---

## Architecture Summary

```
PromptPackage
      ↓
AIProvider
      ↓
OpenAIProvider
      ↓
OpenAI SDK
      ↓
OpenAI API
      ↓
Unified AIResponse
```

Module: `app/src/features/openai-provider/`.

Only this module may import the OpenAI SDK.

It is **not**:

- domain / business logic
- prompt generation
- conversation orchestration
- UI / rendering

---

## Module Layout

| Folder | Role |
|--------|------|
| **provider/** | `OpenAIProvider` (+ registry registration helper) |
| **client/** | `OpenAIClient` — SDK communication only |
| **configuration/** | Immutable env-based configuration loading |
| **mappers/** | `OpenAIRequest` / response / usage / error mappers |
| **builders/** | `OpenAIRequestBuilder` (PromptPackage → OpenAI Request) |
| **validators/** | Configuration, request, response, streaming |
| **streaming/** | Incremental chunk abstraction (no UI) |
| **errors/** | Dedicated error hierarchy → `AIError` |
| **services/** | `OpenAIProviderService` coordination facade |
| **application/** | Public API surface |
| **utils/** | Tokens, retry, backoff, statistics, formatting |

---

## OpenAI Provider

`OpenAIProvider` implements:

| Contract | Methods |
|----------|---------|
| `IAIProvider` | `getInfo`, `getCapabilities`, `getConfiguration`, `getMetadata`, `getStatus`, `supports` |
| `IAIHealthProvider` | `getHealth` |
| `IAIModelProvider` | `listModels`, `getModel` |
| `IAIStreamingProvider` | `supportsStreaming`, `stream` (when config enables streaming) |

Adapter methods:

| Method | Role |
|--------|------|
| `execute()` | PromptPackage → OpenAI → `AIResponse` |
| `executeStreaming()` | PromptPackage → incremental `AIStreamingChunk` |
| `health()` | Live configuration/health snapshot |

Capabilities: `chat`, `models`, `health`; `streaming` follows configuration flag.  
Explicitly off: `tools`, `vision`, `audio`, `embeddings`.

---

## Provider Flow

1. Validate configuration, API key, model availability, execution options  
2. `OpenAIRequestBuilder.fromPromptPackage` → immutable `OpenAIRequest`  
3. Validate mapped request integrity  
4. Call `OpenAIClient` (OpenAI SDK; SDK types stay inside client)  
5. Map → standardized `AIResponse` (`OpenAIResponseMapper` + `OpenAIUsageMapper`)  
6. Surface errors via `OpenAIErrorMapper` → typed hierarchy + `AIError` / `AIProviderError`

### Prompt mapping rules

| PromptPackage source | OpenAI role |
|----------------------|-------------|
| system / identity / safety / constraints / knowledge / memory / conversation blocks | `system` (concatenated by block order) |
| `user_input` block / `PromptUserInput.statement` | `user` |

No assistant turns. No conversation history replay.

---

## Configuration

Immutable. Environment-based loading via `loadOpenAIConfiguration()`.

| Field | Env / notes |
|-------|-------------|
| API Key | `OPENAI_API_KEY` (required for execution) |
| Organization | `OPENAI_ORG` |
| Project | `OPENAI_PROJECT` |
| Base URL | `OPENAI_BASE_URL` (default OpenAI API) |
| Model | `OPENAI_MODEL` (fallback `gpt-4o-mini`) |
| Temperature | `OPENAI_TEMPERATURE` (fallback `0.7`) |
| TopP | `OPENAI_TOP_P` (fallback `1`) |
| Max Tokens | configuration default / execution options |
| Timeout | `OPENAI_TIMEOUT` (fallback `30000`) |
| Retry Policy | `OPENAI_MAX_RETRIES` + delay env vars |
| Streaming | `OPENAI_STREAMING` (`true`/`false`, default off) |

---

## Streaming

Provider-local streaming abstraction (no UI, no rendering):

| Type | Role |
|------|------|
| `OpenAIStreamChunk` | Provider-layer incremental chunk |
| `OpenAIStreamingSession` | Yields `AIStreamingChunk` |
| `OpenAIStreamAggregator` | Concatenates deltas for final content |
| `OpenAIStreamChunkMapper` | Maps to `AIStreamingChunk` / `AIResponseChunk` |

`executeStreaming()` requires `configuration.streaming === true`.

---

## Error Mapping

Dedicated hierarchy (all map into `AIError`):

- `AuthenticationError`
- `RateLimitError`
- `TimeoutError`
- `NetworkError`
- `ProviderUnavailableError`
- `InvalidResponseError`
- `ConfigurationError`

`OpenAIErrorMapper` classifies SDK/transport failures into this hierarchy, then to `AIError` / `AIProviderError`.

---

## Public Application API

| Function | Role |
|----------|------|
| `execute()` | PromptPackage → `AIResponse` |
| `executeStreaming()` | PromptPackage → `AsyncIterable<AIStreamingChunk>` |
| `healthCheck()` | Provider health snapshot |
| `validateConfiguration()` | Soft-validate configuration / API key |
| `listAvailableModels()` | Available model descriptors |

Aliases kept for compatibility: `executePrompt`, `checkHealth`.

Client / SDK internals are not part of the public API surface.

---

## Integration

| Concern | Detail |
|---------|--------|
| Consumes | `PromptPackage` |
| Produces | `AIResponse` / `AIStreamingChunk` |
| Implements | `IAIProvider` (+ health / model / streaming) |
| Registry | `registerOpenAIProvider(registry, options)` |
| Factory | Compatible — resolve by id `"openai"` after registration |

---

## Explicit Non-Goals

No domain logic. No prompt generation. No Conversation Orchestrator logic. No Prompt Builder logic. Provider remains completely replaceable. Does not modify Prompt Composition or AI Provider Abstraction contracts beyond implementing them.
