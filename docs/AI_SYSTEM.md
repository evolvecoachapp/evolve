# EVOLVE AI System

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-22  
**Purpose:** Coach architecture, LLM abstraction, engines, memory, and conversation flow.  
**Source of Truth:** Yes — for AI subsystem design (endpoints: [API_STATUS.md](./API_STATUS.md)).
---

## Design Principle

Users interact with **one Coach** — a unified conversational interface. Multiple specialized engines operate behind the scenes; the user never selects engines or receives fragmented responses.

On mobile, the Coach conversation path can drive a **deterministic workout pipeline** (blueprint → knowledge → selection → programming → progression → adaptation). Workout assembly and program generation remain **planned**.

---

## AI Runtime Pipeline (Mobile)

Implemented application-layer pipeline under `app/src/features/`:

```
Conversation Engine
        ↓
Workflow Engine
        ↓
Workout Blueprint Generator
        ↓
Exercise Knowledge Base
        ↓
Exercise Selection Engine
        ↓
Programming Engine
        ↓
Progression Engine
        ↓
Training Adaptation Engine
        ↓
┌───────────────────────────────┐
│ Future (not implemented)      │
│ Workout Assembly              │
│ Program Generation            │
└───────────────────────────────┘
```

### Layer responsibilities

| Layer | Module | Status | Responsibility |
|-------|--------|--------|----------------|
| Conversation | `features/conversation` | Implemented | Coach turn lifecycle, memory handoff into workflows |
| Workflow | `features/workflow` | Implemented | Capability routing; hosts blueprint generation workflow |
| Workout Blueprint | `features/workout-blueprint` | Implemented | Decides **what** session structure to build (split, focus, constraints) — not exercises or sets |
| Exercise Knowledge Base | `features/exercise-kb` | Implemented (17.1) | Read-only exercise metadata + relationship graph |
| Exercise Selection | `features/exercise-selection` | Implemented (17.2) | Deterministic candidate selection from blueprint + knowledge |
| Programming | `features/programming` | Implemented (17.3) | Immutable prescriptions (volume, intensity, rest, tempo, order) |
| Progression | `features/progression` | Implemented (17.4) | Multi-week prescription evolution timeline (no loads/fatigue) |
| Training Adaptation | `features/training-adaptation` | Implemented (17.5) | Readiness assessment + adaptation recommendations only |
| Prompt Orchestrator | `features/prompt-orchestrator` | Implemented | Composes prompts for AI-assisted blueprint steps |
| Tool Engine | `features/tool-calling` | Implemented | Tool registry/execution boundary for workflows |
| Athlete Context | `features/athlete-context` | Implemented | Structured athlete context for orchestration inputs |
| Workout Assembly | — | **Planned** (17.6) | Assemble complete executable workouts |
| Program Generation | — | **Planned** (17.7) | Multi-week program construction |

Supporting orchestration pieces also present: Memory (conversation persistence adapters), Prompt Builder, AIService / AI providers — see feature modules under `app/src/features/`.

### Pipeline rules (implemented)

- Blueprint decides session structure; Selection chooses exercises; Programming decides **how** each selected exercise is executed; Progression defines **how prescriptions evolve over weeks**; Adaptation evaluates **whether that plan should be adjusted before execution**.
- Selection, Programming, Progression, and Training Adaptation are **deterministic** — no LLM inside those engines.
- Knowledge Base is **read-only** and contains no workout logic.
- Programming does **not** progress loads, adapt across weeks, or assemble full workouts.
- Progression does **not** adapt to athlete feedback, calculate loads, autoregulate, manage fatigue, or apply deloads.
- Training Adaptation does **not** modify workouts, integrate wearables, use athlete history, or replace Programming/Progression.

---

## Coach Architecture

