# EVOLVE Technology Stack

**Project:** EVOLVE  
**Version:** 0.5.0  
**Status:** Living Document  
**Last Updated:** 2026-07-14  
**Purpose:** Complete inventory of technologies in use and planned.  
**Source of Truth:** Yes — for stack versions and tooling (verify `package.json` / `requirements.txt` when upgrading).

---

## Overview

| Layer | Primary choice |
|-------|----------------|
| Mobile | React Native + Expo (managed workflow) |
| API | FastAPI + Uvicorn |
| Database | PostgreSQL 17 |
| ORM | SQLAlchemy 2.x |
| Migrations | Alembic |
| AI | Custom orchestrator + OpenAI-compatible LLM SDK |
| Local dev DB | Docker Compose |

---

## Frontend (Mobile — `app/`)

| Category | Technology | Version |
|----------|------------|---------|
| Framework | Expo SDK | ~54.0.34 |
| UI runtime | React Native | 0.81.5 |
| UI library | React | 19.1.0 |
| Language | TypeScript | ~5.9.2 |
| Navigation | Expo Router | ~6.0.23 |
| Icons | @expo/vector-icons (Ionicons) | ^15.0.3 |
| Animation | react-native-reanimated | ~4.1.1 |
| Gestures | react-native-gesture-handler | ~2.28.0 |
| Safe area | react-native-safe-area-context | ~5.6.0 |
| Gradients | expo-linear-gradient | ~15.0.8 |
| Haptics | expo-haptics | ~15.0.8 |
| Secure storage | expo-secure-store | ~15.0.7 |
| Theme preference | @react-native-async-storage/async-storage | 2.2.0 |
| HTTP | Hand-written `fetch` wrapper | — |
| State | React Context (Auth, Theme) | — |
| Styling | StyleSheet + design tokens | — |
| Lint | ESLint (expo config) | — |
| Format | Prettier | — |

**Testing**

| Tool | Version |
|------|---------|
| Jest | (via jest-expo) |
| jest-expo | (devDependency) |
| @testing-library/react-native | (devDependency) |

Detail: [FRONTEND_STATUS.md](./FRONTEND_STATUS.md) · ADR-025, ADR-026, ADR-027

---

## Backend (`backend/`)

| Category | Technology | Version |
|----------|------------|---------|
| Language | Python | 3.x |
| Web framework | FastAPI | 0.116.1 |
| ASGI server | Uvicorn | 0.35.0 |
| Validation | Pydantic | 2.11.7 |
| Settings | pydantic-settings | 2.10.1 |
| ORM | SQLAlchemy | 2.0.43 |
| PostgreSQL driver | psycopg[binary] | 3.2.9 |
| Migrations | Alembic | 1.16.4 |
| Password hashing | pwdlib[argon2] | 0.3.0 |
| JWT | PyJWT | 2.13.0 |
| Email validation | email-validator | 2.3.0 |
| Env loading | python-dotenv | 1.1.1 |
| OpenAI SDK | openai | 2.45.0 |
| HTTP client (tests) | httpx | 0.28.1 |

Detail: [BACKEND_STATUS.md](./BACKEND_STATUS.md) · ADR-001, ADR-003

---

## Database

| Category | Technology | Notes |
|----------|------------|-------|
| Engine | PostgreSQL | 17 (Docker Compose image) |
| ORM | SQLAlchemy 2.x | Declarative `Mapped[]` style |
| Migrations | Alembic | 8 revisions applied |
| JSON fields | JSONB | Chat message metadata |
| Seeds | Python scripts | `database/seeds/` |

**Core tables:** users, exercises, muscle_groups, equipment, programs, workouts, workout_logs, meals, recovery_check_ins, conversations, chat_messages, goals, progress_entries

ADR-002, ADR-004

---

## AI

