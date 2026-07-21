# EVOLVE Sprint History

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document (append-only)  
**Last Updated:** 2026-07-21  
**Purpose:** Chronological record of every sprint. Append new entries at the bottom — never rewrite past entries.  
**Source of Truth:** Yes — for sprint chronology and completion dates.
---

## Phase 1 — Foundation

### Sprint 1.1 — Database & Configuration

| Field | Detail |
|-------|--------|
| **Sprint ID** | 1.1 |
| **Title** | Database & Configuration |
| **Date** | 2025 (approx.) |
| **Goal** | Runnable database layer and environment-based config |
| **Files modified** | `backend/app/db/database.py`, `backend/app/core/config.py`, `.env.example`, `backend/requirements.txt` |
| **Architecture impact** | Established SQLAlchemy 2.x session pattern and Pydantic Settings |
| **Status** | Complete |
| **Notes** | Foundation for all subsequent phases |

### Sprint 1.2 — Alembic & Docker

| Field | Detail |
|-------|--------|
| **Sprint ID** | 1.2 |
| **Title** | Alembic & Docker |
| **Date** | 2025 (approx.) |
| **Goal** | Schema migration tooling and local PostgreSQL |
| **Files modified** | `alembic.ini`, `backend/alembic/`, `docker-compose.yml` |
| **Architecture impact** | Alembic replaces ad-hoc schema creation; Docker Compose for DB |
| **Status** | Partial |
| **Notes** | Backend Dockerfile and Compose service not yet added |

### Sprint 1.3 — API Skeleton & CI

| Field | Detail |
|-------|--------|
| **Sprint ID** | 1.3 |
| **Title** | API Skeleton & CI |
| **Date** | — |
| **Goal** | Versioned API structure, health endpoints, CI pipeline |
| **Files modified** | `backend/app/api/v1/`, `backend/app/main.py` |
| **Architecture impact** | `/api/v1/` routing established |
| **Status** | Partial |
| **Notes** | `GET /health` with DB check, CI pipeline, root README still pending |

---

## Phase 2 — Authentication

### Sprint 2.1 — User Model & Migration

| Field | Detail |
|-------|--------|
| **Sprint ID** | 2.1 |
| **Title** | User Model & Migration |
| **Date** | 2025 (approx.) |
| **Goal** | First Alembic migration and User ORM model |
| **Files modified** | `backend/app/models/user.py`, `backend/alembic/versions/5ccce88c59dd_*`, `backend/app/schemas/user.py` |
| **Architecture impact** | First domain entity; repository pattern introduced |
| **Status** | Complete |
| **Notes** | Commit: `feat(user): implement SQLAlchemy user model and initial migration` |

### Sprint 2.2 — Auth Core

| Field | Detail |
|-------|--------|
| **Sprint ID** | 2.2 |
| **Title** | Auth Core |
| **Date** | 2025 (approx.) |
| **Goal** | Password hashing, JWT, register/login |
| **Files modified** | `backend/app/security/`, `backend/app/services/auth_service.py`, `backend/app/api/v1/auth.py` |
| **Architecture impact** | Stateless JWT auth; ADR-001 stack confirmed in practice |
| **Status** | Complete |
| **Notes** | Argon2 via pwdlib; PyJWT for tokens |

### Sprint 2.3 — Profile & Hardening

| Field | Detail |
|-------|--------|
| **Sprint ID** | 2.3 |
| **Title** | Profile & Hardening |
| **Date** | 2025 (approx.) |
| **Goal** | Refresh tokens, profile endpoint, auth tests |
| **Files modified** | `backend/app/api/v1/users.py`, `backend/app/security/dependencies.py` |
| **Architecture impact** | `get_current_user` dependency used across all protected routes |
| **Status** | Partial |
| **Notes** | `GET /users/me` done; `PATCH /users/me`, role field, dedicated auth tests pending |

---

## Phase 3 — Workout Engine

### Sprint 3.1 — Exercise Catalog

