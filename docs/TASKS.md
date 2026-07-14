# EVOLVE Tasks

**Project:** EVOLVE  
**Version:** 0.5.0  
**Status:** Living Document  
**Last Updated:** 2026-07-14  
**Purpose:** Actionable sprint checklists derived from [ROADMAP.md](./ROADMAP.md).  
**Source of Truth:** Partial — checklists only; completion status may lag code (verify against [PROJECT_STATE.md](./PROJECT_STATE.md)).

---

## Phase 1 — Foundation

### Sprint 1.1 — Database & Configuration

- [ ] Implement `backend/app/db/database.py` (`Base`, `engine`, `SessionLocal`, `get_db()`)
- [ ] Implement `backend/app/core/config.py` (Pydantic Settings, `DATABASE_URL`)
- [ ] Populate `.env.example` with all required variables
- [ ] Clean up `backend/requirements.txt` (remove duplicate/conflicting packages)
- [ ] Verify app can import database/config modules without errors

### Sprint 1.2 — Alembic & Docker

- [ ] Initialize Alembic (`alembic.ini`, `env.py`, `script.py.mako`)
- [ ] Wire `env.py` to read `DATABASE_URL` from application settings
- [ ] Verify `alembic current` connects successfully (no migrations yet)
- [ ] Add backend service to `docker-compose.yml`
- [ ] Write backend `Dockerfile`

### Sprint 1.3 — API Skeleton & CI

- [ ] Introduce `/api/v1/` routing structure
- [ ] Add health endpoint (`GET /health`) with DB connectivity check
- [ ] Add readiness endpoint
- [ ] Set up basic CI pipeline (lint step)
- [ ] Set up basic CI pipeline (test step, even if no tests exist yet)
- [ ] Populate root `README.md` with setup instructions

---

## Phase 2 — Authentication

### Sprint 2.1 — User Model & Migration

- [ ] Finalize `User` SQLAlchemy model (SQLAlchemy 2.x style)
- [ ] Rename plaintext `password` field to `hashed_password`
- [ ] Register `User` model in `db/base.py`
- [ ] Generate first Alembic migration for `users` table
- [ ] Apply migration locally and verify table structure

### Sprint 2.2 — Auth Core

- [ ] Implement `security/hashing.py` (password hashing/verification)
- [ ] Implement `security/jwt.py` (access + refresh token creation/validation)
- [ ] Implement `UserRepository`
- [ ] Implement `AuthService` (register, login, token refresh)
- [ ] Implement Pydantic schemas: `UserCreate`, `UserRead`, `TokenResponse`
- [ ] Implement `/api/v1/auth/register` endpoint
- [ ] Implement `/api/v1/auth/login` endpoint

### Sprint 2.3 — Profile & Hardening

- [ ] Implement `/api/v1/auth/refresh` endpoint
- [ ] Implement `/api/v1/users/me` (get/update profile)
- [ ] Implement `get_current_user` dependency
- [ ] Add role field to `User` (client/coach/admin)
- [ ] Write auth integration tests (register, login, protected route)

---

## Phase 3 — Workout Engine

### Sprint 3.1 — Exercise Catalog

- [ ] Create `Exercise` model and migration
- [ ] Implement `ExerciseRepository`
- [ ] Implement exercise catalog service and read-only API
- [ ] Seed database with common exercises

### Sprint 3.2 — Programs & Workouts

- [x] Create `Program` model and migration
- [x] Create `Workout` model (template + logged session) and migration
- [x] Implement `ProgramRepository`, `WorkoutRepository`
- [x] Implement program assignment flow (`WorkoutService`)

### Sprint 3.3 — Logging & Rule-Based Engine

- [x] Implement workout logging API (create/update logged sessions)
- [x] Implement session history API
- [x] Implement rule-based Workout Engine (pre-AI, template-driven) — delivered as the Workout Resolution Engine (`WorkoutResolutionService`)
- [x] Write unit tests for `WorkoutService` (established via `WorkoutLogService`, the sibling service covering the same domain)

---

## Phase 4 — AI Coach

### Sprint 4.1 — Orchestrator & Memory (superseded — see Sprint 4.2)

