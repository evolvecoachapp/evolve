# Profile Experience Architecture

**Project:** EVOLVE  
**Sprint:** 31.6 — Profile & Settings Experience  
**Status:** Accepted  
**ADR:** [ADR-111](./DECISIONS.md)  
**Module:** `app/src/features/profile-experience`

---

## Purpose

Transform the Profile screen into the Digital Athlete Profile — the central identity and preferences hub for EVOLVE. All athlete configuration flows through this module. This is not a generic settings page.

---

## Dependency Flow

```
React UI (screens / components)
        ↓
ProfileExperienceViewModel
        ↓
Application Use Cases
  (loadProfile / refreshProfile /
   updateTrainingPreferences / updateNutritionPreferences /
   updateCoachPreferences / updateNotificationPreferences /
   updateAppearancePreferences / updateMeasurementUnits /
   updateGoals)
        ↓
Mappers (DTO → immutable presentation read models)
        ↓
ProfileExperienceService (provider contract)
        ↓
Mock / Backend / Local providers
        ↓
(future) repositories / authentication /
backend / cloud sync / coach preferences
```

UI never imports providers, mocks, repositories, or infrastructure adapters directly.

---

## Module Structure

```
features/profile-experience/
  application/     — profile use cases
  hooks/           — ViewModel bindings
  viewmodels/      — ProfileExperienceViewModel
  components/      — presentation-only profile UI
  models/          — immutable presentation read models
  mappers/         — provider DTO → experience models
  providers/       — Mock / Backend / Local experience providers
  services/        — provider contract + factory
  screens/         — ProfileExperienceScreen composition
  __tests__/       — application / viewmodel / hooks
  index.ts
```

---

## Models

Immutable (`readonly` + `Object.freeze` at construction):

| Model | Role |
|-------|------|
| `AthleteProfile` | Aggregate athlete identity and preferences read model |
| `AthleteGoal` | Training / body composition goal with progress |
| `TrainingPreferences` | Session frequency, duration, focus, equipment |
| `NutritionPreferences` | Dietary approach, calorie target, allergies, supplements |
| `CoachPreferences` | Coaching style, motivation, feedback, explanation depth |
| `NotificationPreferences` | Reminder and update toggles |
| `AppearancePreferences` | Theme mode (light / dark / system), accent |
| `MeasurementUnits` | Weight, distance, height unit system |
| `ConnectedServices` / `ConnectedServiceEntry` | Health and fitness integrations (prepared) |
| `ProfileSection` | Navigation section descriptor |
| `ProfileLoadingState` | idle / loading / refreshing |
| `ProfileSavingState` | idle / saving |
| `ProfileErrorState` | retryable error envelope |

Provider DTOs remain under `services/` and are never rendered directly.

---

## Application APIs

| API | Responsibility |
|-----|----------------|
| `loadProfile` | Fetch provider DTO → map full athlete profile |
| `refreshProfile` | Explicit refresh path for profile |
| `updateTrainingPreferences` | Save training preferences through provider contract |
| `updateNutritionPreferences` | Save nutrition preferences through provider contract |
| `updateCoachPreferences` | Save coach preferences through provider contract |
| `updateNotificationPreferences` | Save notification preferences through provider contract |
| `updateAppearancePreferences` | Save appearance preferences through provider contract |
| `updateMeasurementUnits` | Save measurement units through provider contract |
| `updateGoals` | Save athlete goals through provider contract |

All accept an injectable `ProfileExperienceService`. Default resolves via `profileExperienceService` (`EXPO_PUBLIC_PROFILE_EXPERIENCE_PROVIDER`).

---

## ViewModel

`ProfileExperienceViewModel` owns:

- `loadProfile()` / `refresh()`
- `updateUnits()` / `updateTheme()`
- `updateNotifications()` / `updateTrainingPreferences()`
- `updateNutritionPreferences()` / `updateGoals()`
- `updateCoachPreferences()`
- loading / saving / error / empty flags
- subscriber notifications for hooks

No UI imports. No React. No repository or provider access from components.

---

## Hooks

| Hook | Role |
|------|------|
| `useProfile` | Subscribe to profile / refresh / load / save operations |
| `useGoals` | Goals projection + update |
| `useTrainingPreferences` | Training preferences projection + update |
| `useNutritionPreferences` | Nutrition preferences projection + update |
| `useCoachPreferences` | Coach preferences projection + update |

---

## Screen Composition

`ProfileExperienceScreen` composes only:

- `ProfileHeader`
- `AthleteCard`
- `GoalsCard`
- `TrainingPreferencesCard`
- `NutritionPreferencesCard`
- `CoachPreferencesCard`
- `NotificationPreferencesCard`
- `AppearanceCard`
- `MeasurementUnitsCard`
- `ConnectedServicesCard`
- `ProfileSectionCard`
- `ProfileSkeleton` / `ProfileEmpty` / `ProfileError`

Route: `app/(app)/(tabs)/profile.tsx` → `ProfileExperienceScreen`.

Prepared navigation placeholders (not implemented in this sprint):

- Edit Profile — `/(app)/profile/edit`
- Goal Details — `/(app)/profile/goal/:id`
- Connected Service Details — `/(app)/profile/service/:kind`
- Notification Settings — `/(app)/profile/notification-preferences`
- Privacy — `/(app)/profile/privacy`
- About — `/(app)/profile/about`

---

## Connected Services (Prepared)

| Service | Status |
|---------|--------|
| Apple Health | Prepared — not connected |
| Google Fit | Prepared — not connected |
| Garmin | Prepared — not connected |
| WHOOP | Prepared — not connected |
| Oura | Prepared — not connected |

Synchronization is not implemented in this sprint.

---

## Coach Preferences (Prepared for AI Provider)

| Dimension | Values |
|-----------|--------|
| Coaching Style | supportive / directive / analytical / motivational |
| Motivation Level | low / moderate / high / intense |
| Feedback Frequency | minimal / regular / frequent / constant |
| Explanation Depth | brief / moderate / detailed / comprehensive |

---

## Appearance

| Mode | Status |
|------|--------|
| Light | Supported |
| Dark | Supported |
| System | Supported |
| Accent color | Prepared |

---

## Provider Seam

| Provider | Behavior |
|----------|----------|
| `mock` (default) | Seeded athlete profile with goals, preferences, connected services |
| `backend` | Placeholder — throws until backend profile wiring exists |
| `local` | Placeholder — future repository / persistence-backed profile bridge |

Env: `EXPO_PUBLIC_PROFILE_EXPERIENCE_PROVIDER`.

Replacing Mock with persistence- or backend-backed profile data requires only a new provider implementation behind `ProfileExperienceService` — no UI, ViewModel, or Application contract changes.

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

- Application layer (profile / preferences / goals / error)
- ViewModel (loading / saving / refresh / empty / error / subscribers)
- Hooks (`useProfile` / `useGoals` / `useTrainingPreferences` / `useNutritionPreferences` / `useCoachPreferences`)

---

## Related

- [ADR-111](./DECISIONS.md) — Profile Experience
- [ARCHITECTURE.md](./ARCHITECTURE.md) — system architecture summary
- [PROJECT_STATE.md](./PROJECT_STATE.md) — current sprint and module state
- [CHANGELOG.md](./CHANGELOG.md) — release history
