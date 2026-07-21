# EVOLVE Project State

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-21  
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
| Feature modules | coach, workout, nutrition, progress, analytics, home, dashboard, profile, shared |
| Data layer | Service factory pattern; user/workout backend providers; on-device workout history via `WorkoutHistoryRepository` + `StorageAdapter` (Sprint 13.0); analytics via `WorkoutAnalyticsRepository` (Sprint 14.0) |
| Backend providers | `BackendUserService`, `BackendWorkoutService` live; other `Backend*Service` classes throw `notConfigured()` |
| Tests | Jest + jest-expo |
| Sprint status | History + detail shipped (13.1–13.2); workout analytics foundation (14.0) — domain/hook only, no charts UI |

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
| Mobile | Jest + Testing Library (23 files) — auth, API client, screens, feature architecture, Workout backend service/adapters |
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

---

## Last Completed Sprint

**14.0.0 — Workout Analytics Foundation** (2026-07-21)

- `features/analytics` computes totals, exercise stats, weekly volume, and trend series from `WorkoutHistoryRepository`
- `useWorkoutAnalytics` → application → `WorkoutAnalyticsRepository` (history-backed); no screens or charts

Previous: **13.2.0 — Workout Detail Experience**, **13.1.0 — Workout History Timeline**, **13.0.0 — Workout History Persistence Foundation** (2026-07-21)

---

## Next Sprint

**Progress charts / analytics UI (TBD)** — wire analytics domain into Progress surfaces; still no AI.

---

## Overall Completion

| Phase | Weight | Completion |
|-------|--------|------------|
| 1 Foundation | 10% | 85% |
| 2 Authentication | 10% | 90% |
| 3 Workout Engine | 15% | 100% |
| 4 AI Coach | 25% | 95% |
| 5 Mobile App | 30% | 72% |
| 6 Production | 10% | 0% |

**Weighted overall: ~78%**
