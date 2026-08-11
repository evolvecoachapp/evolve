# EVOLVE Project State

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-08-11  
**Purpose:** Snapshot of the current project state only.  
**Source of Truth:** Yes — for current sprint, completion %, and live system status.

For onboarding and philosophy see [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md). For history see [EVOLVE_MASTER_REPORT.md](./EVOLVE_MASTER_REPORT.md).
---

## Frontend

| Item | State |
|------|-------|
| Stack | Expo SDK ~54, React Native 0.81, React 19, Expo Router ~6, TypeScript ~5.9 |
| Auth | Connected — login, register, refresh, secure-store tokens |
| Navigation | 6-tab bottom bar (Home, Workout, Nutrition, Coach, Progress, Profile) |
| Design system | Token-based theme with light/dark/system preference (`ThemeContext`) |
| Feature modules | coach, coach-experience, coach-timeline, workout, nutrition, nutrition-experience, recovery-experience, goal-progress-experience, progress, progress-experience, progress-analytics, notification-center, analytics, home, home-experience, daily-brief, weekly-report, dashboard, profile, profile-experience, shared, athlete-identity, runtime-environment, integrations/workout-progress, integrations/nutrition-progress, integrations/recovery-progress, integrations/goal-progress, integrations/analytics-timeline, integrations/dashboard-projection; plus AI/training domains below |
| Data layer | Service factory pattern; Composition Root DI for Training Intelligence pipeline (`core/composition`, Sprint 17.9); Runtime Bootstrap gate (`runtime/bootstrap`, Sprint 33.1B); Repository Hydration pipeline (`runtime/hydration`, Sprint 33.2); Dashboard Restore pipeline (`runtime/dashboard-restore`, Sprint 33.3); Runtime Write-Through pipeline (`runtime/write-through`, Sprint 33.4); Runtime Session Orchestrator (`runtime/session`, Sprint 33.5); Runtime Startup Integration (`RuntimeSessionProvider`, Sprint 33.6); Runtime Change Observer (`runtime/runtime-observer`, Sprint 33.7); Workout → Progress Analytics integration (`integrations/workout-progress`, Sprint 32.1); Nutrition → Progress Analytics integration (`integrations/nutrition-progress`, Sprint 32.2); Recovery → Progress Analytics integration (`integrations/recovery-progress`, Sprint 32.3); Goal Progress → Progress Analytics integration (`integrations/goal-progress`, Sprint 32.4); Progress Analytics → Coach Timeline projection (`integrations/analytics-timeline`, Sprint 32.5); Unified Workspace → Dashboard projection (`integrations/dashboard-projection`, Sprint 32.6); Decision Intelligence explanations (`core/decision-intelligence`, Sprint 17.10); Workout Runtime execution state (`features/workout-runtime`, Sprint 18.0); Rest Runtime rest periods (`features/rest-runtime`, Sprint 18.1); Domain Events execution substrate (`core/domain-events`, Sprint 18.2); Performance Engine single-session snapshots (`features/performance-engine`, Sprint 18.3); Achievement Engine Personal Records (`features/achievement-engine`, Sprint 18.4); Athlete History immutable chronological record (`features/athlete-history`, Sprint 18.5); Recovery Intelligence deterministic recovery snapshots (`features/recovery-intelligence`, Sprint 18.6); Insight Engine deterministic domain insight snapshots (`features/insight-engine`, Sprint 18.7); Coach Intelligence immutable Coaching Context preparation (`features/coach-intelligence`, Sprint 18.8); Conversation Orchestrator immutable Conversation Context preparation (`features/conversation-orchestrator`, Sprint 19.0); Prompt Composition Engine immutable Prompt Package composition (`features/prompt-composition`, Sprint 19.1); Agent Framework / Runtime / Collaboration / Capability foundations (Sprint 21.x); Conversation Memory (`features/conversation-memory`, Sprint 21.4); Coach Timeline (`features/coach-timeline`, Sprint 25.4); Proactive Coach Insights (`features/proactive-insights`, Sprint 25.5); Explainable Coaching Session (`features/coaching-session/composition`, Sprint 26.1); Home Experience (`features/home-experience`, Sprint 27.1); Athlete Daily Brief (`features/daily-brief`, Sprint 27.2); Weekly Coach Report (`features/weekly-report`, Sprint 27.3); Athlete Intelligence Workspace (`features/intelligence-workspace`, Sprint 28.1); Athlete Snapshot (`features/athlete-snapshot`, Sprint 28.2); Unified Athlete Workspace (`features/unified-workspace`, Sprint 28.3); Athlete Identity Foundation (`features/athlete-identity`, Sprint 29.1); Runtime Environment Foundation (`features/runtime-environment`, Sprint 29.2); Persistence Contract Foundation (`core/persistence`, Sprint 29.3); Infrastructure Adapter Contracts (`core/infrastructure`, Sprint 29.4); SQLite Infrastructure Adapter (`infrastructure/sqlite`, Sprint 30.1); Repository Adapter Integration (`infrastructure/repositories`, Sprint 30.2); Authentication Adapter Foundation (`infrastructure/authentication`, Sprint 30.3); Synchronization Adapter Foundation (`infrastructure/synchronization`, Sprint 30.4); Backend API Adapter Foundation (`infrastructure/backend`, Sprint 30.5); Logging Adapter Foundation (`infrastructure/logging`, Sprint 30.6); Architecture Consolidation (`docs/ARCHITECTURE_REVIEW.md`, Sprint 30.7); Real Home Dashboard (`features/home` ViewModel → Application → HomeService, Sprint 31.1); Workout Runtime Experience (`features/workout-runtime` ViewModel → Application → ExperienceService, Sprint 31.2); Coach Experience (`features/coach-experience` ViewModel → Application → ExperienceService, Sprint 31.3); Progress Experience (`features/progress-experience` ViewModel → Application → ExperienceService, Sprint 31.4); Nutrition Experience (`features/nutrition-experience` ViewModel → Application → ExperienceService, Sprint 31.5); Profile Experience (`features/profile-experience` ViewModel → Application → ExperienceService, Sprint 31.6); user/workout backend providers; on-device workout history via `WorkoutHistoryRepository` + `StorageAdapter` (Sprint 13.0); analytics via `WorkoutAnalyticsRepository` (Sprint 14.0) |
| Backend providers | `BackendUserService`, `BackendWorkoutService` live; other `Backend*Service` classes throw `notConfigured()` |
| Tests | Jest + jest-expo |
| Sprint status | Sprint 36.5 Runtime Persistence Verification & Consistency Guard shipped (Phase A — Production Hardening continued; a verification pass over the complete persistence lifecycle — Runtime Session → Observer → Domain Mutation → Write-Through → Repository Contracts → SQLite → Hydration → Restore — found two concrete gaps and closed both with the smallest possible pure guards, per the sprint's explicit "verify, don't rewrite" mandate: (1) a payload-internal athlete-ownership check (`runtime/persistence/AthleteRecordOwnership.ts`) now runs inside every write-through `observe*Records()` and hydration `restore*Records()` function, catching a record legitimately keyed under the current athlete whose payload was itself built for a different `athleteId` — a case the Sprint 36.1 `filterRecordsForAthleteScope()` (`record.id`-only) check could not catch; a mismatch is skipped and logged, never persisted/restored (`AthleteSnapshot`'s composite-id keying is documented as an explicit, out-of-scope exception); (2) a monotonic mutation-sequence counter (`runtime/write-through/RuntimeWriteThroughSequence.ts`) now lets `RuntimeWriteThroughPipeline.persist()` reject — before touching any service or repository — a stale/out-of-order write-through call whose captured mutation predates one already applied, guaranteeing "latest mutation wins" even if an earlier mutation's persist call happens to complete after a later one's; both guards are pure functions/counters wired into existing call sites with one new optional field each (`mutationSequence` on `PersistRuntimeOptions`/`RuntimeWriteThroughOptions`) and one new `RuntimeWriteThroughError` code (`stale_mutation_sequence`) — no event sourcing, no versioned event log, no background worker, no queue, no retry system, no network sync, no new repository; mutation/failure sequencing (A→persist, B→persist, C→fails, D→persist — only D survives) and persistence-failure consistency (Sprint 36.4) were re-verified and found already correct — no code change; athlete isolation (A→logout→B→logout→A, Sprint 36.1) verified extended across every cross-domain overlay (Workout/Nutrition/Recovery/Goal/Coach/Notification) in one new integration test; new cross-domain persist+restart, post-hydration dashboard-vs-mock-fallback, and full-reset state-inventory (every pipeline's status **and** result, observer `athleteIds`, both new sequence counters) integration tests close testing gaps with no production-code change; no new runtime subsystem, no SQLite/networking/backend/Admin/AI changes, no visual redesign; see ADR-149); Sprint 36.4 Runtime Persistence Failure Recovery shipped (Phase A — Production Hardening continued; a repository/write-through failure automatically triggered by the Runtime Observer is now fully deterministic — `RuntimeObserver`'s `triggerWriteThrough()` catches the `persistRuntime()` rejection instead of letting it become an unhandled promise rejection, logging the reason via the existing `infrastructure/logging` abstraction; the failure remains fully observable through the existing `RuntimeWriteThroughState`/`getWriteThroughStatus()` status+error mechanism without ever rolling back the in-memory runtime mutation that triggered it; Runtime Observer and Runtime Session both remain `"ready"` — persistence failure is confirmed as a concern fully separate from runtime execution/session availability; recovery on the next successful mutation was already structurally guaranteed by the observer's existing reset-before-every-persist pattern (`resetRuntimeWriteThrough()` then `persistRuntime()` on every successful `build()`, not only after a failure) — verified rather than re-implemented; "latest mutation wins" and full domain coverage (Workout, Nutrition, Recovery, Goal Progress, Coach, Notification) proved across repository-failure + recovery + restart/rehydration scenarios; logout's existing reset cascade (Sprint 36.3) already clears write-through state unconditionally, so no stale persistence-failure state survives logout; no new runtime subsystem, no retry queue/background worker/debounce/batching/event bus, no new repository/provider, no SQLite/networking/Admin/AI changes, no visual redesign; see ADR-148); Sprint 36.3 Runtime Session Retry Hardening & Recovery State Reset shipped (Phase A — Production Hardening continued; `retrySession()` now performs its full deterministic pipeline reset unconditionally — Observer → Write-Through → Dashboard Restore → Hydration → Bootstrap → Session — instead of gating the reset on the orchestrator's internal status, closing a gap where an observer-only failure left stale pipeline state in place across a retry; `resetRuntimeWriteThrough()` added to the shared reset cascade; `RuntimeObserver.start()` now unwinds partially-wrapped `build()` methods on a mid-sequence failure, preventing duplicate wrapping/double-persist on a later successful start; athlete isolation reaffirmed — retry always reuses the current authenticated `user.id`, never a cached/hydrated/persisted athlete id; `ErrorBoundary` remains independent of Runtime Session retry; no new runtime subsystem, no persistence/SQLite/networking/admin/AI changes, no visual redesign; see ADR-147); Sprint 36.2 Global Runtime Failure UX & Error Boundary shipped (Phase A — Production Hardening continued; authenticated startup failures — bootstrap, hydration, dashboard restore, or observer — now render a dedicated global `RuntimeFailureScreen` instead of leaving authenticated navigation reachable with no recovery surface; `app/(app)/_layout.tsx` blocks the authenticated `Stack` while Runtime Session `status === "failed"`; Retry calls the existing `retrySession()` — no parallel retry mechanism; raw exceptions/SQLite internals/stack traces are never shown to the user; new reusable `ErrorBoundary` wraps only the authenticated `Stack` (auth/onboarding unaffected) and catches unexpected React render exceptions with a safe "Try again" fallback; both surfaces log through the existing `infrastructure/logging` abstraction (Sprint 30.6), no `console.*` production path; no new runtime subsystem, no persistence/SQLite/networking/admin/AI changes, no visual redesign; see ADR-146); Sprint 36.1 SQLite Session Data Isolation / Logout Hardening shipped ( closed production data-isolation gap where SQLite data survived logout and could be rehydrated by a different athlete's next login; `RepositoryHydrationPipeline` now accepts `athleteIds` and filters athlete-owned records through new `filterRecordsForAthleteScope()` Authenticated Athlete Persistence Boundary before restoring into runtime memory; `RuntimeSessionOrchestrator` threads authenticated session `athleteIds` into hydration; SQLite retained on disk (no destructive wipe) so a returning athlete recovers only their own data; Repository Contracts, SQLite infrastructure, Composition Root, Runtime Session/Observer/Bootstrap public APIs unchanged; see ADR-145); Sprint 35.5 Coach & Notification Persistence Completion shipped (Coach conversation turns + Conversation Memory entries persist through `Workspace.coachRuntimeOverlay` + existing WorkspaceRepository write-through; Notification read/settings/reminder overlays persist through `Workspace.notificationRuntimeOverlay`; dismiss/create also journaled to Coach Timeline; hydration restores overlays and Conversation Memory via `loadHydratedCoachExperience()` / `loadHydratedNotificationExperience()`; no new repositories; no push/network; transient Coach UI pin/dismiss remains session-local; Runtime Session unchanged); Sprint 35.4 Domain Runtime Persistence Completion shipped (Workout/Nutrition/Recovery in-session mutations persist through existing Workout/Nutrition/Recovery repository contracts + domain serializers; Goal Progress milestone/completion overlay persists through `Workspace.goalRuntimeOverlay` + existing WorkspaceRepository write-through; Runtime Observer minimally extended to wrap domain persistence service `build()`; hydration restores overlays via `loadHydrated*()`; no new persistence architecture; no direct SQLite from feature layers; Runtime Session unchanged); Sprint 35.3 Progress & Analytics Runtime Activation shipped (Progress tab production path reads Progress Analytics read models via `applyHydratedProgress()`; default Mock ProgressExperienceService loading removed from authenticated startup; refresh/time-range changes re-load analytics and reproject timeline where supported; ProgressExperienceService retained for test/preview; no duplicate analytics engine; Backend/Local ProgressAnalyticsService providers remain stubs — in-memory read model fed by Sprints 32.1–32.4 runtime integrations); Sprint 35.2 Notification Runtime Activation shipped (Notification Center production path reads hydrated Unified Workspace + Coach Timeline via `applyHydratedNotifications()`; default Mock NotificationCenterService loading removed from authenticated startup; dismiss/reminder mutations append Coach Timeline lifecycle events where supported; NotificationCenterService retained for test/preview; no push/network — Expo/FCM/APNS deferred); Sprint 35.1 Coach Runtime Activation shipped (Coach tab driven by hydrated Unified Workspace coach projection + existing Coach Conversation orchestration; `applyHydratedCoachExperience()` is production source of truth; Mock CoachExperienceService loading removed from startup; coaching turns execute via `processCoachConversationTurn` through Conversation Memory, Agent Collaboration, and Coach Timeline append where supported; CoachExperienceService retained for test/preview; no live LLM provider — deterministic orchestration seam); Sprint 35.0 Goal Progress Runtime Activation shipped (Goal Progress screen driven by hydrated Unified Workspace goals projection; `applyHydratedGoalProgress()` is production source of truth; Mock GoalProgressExperienceService loading removed from startup; progress/milestone/completion mutations publish through existing Sprint 32.4 integration; GoalProgressExperienceService retained for test/preview); Sprint 34.9 Recovery Runtime Activation shipped (Recovery screen driven by hydrated Unified Workspace recovery projection; `applyHydratedRecovery()` is production source of truth; Mock RecoveryExperienceService loading removed from startup; sleep/readiness/assessment mutations publish through existing Sprint 32.3 integration; RecoveryExperienceService retained for test/preview); Sprint 34.8 Nutrition Runtime Activation shipped (Nutrition tab driven by hydrated Unified Workspace + Plan History nutrition plan; `applyHydratedDashboard()` is production source of truth; Mock NutritionExperienceService loading removed from startup; meal/hydration mutations publish through existing Sprint 32.2 integration; NutritionExperienceService retained for test/preview); Sprint 34.7 Workout Runtime Activation shipped (Workout tab driven by hydrated Unified Workspace + Workout Assembly cache; `applyHydratedWorkout()` is production source of truth; Mock WorkoutRuntimeExperienceService loading removed from startup; finish publishes WorkoutCompleted via existing Sprint 32.1 integration; WorkoutRuntimeExperienceService retained for test/preview); Sprint 34.6 Profile Update Persistence shipped (supported Profile edits persist via AthleteIdentityService.build() → Runtime Observer → Write-Through → SQLite; unsupported fields unchanged; ProfileExperienceService retained for test/preview); Sprint 34.5 Real Profile & Identity Persistence shipped (Profile screen driven by hydrated AthleteIdentityService; `applyHydratedProfile()` is production source of truth; Mock ProfileExperienceService loading removed from startup); Sprint 34.4 Real Home Dashboard Activation shipped (Home screen driven exclusively by Dashboard Restore; `applyRestoredDashboard()` is production source of truth; HomeService mock loading removed from startup; tests/previews retain injectable HomeService); Sprint 34.3 Domain Persistence Serialization shipped (full immutable domain JSON in SQLite payload; repository-layer serializers; hydration/write-through restore complete domain models; PersistenceRecord contracts unchanged); Sprint 34.2 Native SQLite Engine Integration shipped (Expo SQLite persistent driver; automatic schema init; database survives restart; Infrastructure-only change); Sprint 34.1 SQLite Runtime Persistence Activation shipped (runtime hydration/write-through use SQLite repository adapters via PersistenceRepositoryProvider; Phase 34 started); Sprint 33.9 End-to-End Runtime Persistence Validation shipped (full lifecycle integration tests; User Story 01 validated); Sprint 33.8 Runtime Auto-Start Wiring shipped (observer wired to session lifecycle); Sprint 33.7 Runtime Change Observer shipped (automatic persistence); Sprint 33.6 Runtime Startup Integration shipped (User Story 01 orchestration complete); Sprint 33.5 Runtime Session Orchestrator shipped (Phase 33 in progress); Sprint 33.4 Runtime Write-Through Pipeline shipped; Sprint 33.3 Dashboard Restore Pipeline shipped; Sprint 33.2 Repository Hydration Pipeline shipped; Sprint 33.1B Runtime Bootstrap Gate shipped; Sprint 32.6 Unified Workspace → Dashboard Projection shipped (Phase 32 complete); Sprint 32.5 Progress Analytics → Coach Timeline Projection shipped; Sprint 32.4 Goal Progress → Progress Analytics Integration shipped; Sprint 32.3 Recovery → Progress Analytics Integration shipped; Sprint 32.2 Nutrition → Progress Analytics Integration shipped; Sprint 32.1 Workout → Progress Analytics Integration shipped; Sprint 31.9 Coach Timeline Framework shipped; Sprint 31.6 Profile & Settings Experience shipped; Sprint 31.5 Nutrition Experience shipped; Sprint 31.4 Progress & Analytics Experience shipped; Sprint 31.3 AI Coach Experience shipped; Sprint 31.2 Workout Runtime Experience shipped; Sprint 31.1 Real Home Dashboard shipped; History + detail (13.1–13.2); workout analytics (14.0); AI workout pipeline through Training Adaptation (17.1–17.5) |

---

## Mobile AI / Training Domains (Application Layer)

| Domain | Module | Maturity |
|--------|--------|----------|
| Conversation | `features/conversation` | Foundation complete |
| Workflow | `features/workflow` | Foundation complete |
| Memory | conversation persistence adapters | Foundation complete |
| Prompt Orchestrator | `features/prompt-orchestrator` | Foundation complete |
| Tool Engine | `features/tool-calling` | Foundation complete |
| Athlete Context | `features/athlete-context` | Foundation complete |
| Workout Blueprint | `features/workout-blueprint` | Foundation complete (17.0) |
| Exercise Knowledge Base | `features/exercise-kb` | Foundation complete (17.1) — read-only, in-memory |
| Exercise Selection | `features/exercise-selection` | Foundation complete (17.2) — deterministic |
| Programming | `features/programming` | Foundation complete (17.3) — prescriptions only |
| Progression | `features/progression` | Foundation complete (17.4) — multi-week timeline only |
| Training Adaptation | `features/training-adaptation` | Foundation complete (17.5) — readiness + recommendations only |
| Workout Assembly | `features/workout-assembly` | Foundation complete (17.6) — immutable session assembly only |
| Program Generation | `features/program-generation` | Foundation complete (17.7) — orchestration only |
| Integration Testing Framework | `app/tests/integration/` | Foundation complete (17.8) — testing infrastructure only |
| Composition Root & DI | `core/composition` | Foundation complete (17.9) — wiring only |
| Decision Intelligence | `core/decision-intelligence` | Foundation complete (17.10) — domain explainability only |
| Workout Runtime | `features/workout-runtime` | Foundation complete (18.0) — live session execution state only; Experience UI complete (31.2) — ViewModel → Application → ExperienceService |
| Rest Runtime | `features/rest-runtime` | Foundation complete (18.1) — deterministic rest periods (injected elapsed) |
| Domain Events | `core/domain-events` | Foundation complete (18.2) — immutable execution events + Event Stream only |
| Performance Engine | `features/performance-engine` | Foundation complete (18.3) — single-session Performance Snapshots only |
| Achievement Engine | `features/achievement-engine` | Foundation complete (18.4) — Personal Records only; future categories reserved |
| Athlete History | `features/athlete-history` | Foundation complete (18.5) — immutable chronological domain record only |
| Recovery Intelligence | `features/recovery-intelligence` | Foundation complete (18.6) — deterministic recovery snapshots only |
| Insight Engine | `features/insight-engine` | Foundation complete (18.7) — deterministic domain insight snapshots only |
| Coach Intelligence | `features/coach-intelligence` | Foundation complete (18.8) — immutable Coaching Context preparation only |
| Conversation Orchestrator | `features/conversation-orchestrator` | Foundation complete (19.0) — immutable Conversation Context preparation only |
| Prompt Composition Engine | `features/prompt-composition` | Foundation complete (19.1) — immutable Prompt Package composition only |
| Plan History | `features/plan-history` | Foundation complete (25.2) — append-only immutable plan versions only |
| Plan Restore | `features/plan-restore` | Foundation complete (25.3) — restore snapshot as new version only |
| Coach Timeline | `features/coach-timeline` | Foundation complete (25.4) — append-only coach decision journal; Framework Foundation complete (31.9) — athlete-event presentation domain via ViewModel → Application → CoachTimelineFrameworkService |
| Proactive Insights | `features/proactive-insights` | Foundation complete (25.5) — deterministic coach insights from existing evidence only |
| Explainable Coaching Session | `features/coaching-session/composition` | Foundation complete (26.1) — compose existing evidence into immutable session artifacts only |
| Home Experience | `features/home-experience` | Foundation complete (27.1) — compose existing coaching knowledge into Home dashboard experience only |
| Athlete Daily Brief | `features/daily-brief` | Foundation complete (27.2) — compose existing coaching knowledge into deterministic daily brief only |
| Weekly Coach Report | `features/weekly-report` | Foundation complete (27.3) — compose athlete week into deterministic coaching review only |
| Athlete Intelligence Workspace | `features/intelligence-workspace` | Foundation complete (28.1) — compose premium coaching artifacts into one immutable workspace read model only |
| Athlete Snapshot | `features/athlete-snapshot` | Foundation complete (28.2) — compose immutable point-in-time athlete representation only |
| Unified Athlete Workspace | `features/unified-workspace` | Foundation complete (28.3) — compose canonical immutable athlete read model only |
| Athlete Identity | `features/athlete-identity` | Foundation complete (29.1) — immutable identity layer only; not auth, not persistence |
| Runtime Environment | `features/runtime-environment` | Foundation complete (29.2) — immutable execution-environment layer only; not RN/Expo/platform APIs |
| Persistence Contracts | `core/persistence` | Foundation complete (29.3) — immutable persistence contracts only; not storage |
| Infrastructure Adapters | `core/infrastructure` | Foundation complete (29.4) — immutable adapter contracts only; not implementations |
| SQLite Adapter | `infrastructure/sqlite` | Foundation complete (30.1); Native persistent engine (34.2); Domain JSON serialization (34.3) — Expo SQLite driver behind Persistence Contracts; database survives restart; domain-aware mappers |
| Repository Adapters | `infrastructure/repositories` | Foundation complete (30.2); Domain serialization layer (34.3) — Persistence Contracts bound to SQLite repositories via adapters; JSON serializers for runtime domains |
| Authentication Adapter | `infrastructure/authentication` | Foundation complete (30.3) — Mock Authentication Adapter behind Authentication Contracts only |
| Synchronization Adapter | `infrastructure/synchronization` | Foundation complete (30.4) — deterministic Synchronization Engine behind Synchronization Contracts only |
| Backend API Adapter | `infrastructure/backend` | Foundation complete (30.5) — Mock Backend API Adapter behind Backend API Contracts only |
| Logging Adapter | `infrastructure/logging` | Foundation complete (30.6) — Mock Logger behind Logging Contracts only |
| Architecture Consolidation | `docs/ARCHITECTURE_REVIEW.md` | Complete (30.7) — architecture audit & production-readiness gate; no features |
| Home Dashboard | `features/home` | Complete (34.4) — operational Home UI driven by Dashboard Restore via `applyRestoredDashboard()`; HomeService retained for tests/previews only |
| Coach Experience | `features/coach-experience` | Complete (31.3) — flagship Coach UI via ViewModel → Application → ExperienceService (Mock AI provider) |

These domains are TypeScript application modules with in-memory repositories. They are **not** backend HTTP APIs and do **not** write to PostgreSQL. The integration framework exercises the full pipeline without modifying engine behavior. Pipeline services are composed through `core/composition`. Decision Intelligence explains pipeline decisions without changing engine behavior. Workout Runtime consumes immutable `WorkoutSession` outputs without modifying Program Generation. Rest Runtime manages rest periods with injected elapsed time and may be owned by Workout Runtime. Domain Events record immutable lifecycle events from Workout/Rest Runtime into an ordered in-memory Event Stream for future subscribers. Performance Engine analyzes completed `WorkoutResult` + `EventStream` into immutable single-session snapshots without mutating execution or program generation. Achievement Engine detects Personal Records from Performance Snapshots via injected baselines without owning history, persistence, or gamification. Athlete History organizes immutable chronological domain facts from workout/performance/achievement outputs without persistence, AI, networking, storage, querying, or timeline UI. Recovery Intelligence derives deterministic recovery metrics/snapshots from Athlete History + Performance Snapshot without AI, recommendations, persistence, networking, predictions, sleep, or wearables. Insight Engine aggregates deterministic domain facts from Performance, Achievement, Recovery, and Athlete History into immutable Insight Snapshots without AI, recommendations, persistence, networking, prompts, LLM, or conversation. Coach Intelligence prepares immutable Coaching Context from Insight Snapshot (optionally referencing Recovery, History, Performance, Achievement) without AI, prompts, LLM providers, networking, HTTP, persistence, or conversation. Conversation Orchestrator prepares immutable Conversation Context from Coaching Context (optionally referencing Insight, Recovery, History, Performance, Achievement) without AI, prompts, LLM providers, networking, HTTP, persistence, or conversation generation. Prompt Composition Engine transforms Conversation Context into an immutable Prompt Package of structured blocks (optionally referencing Coaching Context / Insight Snapshot) without AI, networking, HTTP, OpenAI/Anthropic/Gemini/Ollama, or provider-specific string prompt generation.

---

## Backend

| Item | State |
|------|-------|
| Stack | FastAPI 0.116, SQLAlchemy 2.0, Pydantic 2.11, Uvicorn |
| Architecture | Clean Architecture enforced — routes thin, logic in services |
| Domains live | Auth, users, exercises, catalog, workouts (templates), workout logs, workout resolution, nutrition, recovery, coach, goals, progress |
| API endpoints | **56 implemented**, **6 planned** ([API_STATUS.md](./API_STATUS.md)) |
| Missing HTTP APIs | Program/workout authoring & assignment, exercise writes, conversation list |
| Entry point | `GET /` health stub; no `/health` with DB check |
| OpenAPI | Auto-generated at `/docs`, `/redoc` |

---

## AI

| Item | State |
|------|-------|
| Orchestrator | Complete — intent routing, memory, persistence |
| Registered engines | WorkoutCoach, NutritionCoach, RecoveryCoach |
| Rule-based engines | NutritionEngine, RecoveryEngine (no LLM) |
| Progress Analyzer | Complete — hybrid stats + LLM narrative; REST only, not Coach-bound |
| LLM providers | `mock` (default), `openai_compatible` (OpenAI SDK + configurable base URL) |
| Intent classification | LLM-primary with keyword fallback |
| Memory | Windowed conversation context; summarization deferred |
| Mobile AI | MockCoachService working; OpenAI/Anthropic/Local LLM are placeholders |
| Mobile workout pipeline | Composition Root wires Blueprint → Knowledge → Selection → Programming → Progression → Adaptation → Assembly → Program Generation; Decision Intelligence explains domain decisions (17.1–17.10); Workout Runtime performs assembled sessions (18.0); Rest Runtime owns rest periods (18.1) |

---

## Database

| Item | State |
|------|-------|
| Engine | PostgreSQL 17 (Docker Compose locally) |
| ORM | SQLAlchemy 2.x declarative |
| Migrations | 10 Alembic versions applied |
| Tables | users, exercises, muscle_groups, equipment, programs, workouts, workout_logs, meals, recovery_check_ins, conversations, chat_messages, goals, progress_entries |
| Seeds | Exercise catalog via `database/seeds/seed_exercises.py`; default beginner program via `database/seeds/seed_default_program.py` (Sprint 6.3.1) |

---

## Authentication

| Layer | State |
|-------|-------|
| Backend | JWT (HS256), Argon2 passwords, stateless sessions |
| Endpoints | `POST /auth/register`, `/login`, `/refresh`; `GET /users/me`; `PATCH /users/me` |
| Mobile | `expo-secure-store` for tokens; 401 → refresh → retry-once |
| Gaps | No role enum (uses `is_superuser`) |

---

## Testing

| Layer | State |
|-------|-------|
| Backend unit | 19 files — services, engines, orchestrator, intent, LLM provider |
| Backend integration | 11 files — real PostgreSQL via pytest fixtures (incl. workout templates, workout log skip) |
| Backend runner | pytest 9.1 + pytest-asyncio |
| Mobile | Jest + Testing Library — auth, API client, screens, feature architecture, Workout backend service/adapters; plus domain suites for exercise-kb (6), exercise-selection (8), programming (7) |
| CI pipeline | **Not configured** (no `.github/workflows`) |

---

## Deployment

| Item | State |
|------|-------|
| Local DB | `docker-compose.yml` — PostgreSQL only |
| Backend container | Dockerfile referenced in architecture; **not in repo root backend/** |
| Production compose | Planned under `docker/` — **not present** |
| Infrastructure as Code | Planned under `infrastructure/` — **not present** |
| CI/CD | **Not started** |
| Secrets | `.env.example` templates exist; no managed secrets store |

---

## Known Issues

See [KNOWN_ISSUES.md](./KNOWN_ISSUES.md) for the full list.

**Highlights (open):**
- Mobile backend providers not wired for coach/nutrition (Sprint 5.3) — Workout wired in Sprint 6.3
- No program management HTTP API; workout template *authoring* (write) HTTP API still missing (reads live since Sprint 6.3)
- No CI pipeline or backend Docker service
- `docs/TASKS.md` Phase 1–2 checkboxes out of sync with code
- AI workout pipeline stops at Workout Assembly — no program generation yet

---

## Last Completed Sprint

**36.5 — Runtime Persistence Verification & Consistency Guard** (2026-08-11)

- Verification + guard sprint over the complete persistence lifecycle (Runtime Session → Observer → Domain Mutation → Write-Through → Repository Contracts → SQLite → Hydration → Restore) built on Sprints 35.4/35.5/36.1/36.4 — explicitly scoped to not rewrite working persistence code, only add the smallest guard needed for a concrete gap
- **Gap 1 (payload-internal athlete mismatch):** the Sprint 36.1 `filterRecordsForAthleteScope()` validates only `record.id` against the session's `athleteIds`, never the payload's own `athleteId` field — a record legitimately keyed under the current athlete but whose payload was itself built for a different athlete would pass. New pure module `runtime/persistence/AthleteRecordOwnership.ts` (`isOwnedByAthlete`, `isRecordOwnedByAthlete`) is now checked inside every `observe*Records()` (write-through) and `restore*Records()` (hydration) function for identity, workspace, workout, nutrition, recovery, and timeline (plus the coach-overlay restore path); a mismatch is skipped and logged via `getLogger().warn()`, never persisted or restored. `AthleteSnapshot` is intentionally excluded — its composite `athlete-snapshot:${athleteId}:${createdAt}` key makes a `record.id === payload.athleteId` check inapplicable, documented in-line as a pre-existing, out-of-scope structural note
- **Gap 2 (out-of-order write-through completion):** `triggerWriteThrough()` resets Write-Through state before every persist call, even while a prior call may still be executing — if a later call's write completes before an earlier one's, the earlier call could silently overwrite fresher persisted data. New pure counter module `runtime/write-through/RuntimeWriteThroughSequence.ts` assigns a monotonic sequence number to every successful mutation (`RuntimeObserver.onSuccessfulChange()`); `RuntimeWriteThroughPipeline.persist({ mutationSequence })` now rejects a stale/out-of-order call — with new `RuntimeWriteThroughError` code `stale_mutation_sequence` — before observing any service or touching any repository, guaranteeing the latest mutation always wins. `mutationSequence` is optional everywhere; every existing caller that omits it is unaffected. `resetRuntimeMutationSequence()` joins the existing `RuntimeObserver.stop()` reset cascade
- No event sourcing, versioned event log, background worker, queue, retry system, network synchronization, or new repository was introduced for either guard — both are pure functions/counters composed into existing call sites
- Verified (no code change, already correct): mutation sequencing A→persist/B→persist/C-fails/D→persist leaves SQLite and hydration reflecting only D; failure sequencing (no rollback, observer stays `"ready"`, next mutation recovers); persistence-failure consistency (Sprint 36.4 behavior reused as-is)
- Verified + extended: athlete isolation (A→logout→B→logout→A, Sprint 36.1) now covered across every cross-domain overlay (Workout/Nutrition/Recovery/Goal/Coach/Notification) in one integration test, not just identity/workspace
- New integration coverage closing pure testing gaps (no production-code change): a single session mutating all eight domains persists and restores together after a full restart (cross-domain consistency); `restoreDashboard()` after hydration reflects real hydrated data and never the empty/mock fallback shape (dashboard consistency); a comprehensive full-reset test asserts every pipeline's status **and** result object, the observer's `athleteIds`, and both new mutation-sequence counters all return to a clean state together (reset consistency)
- Tests: new `athleteRecordOwnership.test.ts` (6 tests), `write-through/__tests__/ownershipGuard.test.ts` (8 tests), `hydration/__tests__/ownershipGuard.test.ts` (7 tests), `mutationSequenceGuard.test.ts` (10 tests), `consistencyGuard.integration.test.ts` (4 tests — cross-domain restart, dashboard consistency, extended athlete isolation, full-reset inventory); full existing suite (802 suites / 3326 tests) and typecheck remain green
- No new runtime subsystem, no runtime architecture redesign, no networking, no backend, no SQLite changes, no Admin changes, no AI/Coach changes, no visual redesign; ADR-149; docs: ARCHITECTURE, PROJECT_STATE, CHANGELOG, DECISIONS

Previous: **36.4 — Runtime Persistence Failure Recovery** (2026-08-11)

- `RuntimeObserver`'s `triggerWriteThrough()` now attaches `.catch((error) => logWriteThroughFailure(error))` to the fire-and-forget `persistRuntime()` call it fires after every successful runtime `build()` — a repository/write-through failure no longer surfaces as an unhandled promise rejection; the failure reason is logged through the existing `infrastructure/logging` abstraction (`getLogger().error()`, scope `"Application"`), never via `console.*`
- The failure remains fully deterministic and observable through the **existing** `RuntimeWriteThroughState`/`getWriteThroughStatus()`/`RuntimeWriteThroughService` mechanism (`status: "failed"` + the causing error) — `RuntimeWriteThroughPipeline.persist()`'s catch block already recorded this correctly and never touches any runtime composition service, so the in-memory domain mutation that triggered the failed persist is never rolled back
- Runtime Observer status and Runtime Session status both remain `"ready"` after a persistence failure — confirmed as separate concerns from runtime execution/session availability; no observer restart and no session retry is triggered or required
- Recovery on the next successful mutation was **already structurally guaranteed**, not newly built: `triggerWriteThrough()` has called `resetRuntimeWriteThrough()` immediately before every `persistRuntime()` call since the observer's introduction (Sprint 33.7) — not only after a detected failure. This is load-bearing: `persistRuntime()` treats a `"ready"` state as idempotent and, without the reset, a `"failed"` state's stale rejected promise (cleared only by `resetRuntimeWriteThrough()`) would otherwise be returned indefinitely. This sprint's tests prove the existing behavior satisfies "reset existing Write-Through state, then persist the latest complete runtime state" on every mutation
- "Latest mutation wins" verified end-to-end: Mutation A succeeds → Mutation B fails → Mutation C succeeds leaves SQLite (and post-restart rehydration) reflecting only C, because write-through always persists the complete current runtime-service state at execution time, not a delta captured at trigger time
- Domain coverage verified uniformly for Workout, Nutrition, Recovery (own `*RuntimePersistenceService.build()` + own repository) and Goal Progress, Coach, Notification (`UnifiedWorkspaceService.build()` + `WorkspaceRepository` overlays, Sprint 35.4/35.5) — all six route through the same `RuntimeObserver` → `triggerWriteThrough()` → `persistRuntime()` path, so no domain-specific handling was needed
- Logout unaffected: the existing reset cascade (Sprint 33.8/36.1/36.3 — Observer → Write-Through → Dashboard Restore → Hydration → Bootstrap → Session) already clears write-through status/error/in-flight-promise unconditionally regardless of the last write-through outcome; no stale persistence-failure state survives logout, and athlete isolation is unaffected (recovery reuses the same authenticated `athleteIds` already threaded through the observer/write-through pipeline)
- No duplicate observer wrappers: `RuntimeObserver.start()`'s `build()` wrap/unwrap bookkeeping (Sprint 33.7/36.3) is untouched — one wrapper per watched service, one persist trigger per successful `build()`, across any number of failure/recovery cycles
- Tests: new `persistenceFailureRecovery.test.ts` (9 tests — successful persistence, repository failure without rollback, no unhandled rejection, failure logging, observer stays installed after failure, reset-before-recovery-persist proof, no duplicate wrappers, session lifecycle unaffected, real write-through pipeline failure→recovery); new `persistenceFailureRecovery.integration.test.ts` (8 tests — latest-mutation-wins A/B/C sequence, Workout/Nutrition/Recovery/Goal Progress/Coach/Notification domain coverage with repository-failure + recovery + restart/rehydration, restart lifecycle); new `persistenceFailureLogout.integration.test.tsx` (3 tests — persistence failure does not block/fail the session, failed-persistence → logout → login clean startup, no cross-athlete persistence-failure leakage); full existing suite (797 suites / 3292 tests) and typecheck remain green
- No new runtime subsystem, no runtime architecture redesign, no retry queue/background worker/debounce/batching/event bus, no new repository/provider, no persistence/SQLite changes, no networking, no admin, no AI/Coach changes, no visual redesign; ADR-148; docs: ARCHITECTURE, PROJECT_STATE, CHANGELOG, DECISIONS

Previous: **36.3 — Runtime Session Retry Hardening & Recovery State Reset** (2026-08-11)

- `retrySession()` (`RuntimeSessionContext.tsx`) now performs its full deterministic pipeline reset **unconditionally** on every invocation, instead of gating the reset on the orchestrator's internal `getRuntimeSessionStatus() === "failed"` check — closing a gap where an observer-only failure (which starts *after* `startRuntimeSession()` resolves) left the orchestrator's internal state at `"ready"` while the UI correctly showed `"failed"`, silently skipping the reset on the next retry
- Reset cascade order (shared by `retrySession()` and logout): `resetRuntimeObserver()` → `resetRuntimeWriteThrough()` → `resetDashboardRestore()` → `resetRepositoryHydration()` → `resetRuntimeBootstrap()` → `resetRuntimeSession()` — `resetRuntimeWriteThrough()` is now included (previously missing from the cascade); every step reuses an **existing** reset function, no new reset API introduced
- No stale `ready`/`failed`/in-flight state can block a legitimate retry — bootstrap, hydration, dashboard restore, and observer can each independently fail and be retried without the others' state interfering
- `RuntimeObserver.start()` now builds its `activeObservation.unwraps` list incrementally (pushing each service's unwrap function as soon as it wraps successfully) instead of assigning a finished array only after all six services wrap — a mid-sequence wrap failure is now fully unwound by the existing `unwrapActiveObservation()` cleanup path, preventing a previously-possible permanent double-wrap (and double-persist) of a service's `build()` on a subsequent successful start
- Athlete isolation unchanged and reaffirmed: retry always reuses the current authenticated `AuthContext.user.id` via the same `athleteIds` memo as initial startup — never a cached/hydrated/persisted athlete id
- `ErrorBoundary` (Sprint 36.2) remains fully independent of `RuntimeSessionContext`/`retrySession()` — the two recovery mechanisms are not coupled
- Tests: new `retryHardening.integration.test.tsx` (15 tests — failure→retry→ready, failure→retry→failure, retry after bootstrap/hydration/dashboard-restore/observer failure, no duplicate observer wrapping, full pipeline reset-and-re-run proof via real pipeline class spies, athleteId reuse + no stale athleteId reuse, navigation gating, retry loading-state transition, logout→login clean startup, no cross-athlete state leakage); new `RuntimeObserver.test.ts` regression case for the partial-wrap leak; full existing suite (794 suites / 3272 tests) and typecheck remain green
- No new runtime subsystem, no runtime architecture redesign, no persistence/SQLite changes, no networking, no admin, no AI/Coach changes, no visual redesign; ADR-147; docs: ARCHITECTURE, PROJECT_STATE, CHANGELOG, DECISIONS

Previous: **36.2 — Global Runtime Failure UX & Error Boundary** (2026-08-11)

- Authenticated startup failures (bootstrap, hydration, dashboard restore, or observer) now render a dedicated global `RuntimeFailureScreen` (`components/RuntimeFailureScreen.tsx`) instead of leaving authenticated navigation reachable with no recovery surface
- `app/(app)/_layout.tsx` blocks the authenticated `Stack` while Runtime Session `status === "failed"`; Retry calls the **existing** `RuntimeSessionContext.retrySession()` only — no parallel/duplicate retry mechanism
- `RuntimeSessionProvider` logs the internal failure reason via the existing `infrastructure/logging` abstraction (`getLogger().error()`) before setting `status = "failed"`; the raw exception, message, or SQLite internals are never passed to the UI
- New reusable `components/ErrorBoundary.tsx` (class component) catches unexpected React render/lifecycle exceptions, logs via `getLogger().error()`, and shows a safe fallback with a "Try again" action that resets and re-renders its subtree — no stack traces, no `console.*` production logging path
- `ErrorBoundary` wraps only the authenticated `Stack` inside `app/(app)/_layout.tsx` — the smallest boundary covering the authenticated app shell; auth/onboarding route groups render outside it and are unaffected
- Both surfaces share presentation via new `components/AppErrorFallback.tsx` (existing `GradientBackground` + `EmptyState` + `AppButton`) — no new design-system primitives, no visual redesign
- Tests: `RuntimeFailureScreen.test.tsx`, `ErrorBoundary.test.tsx`, `globalFailureUX.integration.test.tsx` (failure screen render, no raw error exposure, retry via existing API, successful retry returns to authenticated app, unauthenticated bypass, ErrorBoundary catch/log/recover/pass-through); full existing suite (3256 tests) and typecheck remain green
- No new runtime subsystem, no persistence/SQLite changes, no networking, no admin, no AI/Coach changes; ADR-146; docs: ARCHITECTURE, PROJECT_STATE, CHANGELOG, DECISIONS

Previous: **36.1 — SQLite Session Data Isolation / Logout Hardening** (2026-08-11)

- Closed production data-isolation gap where SQLite data survived logout and could be rehydrated by a different athlete's next login; see ADR-145

Previous: **31.6 — Profile & Settings Experience** (2026-07-29)

- Profile tab rebuilt as `features/profile-experience` with `ProfileExperienceViewModel` and Application APIs over `ProfileExperienceService`
- **Sprint 34.8:** Production Nutrition tab path reads hydrated Unified Workspace (+ Plan History nutrition plan) via `useNutritionDashboard` + `applyHydratedDashboard()`; Mock NutritionExperienceService removed from authenticated startup; meal/hydration mutations publish through existing Sprint 32.2 integration; in-session nutrition state not yet persisted through Nutrition SQLite mapper (placeholder)
- **Sprint 34.7:** Production Workout tab path reads hydrated Unified Workspace (+ Workout Assembly cache) via `useWorkoutRuntime` + `applyHydratedWorkout()`; Mock WorkoutRuntimeExperienceService removed from authenticated startup; finish publishes `WorkoutCompleted` via existing Sprint 32.1 integration
- **Sprint 34.6:** Supported Profile edits persist via Application update APIs → `AthleteIdentityService.build()` → Runtime Observer → Write-Through → SQLite; unsupported Profile fields remain unchanged
- **Sprint 34.5:** Production Profile path reads hydrated `AthleteIdentityService` via `useProfile` + `applyHydratedProfile()`; Mock ProfileExperienceService removed from authenticated startup
- Digital Athlete Profile aggregates athlete information, goals, training preferences, nutrition preferences, coach preferences, notification preferences, appearance preferences, measurement units, connected services, app version, and account status
- Preference update workflow with ViewModel-owned loading/saving/error state; presentation-only cards; future navigation placeholders for edit profile, goal details, connected service details, notification settings, privacy, about
- Connected Services prepared (Apple Health, Google Fit, Garmin, WHOOP, Oura) without synchronization
- Coach Preferences prepared for AI provider (coaching style, motivation level, feedback frequency, explanation depth)
- Appearance supports Light / Dark / System with accent color prepared
- Mock / Backend / Local provider seam established; route `app/(app)/(tabs)/profile.tsx` now targets `ProfileExperienceScreen`
- Docs aligned: PROFILE_EXPERIENCE_ARCHITECTURE, ARCHITECTURE, PROJECT_STATE, CHANGELOG; ADR-111

Previous: **31.5 — Nutrition Experience** (2026-07-29)

- Nutrition tab rebuilt as `features/nutrition-experience` with `NutritionExperienceViewModel` and Application APIs over `NutritionExperienceService`
- Dashboard aggregates calories, protein, carbohydrates, fat, hydration, meal completion, coach suggestions, daily goal, and nutrition score
- Day-based workflow shipped with ViewModel-owned state, presentation-only meal timeline/cards, and future navigation placeholders for meal details, food search, barcode scanning, and history
- Mock / Backend / Local provider seam established; route `app/(app)/(tabs)/nutrition.tsx` now targets `NutritionExperienceScreen`
- Docs aligned: NUTRITION_EXPERIENCE_ARCHITECTURE, ARCHITECTURE, PROJECT_STATE, CHANGELOG; ADR-110

Previous: **31.4 — Progress & Analytics Experience** (2026-07-29)

- Progress tab rebuilt as `features/progress-experience` with `ProgressExperienceViewModel` and Application APIs over `ProgressExperienceService`
- Dashboard aggregates strength, volume, recovery, nutrition, body metrics, streak, goal completion, personal records, and coach insights
- Time-range support shipped (`7d` / `30d` / `90d` / `1y` / `all`) with ViewModel-owned state and reusable chart-ready models
- Mock / Backend / Local provider seam established; route `app/(app)/(tabs)/progress.tsx` now targets `ProgressExperienceScreen`
- Docs aligned: PROGRESS_EXPERIENCE_ARCHITECTURE, ARCHITECTURE, PROJECT_STATE, CHANGELOG; ADR-109

Previous: **30.7 — Architecture Review & Production Readiness** (2026-07-29)

- Architecture Consolidation audit — no business features; review / cleanup / documentation only
- Deliverable: [ARCHITECTURE_REVIEW.md](./ARCHITECTURE_REVIEW.md) (overview, strengths, weaknesses, refactors, debt, production readiness, risks, MVP readiness)
- Verified: Domain ↛ Infrastructure; Composition Root owns 55 ServiceMap tokens; Phase 30 adapter family consistency
- Safe consistency: Composition Root public factory export parity with `factories/index.ts`
- Docs aligned: ARCHITECTURE, COMPOSITION_ROOT, PROJECT_STATE, CHANGELOG; ADR-105
- Architecture ready for Phase 31 Product Development; product not production-deployable (mocks / no CI)

Previous: **30.6 — Logging & Observability Adapter Foundation** (2026-07-28)

- Logging & Observability Adapter Foundation (`infrastructure/logging`) — deterministic Mock Logger
- Implements Infrastructure `LoggingAdapter` via local orchestration only
- Models: LogEvent / LogEntry / LogContext / LogScope / LogLevel / LogMetadata / LogCapabilities / LogStatistics / LogResult
- Logger: MockLogger / LoggerFactory / LoggerRegistry / LoggerValidator / LogDispatcher
- Operations: trace / debug / info / warn / error / fatal / flush / clear / statistics
- Levels: Trace / Debug / Information / Warning / Error / Fatal
- Context scopes: Workout / Nutrition / Recovery / Coach / Synchronization / Authentication / Backend / Application
- Registry: LoggerRegistry / LoggerRegistration / LoggerMetadata / LoggerResult
- Application APIs: `getLogger`, `log`, `getLogStatistics`, `clearLogs`, `validateLogging`
- Composition Root: `MockLogger` / `LoggerFactory` / `LoggerRegistry`
- ADR-104; docs: LOGGING_ADAPTER, ARCHITECTURE
- Orchestration only; no console; no files; no OpenTelemetry; no Sentry; no Datadog; no Azure Monitor; no Grafana; no Elastic; no cloud; no networking; no persistence; no business logic

Previous: **30.5 — Backend API Adapter Foundation** (2026-07-28)

- Backend API Adapter Foundation (`infrastructure/backend`) — deterministic Mock Backend Provider
- Implements Infrastructure `BackendAdapter` via local orchestration only
- Models: BackendRequest / BackendResponse / BackendEndpoint / BackendRoute / BackendMetadata / BackendCapabilities / BackendResult / BackendStatus / BackendHealth / BackendError
- Provider: MockBackendProvider / BackendProviderFactory / BackendRequestDispatcher / BackendResponseMapper / BackendValidator
- Operations: send / execute / dispatch / health / capabilities / listEndpoints
- Routing: `/auth` `/workout` `/nutrition` `/recovery` `/coach` `/sync` `/profile` `/settings` (routes only)
- Responses: Success / Failure / Unavailable / Unauthorized / Forbidden / Conflict / ValidationError / NotFound
- Registry: BackendRegistry / BackendRegistration / BackendMetadata / BackendResult
- Application APIs: `getBackend`, `getBackendHealth`, `getBackendCapabilities`, `listBackendEndpoints`, `validateBackend`
- Composition Root: `MockBackendProvider` / `BackendRegistry` / `BackendFactory`
- ADR-103; docs: BACKEND_API_ADAPTER, ARCHITECTURE
- Orchestration only; no HTTP; no REST; no GraphQL; no sockets; no networking; no FastAPI; no ASP.NET; no Express; no NestJS; no serialization; no JSON parsing; no cloud; no business logic

Previous: **30.4 — Synchronization Adapter Foundation** (2026-07-28)

- Synchronization Adapter Foundation (`infrastructure/synchronization`) — deterministic Synchronization Engine
- Implements Infrastructure `SynchronizationAdapter` via local orchestration only
- Models: SynchronizationState / SynchronizationOperation / SynchronizationBatch / SynchronizationQueue / SynchronizationConflict / SynchronizationPolicy / SynchronizationMetadata / SynchronizationStatistics / SynchronizationCapabilities / SynchronizationResult / SynchronizationCheckpoint
- Engine: SynchronizationEngine / SynchronizationCoordinator / SynchronizationValidator / SynchronizationBatchProcessor / SynchronizationStateManager
- Operations: enqueue / dequeue / peek / markCompleted / markFailed / cancel / clear / retry
- Registry: SynchronizationRegistry / SynchronizationProviderRegistration / SynchronizationProviderMetadata / SynchronizationProviderResult
- Application APIs: `getSynchronization`, `getSynchronizationQueue`, `getSynchronizationState`, `getSynchronizationStatistics`, `validateSynchronization`
- Composition Root: `SynchronizationEngine` / `SynchronizationRegistry` / `SynchronizationFactory`
- ADR-102; docs: SYNCHRONIZATION_ADAPTER, ARCHITECTURE
- Orchestration only; no networking; no HTTP; no REST; no GraphQL; no Supabase; no Firebase; no PostgreSQL; no cloud; no sockets; no persistence; no background services; no business logic; no synchronization execution

Previous: **30.3 — Authentication Adapter Foundation** (2026-07-28)

- Authentication Adapter Foundation (`infrastructure/authentication`) — first Mock Authentication Adapter
- Implements Infrastructure `AuthenticationAdapter` via in-memory MockAuthenticationProvider
- Models: AuthenticatedUser / AuthenticationSession / AuthenticationToken / RefreshToken / AuthenticationMetadata / AuthenticationState / AuthenticationResult / AuthenticationCapabilities
- Provider: MockAuthenticationProvider / AuthenticationProviderFactory / AuthenticationSessionManager / AuthenticationValidator
- Registry: AuthenticationRegistry / AuthenticationProviderRegistration / AuthenticationProviderMetadata / AuthenticationProviderResult
- Application APIs: `getAuthentication`, `getCurrentUser`, `getCurrentSession`, `isAuthenticated`, `validateAuthentication`
- Composition Root: `MockAuthenticationProvider` / `AuthenticationRegistry` / `AuthenticationFactory`
- ADR-101; docs: AUTHENTICATION_ADAPTER, ARCHITECTURE
- Deterministic in-memory only; no Supabase; no Firebase; no Auth0; no OAuth; no JWT; no OpenID; no HTTP; no networking; no cloud; no SDK; no encryption; no persistence; no business logic

Previous: **30.2 — Repository Adapter Integration** (2026-07-28)

- Repository Adapter Layer (`infrastructure/repositories`) — Persistence Contracts bound to SQLite repositories
- Adapters: Athlete / Identity / Workspace / Snapshot / Timeline / Workout / Nutrition / Recovery / Settings / Runtime
- Registry: RepositoryAdapterRegistry / RepositoryAdapterMetadata / RepositoryAdapterResult / RepositoryAdapterRegistration
- Application APIs: `getRepositoryAdapters`, `getRepositoryAdapter`, `validateRepositoryAdapters`
- Composition Root: `RepositoryAdapterRegistry` / `RepositoryAdapters` via `RepositoryAdapterFactory`
- ADR-100; docs: REPOSITORY_ADAPTERS, ARCHITECTURE
- Delegation only; no domain changes; no business logic; no AI; no networking; no cloud; no auth; no cache; no sync

Previous: **30.1 — SQLite Storage Adapter** (2026-07-28)

- SQLite Infrastructure Adapter (`infrastructure/sqlite`) — first production persistence adapter
- Implements Persistence Contracts (Athlete / Identity / Workspace / Snapshot / Timeline / Workout / Nutrition / Recovery / Settings / Runtime) + Infrastructure `StorageAdapter`
- Connection / Session / Transaction / Health; pure mappers; begin/commit/rollback (no retry)
- Application APIs: `getSQLiteHealth`, `getSQLiteRepositories`, `getSQLiteConnection`
- Composition Root: `SQLiteConnection` / `SQLiteAdapter` / `SQLiteRepositories` via `SQLiteAdapterFactory`
- ADR-099; docs: SQLITE_ADAPTER, ARCHITECTURE
- Domain never imports SQLite; no React Native; no Expo; no cloud sync; no auth; no networking; no business logic; no AI

Previous: **29.4 — Infrastructure Adapter Contracts** (2026-07-28)

- Infrastructure Adapter Contracts (`core/infrastructure`) — immutable abstraction layer for future external infrastructure
- Adapter contracts: Storage / Authentication / Notification / Analytics / Synchronization / Logging / FeatureFlag / HealthPlatform / Media / Export / Import / Clock / IdentifierGenerator / ConfigurationProvider
- Registry: AdapterRegistry / AdapterMetadata / AdapterCapabilities / AdapterRegistration / AdapterResult
- Application APIs: `getAdapterRegistry`, `getRegisteredAdapters`, `validateAdapters`, `getAdapterCapabilities`
- Composition Root: `InfrastructureAdapterRegistry` via `InfrastructureAdapterFactory`
- ADR-098; docs: INFRASTRUCTURE_ADAPTERS, ARCHITECTURE
- No SQLite; no PostgreSQL; no Firebase; no Supabase; no HTTP; no REST; no GraphQL; no SDKs; no Expo; no React Native; no network; no filesystem; no persistence; contracts only

Previous: **29.3 — Persistence Contract Foundation** (2026-07-28)

- Persistence Contract foundation (`core/persistence`) — immutable contracts for future persistence adapters
- Repository contracts: Athlete / Identity / Workspace / Snapshot / Timeline / Plan / Workout / Nutrition / Recovery / Settings / Runtime
- Storage ports: Reader / Writer / Transaction / Session / Health / Metadata / Result
- Application APIs: `getPersistenceContracts`, `getRepositoryRegistry`, `validatePersistenceContracts`
- Composition Root: `PersistenceContractRegistry` / `RepositoryRegistry` / `StorageContractRegistry` via `PersistenceContractsFactory`
- ADR-097; docs: PERSISTENCE_CONTRACTS, ARCHITECTURE
- No SQLite; no PostgreSQL; no Supabase; no AsyncStorage; no Realm; no IndexedDB; no filesystem; no network; no persistence I/O; no adapters; contracts only

Previous: **29.2 — Runtime Environment Foundation** (2026-07-28)

- Runtime Environment foundation (`features/runtime-environment`) — immutable execution-environment layer for future production features
- Models: Device / Platform / Application / Capabilities / FeatureSupport / Locale / Connectivity / Metadata
- Application APIs: `getRuntimeEnvironment`, `getCapabilities`, `getPlatformInfo`, `getApplicationInfo`, `getConnectivityInfo`
- Composition Root: `RuntimeEnvironmentService` via `RuntimeEnvironmentFactory`
- ADR-096; docs: RUNTIME_ENVIRONMENT, ARCHITECTURE
- No React Native; no Expo; no Device APIs; no networking; no persistence; no cache; no cloud; no LLM; environment modeling only

Previous: **29.1 — Athlete Identity Foundation** (2026-07-28)

- Athlete Identity foundation (`features/athlete-identity`) — immutable identity layer for future production features
- Models: Profile / Preferences / Settings / Locale / Units / TimeZone / Metadata
- Application APIs: `getAthleteIdentity`, `getAthleteProfile`, `getPreferences`, `getSettings`
- Composition Root: `AthleteIdentityService` via `AthleteIdentityFactory`
- ADR-095; docs: ATHLETE_IDENTITY, ARCHITECTURE
- No authentication; no OAuth/JWT; no persistence; no database; no cache; no cloud; no networking; no LLM; identity modeling only

Previous: **28.3 — Unified Athlete Workspace** (2026-07-28)

- Unified Athlete Workspace composition (`features/unified-workspace`) — canonical immutable athlete read model
- Projections: Header / Summary / Health / Goals / Workout / Nutrition / Recovery / Insights / Timeline / Coach / Snapshot / Metadata
- Application APIs: `getWorkspace`, `getWorkspaceSummary`, `getWorkspaceHealth`, `getWorkspaceInsights`, `getWorkspaceCoach`
- Composition Root: `UnifiedWorkspaceService`
- ADR-094; docs: UNIFIED_WORKSPACE, ATHLETE_SNAPSHOT, ARCHITECTURE
- No persistence; no database; no cache; no event bus; no scheduler; no LLM; composition only

Previous: **28.1 — Athlete Intelligence Workspace** (2026-07-28)

- Athlete Intelligence Workspace composition (`features/intelligence-workspace`) — single immutable premium coaching read model
- Projections: Overview / Status / Home / Daily Brief / Weekly Report / Timeline / Insights / Coach / Metadata
- Dashboard APIs: `getAthleteWorkspace`, `getWorkspaceOverview`, `getWorkspaceStatus`, `getWorkspaceTimeline`, `getWorkspaceInsights`, `getWorkspaceCoach`
- Composition Root: `AthleteWorkspaceService`
- ADR-092; docs: INTELLIGENCE_WORKSPACE, WEEKLY_REPORT, DAILY_BRIEF, HOME_EXPERIENCE, ARCHITECTURE
- No new engines; no persistence; no caching; no scheduler; no UI redesign; no LLM

Previous: **27.3 — Weekly Coach Report** (2026-07-28)

- Weekly Coach Report composition (`features/weekly-report`) — deterministic weekly coaching review
- Sections: Executive Summary / Workout / Nutrition / Recovery / Goals / Insights / Decisions / Recommendations
- Evidence projection + deterministic evidence-based confidence
- Dashboard APIs: `getWeeklyCoachReport`, `getExecutiveSummary`, section getters
- Composition Root: `WeeklyCoachReportService`
- ADR-091; docs: WEEKLY_REPORT, DAILY_BRIEF, HOME_EXPERIENCE, ARCHITECTURE, PROACTIVE_INSIGHTS, COACHING_SESSION
- No new engines; no conversation changes; no UI redesign; no PDF; no persistence; no notifications

Previous: **27.2 — Athlete Daily Brief** (2026-07-28)

- Daily Brief composition (`features/daily-brief`) — deterministic daily coaching brief
- Sections: Workout / Nutrition / Recovery / Goals / Insights / Coach Message
- Deterministic priority (`LOW`/`NORMAL`/`HIGH`/`CRITICAL`) and evidence-based confidence
- Dashboard APIs: `getDailyBrief`, `getCoachMessage`, section getters
- Composition Root: `DailyBriefService`
- ADR-090; docs: DAILY_BRIEF, HOME_EXPERIENCE, ARCHITECTURE, PROACTIVE_INSIGHTS, COACHING_SESSION
- No new engines; no conversation changes; no UI redesign; no persistence; no notifications

Previous: **27.1 — Coach Home Experience Orchestrator** (2026-07-28)

- Home Experience composition (`features/home-experience`) — Home as deterministic intelligence hub
- Cards: Workout / Nutrition / Recovery / Goal / Insight / Timeline / Coach + deterministic Quick Actions
- Dashboard APIs: `getHomeExperience`, `getHomeSummary`, `getQuickActions`, `getCoachCard`, `getInsightCards`
- Composition Root: `HomeExperienceService`
- ADR-089; docs: HOME_EXPERIENCE, ARCHITECTURE, PROACTIVE_INSIGHTS, COACHING_SESSION
- No new engines; no conversation changes; no UI redesign

Previous: **26.1 — Explainable Coaching Session** (2026-07-28)

- Explainable Coaching Session composition (`features/coaching-session/composition`)
- Every Coach Conversation turn packages Timeline / Decision / Recommendation / Explainability / Insights evidence
- Dashboard APIs: Latest Session / Summary / Evidence / Insights / Confidence
- Composition Root: `ExplainableCoachingSessionService` injected into Coach Conversation
- ADR-088; docs: COACHING_SESSION

Previous: **25.4 — Coach Timeline & Decision Journal** (2026-07-27)

- Append-only Coach Timeline decision journal (`features/coach-timeline`)
- Automatic orchestration hooks for workout/nutrition/restore/goal/recovery/decision/user-request
- Coach Conversation intent `timeline_query` — answers grounded only in Timeline entries
- Deterministic summaries (last 7 days, training block, cut/bulk, recovery, modifications, latest decisions)
- Composition Root: `CoachTimelineService`
- ADR-086; docs: COACH_TIMELINE, COACH_CONVERSATION, PLAN_HISTORY, WORKOUT_PIPELINE, NUTRITION_PIPELINE

Previous: **25.3 — Plan Restore & Undo Foundation** (2026-07-27)

- Immutable plan restore for Workout and Nutrition via `features/plan-restore`
- Flow: Resolve Target → Preview → Validate → Restore Snapshot → Publish New Version
- Plan History foundation (`features/plan-history`) — append-only versioned snapshots
- Coach Conversation intent `plan_restore`; restore always creates `n+1` without mutating history
- Composition Root: `PlanHistoryService`, `PlanRestoreService` injected into Coach Conversation
- ADR-083 / ADR-085; docs: PLAN_HISTORY, WORKOUT_PIPELINE, NUTRITION_PIPELINE, COACH_CONVERSATION

Previous: **24.3 — Adaptive Workout Modification** (2026-07-27)

- Product capability: active `WorkoutPlan` becomes a living object modified through natural coaching requests
- Surgical path: WorkoutPlan → Modification Request → Workout Agent → Validation → Updated WorkoutPlan → Conversation Reply
- No full regeneration; preserves progression week, recommendations, decision package, ordering when possible
- Coach Conversation intent `workout_modification`; Composition Root injects pipeline into `CoachConversationService`
- Coach Screen: Generate → Modify via chat → Updated plan continuity
- Supported kinds: replace/remove/add exercise, duration, intensity, volume, equipment, injury, fatigue, recovery, focus; unknown fallback

Previous: **24.2 — Intelligent Coach Conversation Experience** (2026-07-27)

- Product capability: conversation becomes the primary coaching interface after WorkoutPlan generation
- Module `features/coach-conversation` (orchestration only — no new engines)
- Deterministic intent routing + Supervisor Routing reuse; WorkoutPlan attachment to conversation session
- Coach Screen: Generate Workout → natural conversation about that plan via Composition Root
- Conversation Memory records intent / plan / reply continuity; `ConversationService.sendCoachingReply` adapter
- Composition Root registers `CoachConversationService`

Previous: **24.1 — Intelligent Workout Generation Pipeline** (2026-07-27)

- Product capability: Conversation → Coaching Session → Coach Supervisor → Workout Agent → Athlete State → Context Fusion → Decision → Recommendation → Workout Generation → canonical `WorkoutPlan`
- Module `features/workout-generation-pipeline` (orchestration only — no new engines)
- Workout Agent gained `generateWorkout` (Program Generation via domain gateway)
- Coach Screen **Generate Workout** CTA; UI adapter `mapWorkoutPlanToWorkoutProgram` for legacy screens
- Composition Root registers `WorkoutGenerationPipelineService`

Previous: **23.2 — Legacy Pipeline Consolidation** (2026-07-27)

- Converted legacy `recommendations` service into a Composition Root facade (`DefaultRecommendationService` → Recommendation Engine bridge; rule path is fallback-only)
- Collapsed Dashboard weight pipeline onto the single facade (removed duplicate bridge resolve)
- Marked `decisionEngine`, `coach-agent`, and `useCoachChat` as deprecated compatibility surfaces
- Removed duplicate WeightUpdated recommendation handling from `RecommendationListener`
- Public APIs preserved; no new engines; no business-behavior redesign

Previous: **23.1 — Composition Root Integration** (2026-07-26)

- Wired the coaching architecture into `core/composition` (Capability Registry → Routing → Collaboration → Coach Supervisor → Coaching Session → Athlete State → Context Fusion → Decision Engine → Recommendation Engine)
- Thin port adapters only — no new engines, no module redesigns, legacy modules retained
- Coach UI resolves `CoachingSessionService`; Dashboard recommendations use Recommendation Engine bridge into the legacy store/widget contract

Previous: **22.0 — Coaching Session Runtime**, **21.8 — Coach Supervisor Foundation**, **21.7 — Supervisor Routing Engine Foundation**

---

Current: **34.3 — Domain Persistence Serialization** (2026-08-10)

- Repository layer serializes full immutable domain models (Athlete Identity, Runtime Environment, Unified Workspace, Workspace Snapshot, Coach Timeline) into SQLite JSON payloads
- Write-through attaches domain payloads; hydration restores complete immutable models — no structural placeholder rebuilds
- `PersistenceRecord` contracts, Composition Root, Runtime Session/Observer/Bootstrap, and Dashboard Restore lifecycle unchanged
- Integration tests cover serialize/deserialize, round-trip equality, immutable restoration, restart persistence, repository compatibility
- ADR-132; docs: ARCHITECTURE, PROJECT_STATE, CHANGELOG, DECISIONS, SQLITE_ADAPTER
- No schema migrations; no networking; no cloud sync

Previous: **34.2 — Native SQLite Engine Integration** (2026-08-10)

- Native persistent Expo SQLite driver replaces in-memory engine; automatic idempotent schema init; database survives restart
- Infrastructure-only change; repository contracts and runtime pipeline unchanged
- ADR-131

Previous: **34.1 — SQLite Runtime Persistence Activation** (2026-08-10)

- Runtime persistence activated through `PersistenceRepositoryProvider` — Composition Root selects SQLite-backed repository adapters for hydration and write-through
- `CompositionConfiguration.runtimePersistenceMode` hard-locked to `"sqlite"`; Training Intelligence repositories remain in-memory via `RepositoryProvider`
- Application startup hydrates from SQLite; runtime observer write-through persists into SQLite automatically through existing repository contracts
- Integration tests cover empty/populated startup, write-through, restart persistence, repository integration, and composition wiring
- ADR-130; docs: ARCHITECTURE, PROJECT_STATE, CHANGELOG, DECISIONS, SQLITE_ADAPTER, COMPOSITION_ROOT
- Phase 34 started; no new repositories; no runtime architecture changes; no networking; no cloud sync

Previous: **33.9 — End-to-End Runtime Persistence Validation** (2026-08-10)

- Comprehensive end-to-end integration tests validate the complete runtime lifecycle: authenticated startup → session → hydration → dashboard restore → observer → write-through
- Tests cover empty/populated repositories, dashboard restoration, automatic persistence, logout reset, restart sequence, deterministic execution order, and failure propagation
- User Story 01 complete — application startup is deterministic and runtime lifecycle is fully validated
- ADR-129; docs: ARCHITECTURE, PROJECT_STATE, CHANGELOG, DECISIONS
- No new runtime modules, no SQLite implementation, no networking, no duplicated orchestration

Previous: **33.8 — Runtime Auto-Start Wiring** (2026-08-10)

- `RuntimeSessionProvider` auto-starts `observeRuntime()` immediately after successful `startRuntimeSession()`
- Logout and unauthenticated reset invoke `resetRuntimeObserver()` before session sub-pipeline teardown
- Observer startup integration tests cover auto-start, stop on logout, startup ordering, failure path, and composition integration
- ADR-128; docs: ARCHITECTURE, PROJECT_STATE, CHANGELOG, DECISIONS
- No new public APIs, no SQLite, no Dashboard/Timeline changes, no circular dependencies

Previous: **33.7 — Runtime Change Observer** (2026-08-10)

- Runtime Change Observer module (`runtime/runtime-observer`) — automatic write-through on runtime service mutations
- Application APIs: `observeRuntime`, `getRuntimeObserverStatus`
- Externally wraps `build()` on Athlete Identity, Runtime Environment, and Unified Workspace; triggers `persistRuntime()` on success
- Composition Root registers `RuntimeObserverService` via `RuntimeObserverFactory` (token #63)
- ADR-127; docs: RUNTIME_OBSERVER, ARCHITECTURE, COMPOSITION_ROOT
- No SQLite, no service-internal hooks, no Dashboard changes, no retry/debounce/batching

Previous: **33.6 — Runtime Startup Integration** (2026-08-10)

- Authenticated app launch wired to `startRuntimeSession()` via `RuntimeSessionProvider`
- Route guards (`app/index.tsx`, `app/(app)/_layout.tsx`) wait for full runtime session (bootstrap → hydration → dashboard restore)
- Removed duplicated `RuntimeBootstrapProvider` orchestration from app launch path
- Startup integration tests cover authenticated/unauthenticated paths, ordering, failure propagation, composition integration
- ADR-126; docs: ARCHITECTURE, PROJECT_STATE, CHANGELOG; completes User Story 01
- No SQLite, no persistence implementation, no networking, no business logic

Previous: **33.5 — Runtime Session Orchestrator** (2026-08-10)

- Runtime Session module (`runtime/session`) — single orchestration entry for bootstrap → hydration → dashboard restore
- Application APIs: `startRuntimeSession`, `getRuntimeSessionStatus`
- Composition Root registers `RuntimeSessionService` via `RuntimeSessionFactory` (token #62)
- ADR-125; docs: RUNTIME_SESSION, ARCHITECTURE, COMPOSITION_ROOT

Previous: **33.2 — Repository Hydration Pipeline** (2026-08-10)

- Repository Hydration module (`runtime/hydration`) — restores in-memory runtime from persistence contract repositories after bootstrap
- Immutable models: `HydrationState`, `HydrationResult`, `HydrationStatus`, `HydrationInitialization` phases
- `RepositoryHydrationPipeline` reads identity/runtime/workspace repository contracts and restores composition services
- Application APIs: `hydrateRuntime`, `getHydrationStatus`
- Composition Root registers `RepositoryHydrationService` via `RepositoryHydrationFactory` (token #59)
- ADR-122; docs: RUNTIME_HYDRATION, ARCHITECTURE, COMPOSITION_ROOT
- No direct SQLite, no persistence implementation, no Dashboard/Home/Timeline logic; empty repositories succeed with empty runtime

Previous: **33.1B — Runtime Bootstrap Gate** (2026-08-10)

- Runtime Bootstrap module (`runtime/bootstrap`) — deterministic application runtime bootstrap before authenticated content
- Immutable models: `BootstrapState`, `BootstrapResult`, `BootstrapStatus`, `RuntimeInitialization` phases
- `RuntimeBootstrap` gate creates Composition Root, validates Service Registry, freezes bootstrap state
- Application APIs: `bootstrapRuntime`, `getBootstrapStatus`
- `RuntimeBootstrapProvider` gates authenticated navigation (mirrors Auth `isBootstrapping`)
- Composition Root registers `RuntimeBootstrapService` via `RuntimeBootstrapFactory` (token #58)
- ADR-121; docs: RUNTIME_BOOTSTRAP, ARCHITECTURE, COMPOSITION_ROOT
- No persistence, SQLite reads, repository hydration, networking, or business logic

Previous: **32.6 — Unified Workspace → Dashboard Projection** (2026-08-10)

- Integration module (`integrations/dashboard-projection`) projects Unified Workspace into Dashboard read models
- Immutable models: `DashboardProjection`, `DashboardProjectionResult`, `DashboardProjectionSnapshot`, card models
- `DashboardProjector` validates workspace input and maps sections to Dashboard cards
- Application APIs: `projectWorkspaceToDashboard`, `projectAthleteWorkspaceToDashboard`
- Composition Root registers `DashboardProjector` via `DashboardProjectionFactory`
- ADR-120; docs: DASHBOARD_PROJECTION — completes Phase 32
- No persistence, networking, event bus, scheduler, or calculations

Previous: **32.5 — Progress Analytics → Coach Timeline Projection** (2026-08-10)

- Integration module (`integrations/analytics-timeline`) projects Progress Analytics events into Coach Timeline read models
- Composition Root registers `AnalyticsTimelineProjector` via `AnalyticsTimelineIntegrationFactory`
- ADR-119; docs: ANALYTICS_TIMELINE_PROJECTION

Previous: **32.4 — Goal Progress → Progress Analytics Integration** (2026-08-10)

- Integration module (`integrations/recovery-progress`) publishes immutable recovery progress events and updates Progress Analytics read models through contracts
- Immutable models: `RecoveryProgressEvent`, `RecoveryProgressSnapshot`, `RecoveryMetric`, `RecoveryAnalyticsPayload`, `RecoveryProgressMetadata`, `RecoveryProgressResult`
- Supported events represent only: `RecoveryDayStarted`, `RecoveryAssessed`, `SleepLogged`, `StressUpdated`, `ReadinessUpdated`, `HRVLogged`, `FatigueUpdated`, `RecoveryGoalAchieved`
- `RecoveryProgressPublisher` publishes immutable events; `RecoveryProgressSubscriber` consumes via `ProgressAnalyticsService.applyRecoveryProgressEvent`
- Application APIs: `publishRecoveryProgress`, `publishRecoveryAssessed`, `publishSleepLogged`, `publishReadinessUpdated`
- Validation: missing event, duplicate event id, invalid payload, missing metadata, unsupported event type
- Composition Root registers `RecoveryProgressPublisher` + `RecoveryProgressSubscriber` via `RecoveryProgressIntegrationFactory`
- Recovery feature never depends on Progress Analytics internals; contract-only communication
- No analytics calculations, repository changes, persistence, networking, backend, synchronization, or event sourcing

Previous: **32.2 — Nutrition → Progress Analytics Integration** (2026-08-02)

- Integration module (`integrations/nutrition-progress`) publishes immutable nutrition progress events and updates Progress Analytics read models through contracts
- Immutable models: `NutritionProgressEvent`, `NutritionProgressSnapshot`, `NutritionMetric`, `NutritionAnalyticsPayload`, `NutritionProgressMetadata`, `NutritionProgressResult`
- Supported events represent only: `NutritionDayStarted`, `MealLogged`, `MealRemoved`, `DailyNutritionCompleted`, `HydrationLogged`, `MacroTargetUpdated`, `NutritionGoalAchieved`, `NutritionAdherenceUpdated`
- `NutritionProgressPublisher` publishes immutable events; `NutritionProgressSubscriber` consumes via `ProgressAnalyticsService.applyNutritionProgressEvent`
- Application APIs: `publishNutritionProgress`, `publishMealLogged`, `publishDailyNutritionCompleted`, `publishHydrationLogged`
- Validation: missing event, duplicate event id, invalid payload, missing metadata, unsupported event type
- Composition Root registers `NutritionProgressPublisher` + `NutritionProgressSubscriber` via `NutritionProgressIntegrationFactory`
- Nutrition feature never depends on Progress Analytics internals; contract-only communication
- No analytics calculations, repository changes, persistence, networking, backend, synchronization, or event sourcing

Previous: **32.1 — Workout → Progress Analytics Integration** (2026-08-02)

- Integration module (`integrations/workout-progress`) publishes immutable workout progress events and updates Progress Analytics read models through contracts
- Immutable models: `WorkoutProgressEvent`, `WorkoutProgressSnapshot`, `WorkoutMetric`, `WorkoutAnalyticsPayload`, `WorkoutProgressMetadata`, `WorkoutProgressResult`
- Supported events represent only: `WorkoutStarted`, `WorkoutCompleted`, `WorkoutCancelled`, `WorkoutSkipped`, `ExerciseCompleted`, `SetCompleted`, `PersonalRecordAchieved`, `WorkoutVolumeUpdated`
- `WorkoutProgressPublisher` publishes immutable events; `ProgressAnalyticsSubscriber` consumes via `ProgressAnalyticsService.applyWorkoutProgressEvent`
- Application APIs: `publishWorkoutProgress`, `publishWorkoutCompletion`, `publishWorkoutCancellation`, `publishPersonalRecord`
- Validation: missing event, duplicate event id, invalid payload, missing metadata, unsupported event type
- Composition Root registers `WorkoutProgressPublisher` + `ProgressAnalyticsSubscriber` via `WorkoutProgressIntegrationFactory`
- Workout feature never depends on Progress Analytics internals; contract-only communication
- No analytics calculations, repository changes, persistence, networking, backend, synchronization, or event sourcing

Previous: **31.9 — Coach Timeline Framework Foundation** (2026-07-29)

- Coach Timeline Framework (`features/coach-timeline`) colocated with Decision Journal
- Immutable models: `TimelineEvent`, `TimelineEventType`, `TimelineCategory`, `TimelinePriority`, `TimelineSection`, `TimelineFilter`, `TimelinePeriod`, `TimelineMetadata`, `TimelineStatistics`, `TimelineSnapshot`, `TimelinePagination`, `TimelineCursor`, `TimelineGroup`, `TimelineAction`, `TimelineBadge`, `TimelineAttachment`, `AthleteTimeline`, loading/error states
- Application APIs: `loadTimeline`, `refreshTimeline`, `loadMoreTimeline`, `filterTimeline`, `searchTimeline`, `loadTimelineStatistics`, `loadTimelineSnapshot`
- `CoachTimelineViewModel` with subscriber pattern, loading/error/empty state, cursor pagination, filter/search
- Hooks: `useTimeline`, `useTimelineFilters`, `useTimelineStatistics`, `useTimelineSnapshot`, `useTimelineSearch`
- Components: header, event card, group header, statistics, filter, search, section, load more, skeleton, empty, error
- `CoachTimelineScreen` presentation composition
- Mock `CoachTimelineFrameworkService` seam; Backend/Local stubs prepared
- Event types / categories / periods / groups represent only; cursor pagination & search representation only
- Navigation destinations prepared on models only
- No event sourcing, realtime, networking, persistence, search engine, analytics calculations
- Decision Journal (ADR-086) preserved

Previous: **31.8 — Progress & Analytics Framework Foundation** (2026-07-29)

- Progress Analytics feature (`features/progress-analytics`) with deterministic analytics domain
- Immutable models: `AthleteProgress`, `ProgressSummary`, `WorkoutHistory`, `WorkoutStatistics`, `StrengthProgress`, `VolumeProgress`, `BodyMeasurement`, `BodyComposition`, `BodyWeightHistory`, `NutritionStatistics`, `RecoveryStatistics`, `SleepStatistics`, `PerformanceTrend`, `GoalProgress`, `PersonalRecord`, `TrainingConsistency`, `ProgressChart`, `AnalyticsPeriod`, `AnalyticsFilter`, `AnalyticsSnapshot`, loading/error states
- Application APIs: `loadAnalytics`, `refreshAnalytics`, `loadWorkoutHistory`, `loadBodyMeasurements`, `loadStrengthProgress`, `loadNutritionStatistics`, `loadRecoveryStatistics`, `loadGoalProgress`, `loadPersonalRecords`, `loadAnalyticsSnapshot`
- `ProgressAnalyticsViewModel` with subscriber pattern, loading/error/empty state
- Hooks: `useAnalytics`, `useWorkoutHistory`, `useStrengthProgress`, `useBodyMeasurements`, `useGoalProgress`, `useAnalyticsSnapshot`
- Components: header, summary, workout history, strength, body measurements, nutrition, recovery, goals, personal records, chart data, filter, skeleton, empty, error
- `ProgressAnalyticsScreen` presentation composition
- Mock `ProgressAnalyticsService` seam; Backend/Local stubs prepared
- Analytics Categories and Periods represent only; chart data models without chart libraries
- Navigation destinations prepared on models only
- No calculations, chart libraries, persistence, networking, backend, wearable APIs

Previous: **31.7 — Notification & Reminder Framework Foundation** (2026-07-29)

## Next Sprint

Continue Phase 31 Product Development. Candidate follow-ups: bridge Coach Timeline Framework providers to Workout / Nutrition / Recovery / Coach / Notification / Analytics / Profile / Sync sources; bridge Progress Analytics providers to Workout / Nutrition / Recovery Engines; wire wearables behind `ProgressAnalyticsService` without UI changes; bridge Coach Experience `local` provider to Coach Intelligence → Memory → Context; wire OpenAI / Azure / Anthropic behind `CoachExperienceService`; bridge `HomeService` / Workout Runtime / Profile / Notification providers to repository adapters; replace remaining Phase 30 mocks behind contracts (new ADR per provider); wire Notification Center to Expo Notifications / FCM / APNS providers.

---

## Overall Completion

| Phase | Weight | Completion |
|-------|--------|------------|
| 1 Foundation | 10% | 85% |
| 2 Authentication | 10% | 90% |
| 3 Workout Engine | 15% | 100% |
| 4 AI Coach | 25% | 95% |
| 5 Mobile App | 30% | 80% |
| 6 Production | 10% | 5% |

**Weighted overall: ~81%**
