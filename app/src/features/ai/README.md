# AI

Central AI domain.

This module contains all intelligence systems powering EVOLVE.
The Coach consumes these services but does not implement them.

## Provider abstraction

```
PromptBuilder (PromptContext)
        ↓
AIService
        ↓
AIProvider
├── OpenAIProvider  (REST via HttpClient)
├── OpenAIProviderStub
├── AnthropicProviderStub
├── GeminiProviderStub
└── LocalProviderStub
```

`AIService` depends only on an injected `AIProvider` + `AIConfiguration`.
OpenAI networking uses the shared `features/http` `HttpClient` — no vendor SDK.
