# Providers

Provider-agnostic `AIProvider` interface.

- **OpenAIProvider** — real OpenAI Chat Completions REST integration via `HttpClient` (no SDK).
- **Stubs** — offline deterministic stand-ins (OpenAI, Anthropic, Gemini, Local) for tests.

Providers never call `fetch()` directly. Networking goes through `features/http`.
