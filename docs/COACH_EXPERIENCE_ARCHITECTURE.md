# Coach Experience Architecture

**Project:** EVOLVE  
**Sprint:** 31.3 — AI Coach Experience  
**Status:** Accepted  
**ADR:** [ADR-108](./DECISIONS.md)  
**Module:** `app/src/features/coach-experience`

---

## Purpose

Transform the Coach tab into EVOLVE's flagship contextual AI coaching experience — not a generic chatbot — built on top of the existing Coach Intelligence architecture, without embedding business logic in React and without binding UI to a specific AI provider.

---

## Dependency Flow

```
React UI (screens / components)
        ↓
CoachExperienceViewModel
        ↓
Application Use Cases
  (loadCoachConversation / sendCoachMessage / loadDailyInsight /
   loadRecommendations / loadQuickActions / refreshCoachExperience /
   pinCoachInsight / dismissCoachInsight / regenerateCoachResponse /
   loadConversationHistory)
        ↓
Mappers (DTO → immutable presentation read models)
        ↓
CoachExperienceService (provider contract)
        ↓
Mock / Backend / Local providers
        ↓
(future) Coach Intelligence → Memory → Context → AI Provider
         (Mock AI / OpenAI / Azure OpenAI / Anthropic / Local LLM)
```

UI never imports providers, mocks, infrastructure, or OpenAI SDKs.

Existing Coach Intelligence / Conversation / Memory domain modules remain intact. Product presentation models live under `features/coach-experience/models`.

---

## Module Structure

```
features/coach-experience/
  application/     — experience use cases
  hooks/           — ViewModel bindings
  viewmodels/      — CoachExperienceViewModel
  components/      — presentation-only Coach UI
  models/          — immutable presentation read models
  mappers/         — provider DTO → experience models
  screens/         — CoachExperienceScreen composition
  providers/       — Mock / Backend / Local experience providers
  services/        — experience service factory
  types/           — experience provider DTO contract
  mocks/           — seed data for Mock provider only
  __tests__/       — application / viewmodel / hooks
  index.ts
```

---

## Models

Immutable (`readonly` + `Object.freeze` at construction):

| Model | Role |
|-------|------|
| `CoachExperience` | Aggregate operational read model |
| `CoachConversation` | Active conversation + destinations |
| `CoachMessage` | Message with streaming/markdown/citation readiness |
| `CoachInsight` | Daily / pinned insight |
| `CoachRecommendation` | Today / workout / recovery / nutrition recommendations |
| `CoachQuickAction` | Prompted coaching shortcuts |
| `CoachMemorySummary` | Memory summary card |
| `CoachConversationState` | idle / ready / awaiting / streaming / empty / error |
| `CoachTypingState` | typing / streaming indicator (prepared) |
| `CoachLoadingState` | idle / loading / refreshing / sending |
| `CoachErrorState` | retryable error envelope |

Provider DTOs remain under `types/` and are never rendered directly.

---

## Application APIs

| API | Responsibility |
|-----|----------------|
| `loadCoachConversation` | Fetch provider DTO → map full experience |
| `sendCoachMessage` | Send user message + append coach reply |
| `loadDailyInsight` | Fetch / map daily insight |
| `loadRecommendations` | Fetch / map recommendations |
| `loadQuickActions` | Fetch / map quick actions |
| `refreshCoachExperience` | Same path as load (explicit refresh) |
| `pinCoachInsight` | Pin insight via provider |
| `dismissCoachInsight` | Dismiss insight via provider |
| `regenerateCoachResponse` | Regenerate a coach message |
| `loadConversationHistory` | Fetch conversation history list |

All accept an injectable `CoachExperienceService`. Default resolves via `coachExperienceService` (`EXPO_PUBLIC_COACH_EXPERIENCE_PROVIDER`).

---

## ViewModel

`CoachExperienceViewModel` owns:

- `loadConversation` / `loadDailyInsight` / `refresh`
- `sendMessage` / `regenerateResponse` / `suggestActions`
- `loadConversationHistory`
- `pinInsight` / `dismissInsight`
- loading / typing / streaming-prepared / error / empty flags
- subscriber notifications for hooks

No UI imports. No React.

---

## Hooks

| Hook | Role |
|------|------|
| `useCoachConversation` | Subscribe to conversation / send / regenerate / refresh |
| `useCoachInsights` | Daily + pinned insight projection |
| `useCoachRecommendations` | Recommendation projection |
| `useCoachQuickActions` | Quick action projection |
| `usePullToRefresh` | RefreshControl orchestration |

---

## Screen Composition

`CoachExperienceScreen` composes only:

- `CoachHeader` / `CoachStatus` / `CoachAvatar`
- `InsightCard` (daily + pinned)
- `RecommendationCard` (today / workout / recovery / nutrition)
- `CoachMemoryCard`
- `QuickActionsRow`
- `ConversationList` / `MessageBubble` / `TypingIndicator`
- `ConversationInput`
- `CoachLoading` / `CoachEmpty` / `CoachError`

Route: `app/(app)/(tabs)/coach.tsx` → `CoachExperienceScreen`.

Future navigation prepared (not implemented as new screens):

- Coach History — `/(app)/coach/history`
- Coach Settings — `/(app)/coach/settings`
- Insight Details — `/(app)/coach/insights/:id`

---

## Quick Actions (mock)

- Explain today's workout
- Reduce today's volume
- Adjust calories
- Show weekly progress
- Recovery analysis
- Generate motivation
- Modify next workout

Actions send prompted messages through the ViewModel (mock AI replies).

---

## Provider Seam

| Provider | Behavior |
|----------|----------|
| `mock` (default) | Seeded experience + deterministic keyword mock AI |
| `backend` | Placeholder — throws until API wired |
| `local` | Placeholder — future Coach Intelligence / on-device LLM bridge |

Env: `EXPO_PUBLIC_COACH_EXPERIENCE_PROVIDER`.

Replacing Mock with OpenAI / Azure / Anthropic / Local LLM requires only a new provider implementation behind `CoachExperienceService` — no UI, ViewModel, or Application contract changes.

---

## Design Constraints

- No business logic inside React
- No infrastructure / repository access from UI
- No provider code inside components
- No OpenAI SDK in this module
- No networking in this sprint
- No duplicated state — ViewModel is the single experience owner
- Strict TypeScript; Design System reuse; no visual redesign
- Streaming indicator prepared only (no live token stream yet)
- Messages prepared for markdown and citations

---

## Testing

Integration coverage under `__tests__/`:

- Application layer (load / send / regenerate / insights / recommendations / quick actions / pin / dismiss / empty / error)
- ViewModel (load / send / regenerate / insights / quick actions / loading / empty / error / subscribers)
- Hooks (conversation / insights / recommendations / quick actions / pull-to-refresh)

---

## Related

- [ADR-108](./DECISIONS.md) — Coach Experience
- [COACH_INTELLIGENCE.md](./COACH_INTELLIGENCE.md) — domain Coaching Context
- [COACH_CONVERSATION.md](./COACH_CONVERSATION.md) — intelligent conversation orchestration
- [AI_PROVIDER_ABSTRACTION.md](./AI_PROVIDER_ABSTRACTION.md) — provider contract foundation
- [HOME_DASHBOARD_ARCHITECTURE.md](./HOME_DASHBOARD_ARCHITECTURE.md) — Sprint 31.1 product pattern
- [WORKOUT_RUNTIME_ARCHITECTURE.md](./WORKOUT_RUNTIME_ARCHITECTURE.md) — Sprint 31.2 product pattern
