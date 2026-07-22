# EVOLVE Project State

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-23  
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
| Feature modules | coach, workout, nutrition, progress, analytics, home, dashboard, profile, shared; plus AI/training domains below |
| Data layer | Service factory pattern; Composition Root DI for Training Intelligence pipeline (`core/composition`, Sprint 17.9); Decision Intelligence explanations (`core/decision-intelligence`, Sprint 17.10); Workout Runtime execution state (`features/workout-runtime`, Sprint 18.0); Rest Runtime rest periods (`features/rest-runtime`, Sprint 18.1); Domain Events execution substrate (`core/domain-events`, Sprint 18.2); Performance Engine single-session snapshots (`features/performance-engine`, Sprint 18.3); Achievement Engine Personal Records (`features/achievement-engine`, Sprint 18.4); Athlete History immutable chronological record (`features/athlete-history`, Sprint 18.5); Recovery Intelligence deterministic recovery snapshots (`features/recovery-intelligence`, Sprint 18.6); Insight Engine deterministic domain insight snapshots (`features/insight-engine`, Sprint 18.7); Coach Intelligence immutable Coaching Context preparation (`features/coach-intelligence`, Sprint 18.8); user/workout backend providers; on-device workout history via `WorkoutHistoryRepository` + `StorageAdapter` (Sprint 13.0); analytics via `WorkoutAnalyticsRepository` (Sprint 14.0) |
| Backend providers | `BackendUserService`, `BackendWorkoutService` live; other `Backend*Service` classes throw `notConfigured()` |
| Tests | Jest + jest-expo |
| Sprint status | History + detail shipped (13.1–13.2); workout analytics foundation (14.0); AI workout pipeline foundations through Training Adaptation (17.1–17.5) |

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
| Workout Runtime | `features/workout-runtime` | Foundation complete (18.0) — live session execution state only |
| Rest Runtime | `features/rest-runtime` | Foundation complete (18.1) — deterministic rest periods (injected elapsed) |
| Domain Events | `core/domain-events` | Foundation complete (18.2) — immutable execution events + Event Stream only |
| Performance Engine | `features/performance-engine` | Foundation complete (18.3) — single-session Performance Snapshots only |
| Achievement Engine | `features/achievement-engine` | Foundation complete (18.4) — Personal Records only; future categories reserved |
| Athlete History | `features/athlete-history` | Foundation complete (18.5) — immutable chronological domain record only |
| Recovery Intelligence | `features/recovery-intelligence` | Foundation complete (18.6) — deterministic recovery snapshots only |
| Insight Engine | `features/insight-engine` | Foundation complete (18.7) — deterministic domain insight snapshots only |
| Coach Intelligence | `features/coach-intelligence` | Foundation complete (18.8) — immutable Coaching Context preparation only |

These domains are TypeScript application modules with in-memory repositories. They are **not** backend HTTP APIs and do **not** write to PostgreSQL. The integration framework exercises the full pipeline without modifying engine behavior. Pipeline services are composed through `core/composition`. Decision Intelligence explains pipeline decisions without changing engine behavior. Workout Runtime consumes immutable `WorkoutSession` outputs without modifying Program Generation. Rest Runtime manages rest periods with injected elapsed time and may be owned by Workout Runtime. Domain Events record immutable lifecycle events from Workout/Rest Runtime into an ordered in-memory Event Stream for future subscribers. Performance Engine analyzes completed `WorkoutResult` + `EventStream` into immutable single-session snapshots without mutating execution or program generation. Achievement Engine detects Personal Records from Performance Snapshots via injected baselines without owning history, persistence, or gamification. Athlete History organizes immutable chronological domain facts from workout/performance/achievement outputs without persistence, AI, networking, storage, querying, or timeline UI. Recovery Intelligence derives deterministic recovery metrics/snapshots from Athlete History + Performance Snapshot without AI, recommendations, persistence, networking, predictions, sleep, or wearables. Insight Engine aggregates deterministic domain facts from Performance, Achievement, Recovery, and Athlete History into immutable Insight Snapshots without AI, recommendations, persistence, networking, prompts, LLM, or conversation. Coach Intelligence prepares immutable Coaching Context from Insight Snapshot (optionally referencing Recovery, History, Performance, Achievement) without AI, prompts, LLM providers, networking, HTTP, persistence, or conversation.

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

**17.6.0 — Workout Assembly Engine Foundation** (2026-07-22)

- `features/workout-assembly` assembles immutable `WorkoutSession` from Blueprint + Selection + Programming + Progression + Adaptation
- Resolves adaptation recommendations, builds blocks/execution order/summary; in-memory cache; application use-cases
- Unit tests across engine/validators/utils/application/repository/service — no strategy, programming, progression, readiness, execution state, timers, analytics, UI, or networking

Previous: **17.5.0 — Training Adaptation Engine Foundation**, **17.4.0 — Progression Engine Foundation**, **17.3.0 — Programming Engine Foundation**, **17.2.0 — Exercise Selection Engine Foundation**, **17.1.0 — Exercise Knowledge Base Foundation**, **17.0.0 — Workout Blueprint Generator Foundation**

---

## Next Sprint

**17.7.0 — Program Generation Orchestrator** — single public entry point coordinating Blueprint→…→Assembly; immutable `WorkoutGenerationResult` with pipeline summary/trace.

---

## Overall Completion

| Phase | Weight | Completion |
|-------|--------|------------|
| 1 Foundation | 10% | 85% |
| 2 Authentication | 10% | 90% |
| 3 Workout Engine | 15% | 100% |
| 4 AI Coach | 25% | 95% |
| 5 Mobile App | 30% | 74% |
| 6 Production | 10% | 0% |

**Weighted overall: ~79%**