| Field | Detail |
|-------|--------|
| **Sprint ID** | 3.1 |
| **Title** | Exercise Catalog |
| **Date** | 2025 (approx.) |
| **Goal** | Exercise model, read-only catalog API, seed data |
| **Files modified** | `backend/app/models/exercise.py`, `backend/app/api/v1/exercises.py`, `database/seeds/` |
| **Architecture impact** | Public read-only catalog pattern established |
| **Status** | Complete |
| **Notes** | Commit: `feat(exercises): implement exercise catalog domain` |

### Sprint 3.2 — Programs & Workouts

| Field | Detail |
|-------|--------|
| **Sprint ID** | 3.2 |
| **Title** | Programs & Workouts |
| **Date** | 2025 (approx.) |
| **Goal** | Program/workout template models and assignment flow |
| **Files modified** | `backend/app/models/program.py`, `backend/app/models/workout.py`, `backend/app/services/workout_service.py` |
| **Architecture impact** | Template vs. execution aggregate separation |
| **Status** | Complete |
| **Notes** | Service layer complete; HTTP routes for authoring not exposed |

### Sprint 3.3 — Logging & Rule-Based Engine

| Field | Detail |
|-------|--------|
| **Sprint ID** | 3.3 |
| **Title** | Workout Logging |
| **Date** | 2025 (approx.) |
| **Goal** | Full workout session lifecycle and history API |
| **Files modified** | `backend/app/models/workout_log.py`, `backend/app/services/workout_log_service.py`, `backend/app/api/v1/workout_logs.py` |
| **Architecture impact** | Execution aggregate with snapshot semantics |
| **Status** | Complete |
| **Notes** | Commit: `feat(workout): implement workout execution and logging` |

---

## Phase 4 — AI Coach

### Sprint 4.1 — Workout Resolution Engine

| Field | Detail |
|-------|--------|
| **Sprint ID** | 4.1 |
| **Title** | Workout Resolution Engine |
| **Date** | 2025–2026 |
| **Goal** | Rule-based "what to do today" engine (closes Phase 3 deliverable) |
| **Files modified** | `backend/app/services/workout_resolution_service.py`, `backend/app/api/v1/workout_resolution.py`, migration `84b668dd4276` |
| **Architecture impact** | Stored cursor on ProgramAssignment (ADR-006) |
| **Status** | Complete |
| **Notes** | Originally planned as Orchestrator sprint; scope redirected |

### Sprint 4.2 — AI Orchestrator Infrastructure

| Field | Detail |
|-------|--------|
| **Sprint ID** | 4.2 |
| **Title** | AI Orchestrator Infrastructure |
| **Date** | 2026 |
| **Goal** | Conversation persistence, Memory Engine, LLM abstraction, Orchestrator |
| **Files modified** | `backend/app/ai/`, `backend/app/models/chat.py`, `backend/app/repositories/chat_repository.py` |
| **Architecture impact** | First async boundary (ADR-009); Conversation aggregate (ADR-007); Mock LLM (ADR-008) |
| **Status** | Complete |
| **Notes** | Commit: `feat(ai): implement AI orchestrator infrastructure` |

### Sprint 4.3 — Nutrition Engine

| Field | Detail |
|-------|--------|
| **Sprint ID** | 4.3 |
| **Title** | Nutrition Engine |
| **Date** | 2026 |
| **Goal** | Meal domain, rule-based macro targets, nutrition API |
| **Files modified** | `backend/app/ai/nutrition_engine.py`, `backend/app/models/meal.py`, `backend/app/api/v1/nutrition.py` |
| **Architecture impact** | BMR strategy pattern (ADR-013); engine decoupled from Orchestrator (ADR-011) |
| **Status** | Complete |
| **Notes** | Commit: `feat(nutrition): implement nutrition engine` |

### Sprint 4.4 — Recovery Engine

