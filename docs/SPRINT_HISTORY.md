# EVOLVE Sprint History

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document (append-only)  
**Last Updated:** 2026-07-23  
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

### Sprint 17.1.0 — Exercise Knowledge Base Foundation

| Field | Detail |
|-------|--------|
| **Sprint ID** | 17.1.0 |
| **Title** | Exercise Knowledge Base Foundation |
| **Date** | 2026-07-22 |
| **Goal** | Create a read-only Exercise Knowledge Base domain that provides immutable exercise metadata for selection engines and future AI workflows — no workout generation, no selection, no networking, no UI, no durable persistence |
| **Architecture** | Workout Blueprint → Exercise Selection (future at time of sprint) → **Exercise Knowledge Base** → `ExerciseDefinition`. Bounded context under `app/src/features/exercise-kb/`. Nothing inside the KB knows about workouts. |
| **Main components** | **Models:** `ExerciseDefinition`, difficulty/category/muscles/equipment, `ExerciseRelationship`, constraints, tags, variants, metadata, result/error types. **Repository:** `ExerciseKnowledgeRepository` + `InMemoryExerciseKnowledgeRepository`. **Service:** `ExerciseKnowledgeService` (query, search, alternatives, progressions, regressions). **Validators:** definition, constraints, relationships, metadata. **Utils:** freeze/normalize, complexity & equipment scores, `rankAlternatives`. **Application:** `queryExerciseKnowledge`, `searchExercises`, `findAlternativeExercises`, `findProgressions`, `findRegressions`. **Catalog:** illustrative in-memory catalog (~25 exercises). |
| **Tests** | 6 suites — application, catalog, repository, service, utilities, validators |
| **Results** | Read-only immutable knowledge graph with relationship kinds `alternative` / `progression` / `regression` / `variation` / `related`. No sets/reps/athlete state. ADR-028 recorded. |
| **Status** | Complete |
| **Notes** | In-memory only; architecture supports large catalogs; no HTTP API |

### Sprint 17.2.0 — Exercise Selection Engine Foundation

| Field | Detail |
|-------|--------|
| **Sprint ID** | 17.2.0 |
| **Title** | Exercise Selection Engine Foundation |
| **Date** | 2026-07-22 |
| **Goal** | Implement a deterministic Exercise Selection Engine that consumes a Workout Blueprint + Exercise Knowledge Base and produces ranked Workout Exercise Candidates — no sets, reps, RPE, volume, progression, or complete workouts |
| **Architecture** | Workout Blueprint → **Exercise Selection Engine** → Exercise Knowledge Base → Candidates. Programming Engine was future at sprint close (now 17.3). Module: `app/src/features/exercise-selection/`. |
| **Main components** | **Models:** `SelectionContext`, `ExerciseSelectionRequest`/`Result`, `CandidateExercise`, role groups, scores, reasons, explanations, rejections, constraints. **Engine:** `ExerciseSelectionEngine` (`select` / `preview` / `explain`). **Strategies:** MovementPattern, Equipment, Difficulty, Goal, Constraint, Relationship. **Selectors:** Primary, Secondary, Accessory. **Validators:** blueprint compatibility, candidate consistency, relationships, duplicates, constraint violations. **Utils:** context build, scoring, deterministic sort, ranking, freeze. **Repository:** `SelectionRepository` + `InMemorySelectionRepository` (result cache). **Service / Application:** `selectExercises`, `previewExerciseCandidates`, `explainSelection`. |
| **Tests** | 8 suites — application, engine, repository, selectors, service, strategies, utilities, validators |
| **Results** | Fully deterministic selection independent of LLM. Role-grouped ranked candidates with rejection tracking and optional explanations. ADR-029 recorded. |
| **Status** | Complete |
| **Notes** | No programming, no UI, no networking, no durable persistence |

### Sprint 17.3.0 — Programming Engine Foundation

