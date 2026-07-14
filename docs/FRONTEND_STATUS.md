# EVOLVE Frontend Status

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-14  
**Purpose:** Mobile client modules, providers, completed work, and backend integration plan.  
**Source of Truth:** Yes — for frontend layer status (stack versions: [TECH_STACK.md](./TECH_STACK.md)).
---

## Stack

| Component | Version / Choice |
|-----------|------------------|
| Framework | React Native 0.81.5 + Expo SDK ~54 |
| Language | TypeScript ~5.9 (strict) |
| Navigation | Expo Router ~6 (file-based) |
| State | React Context only (Auth, Theme) — no Redux/Zustand |
| Styling | StyleSheet + theme tokens |
| Testing | Jest + jest-expo + Testing Library |
| Token storage | expo-secure-store (never AsyncStorage for credentials) |

---

## Project Structure

```
app/
├── app.config.ts              EXPO_PUBLIC_* env vars
├── app/                       Expo Router (thin routes)
│   ├── (auth)/                login, register
│   ├── (onboarding)/          welcome
│   ├── (app)/(tabs)/          6 main tabs
│   └── (app)/settings/        settings, appearance, theme
└── src/
    ├── api/                   HTTP client, auth endpoints
    ├── auth/                  AuthContext, secureStorage
    ├── theme/                 Design tokens, ThemeContext
    ├── components/            Shared UI (~25 components)
    ├── screens/               Screen implementations
    ├── features/              Domain modules (see below)
    ├── animation/             Reanimated utilities
    └── haptics/               Haptic feedback helper
```

---

## Feature Modules

| Module | Path | Hooks | Providers | Status |
|--------|------|-------|-----------|--------|
| **coach** | `features/coach/` | `useCoachChat` | mock, backend (stub), OpenAI/Anthropic/local (stub) | UI complete; mock data |
| **workout** | `features/workout/` | `useWorkoutSession`, `useWorkoutProgram` | mock, backend (stub), local | Domain foundation + UI |
| **nutrition** | `features/nutrition/` | `useNutrition` | mock, backend (stub) | UI complete; mock data |
| **progress** | `features/progress/` | via `progressService` | mock, backend (stub) | UI complete; mock data |
| **home** | `features/home/` | `useHome` | mock, backend (stub), local | Dashboard aggregation |
| **dashboard** | `features/dashboard/` | — | presentation components | Hero/summary widgets |
| **profile** | `features/profile/` | `useProfileEdit` | — | Editable profile UI (Sprint 6.1) |
| **shared** | `features/shared/` | `useCurrentUser` | mock, backend | User profile wired to API (Sprint 6.0) |

---

## Completed Architecture

### Authentication (Sprint 5.1)
- JWT login/register/refresh against backend
- Token persistence in secure store
- Auth guard in `(app)/_layout.tsx`
- 401 → silent refresh → retry-once → logout

### Design System (Sprint 5.2 + 5.6)
- Token files: colors, typography, spacing, radius, shadows, motion, elevation
- Light/dark/system theme via `ThemeContext` + AsyncStorage preference
- Shared components: AppButton, AppCard, StatCard, Skeleton, HeroSection, AiPresenceOrb, etc.
- Animation utilities: press scale, glow pulse, hero entrance, reduce-motion support

### Navigation (Sprint 5.2)
- 6-tab floating tab bar: Home, Workout, Nutrition, Coach, Progress, Profile
- Settings stack: appearance, theme selection
- 404 handler (`+not-found.tsx`)

### Service Factory Pattern (Sprint 5.2b+)
- Per-domain `*ServiceFactory.ts` resolves provider from env
- Interface-driven providers enable mock → backend swap without screen changes
- Adapter utilities translate API shapes to feature models

### Screens (Sprint 5.2 + 5.6)
All primary screens implemented with premium layout:
- DashboardScreen, WorkoutScreen, NutritionScreen, CoachScreen
- ProgressScreen, ProfileScreen, SettingsScreen, AppearanceScreen, ThemeScreen
- WelcomeScreen, LoginScreen, RegisterScreen

---

## Mock Providers

Default provider for all domains is **mock**. Mock providers serve static fixtures from:
- `features/*/mocks/` — domain-specific data
- `src/data/mocks/` — shared fixtures (coach messages, etc.)

| Provider | Env var | Default | Status |
|----------|---------|---------|--------|
| Workout | `EXPO_PUBLIC_WORKOUT_PROVIDER` | mock | Working |
| Nutrition | `EXPO_PUBLIC_NUTRITION_PROVIDER` | mock | Working |
| Coach | `EXPO_PUBLIC_COACH_PROVIDER` | mock | Working |
| Progress | `EXPO_PUBLIC_PROGRESS_PROVIDER` | mock | Working |
| Home | `EXPO_PUBLIC_HOME_PROVIDER` | mock | Working |
| User | `EXPO_PUBLIC_USER_PROVIDER` | backend | Working (Sprint 6.0) |

---

## Backend Integration

| Domain | Backend endpoints wired | Provider file | Status |
|--------|-------------------------|---------------|--------|
| User profile | `GET /users/me`, `PATCH /users/me` | `BackendUserService` | **Live** (Sprint 6.0–6.1) |
| Coach | `POST /coach/messages`, `GET /coach/conversations/{id}/messages` | `BackendCoachService` (stub) | Pending |
| Workout | `GET /workout-resolution/today`, `/workout-logs/*` | `BackendWorkoutService` (stub) | Pending |
| Nutrition | `/nutrition/meals`, `/nutrition/logs`, `/nutrition/targets` | `BackendNutritionService` (stub) | Pending |
| Progress | `/progress`, `/progress/summary`, `/goals` | `BackendProgressService` (stub) | Pending |
| Home | Aggregates above APIs | `BackendHomeService` (stub) | Pending |

**API base URL:** `EXPO_PUBLIC_API_BASE_URL` in `app.config.ts`

---

## Pending Work

| Item | Sprint |
|------|--------|
| Implement all `Backend*Service` providers | 5.3 |
| Profile completion onboarding (height/weight/activity/goal) | 5.3+ |
| Real progress charts (replace ChartPlaceholder) | 5.4 |
| Push notifications | 5.4 |
| Offline workout logging with sync | 5.4 |
| Wire feature flags to actual features | TBD |
| Barcode scanner, progress photos, social sharing | Future |
| Client-side OpenAI/Anthropic/local LLM providers | Future (backend Coach preferred) |

---

## Tests

| Area | Files |
|------|-------|
| Auth/API | `api/__tests__/`, `auth/__tests__/` |
| Screens | `screens/__tests__/LoginScreen`, `RegisterScreen`, `ProfileScreen` |
| Features | `features/*/__tests__/` — architecture and service tests |
| Components | Selected component tests |

Run: `npm test` from `app/`

---

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `EXPO_PUBLIC_API_BASE_URL` | Backend URL (default `http://localhost:8000`) |
| `EXPO_PUBLIC_WORKOUT_PROVIDER` | mock \| backend \| local |
| `EXPO_PUBLIC_NUTRITION_PROVIDER` | mock \| backend |
| `EXPO_PUBLIC_COACH_PROVIDER` | mock \| backend |
| `EXPO_PUBLIC_PROGRESS_PROVIDER` | mock \| backend |
| `EXPO_PUBLIC_HOME_PROVIDER` | mock \| backend \| local |

See `app/.env.example` for template.