| Field | Detail |
|-------|--------|
| **Sprint ID** | 4.4 |
| **Title** | Recovery Engine |
| **Date** | 2026 |
| **Goal** | Check-ins, readiness scoring, recovery API |
| **Files modified** | `backend/app/ai/recovery_engine.py`, `backend/app/models/recovery.py`, `backend/app/api/v1/recovery.py` |
| **Architecture impact** | Training load derived from WorkoutLog (ADR-014); one check-in per day (ADR-015) |
| **Status** | Complete |
| **Notes** | Commit: `feat(recovery): implement recovery engine` |

### Sprint 4.5 — Coach Service

| Field | Detail |
|-------|--------|
| **Sprint ID** | 4.5 |
| **Title** | Coach Service |
| **Date** | 2026 |
| **Goal** | Conversational Coach API with engine adapters |
| **Files modified** | `backend/app/ai/coach_engines.py`, `backend/app/services/coach_service.py`, `backend/app/api/v1/coach.py` |
| **Architecture impact** | Coach-facing engine adapters (ADR-017); ownership enforcement (ADR-019); sprint split (ADR-018) |
| **Status** | Complete |
| **Notes** | Commit: `feat(coach): implement coach orchestration service` |

### Sprint 4.6 — Progress & Real LLM

| Field | Detail |
|-------|--------|
| **Sprint ID** | 4.6 |
| **Title** | Progress & Real LLM |
| **Date** | 2026 |
| **Goal** | Goals/progress domain, Progress Analyzer, OpenAI-compatible LLM, intent upgrade |
| **Files modified** | `backend/app/ai/progress_analyzer.py`, `backend/app/ai/llm_provider.py`, `backend/app/api/v1/progress.py`, `backend/app/api/v1/goals.py` |
| **Architecture impact** | Real LLM (ADR-020), graceful degradation (ADR-021), hybrid analyzer (ADR-022), Progress decoupled from Coach (ADR-023), LLM intent (ADR-024) |
| **Status** | Complete |
| **Notes** | Commit: `feat(progress): implement progress domain and openai provider` |

---

## Phase 5 — Mobile App

### Sprint 5.1 — Scaffold & Auth

| Field | Detail |
|-------|--------|
| **Sprint ID** | 5.1 |
| **Title** | Mobile Scaffold & Auth |
| **Date** | 2026 |
| **Goal** | Expo project, API client, JWT auth flow |
| **Files modified** | `app/` (full scaffold), `app/src/api/`, `app/src/auth/` |
| **Architecture impact** | React Native + Expo decision (ADR-025); secure-store tokens (ADR-026) |
| **Status** | Complete |
| **Notes** | Commit: `feat(mobile): scaffold expo app and auth flow` |

### Sprint 5.2 — UI Foundation & Navigation

| Field | Detail |
|-------|--------|
| **Sprint ID** | 5.2 |
| **Title** | UI Foundation & Navigation |
| **Date** | 2026 |
| **Goal** | Design system, 6-tab navigation, mock screen shells |
| **Files modified** | `app/src/theme/`, `app/src/components/`, `app/src/screens/`, `app/app/(app)/(tabs)/` |
| **Architecture impact** | Mock-first screen pattern (ADR-027); sprint renumbering 5.3/5.4 |
| **Status** | Complete |
| **Notes** | Commit: `feat(ui): complete Sprint 5.2 mobile foundation` |

### Sprint 5.2b — Workout Domain Foundation

| Field | Detail |
|-------|--------|
| **Sprint ID** | 5.2b (interim) |
| **Title** | Workout Domain Foundation |
| **Date** | 2026 |
| **Goal** | Mobile workout types, hooks, mock program data, service layer |
| **Files modified** | `app/src/features/workout/` (types, hooks, mocks, services) |
| **Architecture impact** | Feature-module pattern extended to workout domain |
| **Status** | Complete |
| **Notes** | Commit: `feat(workout): create workout domain foundation`; not in original roadmap numbering |

### Sprint 5.6 — UI Polish Baseline