| Field | Detail |
|-------|--------|
| **Sprint ID** | 17.3.0 |
| **Title** | Programming Engine Foundation |
| **Date** | 2026-07-22 |
| **Goal** | Transform selected exercise candidates into immutable training prescriptions describing **how** each exercise should be executed — no progression, no weekly adaptation, no complete workout assembly |
| **Architecture** | Workout Blueprint → Exercise Selection → **Programming Engine** → Training Prescription. Progression / Workout Assembly remain future (17.4+). Module: `app/src/features/programming/`. |
| **Main components** | **Models:** `ExercisePrescription`, `ProgrammingResult`, volume/intensity/rest/tempo/set/execution, context, score, reasons, explanations, constraints, errors. **Engine:** `ProgrammingEngine` (`program` / `preview` / `explain`). **Strategies:** Volume, Intensity, Rest, Tempo, ExerciseOrder, Priority. **Validators:** consistency, uniqueness, volume/intensity/rest ranges, execution order. **Utils:** context build, normalize, freeze, score, duration/fatigue/workload estimates, sort. **Repository:** `ProgrammingRepository` + `InMemoryProgrammingRepository` (result cache). **Service / Application:** `programExercises`, `previewProgramming`, `explainProgramming`. |
| **Tests** | 7 suites — application, engine, repository, service, strategies, utilities, validators |
| **Results** | Deterministic immutable prescriptions with ordered execution, estimates, and validation issues. ADR-030 recorded. |
| **Status** | Complete |
| **Notes** | No progression, no fatigue adaptation, no weekly planning, no UI, no AI inside the engine, no networking |

### Sprint 17.4.0 — Progression Engine Foundation

| Field | Detail |
|-------|--------|
| **Sprint ID** | 17.4.0 |
| **Title** | Progression Engine Foundation |
| **Date** | 2026-07-22 |
| **Goal** | Transform immutable programming prescriptions into deterministic multi-week progression timelines — no athlete feedback, loads, autoregulation, fatigue, or workout assembly |
| **Architecture** | Workout Blueprint → Exercise Selection → Programming → **Progression Engine** → Progression Plan. Fatigue / Assembly remain future (17.5+). Module: `app/src/features/progression/`. |
| **Main components** | **Models:** `ProgressionRequest`, `ProgressionPlan`, `ExerciseProgression`, `ProgressionStep`, `ProgressionWindow`, `ProgressionContext`, constraints, score, reasons, explanations, errors. **Engine:** `ProgressionEngine` (`generate` / `preview` / `explain`). **Strategies:** Linear, Volume, Intensity, Frequency, ExerciseRotation. **Validators:** timeline consistency, exercise continuity, progression consistency, week ordering, constraints. **Utils:** context build, normalize/freeze, score, workload trend, sort timeline. **Repository:** `ProgressionRepository` + `InMemoryProgressionRepository` (plan cache). **Service / Application:** `generateProgression`, `previewProgression`, `explainProgression`. |
| **Tests** | 7 suites — application, engine, repository, service, strategies, utilities, validators |
| **Results** | Deterministic immutable multi-week plans with trends, validation issues, and explanations. ADR-031 recorded. |
| **Status** | Complete |
| **Notes** | No athlete history, readiness, recovery, deload, load prediction, autoregulation, or weekly feedback loop |

### Sprint 17.5.0 — Training Adaptation Engine Foundation

| Field | Detail |
|-------|--------|
| **Sprint ID** | 17.5.0 |
| **Title** | Training Adaptation Engine Foundation |
| **Date** | 2026-07-22 |
| **Goal** | Evaluate whether an existing Progression Plan should be adapted before execution — readiness assessments + immutable recommendations only |
| **Architecture** | Workout Blueprint → Exercise Selection → Programming → Progression → **Training Adaptation Engine** → Adapted Progression. Assembly remains future (17.6+). Module: `app/src/features/training-adaptation/`. |
| **Main components** | **Models:** `TrainingAdaptationRequest`, `TrainingAdaptationResult`, `AdaptedProgression`, `AdaptationRecommendation`, `AdaptationAction`, `ReadinessAssessment`, recovery/fatigue/constraint assessments, context, score, reasons, explanations, errors. **Engine:** `TrainingAdaptationEngine` (`evaluate` / `preview` / `explain`). **Assessments:** Recovery, Fatigue, Constraint, ExecutionReadiness. **Strategies:** Volume, Intensity, ExerciseSwap, RecoveryDay, ScheduleAdjustment. **Validators:** assessment consistency, recommendation consistency, constraint compatibility, adaptation ordering. **Utils:** context build, freeze/normalize, readiness score, aggregate assessments, sort recommendations. **Repository:** `TrainingAdaptationRepository` + `InMemoryTrainingAdaptationRepository` (result cache). **Service / Application:** `evaluateTrainingReadiness`, `previewAdaptations`, `explainAdaptations`. |
| **Tests** | 8 suites — application, assessments, engine, repository, service, strategies, utilities, validators |
| **Results** | Deterministic immutable readiness + recommendations. ADR-032 recorded. |
| **Status** | Complete |
| **Notes** | No wearables, athlete history, physiological APIs, workout modification, Programming/Progression replacement, UI, or networking |

