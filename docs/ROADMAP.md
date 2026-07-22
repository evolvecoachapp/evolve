# EVOLVE Roadmap

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-22  
**Purpose:** Engineering roadmap with phase and sprint granularity, completion status, and forward plan.  
**Source of Truth:** Yes — for phase milestones and sprint sequencing.

Product vision and users: [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md). Phase architecture detail: [`EVOLVE_ARCHITECTURE.md`](../.cursor/rules/EVOLVE_ARCHITECTURE.md).

---

## Phase Completion Status

| Phase | Name | Status | Completion |
|-------|------|--------|------------|
| 1 | Foundation | In progress | ~85% |
| 2 | Authentication | In progress | ~90% |
| 3 | Workout Engine | **Complete** | ~95% |
| 4 | AI Coach | **Complete** | ~95% |
| 5 | Mobile App | In progress | ~60% |
| 6 | Production | Not started | 0% |

### Sprint Checklist (High Level)

| Sprint | Status |
|--------|--------|
| 1.1 Database & Config | Done |
| 1.2 Alembic & Docker | Partial (DB only) |
| 1.3 API Skeleton & CI | Partial |
| 2.1 User Model | Done |
| 2.2 Auth Core | Done |
| 2.3 Profile & Hardening | Partial |
| 3.1 Exercise Catalog | Done |
| 3.2 Programs & Workouts | Done |
| 3.3 Workout Logging | Done |
| 4.1 Workout Resolution | Done |
| 4.2 AI Orchestrator | Done |
| 4.3 Nutrition Engine | Done |
| 4.4 Recovery Engine | Done |
| 4.5 Coach Service | Done |
| 4.6 Progress & Real LLM | Done |
| 5.1 Mobile Scaffold & Auth | Done |
| 5.2 UI Foundation | Done |
| 5.6 UI Polish | Done |
| 5.3 API Integration | **Next** |
| 5.4 Progress & Offline | Pending |
| 6.1–6.3 Production | Pending |
| DOC-1 Knowledge Base | Done |
| DOC-1.1 Documentation Finalization | Done |
| 17.0 Workout Blueprint Generator | Done |
| 17.1 Exercise Knowledge Base | Done |
| 17.2 Exercise Selection Engine | Done |
| 17.3 Programming Engine | Done |
| 17.4 Progression Engine | Done |
| 17.5 Fatigue & Recovery Engine | Done |
| 17.6 Workout Assembly | Done |
| 17.7 Program Generation | Done |
| 17.8 Integration Framework Foundation | Done |

---

## Vision