| Field | Detail |
|-------|--------|
| **Sprint ID** | 5.6 |
| **Title** | UI Polish Baseline |
| **Date** | 2026-07 |
| **Goal** | Premium visual polish, dark mode, animations, feature hero components |
| **Files modified** | 106 files — theme system, animation utilities, screen refactors, settings routes |
| **Architecture impact** | `ThemeContext` with light/dark/system; feature-specific presentation components |
| **Status** | Complete |
| **Notes** | Commit: `Sprint 5.6.0 - UI polish baseline`; supersedes ADR-027 "light only" for theme preference |

### Sprint 5.3 — Core Screens (API Integration)

| Field | Detail |
|-------|--------|
| **Sprint ID** | 5.3 |
| **Title** | Core Screens API Integration |
| **Date** | — |
| **Goal** | Wire Coach, workout, nutrition screens to backend |
| **Files modified** | — |
| **Architecture impact** | Backend provider implementations replace stubs |
| **Status** | **Pending** |
| **Notes** | Next sprint after documentation freeze (5.3) |

### Sprint 5.4 — Progress & Offline

| Field | Detail |
|-------|--------|
| **Sprint ID** | 5.4 |
| **Title** | Progress & Offline |
| **Date** | — |
| **Goal** | Real progress data, push notifications, offline workout sync |
| **Files modified** | — |
| **Architecture impact** | Offline storage layer; notification service |
| **Status** | **Pending** |
| **Notes** | Depends on 5.3 |

---

## Phase 6 — Production

### Sprints 6.1–6.3

| Field | Detail |
|-------|--------|
| **Sprint ID** | 6.1, 6.2, 6.3 |
| **Title** | Production Hardening |
| **Date** | — |
| **Goal** | Managed infra, CI/CD, monitoring, runbooks |
| **Status** | **Not started** |

---

## Documentation

### Sprint DOC-1 — Project Knowledge Base

| Field | Detail |
|-------|--------|
| **Sprint ID** | DOC-1 |
| **Title** | Project Knowledge Base |
| **Date** | 2026-07-14 |
| **Goal** | Create official `docs/` knowledge base as single source of truth |
| **Files modified** | `docs/README.md`, `docs/EVOLVE_MASTER_REPORT.md`, `docs/PROJECT_STATE.md`, `docs/SPRINT_HISTORY.md`, `docs/ARCHITECTURE.md`, `docs/FRONTEND_STATUS.md`, `docs/BACKEND_STATUS.md`, `docs/AI_SYSTEM.md`, `docs/API_STATUS.md`, `docs/KNOWN_ISSUES.md`, updates to `ROADMAP.md`, `CHANGELOG.md`, `DECISIONS.md` header |
| **Architecture impact** | None (documentation only) |
| **Status** | Complete |
| **Notes** | Establishes living-document maintenance rules for all future sprints |

### Sprint DOC-1.1 — Documentation Finalization

| Field | Detail |
|-------|--------|
| **Sprint ID** | DOC-1.1 |
| **Title** | Documentation Finalization |
| **Date** | 2026-07-14 |
| **Goal** | Freeze official knowledge base: standardize headers, add onboarding docs, reconcile consistency |
| **Files modified** | `docs/PROJECT_CONTEXT.md`, `docs/TECH_STACK.md`, all `docs/*.md` headers, `docs/README.md` (Maintenance Policy), `docs/API_STATUS.md` (endpoint count fix) |
| **Architecture impact** | None (documentation only) |
| **Status** | Complete |
| **Notes** | API count corrected to 49 implemented + 7 planned; DOC-1.1 completes documentation phase |

---

*Append new sprint entries below this line.*

### Sprint 6.3.1 — Default Program Assignment