### Sprint 17.6.0 — Workout Assembly Engine Foundation

| Field | Detail |
|-------|--------|
| **Sprint ID** | 17.6.0 |
| **Title** | Workout Assembly Engine Foundation |
| **Date** | 2026-07-22 |
| **Goal** | Assemble the final executable WorkoutSession from prior pipeline outputs — no strategy, programming, progression, or readiness evaluation |
| **Architecture** | Workout Blueprint → Exercise Selection → Programming → Progression → Training Adaptation → **Workout Assembly Engine** → Workout Session. Program Generation Orchestrator follows in 17.7. Module: `app/src/features/workout-assembly/`. |
| **Main components** | **Models:** `WorkoutAssemblyRequest`, `WorkoutAssemblyResult`, `WorkoutSession`, `WorkoutExercise`, `WorkoutBlock`, `WorkoutSummary`, `WorkoutExecutionOrder`, context, constraints, score, reasons, explanations, errors. **Engine:** `WorkoutAssemblyEngine` (`assemble` / `preview` / `explain`). **Validators:** exercise ordering, prescription consistency, adaptation consistency, duplicate prevention, session integrity. **Utils:** context build, resolve recommendations, assemble exercises, group blocks, freeze/normalize, duration/workload estimates, summary. **Repository:** `WorkoutAssemblyRepository` + `InMemoryWorkoutAssemblyRepository` (result cache). **Service / Application:** `assembleWorkout`, `previewWorkout`, `explainWorkout`. |
| **Tests** | 6 suites — application, engine, repository, service, utilities, validators |
| **Results** | Deterministic immutable WorkoutSession assembly. ADR-033 recorded. |
| **Status** | Complete |
| **Notes** | No strategy generation, programming, progression, readiness, execution state, timers, analytics, persistence, UI, or networking |

### Sprint 17.7.0 — Program Generation Orchestrator Foundation

| Field | Detail |
|-------|--------|
| **Sprint ID** | 17.7.0 |
| **Title** | Program Generation Orchestrator Foundation |
| **Date** | 2026-07-22 |
| **Goal** | Single public entry point coordinating the complete workout generation pipeline — no engine duplication, AI, persistence, or business logic |
| **Architecture** | Conversation → Workflow → **Program Generation Orchestrator** → Blueprint → Selection → Programming → Progression → Training Adaptation → Workout Assembly → Workout Session. Module: `app/src/features/program-generation/`. |
| **Main components** | **Models:** `WorkoutGenerationRequest`, `WorkoutGenerationResult`, `PipelineExecutionSummary`, `PipelineExecutionTrace`, `PipelineExecutionStep`, `PipelineExecutionContext`, status/error/metrics, explanations. **Orchestrator:** `ProgramGenerationOrchestrator` (`generate` / `preview` / `explain`). **Validators:** pipeline integrity, execution order, required outputs, missing dependencies, pipeline consistency. **Utils:** freeze result, normalize pipeline, build trace, structural metrics, aggregate summaries. **Service / Application:** `generateWorkoutProgram`, `previewWorkoutProgram`, `explainWorkoutGeneration`. |
| **Tests** | 6 suites — application, orchestrator, service, utilities, validators, pipeline integration |
| **Results** | Immutable WorkoutGenerationResult with full pipeline summary/trace. ADR-034 recorded. |
| **Status** | Complete |
| **Notes** | Coordination only. No engine duplication, AI, networking, persistence, caching, execution state, analytics, history, or UI |

### Sprint 17.8.0 — Integration Framework Foundation

