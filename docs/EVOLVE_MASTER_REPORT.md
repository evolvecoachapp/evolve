# EVOLVE Master Report

**Project:** EVOLVE  
**Version:** 0.5.0  
**Status:** Living Document  
**Last Updated:** 2026-07-14  
**Purpose:** Authoritative narrative history and current-state summary. Update progress sections each sprint; do not rewrite history.  
**Source of Truth:** Yes — for project timeline and phase narrative (live status: [PROJECT_STATE.md](./PROJECT_STATE.md)).

Onboarding: [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md)
---

## Vision

See [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md#product-vision). EVOLVE is an **AI-first fitness coaching platform** — one continuous digital coach across training, nutrition, recovery, and progress.
---

## Mission

Deliver a coherent coaching experience backed by a solid, testable backend — growing the domain incrementally while enforcing Clean Architecture from day one.

---

## Product Goals

1. Ship a real backend foundation before product features depend on it.
2. Enforce Clean Architecture: thin routes → services → repositories → models; AI isolated in `app/ai/`.
3. Present **one Coach persona** while multiple specialized engines operate behind the scenes.
4. Grow incrementally: Users → Workouts → AI Coach → Mobile → Production.
5. Treat migrations, tests, CI/CD, and documentation as first-class deliverables.

---

## Technical Philosophy

| Principle | Application |
|-----------|-------------|
| Clean Architecture | Dependencies flow inward; routes never contain business logic |
| Type safety | Pydantic v2 (backend), TypeScript strict mode (mobile) |
| Testability | Services unit-tested with mocked repos; integration tests against real PostgreSQL |
| Swappable providers | LLM, BMR, and mobile service providers resolved via factory + env config |
| Incremental delivery | Each sprint ships a verifiable slice; scope splits when deliverables are independent |
| Documentation as code | Knowledge base updated every sprint; ADRs append-only |

---

## Architecture Overview

EVOLVE is a **monorepo** with two independently runnable projects:

```
EVOLVE/
├── backend/     FastAPI + SQLAlchemy 2.x + PostgreSQL + Alembic
├── app/         React Native + Expo (managed) + Expo Router + TypeScript
├── database/    Seed scripts
├── docs/        Project knowledge base (this folder)
└── docker-compose.yml   PostgreSQL 17 (local dev)
```

**Backend layers:** API → Services → Repositories → Models → PostgreSQL  
**AI layer:** CoachService → AIOrchestrator → Engines / LLMProvider → Services  
**Mobile layers:** Routes (thin) → Screens → Features (hooks + service factories + providers)

See [ARCHITECTURE.md](./ARCHITECTURE.md) for diagrams and pattern details.

---

## Timeline

| Period | Milestone |
|--------|-----------|
| Initial | Project structure, architecture reference, Cursor rules |
| Phase 1 | Database engine, config, Alembic, `.env.example` |
| Phase 2 | User model, JWT auth, register/login/refresh |
| Phase 3 | Exercise catalog, programs/workouts, workout logging, resolution engine |
| Phase 4 | AI orchestrator, nutrition/recovery engines, Coach API, progress/goals, real LLM |
| Phase 5 (in progress) | Expo mobile app, auth, design system, feature modules, UI polish |
| Phase 6 (planned) | Production infrastructure, CI/CD, monitoring, runbooks |

---

## Completed Phases

### Phase 1 — Foundation (~85%)

- SQLAlchemy 2.x engine, session factory, `get_db()` dependency
- Pydantic Settings configuration
- Alembic initialized and wired to settings
- Docker Compose with PostgreSQL 17
- API versioning under `/api/v1/`
- Architecture reference and project rules

**Remaining:** Backend Dockerfile in Compose, health/readiness endpoints, CI pipeline, root `README.md`

### Phase 2 — Authentication (~90%)

- `User` model with Argon2 password hashing
- JWT access (15 min) + refresh (7 days) tokens
- `AuthService`, `UserRepository`, `get_current_user`
- Endpoints: register, login, refresh, `GET /users/me`

**Remaining:** `PATCH /users/me`, role field (client/coach/admin), dedicated auth integration test file

### Phase 3 — Workout Engine (~95%)

- Exercise catalog (read-only API + seed data)
- Program, workout template, and assignment models
- Full workout logging lifecycle (start → log sets → finish/skip)
- Workout Resolution Engine with stored cursor (Decision 006)
- 8 Alembic migrations through recovery and progress tables

**Remaining:** HTTP APIs for program/workout authoring and assignment (service layer exists)

### Phase 4 — AI Coach (~95%)

- AI Orchestrator, Memory Engine, Conversation/ChatMessage persistence
- Nutrition Engine (rule-based BMR/TDEE/macros)
- Recovery Engine (readiness scoring from check-ins + training load)
- Coach API with Workout/Nutrition/Recovery engine adapters
- Progress Analyzer (hybrid stats + LLM narrative), Goals API
- OpenAI-compatible LLM provider with graceful degradation
- LLM-primary intent classification with keyword fallback

**Remaining:** `ProgressCoachEngine` binding to Coach, conversation list/title API, conversation summarization

### Phase 5 — Mobile App (~60%)

- Expo scaffold with JWT auth and secure token storage (Decision 026)
- Design system, 6-tab navigation, premium screen shells (Decision 027)
- Feature-module architecture with service factories and mock/backend/local providers
- Workout domain foundation (types, hooks, mock program data)
- UI polish sprint: dark mode, animations, hero components, settings screens

**Remaining:** Wire Coach, workout, nutrition, progress to backend APIs (Sprint 5.3+); push notifications; offline sync

### Phase 6 — Production (0%)

Not started. Planned: managed PostgreSQL, secrets management, full CI/CD, monitoring, rate limiting, runbooks.

---

## Current Progress

**Overall completion: ~68%**

| Area | Status |
|------|--------|
| Backend domain APIs | 49 implemented, 7 planned ([API_STATUS.md](./API_STATUS.md)) |
| AI Coach stack | Operational with mock or OpenAI-compatible LLM |
| Mobile UI | Premium shell with mock data |
| Mobile ↔ Backend integration | Auth only; feature providers are stubs |
| Production readiness | Not started |

**Last completed sprint:** DOC-1.1 — Documentation Finalization  
**Next sprint:** 5.3 — Core Screens API Integration (Coach, workout resolution, nutrition)

---

## Key Metrics

| Metric | Value |
|--------|-------|
| Alembic migrations | 8 |
| Backend services | 11 |
| Backend repositories | 12 |
| Backend unit test files | 18 |
| Backend integration test files | 10 |
| Mobile feature modules | 7 (coach, workout, nutrition, progress, home, dashboard, profile) |
| Architecture decisions (ADRs) | 27 |
| Documented API endpoints | 49 implemented · 7 planned ([API_STATUS.md](./API_STATUS.md)) |

---

## References

- [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md) — onboarding
- [PROJECT_STATE.md](./PROJECT_STATE.md) — current snapshot
- [TECH_STACK.md](./TECH_STACK.md) — stack versions
- [SPRINT_HISTORY.md](./SPRINT_HISTORY.md) — sprint-by-sprint detail
- [ROADMAP.md](./ROADMAP.md) — forward plan
- [DECISIONS.md](./DECISIONS.md) — ADR log
- [API_STATUS.md](./API_STATUS.md) — endpoint inventory
