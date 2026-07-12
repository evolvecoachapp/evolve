# EVOLVE Tasks

> Actionable checklist derived from [`ROADMAP.md`](./ROADMAP.md). Tasks are ordered by priority within each sprint. Check items off as they are completed; do not reorder completed items.

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

### Sprint 4.1 — Orchestrator & Memory

- [ ] Create `Chat` model and migration
- [ ] Implement `ChatRepository`
- [ ] Implement AI Orchestrator skeleton (intent routing stub)
- [ ] Implement Memory Engine v1 (read/write conversation context)

### Sprint 4.2 — Nutrition & Recovery

- [ ] Create `Meal` model and migration
- [ ] Implement `MealRepository`, `NutritionService`
- [ ] Implement Nutrition Engine
- [ ] Implement Recovery Engine (readiness scoring)

### Sprint 4.3 — Progress & Coach Endpoint

- [ ] Create `Goal` and `Progress` models and migrations
- [ ] Implement `GoalRepository`, `ProgressRepository`
- [ ] Implement Progress Analyzer
- [ ] Implement `CoachService` (context assembly + response synthesis)
- [ ] Implement `/api/v1/coach` conversational endpoint
- [ ] Write AI engine integration tests

---

## Phase 5 — Mobile App

### Sprint 5.1 — Scaffold & Auth

- [ ] Set up mobile project scaffold
- [ ] Implement API client with JWT auth flow
- [ ] Implement onboarding screens

### Sprint 5.2 — Core Screens

- [ ] Implement Coach chat screen
- [ ] Implement today's workout screen
- [ ] Implement meal plan screen

### Sprint 5.3 — Progress & Offline

- [ ] Implement progress dashboard screen
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