| Field | Detail |
|-------|--------|
| **Sprint ID** | 17.8.0 |
| **Title** | Integration Framework Foundation |
| **Date** | 2026-07-22 |
| **Goal** | Reusable integration testing infrastructure for the complete workout generation pipeline — no production behavior changes |
| **Architecture** | `WorkoutGenerationRequest` → Program Generation Orchestrator → `WorkoutGenerationResult` → Integration Assertions → Golden Validation. Package: `app/tests/integration/`. |
| **Main components** | **Fixtures:** immutable athlete profiles. **Builders:** Athlete / WorkoutRequest / Conversation / Workflow. **Assertions:** `expectWorkout`. **Scenarios:** complete-pipeline e2e cases. **Snapshots / Goldens:** normalized deterministic regression files. **Utils:** executePipeline, loadFixture, compareSnapshots. |
| **Tests** | Framework self-tests, builder/assertion suites, scenario suites, golden suites, regression validation |
| **Results** | Dedicated integration harness with golden regression surface. ADR-035 recorded. Docs: INTEGRATION_TESTING.md. |
| **Status** | Complete |
| **Notes** | Testing infrastructure only. No AI, networking, persistence, analytics, caching, UI, or engine modifications |

### Sprint 17.9.0 — Composition Root & Dependency Injection Foundation

| Field | Detail |
|-------|--------|
| **Sprint ID** | 17.9.0 |
| **Title** | Composition Root & Dependency Injection Foundation |
| **Date** | 2026-07-22 |
| **Goal** | Centralized Composition Root and DI for pipeline services — object creation/wiring only; no production behavior changes |
| **Architecture** | Application → **Composition Root** → Container → Registry → Factories → Feature Services → Program Generation Orchestrator → Engines. Module: `app/src/core/composition/`. |
| **Main components** | **Container:** `ApplicationContainer` (register/resolve, singleton/transient, freeze, validation). **Registry:** typed `ServiceMap` / `ServiceRegistry`. **Factories:** Blueprint, Selection, Programming, Progression, Adaptation, Assembly, Program Generation. **Providers:** configuration, in-memory repositories, default strategies. **API:** `createCompositionRoot` / `getCompositionRoot` / `resolveService`. |
| **Tests** | Container, registry, factories, composition root, dependency validation suites |
| **Results** | Dedicated DI foundation; application use-cases resolve defaults via Composition Root. ADR-036 recorded. Docs: COMPOSITION_ROOT.md. |
| **Status** | Complete |
| **Notes** | Wiring only. No AI, networking, persistence, analytics, caching, UI, or engine/business logic modifications |

### Sprint 17.10.0 — Decision Intelligence Foundation

| Field | Detail |
|-------|--------|
| **Sprint ID** | 17.10.0 |
| **Title** | Decision Intelligence Foundation (Observability & Explainability) |
| **Date** | 2026-07-22 |
| **Goal** | Structured domain explanation layer for workout-generation decisions — not logging/telemetry/AI |
| **Architecture** | Program Generation → **Decision Recorder** → Decision Graph → Execution Report → Explanation Report → (future) Coach AI. Module: `app/src/core/decision-intelligence/`. |
| **Main components** | **Models:** immutable decision/graph/timeline/report types. **Recorder:** `DecisionRecorder`. **Builders:** `ExplanationBuilder`, `DecisionReportBuilder`, `ExecutionReportBuilder`. **Validators / utils.** **Application API:** `createDecisionReport`, `createExecutionReport`, `explainWorkoutDecision`, `summarizeDecisionGraph`. **Integration:** extract from engine explanations + pipeline trace/summary; orchestrator `buildDecisionIntelligence`. |
| **Tests** | Recorder/graph, explanation builder, validators/reports, application API, pipeline integration, regression of generation outputs |
| **Results** | Dedicated Decision Intelligence foundation. ADR-037 recorded. Docs: DECISION_INTELLIGENCE.md. |
| **Status** | Complete |
| **Notes** | Explanation substrate only. No engine/business logic changes, AI, networking, persistence, telemetry, logging framework, analytics platform, or UI |

### Sprint 18.0 — Workout Runtime Foundation

| Field | Detail |
|-------|--------|
| **Sprint ID** | 18.0.0 |
| **Title** | Workout Runtime Foundation |
| **Date** | 2026-07-22 |
| **Goal** | Dedicated domain for live execution state of an immutable assembled `WorkoutSession` |
| **Architecture** | `WorkoutSession` → **WorkoutRuntime** → ExerciseRuntime → SetRuntime → SessionState → WorkoutResult. Module: `app/src/features/workout-runtime/`. |
| **Main components** | **Models:** runtime/state/progress/summary/result/event/metrics/configuration. **Engine:** `WorkoutRuntimeEngine`. **Builders / validators / utils.** **Application API:** `startWorkout`, `pauseWorkout`, `resumeWorkout`, `completeWorkout`, `skipExercise`, `completeSet` via opaque `ActiveWorkout`. |
| **Tests** | Lifecycle, state transitions, exercise/set progression, completion, validators, application API, regression |
| **Results** | Dedicated Workout Runtime foundation. ADR-038 recorded. Docs: WORKOUT_RUNTIME.md. |
| **Status** | Complete |
| **Notes** | Execution state only. No Program Generation changes, UI, persistence, networking, timers, analytics, history, or AI |

