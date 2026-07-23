# Response Formatter

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-23  
**Purpose:** Document the Response Formatter domain (Sprint 19.4).  
**Source of Truth:** Yes — for Response Formatter layout, Coach Response model, and Formatting Pipeline on mobile.

Related: [ARCHITECTURE.md](./ARCHITECTURE.md), [AI_PROVIDER_ABSTRACTION.md](./AI_PROVIDER_ABSTRACTION.md), [OPENAI_PROVIDER.md](./OPENAI_PROVIDER.md), [AI_EXECUTION_PIPELINE.md](./AI_EXECUTION_PIPELINE.md), [ACTION_ENGINE.md](./ACTION_ENGINE.md), [AI_SYSTEM.md](./AI_SYSTEM.md), [DECISIONS.md](./DECISIONS.md) (ADR-056).

---

## Architecture Summary

```
AIResponse
      ↓
Response Formatter
      ↓
CoachResponse
      ↓
UI
      ↓
Action Engine
```

Module: `app/src/features/response-formatter/`.

Transforms an immutable `AIResponse` into an immutable `CoachResponse`.

It consumes:

- Unified `AIResponse` from AI Provider Abstraction / OpenAI Provider / future providers

It produces:

- immutable `CoachResponse` / `CoachResponsePackage` / `CoachResponseSnapshot`
- formatting payloads (`CoachFormattingResult`) — text only, no UI

It is **not**:

- OpenAI / Anthropic / Gemini / Ollama SDK usage
- networking
- prompt generation
- Conversation Orchestrator logic
- Prompt Builder logic
- business logic
- persistence

Compatible with `OpenAIProvider` and future `AnthropicProvider` / `GeminiProvider` / `OllamaProvider` via `AIResponse` only.

---

## Coach Response

`CoachResponse` is the structured application response contract for EVOLVE.

| Model | Role |
|-------|------|
| **CoachResponse** | Immutable root coach response |
| **CoachMessage** | Primary coach message body |
| **CoachRecommendation** | Parsed recommendation |
| **CoachWarning** | Parsed warning |
| **CoachInsight** | Extracted insight |
| **CoachAction** | Suggested action (no execution) |
| **CoachExercise** | Exercise suggestion |
| **CoachNutritionAdvice** | Nutrition advice |
| **CoachRecoveryAdvice** | Recovery advice |
| **CoachQuestion** | Clarifying question |
| **CoachCitation** | Citation / reference |
| **CoachConfidence** | Confidence score + label |
| **CoachMetadata** | Provider-agnostic metadata |
| **CoachSection** | Named content section |
| **CoachSummary** | Compact summary |
| **CoachFormatting** | Formatting hints (no UI) |
| **CoachResponseSnapshot** | Response + summary + statistics |
| **CoachResponseStatistics** | Aggregate counts / metrics |
| **CoachParsingResult** | Intermediate parse output |
| **CoachFormattingResult** | Formatted text payload |
| **CoachResponsePackage** | Full pipeline package |

All models are immutable (`readonly` + `Object.freeze`).

---

## Formatting Pipeline

```
AIResponse.content
      ↓
WhitespaceNormalizer
      ↓
SectionExtractor / parsers
      ↓
Extractors (reasoning, insight, confidence, references, tool markers)
      ↓
Classifiers (intent, severity, confidence, recommendation)
      ↓
Normalizers (actions, recommendations, citations, formatting)
      ↓
CoachResponseBuilder
      ↓
Validators
      ↓
Formatters (markdown / plain / rich / card / future JSON)
      ↓
CoachResponsePackage
```

### Parsers

| Parser | Responsibility |
|--------|----------------|
| **MessageParser** | Primary message |
| **RecommendationParser** | Recommendations |
| **WarningParser** | Warnings |
| **ActionParser** | Actions |
| **ExerciseParser** | Exercises |
| **NutritionParser** | Nutrition advice |
| **RecoveryParser** | Recovery advice |
| **QuestionParser** | Questions |
| **CitationParser** | Citations |
| **MetadataParser** | Metadata from `AIResponse` |

### Extractors

| Extractor | Responsibility |
|-----------|----------------|
| **ReasoningExtractor** | Reasoning / rationale |
| **InsightExtractor** | Insights |
| **ConfidenceExtractor** | Confidence |
| **ToolCallExtractor** | Tool-call markers (no execution) |
| **ReferenceExtractor** | Inline references |
| **SectionExtractor** | Sections |

### Classifiers

| Classifier | Responsibility |
|------------|----------------|
| **ResponseIntentClassifier** | Response intent |
| **SeverityClassifier** | Warning / recommendation severity |
| **ConfidenceClassifier** | Confidence label / score |
| **RecommendationClassifier** | Recommendation category |

### Formatters

| Formatter | Output |
|-----------|--------|
| **MarkdownFormatter** | Markdown text |
| **PlainTextFormatter** | Plain text |
| **RichContentFormatter** | Rich structured text payload |
| **CardFormatter** | Card-oriented text payload |
| **FutureJsonFormatter** | JSON serialization placeholder |

No UI rendering.

---

## Module Layout

| Folder | Role |
|--------|------|
| **models/** | Immutable CoachResponse models |
| **parsers/** | Isolated deterministic parsers |
| **extractors/** | Independent extractors |
| **builders/** | Immutable builders |
| **classifiers/** | Provider-independent classifiers |
| **validators/** | Integrity validation |
| **formatters/** | Text formatters (no UI) |
| **normalizers/** | Deterministic normalizers |
| **services/** | `ResponseFormatterService` coordination |
| **application/** | Public API surface |
| **utils/** | Freeze / confidence / metrics / helpers |

---

## Application API

| Function | Role |
|----------|------|
| `formatResponse(options)` | `AIResponse` → `CoachResponsePackage` |
| `buildCoachResponse(options)` | `AIResponse` → `CoachResponse` |
| `summarizeResponse(options)` | `CoachResponse` → `CoachSummary` |
| `validateResponse(options)` | `CoachResponse` → validation issues |

Internals (parsers, extractors, formatters, classifiers) are not part of the public application surface.

---

## Integration

| Direction | Contract |
|-----------|----------|
| Consumes | `AIResponse` (`features/ai-provider`) |
| Produces | `CoachResponse` / `CoachResponsePackage` |
| Compatible with | OpenAI Provider + future Anthropic / Gemini / Ollama |
| Must not depend on | Any provider implementation / SDK |

---

## Design Rules

- No OpenAI / Anthropic / Gemini / Ollama SDK
- No networking
- No prompt generation
- No Conversation Orchestrator logic
- No Prompt Builder logic
- No business logic
- No persistence
- Only immutable, deterministic response transformation
