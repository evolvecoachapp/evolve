# Nutrition Experience Architecture

**Project:** EVOLVE  
**Sprint:** 31.5 — Nutrition Experience  
**Status:** Accepted  
**ADR:** [ADR-110](./DECISIONS.md)  
**Module:** `app/src/features/nutrition-experience`

---

## Purpose

Transform the Nutrition tab into EVOLVE's daily nutrition command center: one premium dashboard that makes meal timing, macro targets, hydration, and coach suggestions actionable in the context of Workout, Recovery, and Coach.

This module is explicitly not a calorie tracker. It is a product experience layer over application services.

---

## Dependency Flow

```
React UI (screens / components)
        ↓
NutritionExperienceViewModel
        ↓
Application Use Cases
  (loadNutritionDashboard / refreshNutritionDashboard /
   loadMeals / loadMacros / loadHydration /
   loadCoachSuggestions / toggleMealCompletion /
   changeNutritionDay)
        ↓
Mappers (DTO → immutable presentation read models)
        ↓
NutritionExperienceService (provider contract)
        ↓
Mock / Backend / Local providers
        ↓
(future) repositories / food database / barcode scanner /
backend / AI coach integrations
```

UI never imports providers, mocks, repositories, or infrastructure adapters directly.

---

## Module Structure

```
features/nutrition-experience/
  application/     — dashboard use cases
  hooks/           — ViewModel bindings
  viewmodels/      — NutritionExperienceViewModel
  components/      — presentation-only nutrition UI
  models/          — immutable presentation read models
  mappers/         — provider DTO → experience models
  providers/       — Mock / Backend / Local experience providers
  services/        — provider contract + factory
  screens/         — NutritionExperienceScreen composition
  __tests__/       — application / viewmodel / hooks
  index.ts
```

---

## Models

Immutable (`readonly` + `Object.freeze` at construction):

| Model | Role |
|-------|------|
| `NutritionDashboard` | Aggregate daily nutrition read model |
| `MealSummary` | Daily meal completion status |
| `Meal` / `MealFood` | Planned meal block and supporting foods |
| `MacroProgress` | Aggregated calorie + macro adherence surface |
| `HydrationProgress` | Water intake goal surface |
| `NutritionCoachSuggestion` | Contextual nutrition guidance from Coach |
| `DailyCalories` / `DailyProtein` / `DailyCarbohydrates` / `DailyFat` | Primitive daily progress building blocks |
| `NutritionDay` | Day selection and navigation surface |
| `NutritionLoadingState` | idle / loading / refreshing |
| `NutritionErrorState` | retryable error envelope |

Provider DTOs remain under `services/` and are never rendered directly.

---

## Application APIs

| API | Responsibility |
|-----|----------------|
| `loadNutritionDashboard` | Fetch provider DTO → map full dashboard |
| `refreshNutritionDashboard` | Explicit refresh path for dashboard |
| `loadMeals` | Fetch / map meal timeline |
| `loadMacros` | Fetch / map macro adherence |
| `loadHydration` | Fetch / map hydration projection |
| `loadCoachSuggestions` | Fetch / map contextual coach suggestions |
| `toggleMealCompletion` | Toggle a meal through provider contract |
| `changeNutritionDay` | Normalize selected day |

All accept an injectable `NutritionExperienceService`. Default resolves via `nutritionExperienceService` (`EXPO_PUBLIC_NUTRITION_EXPERIENCE_PROVIDER`).

---

## ViewModel

`NutritionExperienceViewModel` owns:

- `loadDashboard()` / `refresh()`
- `loadMeals()` / `loadMacros()`
- `loadHydration()` / `loadCoachSuggestions()`
- `toggleMealCompletion()`
- `changeDay()`
- loading / error / empty flags
- subscriber notifications for hooks

No UI imports. No React. No repository or provider access from components.

---

## Hooks

| Hook | Role |
|------|------|
| `useNutritionDashboard` | Subscribe to dashboard / refresh / load / day changes |
| `useMeals` | Meal timeline projection + completion toggles |
| `useHydration` | Hydration projection only |
| `useCoachSuggestions` | Coach suggestion projection only |

---

## Screen Composition

`NutritionExperienceScreen` composes only:

- `NutritionHeader`
- `NutritionDaySelector`
- `NutritionSummaryCard`
- `CaloriesCard`
- `HydrationCard`
- `MacroRingCard`
- `NutritionProgressCard`
- `MealTimeline`
- `MealCard`
- `MealFoodsList`
- `CoachSuggestionCard`
- `NutritionSkeleton` / `NutritionEmpty` / `NutritionError`

Route: `app/(app)/(tabs)/nutrition.tsx` → `NutritionExperienceScreen`.

Prepared navigation placeholders (not implemented in this sprint):

- Meal Details — `/(app)/nutrition/meal-details`
- Food Search — `/(app)/nutrition/food-search`
- Barcode Scanner — `/(app)/nutrition/barcode-scanner`
- Nutrition History — `/(app)/nutrition/history`

---

## Provider Seam

| Provider | Behavior |
|----------|----------|
| `mock` (default) | Seeded daily dashboard with deterministic meals, macros, hydration, and coach suggestions |
| `backend` | Placeholder — throws until backend nutrition experience wiring exists |
| `local` | Placeholder — future repository / persistence-backed nutrition experience bridge |

Env: `EXPO_PUBLIC_NUTRITION_EXPERIENCE_PROVIDER`.

Replacing Mock with persistence-, barcode-, or backend-backed nutrition data requires only a new provider implementation behind `NutritionExperienceService` — no UI, ViewModel, or Application contract changes.

---

## Design Constraints

- No business logic inside React
- No infrastructure / repository access from UI
- No provider code inside components
- No networking in this sprint
- No duplicated state across hooks/components
- No mock data inside components
- Reuse the existing Design System
- Strict TypeScript throughout the module

---

## Testing

Integration coverage under `__tests__/`:

- Application layer (dashboard / meals / hydration / macros / coach suggestions / toggle / error)
- ViewModel (loading / refresh / day changes / empty / error / subscribers)
- Hooks (`useNutritionDashboard` / `useMeals` / `useHydration` / `useCoachSuggestions`)

---

## Related

- [ADR-110](./DECISIONS.md) — Nutrition Experience
- [ARCHITECTURE.md](./ARCHITECTURE.md) — system architecture summary
- [PROJECT_STATE.md](./PROJECT_STATE.md) — current sprint and module state
- [CHANGELOG.md](./CHANGELOG.md) — release history