### Sprint 18.1 — Rest & Time Runtime Foundation

| Field | Detail |
|-------|--------|
| **Sprint ID** | 18.1.0 |
| **Title** | Rest & Time Runtime Foundation |
| **Date** | 2026-07-22 |
| **Goal** | Dedicated deterministic domain for workout rest periods with injected elapsed time |
| **Architecture** | WorkoutRuntime → **RestRuntime** → RestSession → RestResult. Module: `app/src/features/rest-runtime/`. |
| **Main components** | **Models:** session/runtime/state/status/progress/summary/result/event/metrics/configuration/reason/target/duration. **Engine:** `RestRuntimeEngine`. **Builders / validators / utils.** **Application API:** `startRest`, `pauseRest`, `resumeRest`, `cancelRest`, `completeRest`, `updateElapsedTime` via opaque `ActiveRest`. **Integration:** optional `WorkoutRuntime.restRuntime` ownership. |
| **Tests** | Lifecycle, state transitions, progress, remaining time, overtime, validators, application API, regression |
| **Results** | Dedicated Rest Runtime foundation. ADR-039 recorded. Docs: REST_RUNTIME.md. |
| **Status** | Complete |
| **Notes** | No UI, platform timers, persistence, networking, AI, notifications, or analytics |

### Sprint 18.2 — Session Events Foundation

| Field | Detail |
|-------|--------|
| **Sprint ID** | 18.2.0 |
| **Title** | Session Events Foundation |
| **Date** | 2026-07-22 |
| **Goal** | Strongly typed immutable domain event system for workout execution — not an event bus |
| **Architecture** | Workout Runtime → Rest Runtime → **Domain Events** → Event Stream → Future Subscribers. Module: `app/src/core/domain-events/`. |
| **Main components** | **Models:** `DomainEvent` lifecycle variants, metadata/context/category/severity/source/sequence, `EventStream`. **Stream:** append-only ordered store + filters. **Dispatcher:** synchronous publish/notify. **Subscribers:** interfaces only. **Builders / validators / utils.** **Application API:** `publishEvent`, `subscribe`, `unsubscribe`, `getEventStream`, `summarizeEvents`. **Integration:** Workout + Rest emission on lifecycle actions. |
| **Tests** | Dispatcher, ordering, stream, builders, validators, workout/rest integration, application API, regression |
| **Results** | Dedicated Domain Events foundation. ADR-040 recorded. Docs: DOMAIN_EVENTS.md. |
| **Status** | Complete |
| **Notes** | Domain events only. No persistence, networking, async queues, brokers, Kafka/RabbitMQ, analytics implementations, or subscriber implementations |

### Sprint 18.3 — Performance Engine Foundation

| Field | Detail |
|-------|--------|
| **Sprint ID** | 18.3.0 |
| **Title** | Performance Engine Foundation |
| **Date** | 2026-07-22 |
| **Goal** | Dedicated single-session analytics engine producing immutable Performance Snapshots from completed workouts |
| **Architecture** | Domain Events → Workout Result → **Performance Engine** → Performance Snapshot → Future Consumers. Module: `app/src/features/performance-engine/`. |
| **Main components** | **Models:** snapshot/metrics/volume/intensity/density/completion/exercise/session/movement/grade/summary/context/result + trend placeholder. **Engine:** `PerformanceEngine`. **Calculators:** Volume/Intensity/Density/Completion/Duration. **Builders / validators / utils.** **Application API:** `analyzeWorkoutPerformance`, `summarizePerformance`, `gradePerformance`. |
| **Tests** | Engine, calculators, validators, application API, Workout Runtime + Domain Events integration, regression |
| **Results** | Dedicated Performance Engine foundation. ADR-041 recorded. Docs: PERFORMANCE_ENGINE.md. |
| **Status** | Complete |
| **Notes** | Single-session only. No AI, persistence, networking, history, PRs, recovery, or recommendations |

