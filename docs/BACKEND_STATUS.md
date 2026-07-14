# EVOLVE Backend Status

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-14  
**Purpose:** Backend modules, services, repositories, models, and remaining work.  
**Source of Truth:** Yes — for backend layer status (endpoints: [API_STATUS.md](./API_STATUS.md) — 50 implemented, 6 planned).
---

## Stack

| Component | Version |
|-----------|---------|
| FastAPI | 0.116.1 |
| Uvicorn | 0.35.0 |
| SQLAlchemy | 2.0.43 |
| Pydantic | 2.11.7 |
| psycopg | 3.2.9 |
| Alembic | 1.16.4 |
| PyJWT | 2.13.0 |
| pwdlib[argon2] | 0.3.0 |
| openai SDK | 2.45.0 |
| pytest | 9.1.1 |

---

## Implemented Modules

### API Routes (`backend/app/api/v1/`)

| Router | Prefix | Endpoints |
|--------|--------|-----------|
| auth | `/auth` | register, login, refresh |
| users | `/users` | me (read, update) |
| exercises | `/exercises` | list, detail, substitutes |
| catalog | `/catalog` | muscle-groups, equipment |
| workout_logs | `/workout-logs` | full session lifecycle |
| workout_resolution | `/workout-resolution` | today, advance-rest-day |
| nutrition | `/nutrition` | meals, logs, targets |
| recovery | `/recovery` | check-ins, readiness |
| coach | `/coach` | messages, conversation history |
| goals | `/goals` | CRUD |
| progress | `/progress` | entries, AI summary |

### Services (`backend/app/services/`)

| Service | Responsibility | HTTP exposed |
|---------|----------------|--------------|
| `auth_service` | Register, login, refresh | Yes |
| `user_service` | Profile update | Yes |
| `workout_service` | Program/workout authoring, assignment | **No** |
| `workout_log_service` | Session start/finish/skip/log sets | Yes |
| `workout_resolution_service` | Today's workout resolution | Yes |
| `exercise_service` | Exercise catalog reads | Yes |
| `catalog_service` | Muscle groups, equipment | Yes |
| `nutrition_service` | Meal CRUD, logging, daily targets | Yes |
| `recovery_service` | Check-ins, readiness scoring | Yes |
| `coach_service` | Thin wrapper over Orchestrator | Yes |
| `goal_service` | Goal CRUD | Yes |
| `progress_service` | Progress entries + AI summary | Yes |

### Repositories (`backend/app/repositories/`)

| Repository | Aggregate |
|------------|-----------|
| `user_repository` | User |
| `exercise_repository` | Exercise, substitutions |
| `equipment_repository` | Equipment |
| `muscle_group_repository` | MuscleGroup |
| `program_repository` | Program, ProgramDay, ProgramAssignment |
| `workout_repository` | Workout, WorkoutExercise |
| `workout_log_repository` | WorkoutLog, exercises, sets |
| `meal_repository` | Meal, MealLog |
| `recovery_repository` | RecoveryCheckIn |
| `chat_repository` | Conversation, ChatMessage |
| `goal_repository` | Goal |
| `progress_repository` | ProgressEntry |

### Models (`backend/app/models/`)

| Model | Key entities |
|-------|--------------|
| `user.py` | User (profile, fitness fields, is_superuser) |
| `exercise.py` | Exercise, ExerciseSubstitution |
| `muscle_group.py`, `equipment.py` | Catalog metadata |
| `program.py` | Program, ProgramDay, ProgramAssignment (+ cursor) |
| `workout.py` | Workout template, WorkoutExercise |
| `workout_log.py` | WorkoutLog, WorkoutLogExercise, WorkoutSetLog |
| `meal.py` | Meal (nullable created_by, is_public), MealLog |
| `recovery.py` | RecoveryCheckIn |
| `chat.py` | Conversation, ChatMessage (JSONB metadata) |
| `goal.py` | Goal |
| `progress.py` | ProgressEntry |

---

## Database

### Migrations (8 applied)

