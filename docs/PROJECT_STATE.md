# EVOLVE Project State

**Project:** EVOLVE  
**Version:** 0.5.0  
**Status:** Living Document  
**Last Updated:** 2026-07-14  
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
| Feature modules | coach, workout, nutrition, progress, home, dashboard, profile, shared |
| Data layer | Service factory pattern; **defaults to mock providers** |
| Backend providers | All `Backend*Service` classes throw `notConfigured()` |
| Tests | Jest + jest-expo (~15 test files) |
| Sprint status | UI foundation and polish complete; API wiring pending |

---

## Backend

| Item | State |
|------|-------|
| Stack | FastAPI 0.116, SQLAlchemy 2.0, Pydantic 2.11, Uvicorn |
| Architecture | Clean Architecture enforced — routes thin, logic in services |
| Domains live | Auth, users, exercises, catalog, workout logs, workout resolution, nutrition, recovery, coach, goals, progress |
| API endpoints | **49 implemented**, **7 planned** ([API_STATUS.md](./API_STATUS.md)) |
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
| Migrations | 8 Alembic versions applied |
| Tables | users, exercises, muscle_groups, equipment, programs, workouts, workout_logs, meals, recovery_check_ins, conversations, chat_messages, goals, progress_entries |
| Seeds | Exercise catalog via `database/seeds/seed_exercises.py` |

---

## Authentication

| Layer | State |
|-------|-------|
| Backend | JWT (HS256), Argon2 passwords, stateless sessions |
| Endpoints | `POST /auth/register`, `/login`, `/refresh`; `GET /users/me` |
| Mobile | `expo-secure-store` for tokens; 401 → refresh → retry-once |
| Gaps | No profile update endpoint; no role enum (uses `is_superuser`) |

---

## Testing

| Layer | State |
|-------|-------|
| Backend unit | 18 files — services, engines, orchestrator, intent, LLM provider |
| Backend integration | 10 files — real PostgreSQL via pytest fixtures |
| Backend runner | pytest 9.1 + pytest-asyncio |
| Mobile | Jest + Testing Library — auth, API client, screens, feature architecture |
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
- Mobile backend providers not wired (Sprint 5.3)
- No program/workout management HTTP API
- No `PATCH /users/me`
- No CI pipeline or backend Docker service
- `docs/TASKS.md` Phase 1–2 checkboxes out of sync with code

---

## Last Completed Sprint

**DOC-1.1 — Documentation Finalization** (2026-07-14)

- Standardized all `docs/` headers, created PROJECT_CONTEXT and TECH_STACK
- Reconciled API endpoint counts; added Documentation Maintenance Policy

Previous: [DOC-1](./SPRINT_HISTORY.md#documentation) — initial knowledge base

---

## Next Sprint

**5.3 — Core Screens (API Integration)**

- Wire Coach chat → `/api/v1/coach/*`
- Wire workout screen → `/api/v1/workout-resolution/today`
- Wire nutrition screen → `/api/v1/nutrition/*`
- Implement `Backend*Service` provider classes

---

## Overall Completion

| Phase | Weight | Completion |
|-------|--------|------------|
| 1 Foundation | 10% | 85% |
| 2 Authentication | 10% | 90% |
| 3 Workout Engine | 15% | 95% |
| 4 AI Coach | 25% | 95% |
| 5 Mobile App | 30% | 60% |
| 6 Production | 10% | 0% |

**Weighted overall: ~68%**