### Sprint 18.4 — Achievement Engine Foundation (Personal Records)

| Field | Detail |
|-------|--------|
| **Sprint ID** | 18.4.0 |
| **Title** | Achievement Engine Foundation (Personal Records) |
| **Date** | 2026-07-22 |
| **Goal** | Dedicated Achievement Engine detecting immutable Personal Records from Performance Snapshots, with extensible architecture for future achievement categories |
| **Architecture** | Performance Snapshot → **Achievement Engine** → Achievement Result → Achievement Events → Future Consumers. Module: `app/src/features/achievement-engine/`. |
| **Main components** | **Models:** Achievement (+ type/category/level/status/reason/rule/evidence/context/metadata), PersonalRecord (+ types/evidence/result), result/summary/engine result/events, injected baseline provider. **Engine:** `AchievementEngine`. **Detectors:** Weight/Volume/Tonnage/Repetition/CompletedSets/Density/SessionVolume/ExerciseVolume. **Builders / validators / utils / events.** **Application API:** `evaluateAchievements`, `detectPersonalRecords`, `summarizeAchievements`. |
| **Tests** | Engine, detectors, validators, builders, events, Performance Engine integration, regression |
| **Results** | Dedicated Achievement Engine foundation. ADR-042 recorded. Docs: ACHIEVEMENT_ENGINE.md. |
| **Status** | Complete |
| **Notes** | Personal Records only. No AI, persistence, networking, history store, badges/streaks/goals/challenges implementation |

### Sprint 18.5 — Athlete History Foundation

| Field | Detail |
|-------|--------|
| **Sprint ID** | 18.5.0 |
| **Title** | Athlete History Foundation |
| **Date** | 2026-07-23 |
| **Goal** | Dedicated Athlete History domain organizing immutable chronological domain facts from workout, performance, and achievement outputs |
| **Architecture** | Workout Runtime → Domain Events → Performance Snapshot → Achievement Result → **Athlete History** → History Snapshot → Future Consumers. Module: `app/src/features/athlete-history/`. |
| **Main components** | **Models:** AthleteHistory, HistorySnapshot, HistoryEntry (+ Workout/Performance/Achievement specializations), type/category/context/metadata/reference/evidence/summary/statistics/engine result. **Engine:** `AthleteHistoryEngine`. **Aggregators:** Workout/Performance/Achievement/Statistics/Summary. **Builders / validators / utils.** **Application API:** `buildAthleteHistory`, `createHistorySnapshot`, `summarizeHistory`. |
| **Tests** | Engine, aggregators, builders, validators, application helpers, Performance/Achievement integration, regression |
| **Results** | Dedicated Athlete History foundation. ADR-043 recorded. Docs: ATHLETE_HISTORY.md (History Model, Future Offline Synchronization, Future Timeline UI). |
| **Status** | Complete |
| **Notes** | Immutable domain modeling only. No AI, persistence, networking, storage, querying/filtering, timeline UI, or calendar |

### Sprint 18.6 — Recovery Intelligence Foundation

| Field | Detail |
|-------|--------|
| **Sprint ID** | 18.6.0 |
| **Title** | Recovery Intelligence Foundation |
| **Date** | 2026-07-23 |
| **Goal** | Dedicated Recovery Intelligence domain producing immutable Recovery Snapshots from Athlete History + Performance Snapshot |
| **Architecture** | Athlete History → Performance Snapshot → **Recovery Intelligence Engine** → Recovery Snapshot → Future Consumers. Module: `app/src/features/recovery-intelligence/`. |
| **Main components** | **Models:** RecoverySnapshot, RecoveryMetrics, RecoveryStatus, RecoveryContext, RecoverySummary, RecoveryWindow, RecoveryIndicator, TrainingLoad, FatigueScore, DensityLoad, FrequencyLoad, RecoveryAssessment, RecoveryEvidence, RecoveryEngineResult. **Engine:** `RecoveryIntelligenceEngine`. **Calculators:** TrainingLoad/Fatigue/DensityLoad/Frequency/RecoveryWindow/RecoveryStatus. **Builders / validators / utils.** **Application API:** `analyzeRecovery`, `createRecoverySnapshot`, `summarizeRecovery`. |
| **Tests** | Engine, calculators, builders, validators, application helpers, Athlete History/Performance integration, regression |
| **Results** | Dedicated Recovery Intelligence foundation. ADR-044 recorded. Docs: RECOVERY_INTELLIGENCE.md (Recovery Metrics, Future Readiness Model). |
| **Status** | Complete |
| **Notes** | Deterministic recovery metrics only. No AI, recommendations, persistence, networking, predictions, sleep, or wearables |