See [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md#product-vision) for full product vision, target users, and competitive positioning.

EVOLVE is an **AI-first fitness coaching platform** — one continuous digital coach for training, nutrition, recovery, and progress.

---

## Project Goals

1. **Ship a real backend foundation first.** No AI or product feature is built on unstable infrastructure — database, migrations, and configuration must be solid before anything else.
2. **Enforce Clean Architecture from day one.** Routes stay thin, services own logic, repositories own persistence, AI stays isolated. This is non-negotiable per `evolve.mdc`.
3. **Deliver one coherent Coach experience**, never a collection of disconnected tools, even though multiple AI engines operate behind the scenes.
4. **Grow the domain model incrementally.** Users → Workouts → AI Coach → Mobile → Production, each phase building on a verified previous phase.
5. **Keep the system operable.** Migrations, tests, CI/CD, and documentation are treated as first-class deliverables, not afterthoughts.

---

## Development Phases

### Phase 1 — Foundation

**Objective:** A runnable, well-structured backend with real database connectivity.

- Database engine, session factory, and `get_db()` dependency
- Environment-based configuration (Pydantic Settings)
- Alembic initialized and fully configured
- Docker Compose with PostgreSQL (and later, backend service)
- Populated `.env.example` and project documentation
- API versioning structure (`/api/v1/`)
- Basic CI pipeline (lint + test skeleton)

**Exit criteria:** A developer can clone the repo, start the stack, and connect to a healthy, migration-managed database.

---

### Phase 2 — Authentication

**Objective:** Secure user accounts and API access.

- Finalized `User` model with hashed passwords
- `security/` module — JWT creation/validation, password hashing
- `AuthService`, `UserService`, `UserRepository`
- Registration, login, refresh token, and profile endpoints
- Auth integration tests

**Exit criteria:** Users can register, log in, receive JWT tokens, and access protected endpoints.

---

### Phase 3 — Workout Engine

**Objective:** Core fitness domain, without full AI coaching.

- `Exercise`, `Program`, `Workout` models and migrations
- Exercise catalog and program management (repositories + services)
- CRUD APIs for exercises, programs, and workout logging
- Seed data for common exercises
- Rule-based/template-driven Workout Engine (pre-AI)

**Exit criteria:** A user can browse exercises, receive a program, log workouts, and view session history.

---

### Phase 4 — AI Coach

**Objective:** The unified Coach experience and the remaining AI engines.

- AI Orchestrator
- Memory Engine and `Conversation`/`ChatMessage` persistence
- Nutrition Engine and `Meal` domain
- Recovery Engine (readiness inputs and recommendations)
- Progress Analyzer and `Progress` / `Goal` domains
- `CoachService` and `/api/v1/coach` conversational endpoint

**Exit criteria:** A user can chat with the Coach and receive adaptive workout, nutrition, and progress guidance through one interface.

---

### Phase 5 — Mobile App

**Objective:** A native mobile client for daily coaching interaction.

- Mobile project scaffold (`app/ios`, `app/android`, or cross-platform)
- API client with JWT auth flow
- Core screens: onboarding, Coach chat, today's workout, meal plan, progress dashboard
- Push notifications and offline-friendly workout logging

**Exit criteria:** Users can complete the full daily coaching loop on mobile without a desktop browser.

---

### Phase 6 — Production

**Objective:** Harden the platform for real-world traffic and operations.

- Managed PostgreSQL, secrets management, environment separation
- Full CI/CD: test, build, migrate, deploy on merge to `main`
- Monitoring, alerting, rate limiting, backups, load testing
- Operational runbooks

**Exit criteria:** EVOLVE runs reliably in production with automated deployments and a documented operational playbook.

---

## Sprint Roadmap

Each phase is broken into 1–3 sprints. Sprint length is indicative (assume 1–2 week sprints); adjust to actual team velocity.

### Phase 1 — Foundation

| Sprint | Focus |
|--------|-------|
| 1.1 | Database engine, session, config, `.env.example` |
| 1.2 | Alembic configuration, Docker Compose backend service, Dockerfile |
| 1.3 | API versioning skeleton, health/readiness endpoints, CI lint/test skeleton |

### Phase 2 — Authentication

| Sprint | Focus |
|--------|-------|
| 2.1 | `User` model, first Alembic migration, password hashing |
| 2.2 | JWT issuing/validation, `AuthService`, register/login endpoints |
| 2.3 | Refresh tokens, profile endpoints, auth integration tests |

### Phase 3 — Workout Engine

| Sprint | Focus |
|--------|-------|
| 3.1 | `Exercise` model, migration, catalog API, seed data |
| 3.2 | `Program` and `Workout` models, migrations, assignment flow |
| 3.3 | Workout logging API, session history, rule-based Workout Engine |

### Phase 4 — AI Coach

| Sprint | Focus |
|--------|-------|
| 4.1 | ~~AI Orchestrator skeleton, `Chat` model, Memory Engine v1~~ — actually delivered the (non-AI) Workout Resolution Engine, closing out Phase 3 Sprint 3.3's outstanding rule-based Workout Engine deliverable instead. Its originally planned scope moved to 4.2. |
| 4.2 | AI Orchestrator, `Conversation`/`ChatMessage` models, Memory Engine v1 (provider-agnostic `LLMProvider` abstraction, mock-only; async boundary scoped to the Orchestrator/LLM call path — see Decisions 007–009) |
| 4.3 | Nutrition Engine, `Meal`/`MealLog` domain — rule-based, decoupled from the Orchestrator (see Decisions 010–013). Originally scoped together with Recovery Engine; split into its own sprint, moving Recovery Engine to 4.4 below. |
| 4.4 | Recovery Engine (readiness inputs and recommendations) — split out of the original combined 4.3 scope |
| 4.5 | `CoachService`, `/api/v1/coach` endpoint, Workout/Nutrition/Recovery engine adapters wired into `AIOrchestrator` (mock LLM provider only) — split from the originally combined 4.5 scope, moving Progress/Goal and real LLM integration to 4.6 below (see Decisions 017–019) |
| 4.6 | Progress Analyzer (hybrid deterministic stats + LLM narrative), `Goal`/`Progress` domains and REST API, real generic OpenAI-compatible LLM vendor integration (deferred from Decision 008), LLM-primary/keyword-fallback intent classification — split out of the original combined 4.5 scope (see Decisions 020–024) |

### Phase 5 — Mobile App

| Sprint | Focus |
|--------|-------|
| 5.1 | Mobile scaffold, API client, auth flow — delivered as a React Native + Expo (managed workflow) project with Expo Router, a typed `fetch`-based API client (JWT login/register/refresh, secure-store token persistence), and Welcome/Login/Register/placeholder-Home screens (see Decisions 025/026). Full profile-completion onboarding (height/weight/activity/goal) is deferred to whichever later mobile sprint first needs those fields. |
| 5.2 | UI foundation & navigation — design system (`src/theme/`), shared components, 6-tab bottom navigation, production-ready screen shells with mocked data (Dashboard, Workout, Nutrition, Coach, Progress, Profile). Delivers a navigable, premium-feeling app shell; API integration follows in 5.3 (see Decision 027). |
| 5.3 | API-connected Coach chat, workout, and meal plan screens (replaces mock data with backend calls) |
| 5.4 | Progress dashboard with real data, push notifications, offline sync |

### Phase 6 — Production

| Sprint | Focus |
|--------|-------|
| 6.1 | Managed PostgreSQL, secrets management, environment separation |
| 6.2 | Full CI/CD pipeline, automated migrations on deploy |
| 6.3 | Monitoring, alerting, backups, load testing, runbooks |

### Phase 17 — AI Workout Pipeline (Mobile Application Layer)

Deterministic training intelligence under `app/src/features/`. Not backend HTTP APIs. Pipeline:

`Conversation → Workflow → Program Generation Orchestrator → Blueprint → Knowledge → Selection → Programming → Progression → Adaptation → Assembly`

| Sprint | Focus | Status |
|--------|-------|--------|
| 17.0 | Workout Blueprint Generator — session structure (what to build), not exercises/sets | **Done** |
| 17.1 | Exercise Knowledge Base — read-only `ExerciseDefinition` metadata + relationship graph | **Done** |
| 17.2 | Exercise Selection Engine — deterministic candidates from blueprint + knowledge | **Done** |
| 17.3 | Programming Engine — immutable `ExercisePrescription` (volume/intensity/rest/tempo/order) | **Done** |
| 17.4 | Progression Engine — multi-week prescription evolution timeline | **Done** |
| 17.5 | Training Adaptation Engine — readiness assessment + adaptation recommendations | **Done** |
| 17.6 | Workout Assembly — assemble complete executable workouts | **Done** |
| 17.7 | Program Generation Orchestrator — single entry point coordinating the pipeline | **Done** |

**Out of scope until later sprints:** UI for generated workouts, PostgreSQL persistence for these domains, LLM inside Selection/Programming.

---

*This roadmap is a living document. Update it as phases complete or priorities shift. See [`TASKS.md`](./TASKS.md) for the actionable checklist per sprint.*