| Field | Detail |
|-------|--------|
| **Sprint ID** | 6.3.1 |
| **Title** | Default Program Assignment |
| **Date** | 2026-07-15 |
| **Goal** | Auto-assign default beginner program on first workout access when user has no active ProgramAssignment |
| **Files modified** | `backend/app/services/workout_service.py`, `backend/app/core/config.py`, `backend/app/api/v1/workout_resolution.py`, `backend/app/api/v1/workouts.py`, `backend/tests/`, docs |
| **Files created** | `backend/app/api/v1/workout_preview.py`, `database/seeds/seed_default_program.py`, `backend/tests/integration/test_default_program_assignment_api.py` |
| **Architecture impact** | `WorkoutService.ensure_active_assignment()` reuses `assign_program()`; `WorkoutResolutionService` stays read-only; API layer orchestrates ensure-then-resolve |
| **Status** | Complete |
| **Notes** | `DEFAULT_PROGRAM_SLUG=beginner-foundation`; missing seed returns HTTP 503. Run `seed_default_program.py` after `seed_exercises.py`. |

### Sprint 6.3 — Workout Engine v1 (Production Ready)

| Field | Detail |
|-------|--------|
| **Sprint ID** | 6.3 |
| **Title** | Workout Engine v1 (Production Ready) |
| **Date** | 2026-07-15 |
| **Goal** | Transform Workout from presentation layer into a production-ready domain with PostgreSQL persistence |
| **Files modified** | `backend/app/api/v1/workouts.py`, `backend/app/api/v1/workout_logs.py`, `backend/app/services/workout_log_service.py`, `backend/app/schemas/workout_log.py`, `backend/alembic/versions/37fd64b528a8_*`, `app/src/api/workouts.ts`, `app/src/features/workout/providers/BackendWorkoutService.ts`, `app/src/features/workout/hooks/useWorkout.ts`, `app/src/screens/WorkoutScreen.tsx`, docs |
| **Architecture impact** | Provider → Service → Hook → Screen pattern completed for Workout; template layer (`Workout`/`WorkoutExercise`/`Program`/`ProgramDay`) separated from execution layer (`WorkoutLog`/`WorkoutLogExercise`/`WorkoutSetLog`); `EXPO_PUBLIC_WORKOUT_PROVIDER` defaults to `backend` |
| **Status** | Complete |
| **Notes** | Sprint-specified aliases: `GET /workouts/current`, `POST /workouts/session`, `PATCH /workouts/session/{id}`. Canonical execution routes remain under `/workout-logs`. Session UI (start/finish/set logging screens) deferred — preview screen wired via `useWorkout()` only. |

### Sprint 6.1 — Editable User Profile (Production Ready)

| Field | Detail |
|-------|--------|
| **Sprint ID** | 6.1 |
| **Title** | Editable User Profile (Production Ready) |
| **Date** | 2026-07-14 |
| **Goal** | Production-ready profile editing on mobile using existing backend PATCH |
| **Files modified** | `app/src/screens/ProfileScreen.tsx`, `app/src/features/profile/`, `app/src/features/shared/` (service, hook, providers), docs |
| **Architecture impact** | `CurrentUserService.updateProfile()` added; flow `ProfileScreen` → `useProfileEdit` → `useCurrentUser` → `BackendUserService` → `updateCurrentUser()` |
| **Status** | Complete |
| **Notes** | Display name, bio, and avatar upload isolated for future backend fields. Mock provider supports `updateProfile` for local testing. |

### Sprint 6.0 — User Profile Backend Integration

| Field | Detail |
|-------|--------|
| **Sprint ID** | 6.0 |
| **Title** | User Profile Backend Integration |
| **Date** | 2026-07-14 |
| **Goal** | First real mobile backend integration — user profile via FastAPI |
| **Files modified** | `backend/app/services/user_service.py`, `backend/app/api/v1/users.py`, `backend/app/core/dependencies.py`, `app/src/features/shared/` (providers, factory, hook, adapters), `app/src/screens/ProfileScreen.tsx`, `app/src/api/users.ts`, docs |
| **Architecture impact** | `UserService` added; `CurrentUserService` provider/factory pattern completed; ProfileScreen wired through `useCurrentUser()` |
| **Status** | Complete |
| **Notes** | `GET /users/me` already existed; `PATCH /users/me` added. Mock provider remains via `EXPO_PUBLIC_USER_PROVIDER=mock`. |