```
┌──────────┐     ┌──────────────┐     ┌─────────────────┐
│  Client  │────▶│ CoachService │────▶│ AIOrchestrator  │
└──────────┘     │ (ownership)  │     │   (async)       │
                 └──────────────┘     └────────┬────────┘
                                               │
                    ┌──────────────────────────┼──────────────────────────┐
                    │                          │                          │
                    ▼                          ▼                          ▼
            ┌──────────────┐          ┌──────────────┐          ┌──────────────┐
            │ MemoryEngine │          │ classify_    │          │ Coach Engine │
            │ (context)    │          │ intent       │          │ Adapters     │
            └──────────────┘          └──────────────┘          └──────┬───────┘
                    │                          │                          │
                    │                          │              ┌───────────┼───────────┐
                    │                          │              ▼           ▼           ▼
                    │                          │         Workout    Nutrition   Recovery
                    │                          │         Coach      Coach       Coach
                    │                          │         Engine     Engine      Engine
                    │                          │              │           │           │
                    │                          │              └───────────┼───────────┘
                    │                          │                          │
                    │                          ▼                          ▼
                    │                   ┌──────────────┐          ┌──────────────┐
                    │                   │ LLMProvider  │          │ Domain       │
                    │                   │ (fallback)   │          │ Services     │
                    │                   └──────────────┘          └──────────────┘
                    │                          │
                    └──────────────────────────┼──────────────────────────┘
                                               ▼
                                      ┌──────────────┐
                                      │ ChatRepository│
                                      │ (persist)     │
                                      └──────────────┘
```

Backend Coach path (above) remains the HTTP conversational surface. Mobile pipeline domains are separate application-layer bounded contexts and are not yet exposed as backend REST engines.
---

## LLM Abstraction

### Interface (`LLMProvider`)

```python
async def complete(messages: list[ChatTurn]) -> LLMCompletion
```

### Implementations

| Provider | Config | Status |
|----------|--------|--------|
| `MockLLMProvider` | `AI_PROVIDER=mock` (default) | Deterministic offline responses |
| `OpenAICompatibleLLMProvider` | `AI_PROVIDER=openai_compatible` | Real HTTP via OpenAI SDK |

### OpenAI-Compatible Configuration

| Setting | Purpose |
|---------|---------|
| `AI_LLM_BASE_URL` | Any OpenAI-compatible endpoint |
| `AI_LLM_API_KEY` | SecretStr — never logged |
| `AI_LLM_MODEL` | Model identifier |
| `AI_LLM_TIMEOUT_SECONDS` | Request timeout |
| `AI_LLM_MAX_OUTPUT_TOKENS` | Output cap |

Works with: OpenAI, Azure OpenAI, OpenRouter, self-hosted compatible servers.

### Error Handling (ADR-021)

All SDK exceptions → `LLMProviderError`. Every caller degrades gracefully:
- Orchestrator → apology message with `artifacts.llm_error = true`
- Intent classifier → keyword fallback
- Progress Analyzer → templated narrative from computed stats

---

## Provider System

### Backend LLM Providers

Resolved via `get_llm_provider()` from `settings.ai_provider`:
- Fresh instance per call (uncached for testability)
- Unsupported values raise `ValueError`

### Mobile Coach Providers (Client-Side)

| Provider | File | Status |
|----------|------|--------|
| Mock | `MockCoachService.ts` | Working |
| Backend | `BackendCoachService.ts` | Stub (Sprint 5.3) |
| OpenAI | `OpenAIService.ts` | Placeholder |
| Anthropic | `AnthropicService.ts` | Placeholder |
| Local LLM | `FutureLocalLLMService.ts` | Placeholder |

**Recommended path:** Wire mobile to backend Coach API rather than direct LLM calls from client.

---

## AI Engines

### Coach-Facing Adapters (`coach_engines.py`)

Implement `AIEngine` protocol; registered in `AIOrchestrator.engines`:

| Engine | Intent | Calls | Output |
|--------|--------|-------|--------|
| `WorkoutCoachEngine` | WORKOUT | `WorkoutResolutionService.resolve_current` | Templated reply + resolution artifacts |
| `NutritionCoachEngine` | NUTRITION | `NutritionService.get_daily_nutrition` | Macro targets + adherence |
| `RecoveryCoachEngine` | RECOVERY | `RecoveryService.get_daily_readiness` | Readiness score + protocols |

Graceful degradation: missing profile/check-in → guiding reply, not 500.

### Pure Engines (Not Orchestrator-Registered)

| Engine | Type | Access |
|--------|------|--------|
| `NutritionEngine` | Rule-based BMR/TDEE/macros | Via `NutritionService` / REST |
| `RecoveryEngine` | Rule-based readiness scoring | Via `RecoveryService` / REST |
| `ProgressAnalyzer` | Hybrid stats + LLM narrative | Via `ProgressService` / REST only |

### Intent Routing

| Intent | Route |
|--------|-------|
| WORKOUT | WorkoutCoachEngine |
| NUTRITION | NutritionCoachEngine |
| RECOVERY | RecoveryCoachEngine |
| GENERAL | Direct LLM completion |
| PROGRESS | Direct LLM completion (Progress Analyzer not Coach-bound yet) |

