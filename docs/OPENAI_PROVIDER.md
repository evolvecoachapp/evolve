# OpenAI Provider

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-23  
**Purpose:** Document the OpenAI Provider foundation (Sprint 19.3).  
**Source of Truth:** Yes — for OpenAI Provider layout, Provider Flow, Configuration, and Future Streaming Support on mobile.

Related: [ARCHITECTURE.md](./ARCHITECTURE.md), [AI_PROVIDER_ABSTRACTION.md](./AI_PROVIDER_ABSTRACTION.md), [PROMPT_COMPOSITION.md](./PROMPT_COMPOSITION.md), [AI_SYSTEM.md](./AI_SYSTEM.md), [DECISIONS.md](./DECISIONS.md) (ADR-050).

---

## Architecture Summary

```
Prompt Package
      ↓
AI Provider Engine
      ↓
OpenAI Provider
      ↓
Prompt Mapper
      ↓
OpenAI Client
      ↓
Raw OpenAI Response
      ↓
Response Mapper
      ↓
AIResponse
```

This layer is the first concrete AI provider adapter over the AI Provider Abstraction.

It consumes:

- immutable `PromptPackage` (required)
- AI Provider Abstraction contracts (`IAIProvider`, `IAIHealthProvider`, `IAIModelProvider`)

It produces:

- immutable provider-layer `OpenAIRequest` / `OpenAIResponse`
- standardized immutable `AIResponse`
- health + model catalog descriptors

It is **not**:

- prompt composition
- conversation history management
- memory
- tool calling
- streaming (reserved)

Module: `app/src/features/openai-provider/`.

---

## OpenAI Provider

`OpenAIProvider` implements:

| Contract | Methods |
|----------|---------|
| `IAIProvider` | `getInfo`, `getCapabilities`, `getConfiguration`, `getMetadata`, `getStatus`, `supports` |
| `IAIHealthProvider` | `getHealth` |
| `IAIModelProvider` | `listModels`, `getModel` |

Concrete execution surface (adapter only):

| Method | Role |
|--------|------|
| `execute()` | PromptPackage → OpenAI → `AIResponse` |
| `health()` | Live configuration/health snapshot |
| `listModels()` | Available model catalog |

Capabilities in this sprint: `chat`, `models`, `health`.  
Explicitly off: `streaming`, `tools`, `vision`, `audio`, `embeddings`.

---

## Provider Flow

1. Validate configuration, API key, model availability, execution options  
2. Map `PromptPackage` → immutable `OpenAIRequest` (`PromptPackageMapper`)  
3. Validate mapped request integrity  
4. Call `OpenAIClient` (OpenAI SDK; SDK types stay inside client)  
5. Receive provider-layer `OpenAIResponse`  
6. Map → standardized `AIResponse` (`ResponseMapper`)  
7. Surface errors via `ErrorMapper` → `AIProviderError`

No business logic in mappers. No prompt composition in this domain.

### Prompt mapping rules

| PromptPackage source | OpenAI role |
|----------------------|-------------|
| system / identity / safety / constraints / knowledge / memory / conversation blocks | `system` (concatenated by block order) |
| `user_input` block / `PromptUserInput.statement` | `user` |

No assistant turns. No conversation history replay.

---

## Configuration

Read from environment (no hardcoded secrets):

| Variable | Purpose |
|----------|---------|
| `OPENAI_API_KEY` | Required for execution |
| `OPENAI_MODEL` | Default model (fallback: `gpt-4o-mini`) |
| `OPENAI_TIMEOUT` | Request timeout in ms (fallback: `30000`) |

Optional:

| Variable | Purpose |
|----------|---------|
| `OPENAI_BASE_URL` | Override API base URL |
| `OPENAI_ORG` | Organization header |
| `OPENAI_MAX_RETRIES` | SDK retry count |

Loaded via `loadOpenAIConfiguration()`.

---

## Public Application API

| Function | Role |
|----------|------|
| `executePrompt(options)` | PromptPackage → `AIResponse` |
| `checkHealth(options?)` | Provider health snapshot |
| `listAvailableModels(options?)` | Available model descriptors |

Client / SDK internals are not part of the public API surface.

---

## Future Streaming Support

Reserved architecture only in this sprint.

| Concern | Future |
|---------|--------|
| Contract | Implement `IAIStreamingProvider` |
| Client | SDK streaming / SSE transport |
| Mapper | Stream chunks → `AIResponseChunk` |
| Capability | Flip `streaming: true` when shipped |
| Rules | Keep non-streaming `execute()` path; do not leak SDK stream types outside client |

---

## Explicit Non-Goals

No streaming. No memory. No tool calling. No conversation history. No provider-specific logic outside this provider layer. No domain / coaching logic. Does not modify Prompt Composition or AI Provider Abstraction.
