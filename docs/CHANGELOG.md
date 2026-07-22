# Changelog

**Project:** EVOLVE  
**Version:** 0.6.0 (current release)
**Status:** Living Document
**Last Updated:** 2026-07-22
**Purpose:** Semantic release history; accumulate changes under `[Unreleased]` until tagged.  
**Source of Truth:** Yes — for release versions and shipped changes.
All notable changes to EVOLVE are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Versioning Policy

Given a version number `MAJOR.MINOR.PATCH`:

- **MAJOR** — incompatible API changes, or breaking changes to the database schema/contract that require migration by consumers.
- **MINOR** — new functionality added in a backward-compatible manner (e.g., a new roadmap phase delivered).
- **PATCH** — backward-compatible bug fixes and small corrections.

While the project is pre-1.0 (`0.x.y`), the API and schema may still change between minor versions as the Foundation, Authentication, and Workout Engine phases stabilize. Version `1.0.0` will mark the first production-ready release (end of Phase 6).

Each release section groups changes under: `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, `Security`.

---

## [Unreleased]

### Added
- Sprint 17.4.0 — Progression Engine Foundation: `features/progression` with immutable `ProgressionPlan` / `ExerciseProgression` / `ProgressionStep`, `ProgressionEngine` (linear/volume/intensity/frequency/rotation strategies), validators, timeline utilities, in-memory plan cache, application use-cases (`generateProgression`, `previewProgression`, `explainProgression`) — no athlete feedback, load calculation, autoregulation, fatigue, deload, UI, or networking
- Sprint 17.3.0 — Programming Engine Foundation: `features/programming` with `ExercisePrescription` / `ProgrammingResult`, `ProgrammingEngine` (volume/intensity/rest/tempo/order/priority strategies), validators, estimates, in-memory result cache, application use-cases (`programExercises`, `previewProgramming`, `explainProgramming`) — no progression, weekly planning, workout assembly, UI, or networking
- Sprint 17.2.0 — Exercise Selection Engine Foundation: `features/exercise-selection` with deterministic `ExerciseSelectionEngine`, `SelectionContext`, strategy/selector pipelines, ranking/filtering, in-memory result cache, application use-cases (`selectExercises`, `previewExerciseCandidates`, `explainSelection`) — no sets/reps/RPE/volume/programming
- Sprint 17.1.0 — Exercise Knowledge Base Foundation: `features/exercise-kb` read-only bounded context with immutable `ExerciseDefinition`, relationship graph, validators, illustrative in-memory catalog, `ExerciseKnowledgeService` + application queries — no workout logic, selection, UI, or durable persistence
- Sprint 14.0.0 — Workout Analytics Foundation: `features/analytics` domain with `WorkoutAnalytics` / `ExerciseAnalytics` / `WeeklyAnalytics` / `WorkoutTrend` models, `WorkoutAnalyticsRepository` (`HistoryBackedWorkoutAnalyticsRepository` over `WorkoutHistoryRepository`), application use-cases + `useWorkoutAnalytics` hook, volume/frequency trend APIs — no screens, charts, dashboards, or AI
- Sprint 13.2.0 — Workout Detail Experience: `WorkoutDetailScreen` + reusable `WorkoutDetailHero` / `WorkoutMetricsGrid` / `WorkoutExerciseCard` / `WorkoutSetRow` / `WorkoutDetailFooter`, `getCompletedSession` / `useWorkoutDetail`, empty/not-found state — loads via `WorkoutHistoryRepository.getCompletedSession`; completed exercises/sets persisted on `CompletedWorkout`; no editing, deletion, analytics, PRs, sharing, export, or AI
- Sprint 13.1.0 — Workout History Timeline: `WorkoutHistoryScreen` + reusable `WorkoutHistoryCard`, `listCompletedSessions` / `useWorkoutHistory`, empty state, and detail-route stub — reads exclusively via `WorkoutHistoryRepository`; newest-first; no analytics, charts, filters, search, export, or cloud sync
- Sprint 13.0.0 — Workout History Persistence Foundation: on-device `CompletedWorkout` domain model, `StorageAdapter` / `AsyncStorageAdapter`, `WorkoutHistoryRepository` (`saveCompletedSession`, `getCompletedSessions`, `getCompletedSession`, `getRecentSessions`, `clearHistory`), and application `persistCompletedSession` — auto-saves after summary build with no UI changes; no analytics, charts, or dashboards
- Sprint 12.7.0 — Finish Workout Flow: local session completion detection, Finish Workout CTA, `WorkoutSessionSummary` mapper, in-memory summary handoff, and `WorkoutSessionCompleteScreen` — still no persistence, sync, AI, WorkoutSessionBuilder, or Training Engine changes
- Sprint 12.6.0 — Rest Timer & Set Flow: local `useSessionTiming` rest countdown (pause / resume / skip), automatic next-set selection, active-set highlight, and auto-scroll on `WorkoutSessionScreen` — still no persistence, sync, AI, WorkoutSessionBuilder, or Training Engine changes
- Sprint 12.5.0 — Interactive Workout Session: local-only set interaction via `useLocalSessionInteraction` (complete/uncomplete/skip, edit completed reps/load, session + exercise progress) without mutating immutable `WorkoutSession`, persistence, timers, AI, or the Training Engine
- Sprint 12.4.0 — Connect Start Workout flow: `useStartWorkoutSession` invokes application-layer `WorkoutSessionBuilder`, in-memory `executableSessionHandoff`, and `WorkoutSessionScreen` renders immutable application `WorkoutSession` models (title, subtitle, ordered sets, reps, intensity, rest, progression)
- Restored Expo Router tree under `app/app/` (thin routes) so preview → session navigation works again
- Default program auto-assignment on first workout access (Sprint 6.3.1)
- `WorkoutService.ensure_active_assignment()` and `assign_default_program()` — reuses `assign_program()` with `Settings.default_program_slug`
- `database/seeds/seed_default_program.py` — idempotent `beginner-foundation` program seed
- `DEFAULT_PROGRAM_SLUG` setting (default: `beginner-foundation`)
- Workout Engine v1 — production backend integration for mobile Workout domain (Sprint 6.3)
- `GET /api/v1/workouts/current` — workout resolution preview alias
- `POST /api/v1/workouts/session` and `PATCH /api/v1/workouts/session/{id}` — session lifecycle aliases (`finish`/`skip`/notes)
- `GET /api/v1/workouts` + `GET /api/v1/workouts/{id_or_slug}` — read-only workout template browsing with embedded exercise catalog refs
- `POST /api/v1/workout-logs/{id}/exercises/{exercise_id}/skip` — per-exercise skip within a session (`WorkoutLogExercise.skipped`, migration `37fd64b528a8`)
- `BackendWorkoutService` — full `WorkoutService` implementation against `/workout-resolution/*`, `/workouts/*`, `/workout-logs/*`
- `app/src/api/workouts.ts` — typed workout domain API client
- `backendWorkoutAdapters.ts` — DTO → production model mapping (muscle/equipment slugs, placeholder sets, history)
- `useWorkout()` hook — loads today's workout via `workoutService.getTodayWorkout()`; surfaces `error` for non-training-day states
- Workout unit/integration tests: `test_workouts_api.py`, `test_workout_logs_api.py`, `BackendWorkoutService.test.ts`, `useWorkout.test.ts`
- `UserService` with `update_profile()` — partial profile updates with email/username conflict detection
- `PATCH /api/v1/users/me` route wired through `get_user_service()` dependency
- Mobile user profile provider stack: `BackendUserService`, `MockCurrentUserService`, `useCurrentUser()` hook
- `updateCurrentUser()` API client for profile PATCH
- Unit tests (`test_user_service.py`) and integration tests (`test_users_api.py`)
- Profile edit mode on `ProfileScreen` — `useProfileEdit`, `ProfileEditForm`, validation, save/cancel (Sprint 6.1)
- `CurrentUserService.updateProfile()` and `useCurrentUser().updateProfile()` / `saving` state (Sprint 6.1)
- Profile form utilities (`profileForm`, `profileValidation`, `profileLabels`) and screen/service tests (Sprint 6.1)
- Official project knowledge base under `docs/` (Sprint DOC-1): README index, master report, project state, sprint history, architecture summary, status reports, API inventory, known issues
- [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md) and [TECH_STACK.md](./TECH_STACK.md) (Sprint DOC-1.1)
- Standardized document headers across all `docs/` markdown files
- Documentation Maintenance Policy in [README.md](./README.md)

### Changed
- Architecture docs now describe the mobile AI workout pipeline through Progression (17.1–17.4); Fatigue & Recovery / Assembly / Program Generation remain planned (17.5–17.7)
- `CompletedWorkout` / `WorkoutSessionSummary` now carry ordered exercise snapshots with completed sets (weight, reps, set number) for detail rendering; legacy history entries parse with empty `exercises` (Sprint 13.2.0)
- Optional `programName` on `WorkoutSessionSummary` / `CompletedWorkout` (from session `programTitle`); history entry from Workout tab; card press → detail stub (Sprint 13.1.0)
- `useSessionFinish.buildSummary()` persists a `CompletedWorkout` via the application layer after mapping (fire-and-forget; finish navigation unchanged) (Sprint 13.0.0)
- `WorkoutSessionScreen` orchestrates interaction + timing + finish hooks; when all sets are accounted, Finish Workout builds a local `WorkoutSessionSummary` and navigates to Workout Complete (Sprint 12.7.0)
- `WorkoutSessionScreen` orchestrates `useLocalSessionInteraction` + `useSessionTiming`; rest timer, active-set highlight, and auto-scroll guide set flow locally (Sprint 12.6.0)
- `WorkoutSessionScreen` consumes `useLocalSessionInteraction` for local execution overlay; `SessionHero` / `SessionExerciseList` / `SessionSetRow` show live progress and set actions (Sprint 12.5.0)
- `WorkoutScreen` Start Workout CTA builds a session via `WorkoutSessionBuilder` (selected preview day) and navigates to `/(app)/workout/session` — React holds UI state only; no Training Engine changes (Sprint 12.4.0)
- `WorkoutSessionScreen` now displays application-layer executable sessions (read-only briefing); logging remains deferred
- `GET /workout-resolution/today` and `GET /workouts/current` auto-assign the default beginner program when the user has no active assignment; return **503** when the default program is not seeded (Sprint 6.3.1)
- `EXPO_PUBLIC_WORKOUT_PROVIDER` defaults to `backend` (mirrors user profile provider)
- API endpoint counts reconciled: **56 implemented**, **6 planned** ([API_STATUS.md](./API_STATUS.md))
- `ProfileScreen` now supports read/edit modes with backend-backed save via `useCurrentUser()` (Sprint 6.1)
- `ProfileScreen` now consumes `useCurrentUser()` instead of `profileMock` + direct `useAuth()` user fields
- `CurrentUserService` extended with `providerId` and `refresh()` for async backend loading
- API endpoint counts reconciled: **50 implemented**, **6 planned** ([API_STATUS.md](./API_STATUS.md))
- `docs/ROADMAP.md` — phase completion status table
- `docs/DECISIONS.md` — standard document header
- API endpoint counts reconciled: **49 implemented**, **7 planned** ([API_STATUS.md](./API_STATUS.md))

### Architecture
- Three new mobile bounded contexts: Exercise Knowledge Base (read-only), Exercise Selection Engine (deterministic), Programming Engine (immutable prescriptions)
- Pipeline boundary clarified: Programming stops at prescriptions; progression/assembly/program generation are separate future engines
- ADRs 028–030 appended for Knowledge / Selection / Programming boundaries

### Testing
- Jest suites added for `exercise-kb` (6), `exercise-selection` (8), and `programming` (7) covering models/engine/strategies/validators/utils/repository/service/application

### Typecheck
- New domains are TypeScript-strict application modules under `app/src/features/`; no new HTTP contracts or schema migrations
---

## [0.5.0] — Mobile App (Partial)

**Corresponds to:** Roadmap Phase 5 — Mobile App (Sprints 5.1, 5.2, 5.6)

### Added
- React Native + Expo mobile client at `app/` (ADR-025)
- JWT auth flow with expo-secure-store token persistence (ADR-026)
- Design system with light/dark/system theme support
- 6-tab navigation: Home, Workout, Nutrition, Coach, Progress, Profile
- Feature-module architecture with service factory + provider pattern
- Workout domain foundation (types, hooks, mock program data)
- UI polish: animations, hero components, settings screens, haptics
- Mobile test suite (Jest + Testing Library)

### Notes
- All feature data uses mock providers; backend integration is Sprint 5.3
- Dark mode added in Sprint 5.6 (extends ADR-027 light-only scope)

---

## [0.4.0] — AI Coach

**Corresponds to:** Roadmap Phase 4 — AI Coach (Sprints 4.1–4.6)

### Added
- Workout Resolution Engine with stored program cursor (ADR-006)
- AI Orchestrator, Memory Engine, Conversation/ChatMessage persistence (ADRs 007–009)
- Nutrition Engine — rule-based BMR/TDEE/macros (ADRs 010–013)
- Recovery Engine — readiness scoring from check-ins + training load (ADRs 014–016)
- Coach API with Workout/Nutrition/Recovery engine adapters (ADRs 017–019)
- Goal and Progress domains with Progress Analyzer (ADRs 022–023)
- OpenAI-compatible LLM provider with graceful degradation (ADRs 020–021)
- LLM-primary intent classification with keyword fallback (ADR-024)
- Endpoints: `/coach`, `/nutrition`, `/recovery`, `/goals`, `/progress`

---

## [0.3.0] — Workout Engine

**Corresponds to:** Roadmap Phase 3 — Workout Engine (Sprints 3.1–3.3, 4.1)

### Added
- Exercise catalog with read-only API and seed data
- Program, workout template, and program assignment models
- Full workout logging lifecycle (start → log sets → finish/skip → history)
- Workout Resolution Engine (`GET /workout-resolution/today`)
- 8 Alembic migrations covering full fitness domain schema
- Comprehensive unit and integration test suite

### Notes
- Program/workout authoring exists in service layer but has no HTTP API yet

---

## [0.2.0] — Authentication

**Corresponds to:** Roadmap Phase 2 — Authentication (Sprints 2.1–2.2)

### Added
- `User` model with Argon2 password hashing
- JWT access + refresh token flow
- `AuthService`, `UserRepository`, `get_current_user` dependency
- Endpoints: `POST /auth/register`, `/auth/login`, `/auth/refresh`, `GET /users/me`
- First Alembic migration (`users` table)

### Notes
- Profile update endpoint and role field deferred to Sprint 2.3 completion

---

## [0.1.0] — Foundation

**Corresponds to:** Roadmap Phase 1 — Foundation

### Added
- SQLAlchemy 2.x database engine, session factory, and `get_db()` dependency (`backend/app/db/database.py`).
- Environment-based application configuration via Pydantic Settings (`backend/app/core/config.py`).
- `DATABASE_URL` and core application environment variables documented in `.env.example`.
- Alembic fully configured (`alembic.ini`, `env.py`, `script.py.mako`), wired to read the database URL from application settings.
- Model registration hook (`backend/app/db/base.py`) for future Alembic autogeneration.
- Project architecture reference (`EVOLVE_ARCHITECTURE.md`) covering vision, backend architecture, folder structure, AI architecture, database entities, roadmap, coding standards, and deployment strategy.
- Cursor project rules (`evolve.mdc`) defining Clean Architecture conventions for all future contributions.

### Changed
- Consolidated `backend/requirements.txt`, removing duplicate and conflicting dependencies (`psycopg2-binary` in favor of `psycopg[binary]`); added `pydantic-settings`.

### Notes
- No Alembic migrations have been generated yet — the migration chain begins with the `User` model in Phase 2.
- `backend/app/main.py` intentionally remains unchanged from its original minimal health-check form; database wiring at startup is deferred until the foundation is fully verified and migrations exist.
- No authentication, user, or AI functionality is included in this release — strictly database and configuration foundation.

---

*Next release: `1.0.0` (Production — Phase 6).*