### Sprint 18.7 — Insight Engine Foundation

| Field | Detail |
|-------|--------|
| **Sprint ID** | 18.7.0 |
| **Title** | Insight Engine Foundation |
| **Date** | 2026-07-23 |
| **Goal** | Dedicated Insight Engine producing immutable Insight Snapshots from Performance, Achievement, Recovery, and Athlete History |
| **Architecture** | Performance Snapshot → Achievement Result → Recovery Snapshot → Athlete History → **Insight Engine** → Insight Snapshot → Future Consumers. Module: `app/src/features/insight-engine/`. |
| **Main components** | **Models:** InsightSnapshot, Insight, InsightType, InsightCategory, InsightSeverity, InsightPriority, InsightStatus, InsightContext, InsightEvidence, InsightReason, InsightMetadata, InsightCollection, InsightSummary, InsightEngineResult. **Engine:** `InsightEngine`. **Generators:** Performance/Achievement/Recovery/History/Summary. **Builders / validators / utils.** **Application API:** `generateInsights`, `createInsightSnapshot`, `summarizeInsights`. |
| **Tests** | Engine, generators, builders, validators, application helpers, Performance/Achievement/Recovery/History integration, regression |
| **Results** | Dedicated Insight Engine foundation. ADR-045 recorded. Docs: INSIGHT_ENGINE.md (Insight Model, Future Coach Integration). |
| **Status** | Complete |
| **Notes** | Deterministic domain insights only. No AI, recommendations, persistence, networking, prompts, LLM, or conversation |

### Sprint 18.8 — Coach Intelligence Foundation

| Field | Detail |
|-------|--------|
| **Sprint ID** | 18.8.0 |
| **Title** | Coach Intelligence Foundation |
| **Date** | 2026-07-23 |
| **Goal** | Dedicated Coach Intelligence producing immutable Coaching Context from Insight Snapshots |
| **Architecture** | Insight Snapshot → **Coach Intelligence** → Coaching Context → Future Prompt Builder → Future AI Provider. Module: `app/src/features/coach-intelligence/`. |
| **Main components** | **Models:** CoachingContext, CoachSession, CoachObjective, CoachIntent, CoachPriority, CoachConstraint, CoachInstruction, CoachFocus, CoachEvidence, CoachMetadata, CoachSummary, CoachContextSnapshot, CoachEngineResult, CoachPreparation, CoachAudience, CoachCommunicationStyle, CoachKnowledge, CoachReason. **Engine:** `CoachIntelligenceEngine`. **Selectors:** Insight/Priority/Evidence/Recovery/History/Objective. **Builders / validators / utils.** **Application API:** `prepareCoachingContext`, `createCoachSnapshot`, `summarizeCoachingContext`. |
| **Tests** | Engine, selectors, builders, validators, application helpers, Insight Snapshot integration, regression |
| **Results** | Dedicated Coach Intelligence foundation. ADR-046 recorded. Docs: COACH_INTELLIGENCE.md (Coaching Context, Future Prompt Builder, Future AI Provider). |
| **Status** | Complete |
| **Notes** | Immutable coaching context preparation only. No AI, prompts, LLM providers, networking, HTTP, persistence, or conversation |

### Sprint 19.0 — Conversation Orchestrator Foundation

| Field | Detail |
|-------|--------|
| **Sprint ID** | 19.0.0 |
| **Title** | Conversation Orchestrator Foundation |
| **Date** | 2026-07-23 |
| **Goal** | Dedicated Conversation Orchestrator producing immutable Conversation Context from Coaching Context |
| **Architecture** | Coaching Context → **Conversation Orchestrator** → Conversation Context → Future Prompt Builder → Future AI Provider. Module: `app/src/features/conversation-orchestrator/`. |
| **Main components** | **Models:** ConversationContext, ConversationSession, ConversationMessage, ConversationTurn, ConversationIntent, ConversationGoal, ConversationAudience, ConversationPriority, ConversationConstraint, ConversationMetadata, ConversationKnowledge, ConversationEvidence, ConversationSummary, ConversationSnapshot, ConversationEngineResult, ConversationPreparation, ConversationState, ConversationStage, ConversationRequest, ConversationResponsePlaceholder. **Engine:** `ConversationOrchestratorEngine`. **Selectors:** Knowledge/Priority/Goal/Evidence/Constraint/Session. **Builders / validators / utils.** **Application API:** `prepareConversation`, `createConversationSnapshot`, `summarizeConversation`. |
| **Tests** | Engine, selectors, builders, validators, application helpers, Coaching Context integration, regression |
| **Results** | Dedicated Conversation Orchestrator foundation. ADR-047 recorded. Docs: CONVERSATION_ORCHESTRATOR.md (Conversation Context, Future Prompt Builder). |
| **Status** | Complete |
| **Notes** | Immutable conversation orchestration only. No AI, prompts, LLM providers, networking, HTTP, persistence, or conversation generation |

