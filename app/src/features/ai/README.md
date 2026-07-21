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
├── OpenAIProviderStub
├── AnthropicProviderStub
├── GeminiProviderStub
└── LocalProviderStub
```

`AIService` depends only on an injected `AIProvider`. Stubs are offline and
deterministic — no networking, SDKs, or API keys.