---

## Phase — Training Engine (Mobile Application Layer)

### Sprint 14.0.0 — Workout Analytics Foundation

| Field | Detail |
|-------|--------|
| **Sprint ID** | 14.0.0 |
| **Title** | Workout Analytics Foundation |
| **Date** | 2026-07-21 |
| **Goal** | Introduce a dedicated analytics domain that computes workout statistics from `WorkoutHistoryRepository` without UI |
| **Files modified** | `features/analytics` models (`WorkoutAnalytics`, `ExerciseAnalytics`, `WeeklyAnalytics`, `WorkoutTrend`), pure compute utils, `WorkoutAnalyticsRepository` / `HistoryBackedWorkoutAnalyticsRepository`, application use-cases, `useWorkoutAnalytics`, unit tests, docs |
| **Architecture impact** | Hook → Application → `WorkoutAnalyticsRepository` → `WorkoutHistoryRepository`; all aggregates outside UI; trend APIs prepared for future charts; no screens/dashboards/AI |
| **Status** | Complete |
| **Notes** | UTC Monday–Sunday weeks; legacy history without exercise snapshots contributes session totals but not per-exercise stats |

### Sprint 13.2.0 — Workout Detail Experience

| Field | Detail |
|-------|--------|
| **Sprint ID** | 13.2.0 |
| **Title** | Workout Detail Experience |
| **Date** | 2026-07-21 |
| **Goal** | Implement a premium workout detail screen backed by `WorkoutHistoryRepository` |
| **Files modified** | `getCompletedSession`, `useWorkoutDetail`, `WorkoutDetailHero` / `WorkoutMetricsGrid` / `WorkoutExerciseCard` / `WorkoutSetRow` / `WorkoutDetailFooter`, `WorkoutDetailScreen`, exercise/set snapshots on `CompletedWorkout` + summary mapper, repository parse, unit tests, docs |
| **Architecture impact** | UI → Hook → Application (`getCompletedSession`) → Repository; set volume calculated outside UI; no edit/delete/analytics/PRs/sharing/export/AI |
| **Status** | Complete |
| **Notes** | Not-found empty state when session missing; legacy entries without `exercises` degrade to empty exercise list |

### Sprint 13.1.0 — Workout History Timeline

| Field | Detail |
|-------|--------|
| **Sprint ID** | 13.1.0 |
| **Title** | Workout History Timeline |
| **Date** | 2026-07-21 |
| **Goal** | Create the first Workout History screen backed by `WorkoutHistoryRepository` |
| **Files modified** | `listCompletedSessions`, `useWorkoutHistory`, `WorkoutHistoryCard`, `WorkoutHistoryScreen`, routes `workout/history` + `workout/detail` stub, optional `programName` on summary/domain models, `WorkoutScreen` history entry, unit tests, docs |
| **Architecture impact** | UI → Hook → Application (`listCompletedSessions`) → Repository; presentation separated from storage; detail navigation stub only |
| **Status** | Complete |
| **Notes** | Newest-first ordering from repository; empty state when no sessions; no analytics, charts, filters, search, export, cloud sync, or workout detail content |

### Sprint 13.0.0 — Workout History Persistence Foundation

| Field | Detail |
|-------|--------|
| **Sprint ID** | 13.0.0 |
| **Title** | Workout History Persistence Foundation |
| **Date** | 2026-07-21 |
| **Goal** | Introduce an on-device persistence layer for completed workout sessions without changing the workout execution UI |
| **Files modified** | `core/storage` (`StorageAdapter`, `AsyncStorageAdapter`, `InMemoryStorageAdapter`), `CompletedWorkout`, `WorkoutHistoryRepository`, `AsyncStorageWorkoutHistoryRepository`, `persistCompletedSession` / `toCompletedWorkout`, `useSessionFinish` auto-persist, unit tests, docs |
| **Architecture impact** | UI → Application (`persistCompletedSession`) → Repository → Storage Adapter → AsyncStorage; finish navigation and complete screen unchanged; no analytics/charts/dashboards |
| **Status** | Complete |
| **Notes** | Persistence is fire-and-forget after summary build; `clearHistory` is for tests only; corrupt storage degrades to empty history |