| Component | Implementation |
|-----------|----------------|
| Orchestrator | Custom `AIOrchestrator` (async) |
| Memory | `MemoryEngine` v1 + PostgreSQL |
| Intent | LLM-primary + keyword fallback |
| LLM abstraction | `LLMProvider` protocol |
| Mock LLM | `MockLLMProvider` (default) |
| Production LLM | `OpenAICompatibleLLMProvider` (any OpenAI-compatible API) |
| Workout (Coach) | `WorkoutCoachEngine` → `WorkoutResolutionService` |
| Nutrition | `NutritionEngine` (rule-based) + `NutritionCoachEngine` |
| Recovery | `RecoveryEngine` (rule-based) + `RecoveryCoachEngine` |
| Progress | `ProgressAnalyzer` (hybrid stats + LLM narrative) |
| BMR | `BMRStrategy` — Mifflin-St Jeor only |

**Config:** `AI_PROVIDER`, `AI_LLM_*`, `NUTRITION_*`, `RECOVERY_*`, `PROGRESS_*`

Detail: [AI_SYSTEM.md](./AI_SYSTEM.md) · ADRs 008–024

---

## Infrastructure

| Category | Status | Technology |
|----------|--------|------------|
| Local database | **Active** | Docker Compose → PostgreSQL 17 |
| Backend container | Planned | Dockerfile (referenced, not in repo) |
| Prod compose | Planned | `docker/docker-compose.prod.yml` |
| IaC | Planned | Terraform under `infrastructure/` |
| Secrets | Planned | Managed secrets (Phase 6) |
| CI/CD | **Not started** | GitHub Actions (planned) |

ADR-005

---

## Testing

| Layer | Runner | Scope |
|-------|--------|-------|
| Backend unit | pytest 9.1.1 | Services, engines, utils |
| Backend integration | pytest + real PostgreSQL | API lifecycles |
| Async tests | pytest-asyncio 1.4.0 | Orchestrator, LLM, progress |
| Mobile unit | Jest + jest-expo | Auth, API client, screens, features |
| Mocking | pytest-mock 3.15.1 | Backend unit isolation |

**Not configured:** CI pipeline, E2E mobile (Detox/Maestro), load testing

---

## Deployment (Planned — Phase 6)

| Target | Options under consideration |
|--------|----------------------------|
| API hosting | ECS, Cloud Run, Fly.io, Kubernetes |
| Database | Managed PostgreSQL (RDS, Cloud SQL, etc.) |
| Mobile | EAS Build + App Store / Play Store |
| Migrations | Automated Alembic on deploy |
| Monitoring | TBD — metrics, alerting, rate limiting |

Current state: local Uvicorn + Docker Postgres only. See [PROJECT_STATE.md](./PROJECT_STATE.md#deployment).

---

## Future Technologies

| Area | Candidate | Trigger |
|------|-----------|---------|
| Mobile offline | SQLite / WatermelonDB / custom sync queue | Sprint 5.4 |
| Push notifications | expo-notifications | Sprint 5.4 |
| Caching | Redis | Rate limiting / session cache at scale |
| Background jobs | Celery / ARQ / FastAPI BackgroundTasks | Heavy AI batch work |
| Wearables | HealthKit, Google Fit, Whoop API | Post-1.0 integration sprint |
| Food database | External nutrition API | When barcode/search is prioritized |
| Anthropic native SDK | Separate `LLMProvider` | If non-OpenAI-compatible API required |
| Web client | React / Next.js | If desktop coaching is prioritized |
| Coach roles | RBAC expansion | Multi-coach client management |

None of the above are committed until recorded in [DECISIONS.md](./DECISIONS.md).

---

## Repository Tooling

| Tool | Location |
|------|----------|
| Cursor rules | `.cursor/rules/` (evolve.mdc, architect.mdc, reviewer.mdc) |
| Architecture deep-dive | `.cursor/rules/EVOLVE_ARCHITECTURE.md` |
| Env templates | `.env.example`, `app/.env.example`, `backend/.env` (local, gitignored) |