---

## Memory

### MemoryEngine v1

| Method | Purpose |
|--------|---------|
| `start_or_resume_conversation` | Create or resume Conversation row |
| `get_context` | Windowed message history (max turns from settings) |
| `record_turn` | Persist user + assistant messages |

### Persistence

- `Conversation` aggregate: id, user_id, timestamps, last_message_at
- `ChatMessage`: role, content, JSONB metadata (intent, engines_invoked, artifacts)
- Indexed on `(user_id, last_message_at)` for O(1) resume lookup

### Deferred
- Conversation summarization for long threads
- Conversation list/title/rename API
- Cross-conversation memory

### Mobile Memory (Client)

`ConversationMemory` interface with `InMemoryConversationMemory` for mock Coach — separate from backend persistence.

---

## Future Integrations

### OpenAI Integration
- **Backend:** Implemented via `OpenAICompatibleLLMProvider` (ADR-020)
- **Mobile:** Placeholder `OpenAIService.ts` — not recommended for production (use backend Coach)

### Anthropic Integration
- **Backend:** Not implemented; would require new `LLMProvider` subclass or Anthropic-compatible proxy
- **Mobile:** Placeholder `AnthropicService.ts`

### Local LLM
- **Backend:** Supported via `AI_LLM_BASE_URL` pointing to local OpenAI-compatible server (Ollama, llama.cpp server, etc.)
- **Mobile:** Placeholder `FutureLocalLLMService.ts`

---

## Prompt Pipeline

### Coach Message Flow

1. **Receive** user message + optional conversation_id
2. **Authorize** conversation ownership (CoachService)
3. **Resolve** conversation (MemoryEngine.start_or_resume)
4. **Assemble** context window (MemoryEngine.get_context)
5. **Classify** intent (LLM-primary → keyword fallback)
6. **Route:**
   - Engine intent → Coach adapter → domain service → templated reply
   - GENERAL/PROGRESS → LLM completion with context
7. **Persist** user turn + assistant turn with metadata/artifacts
8. **Return** CoachResponse to client

### Intent Classification Prompt

LLM asked to output exactly one label: WORKOUT, NUTRITION, RECOVERY, PROGRESS, GENERAL.
Parsed case-insensitively; invalid response → keyword matcher.

### Progress Analyzer Prompt

Deterministic stats computed first (trend, slope, plateau, consistency).
LLM instructed to narrate 2–3 sentences from stats only — never invent numbers.

---

## Conversation Flow (Sequence)

```
User: "What should I eat today?"
  │
  ▼
POST /api/v1/coach/messages
  │
  ▼
CoachService.send_message(user, message, conversation_id?)
  │
  ▼
AIOrchestrator.process_message
  ├─ classify_intent → NUTRITION
  ├─ NutritionCoachEngine.handle
  │    └─ NutritionService.get_daily_nutrition(today)
  │         └─ NutritionEngine.compute(targets, adherence)
  ├─ EngineOutput.reply_text + artifacts
  ├─ ChatRepository.create_message (user + assistant)
  └─ return CoachResponse
  │
  ▼
Client displays Coach reply with structured artifacts
```

---

## Configuration Reference

| Variable | Default | Purpose |
|----------|---------|---------|
| `AI_PROVIDER` | mock | LLM provider selection |
| `AI_MEMORY_MAX_TURNS` | 20 | Context window size |
| `NUTRITION_BMR_FORMULA` | mifflin_st_jeor | BMR strategy |
| `RECOVERY_TRAINING_LOAD_WINDOW_DAYS` | 7 | Training load aggregation |
| `PROGRESS_MIN_DATA_POINTS_FOR_TREND` | 3 | Analyzer minimum data |

See [BACKEND_STATUS.md](./BACKEND_STATUS.md) for full config list.

---

## Related Decisions

| ADR | Topic |
|-----|-------|
| 008 | LLMProvider abstraction |
| 009 | Async boundary scope |
| 011/016 | Engine decoupling from Orchestrator |
| 017 | Coach engine adapters |
| 020 | OpenAI-compatible endpoint |
| 021 | Graceful LLM degradation |
| 022 | Hybrid Progress Analyzer |
| 023 | Progress decoupled from Coach |
| 024 | LLM-primary intent classification |
| 028 | Exercise Knowledge read-only bounded context |
| 029 | Deterministic Exercise Selection independent from AI |
| 030 | Immutable Programming prescriptions |