### Sprint 12.7.0 — Finish Workout Flow

| Field | Detail |
|-------|--------|
| **Sprint ID** | 12.7.0 |
| **Title** | Finish Workout Flow |
| **Date** | 2026-07-21 |
| **Goal** | Detect local session completion, expose Finish Workout, and present a Workout Complete summary |
| **Files modified** | `WorkoutSessionSummary` type, `buildWorkoutSessionSummary`, `useSessionFinish`, `sessionSummaryHandoff`, `SessionCompleteStats`, `WorkoutSessionCompleteScreen`, `WorkoutSessionScreen`, route `workout/complete`, tests, docs |
| **Architecture impact** | Summary is a presentation projection from immutable `WorkoutSession` + execution overlay; screen still orchestrates only; no persistence or Training Engine changes |
| **Status** | Complete |
| **Notes** | Finish CTA when `interactionStatus === "completed"`; volume = completed load × reps; average reps over completed working sets only |

### Sprint 12.6.0 — Rest Timer & Set Flow

| Field | Detail |
|-------|--------|
| **Sprint ID** | 12.6.0 |
| **Title** | Rest Timer & Set Flow |
| **Date** | 2026-07-21 |
| **Goal** | Guide the athlete through the session with a local rest timer and automatic set progression |
| **Files modified** | `useSessionTiming`, `sessionSetFlow`, `SessionRestTimer`, `SessionSetRow`, `SessionExerciseList`, `WorkoutSessionScreen`, `ScreenContainer` (ref forward), tests, docs |
| **Architecture impact** | Timing state lives in a dedicated local hook beside the execution overlay; immutable `WorkoutSession` unchanged; screen orchestrates hooks + presentation only |
| **Status** | Complete |
| **Notes** | Rest after working sets only; pause/resume/skip; active-set highlight + auto-scroll; no persistence, sync, AI, WorkoutSessionBuilder, or Training Engine changes |

### Sprint 12.5.0 — Interactive Workout Session

| Field | Detail |
|-------|--------|
| **Sprint ID** | 12.5.0 |
| **Title** | Interactive Workout Session |
| **Date** | 2026-07-21 |
| **Goal** | Allow local set interaction (complete/skip/edit) and progress on the executable session screen without persistence |
| **Files modified** | `useLocalSessionInteraction`, `sessionExecutionState` types/utils, `SessionSetRow`, `SessionExerciseList`, `SessionHero`, `WorkoutSessionScreen`, tests, docs |
| **Architecture impact** | Immutable application `WorkoutSession` remains prescription-only; mutable execution lives in a separate overlay owned by the interaction hook; screen stays presentation |
| **Status** | Complete |
| **Notes** | No persistence, sync, timers, AI, WorkoutSessionBuilder, or Training Engine changes |

### Sprint 12.4.0 — Connect Start Workout Flow

| Field | Detail |
|-------|--------|
| **Sprint ID** | 12.4.0 |
| **Title** | Connect Start Workout Flow |
| **Date** | 2026-07-21 |
| **Goal** | Wire Start Workout to `WorkoutSessionBuilder` and navigate to an executable session screen |
| **Files modified** | `app/src/screens/WorkoutScreen.tsx`, `WorkoutSessionScreen.tsx`, `useStartWorkoutSession`, `executableSessionHandoff`, session UI components/formatters, restored `app/app/` routes, tests, docs |
| **Architecture impact** | Preview day → application `WorkoutSessionBuilder` → immutable `WorkoutSession` → handoff → `WorkoutSessionScreen`; React does not construct sessions; Training Engine untouched |
| **Status** | Complete |
| **Notes** | No persistence, timers, logging, AI, or backend in this sprint. Rest days disable the Start CTA. |