- [x] ~~Create `Chat` model and migration~~ — delivered the Workout Resolution Engine instead (closing out Phase 3 Sprint 3.3's rule-based Workout Engine deliverable); this sprint's originally planned scope moved to Sprint 4.2 below.
- [ ] ~~Implement `ChatRepository`~~ — moved to Sprint 4.2
- [ ] ~~Implement AI Orchestrator skeleton (intent routing stub)~~ — moved to Sprint 4.2
- [ ] ~~Implement Memory Engine v1 (read/write conversation context)~~ — moved to Sprint 4.2

### Sprint 4.2 — AI Orchestrator Infrastructure

- [x] Create `Conversation` and `ChatMessage` models and migration (a dedicated `Conversation` aggregate, not a bare `conversation_id` column — see Decision 007)
- [x] Implement `ChatRepository`
- [x] Implement provider-agnostic `LLMProvider` abstraction with a deterministic `MockLLMProvider` (Decision 008; real vendor integration deferred)
- [x] Implement `AIEngine` protocol contract (no concrete engines yet)
- [x] Implement AI Orchestrator (intent routing stub, memory-backed context assembly, LLM-fallback response synthesis, persistence) — async boundary scoped to the Orchestrator/LLM call path only (Decision 009)
- [x] Implement Memory Engine v1 (read/write conversation context)
- [x] Write unit tests (Memory Engine, mock provider, Orchestrator) and an integration test for chat persistence

### Sprint 4.3 — Nutrition Engine

> Originally scoped as "Nutrition & Recovery"; Recovery Engine split out into Sprint 4.4 below.

- [x] Create `Meal`/`MealLog` models and migration (`Meal` uses a nullable `created_by_id` + `is_public` flag, future-proofed for shared/public meals — see Decision 012)
- [x] Implement `MealRepository`, `NutritionService`
- [x] Implement Nutrition Engine (rule-based BMR/TDEE/macro-target calculation via a swappable `BMRStrategy` — see Decision 013; decoupled from `AIOrchestrator`/`AIEngine` — see Decision 011)
- [x] Implement `/api/v1/nutrition` API (meal template CRUD, meal logging, daily targets/adherence)
- [x] Write unit tests (`BMRStrategy`/`NutritionEngine`, `NutritionService`) and an integration test for the nutrition API

### Sprint 4.4 — Recovery Engine

> Split out of the original Sprint 4.3 ("Nutrition & Recovery") scope.

- [x] Create readiness/check-in model and migration (sleep, soreness/fatigue, training load inputs) — training load is derived from `WorkoutLog` history rather than a column on the check-in itself (see Decision 014 in `docs/DECISIONS.md`)
- [x] Implement the corresponding repository and service
- [x] Implement Recovery Engine (readiness scoring) — rule-based, decoupled from the Orchestrator (see Decision 016); reachable via `/api/v1/recovery`

### Sprint 4.5 — Coach Service

> Originally scoped as "Progress & Coach Endpoint"; split per Decision 018 — Progress Analyzer/`Goal`/`Progress`/real LLM integration moved to Sprint 4.6 below.

- [x] Implement `WorkoutCoachEngine`, `NutritionCoachEngine`, `RecoveryCoachEngine` (`app/ai/coach_engines.py`) — thin `AIEngine`-conformant adapters over the existing `WorkoutResolutionService`/`NutritionService`/`RecoveryService`, resolving the binding question deferred by Decisions 011/016 (see Decision 017)
- [x] Register the three adapters into `AIOrchestrator.engines`
- [x] Extend `AIOrchestrator`/`CoachResponse` to persist and surface engine `artifacts`
- [x] Implement `CoachService` — thin application-layer wrapper: conversation-ownership check, then delegates straight to `AIOrchestrator.process_message` (see Decision 019); no orchestration logic of its own
- [x] Implement `/api/v1/coach` conversational endpoint (send message; fetch one conversation's message history)
- [x] Write unit tests (coach engine adapters, `CoachService`) and an integration test for the Coach API end to end

### Sprint 4.6 — Progress & Real LLM

> Split out of the original combined Sprint 4.5 scope (see Decision 018).

- [x] Create `Goal` and `Progress` models and migrations
- [x] Implement `GoalRepository`, `ProgressRepository`
- [x] Implement Progress Analyzer (hybrid deterministic stats + LLM narrative, decoupled from `AIOrchestrator.engines` this sprint — see Decision 022/023)
- [x] Integrate a real LLM provider (deferred from Sprint 4.2 — see Decision 008; generic OpenAI-compatible endpoint, graceful degradation on failure — see Decisions 020/021)
- [x] Upgrade `classify_intent()` beyond the keyword stub — LLM-primary with a keyword fallback (see Decision 024)
- [x] Implement `GoalService`/`ProgressService` and `/api/v1/goals`/`/api/v1/progress` (including the AI-driven `GET /api/v1/progress/summary`)
- [x] Write AI engine integration tests

---

## Phase 5 — Mobile App

### Sprint 5.1 — Scaffold & Auth

> Stack decision: React Native + Expo (managed workflow), TypeScript, Expo Router — see Decision 025 in `docs/DECISIONS.md`. Onboarding this sprint is a welcome screen plus login/register; a full profile-completion wizard (height/weight/activity/goal for the Nutrition Engine) is deferred to a later mobile sprint.

- [x] Set up mobile project scaffold (`app/` — Expo + TypeScript + Expo Router, ESLint/Prettier, strict `tsconfig`)
- [x] Implement API client with JWT auth flow (`app/src/api/client.ts` — bearer auth, single refresh-and-retry-once on `401`; `app/src/api/auth.ts` against the existing `/api/v1/auth/*`/`/api/v1/users/me` endpoints, no backend changes) and token persistence via `expo-secure-store` (see Decision 026)
- [x] Implement onboarding screens (Welcome, Login, Register, and a placeholder authenticated Home screen proving the full loop)

### Sprint 5.2 — UI Foundation & Navigation

> Design system and navigation decision: token-based StyleSheet theme, 6-tab Expo Router layout, mock-first screen shells — see Decision 027 in `docs/DECISIONS.md`. Former Sprint 5.2 (API-connected core screens) is renumbered to 5.3; former 5.3 to 5.4.

- [x] Create design system (`app/src/theme/` — colors, typography, spacing, radius, shadows, theme.ts; light mode only)
- [x] Build shared UI components (`AppButton`, `AppCard`, `AppHeader`, `AppInput`, `SectionTitle`, `LoadingSpinner`, `EmptyState`, `StatCard`, `ScreenContainer`)
- [x] Implement bottom tab navigation (Home, Workout, Nutrition, Coach, Progress, Profile)
- [x] Implement Dashboard screen with mocked data (greeting, workout card, nutrition summary, recovery, weekly progress, coach suggestion)
- [x] Implement Workout screen shell (today's workout, exercise list placeholder, Start Workout button)
- [x] Implement Nutrition screen shell (macros, meals placeholder)
- [x] Implement Coach screen shell (conversation placeholder, Ask Coach input)
- [x] Implement Progress screen shell (stat cards, chart placeholders)
- [x] Implement Profile screen shell (avatar, personal info, subscription placeholder, logout)
- [x] Migrate auth/onboarding screens to design system; update folder organization and architecture docs

### Sprint 5.3 — Core Screens (API Integration)

- [ ] Implement Coach chat screen (wire to `/api/v1/coach/*`)
- [ ] Implement today's workout screen (wire to `/api/v1/workout-resolution/today`)
- [ ] Implement meal plan screen (wire to `/api/v1/nutrition/*`)

### Sprint 5.4 — Progress & Offline

- [ ] Implement progress dashboard with real data (wire to `/api/v1/progress/*`)
- [ ] Implement push notifications
- [ ] Implement offline-friendly workout logging with sync

---

## Phase 6 — Production

### Sprint 6.1 — Managed Infrastructure

- [ ] Provision managed PostgreSQL (staging + production)
- [ ] Set up secrets management
- [ ] Separate dev/staging/production environments

### Sprint 6.2 — CI/CD

- [ ] Build full CI pipeline (lint, type check, test, build)
- [ ] Build CD pipeline (deploy on merge to `main`)
- [ ] Automate Alembic migrations on deploy

### Sprint 6.3 — Operability

- [ ] Set up monitoring and alerting
- [ ] Set up rate limiting on auth and Coach endpoints
- [ ] Set up automated backups and disaster recovery
- [ ] Run load testing and establish performance baseline
- [ ] Write operational runbooks