### Sprint 19.1 — Prompt Composition Engine Foundation

| Field | Detail |
|-------|--------|
| **Sprint ID** | 19.1.0 |
| **Title** | Prompt Composition Engine Foundation |
| **Date** | 2026-07-23 |
| **Goal** | Dedicated Prompt Composition Engine producing immutable Prompt Package from Conversation Context |
| **Architecture** | Conversation Context → **Prompt Composition Engine** → Prompt Package → Future Provider Abstraction → Future AI Providers. Module: `app/src/features/prompt-composition/`. |
| **Main components** | **Models:** PromptPackage, PromptBlock, PromptBlockType, PromptSection, PromptPriority, PromptMetadata, PromptContext, PromptConstraints, PromptInstruction, PromptKnowledge, PromptConversation, PromptMemory, PromptSafety, PromptIdentity, PromptUserInput, PromptSummary, PromptSnapshot, PromptEngineResult, PromptCompositionInput, PromptEngineError. **Engine:** `PromptCompositionEngine`. **Composers:** System/Identity/Knowledge/Conversation/Memory/Constraint/Safety/UserInput/Summary. **Builders / validators / utils.** **Application API:** `composePromptPackage`, `createPromptSnapshot`, `summarizePromptPackage`. |
| **Tests** | Engine, composers, builders, validators, application helpers, Conversation Context integration, regression |
| **Results** | Dedicated Prompt Composition Engine foundation. ADR-048 recorded. Docs: PROMPT_COMPOSITION.md (Prompt Package, Future Provider Mapping). |
| **Status** | Complete |
| **Notes** | Immutable structured prompt composition only. No AI, networking, HTTP, OpenAI/Anthropic/Gemini/Ollama, or provider-specific string prompt generation |

### Sprint 19.2 — AI Provider Abstraction Foundation

| Field | Detail |
|-------|--------|
| **Sprint ID** | 19.2.0 |
| **Title** | AI Provider Abstraction Foundation |
| **Date** | 2026-07-23 |
| **Goal** | Dedicated AI Provider Abstraction defining common contracts and orchestration over Prompt Package |
| **Architecture** | Prompt Package → **AI Provider Abstraction** → Future Providers (OpenAI / Anthropic / Gemini / Ollama) → Standard AI Response. Module: `app/src/features/ai-provider/`. |
| **Main components** | **Models:** AIRequest, AIResponse, AIProvider, AIProviderId, AIProviderCapabilities, AIProviderConfiguration, AIProviderMetadata, AIProviderStatus, AIProviderHealth, AIProviderLimits, AIProviderError, AIProviderResult, AIExecutionContext, AIExecutionOptions, AITokenUsage, AIFinishReason, AIResponseChunk, AIModel, AIModelInfo. **Contracts:** IAIProvider, IAIStreamingProvider, IAIHealthProvider, IAIModelProvider, IAIProviderRegistry. **Registry:** `AIProviderRegistry`. **Engine:** `AIProviderEngine`. **Builders / validators / utils.** **Application API:** `prepareAIRequest`, `resolveProvider`, `createExecutionContext`. |
| **Tests** | Registry, contracts, validators, builders, application helpers, Prompt Package integration, regression |
| **Results** | Dedicated AI Provider Abstraction foundation. ADR-049 recorded. Docs: AI_PROVIDER_ABSTRACTION.md (Provider Registry, Future OpenAI Integration, Future Multi-provider Support). |
| **Status** | Complete |
| **Notes** | Interfaces and orchestration only. No OpenAI/Anthropic/Gemini/Ollama implementations, HTTP, networking, or SDKs |