| Revision | Tables created |
|----------|----------------|
| `5ccce88c59dd` | users |
| `55a562bc136f` | exercises, muscle_groups, equipment, substitutions |
| `da4e0b180322` | programs, program_days, program_assignments, workouts, workout_exercises |
| `a2567ea29561` | workout_logs, workout_log_exercises, workout_set_logs |
| `84b668dd4276` | program assignment cursor columns |
| `bc3eb53f0581` | conversations, chat_messages |
| `b92f14d464ca` | meals, meal_logs |
| `699e9e7afa70` | recovery_check_ins |
| `a4facc05013e` | goals, progress_entries |

### Seed Data
- `database/seeds/seed_exercises.py` — idempotent exercise catalog

---

## Authentication

| Component | Implementation |
|-----------|----------------|
| Password hashing | Argon2 via pwdlib |
| Tokens | JWT HS256 — access 15 min, refresh 7 days |
| Dependency | `get_current_user` in `security/dependencies.py` |
| Session model | Stateless (no server-side sessions) |

**Gaps:** No role enum (uses `is_superuser`); no `display_name`, `bio`, or avatar fields on `UserUpdate`

---

## AI Layer (`backend/app/ai/`)

| Module | Status |
|--------|--------|
| `orchestrator.py` | Complete |
| `memory_engine.py` | Complete (summarization deferred) |
| `intent.py` | LLM-primary + keyword fallback |
| `llm_provider.py` | Mock + OpenAI-compatible |
| `coach_engines.py` | Workout, Nutrition, Recovery adapters |
| `nutrition_engine.py` | Rule-based (no LLM) |
| `recovery_engine.py` | Rule-based (no LLM) |
| `progress_analyzer.py` | Hybrid stats + LLM narrative |
| `bmr_strategies.py` | Mifflin-St Jeor only |

---

## Missing Endpoints

| Domain | Service exists | HTTP API |
|--------|----------------|----------|
| Program CRUD | Yes (`WorkoutService`) | **Missing** |
| Workout template CRUD | Yes | **Missing** |
| Program assignment | Yes | **Missing** |
| Exercise writes (admin) | Yes (`ExerciseService`) | **Missing** (read-only by design) |
| User profile update | Yes (`UserService`) | **Live** — `PATCH /users/me` (Sprint 6.0); consumed by mobile edit UI (Sprint 6.1) |
| Health/readiness probe | — | **Missing** (`GET /health`) |
| Conversation list/title | Yes (`ChatRepository`) | **Missing** |

---

## Remaining Work

| Item | Phase/Sprint |
|------|--------------|
| Program/workout management HTTP API | TBD |
| Role field on user model | 2.3 completion |
| `display_name`, `bio`, avatar upload on user profile | Future sprint |
| Dedicated auth integration tests | 2.3 |
| Health endpoint with DB connectivity check | 1.3 |
| Backend Dockerfile + Compose service | 1.2 / 6.1 |
| CI pipeline (lint, test, typecheck) | 6.2 |
| `ProgressCoachEngine` for Coach routing | TBD |
| Conversation summarization in MemoryEngine | TBD |
| Rate limiting on auth and Coach endpoints | 6.3 |
| Retry/backoff for LLM calls | TBD |

---

## Testing

| Type | Count | Location |
|------|-------|----------|
| Unit tests | 18 files | `backend/tests/unit/` |
| Integration tests | 10 files | `backend/tests/integration/` |
| Fixtures | Shared | `backend/tests/conftest.py` |

**Coverage areas:** auth (indirect), workout logs/resolution, nutrition, recovery, coach, chat, goals, progress, orchestrator, engines, LLM, intent

Run: `pytest` from `backend/` (requires PostgreSQL)

---

## Configuration

Key environment variables (see `.env.example`):

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection |
| `JWT_SECRET_KEY` | Token signing |
| `AI_PROVIDER` | mock \| openai_compatible |
| `AI_LLM_*` | LLM endpoint, key, model, timeout |
| `NUTRITION_*` | BMR formula, deficit/surplus, floors |
| `RECOVERY_*` | Training load window, scoring weights |
| `PROGRESS_*` | Trend/plateau thresholds |
