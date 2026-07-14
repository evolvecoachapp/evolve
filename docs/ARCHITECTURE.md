# EVOLVE Architecture

**Project:** EVOLVE  
**Version:** 0.5.0  
**Status:** Living Document  
**Last Updated:** 2026-07-14  
**Purpose:** Concise system architecture — layers, patterns, dependency flow.  
**Source of Truth:** Partial — summary only; deep reference is [EVOLVE_ARCHITECTURE.md](../.cursor/rules/EVOLVE_ARCHITECTURE.md).

See [TECH_STACK.md](./TECH_STACK.md) for versions. Onboarding: [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md).

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        MOBILE CLIENT (app/)                      │
│  Expo Router → Screens → Features → Service Factory → Provider  │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS + JWT
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND API (backend/)                      │
│         FastAPI Routes → Services → Repositories → Models         │
│                              │                                   │
│                    CoachService → AIOrchestrator                   │
│                              │                                   │
│                    AI Engines → Services (read)                  │
└────────────────────────────┬────────────────────────────────────┘
                             │ SQL
                             ▼
                      ┌──────────────┐
                      │  PostgreSQL  │
                      └──────────────┘
```

---

## Backend Architecture

### Layer Diagram

```
  HTTP Request
       │
       ▼
┌──────────────┐
│  api/v1/     │  Thin routes — validate, delegate, serialize
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  schemas/    │  Pydantic request/response contracts
└──────┬───────┘
       │
       ▼
┌──────────────┐     ┌──────────────┐
│  services/   │────▶│  ai/         │  Orchestrator, engines, LLM
└──────┬───────┘     └──────────────┘
       │
       ▼
┌──────────────┐
│ repositories/│  All SQLAlchemy queries
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   models/    │  SQLAlchemy 2.x ORM
└──────┬───────┘
       │
       ▼
   PostgreSQL
```

### Cross-Cutting

| Module | Role |
|--------|------|
| `core/config.py` | Pydantic Settings from environment |
| `core/dependencies.py` | FastAPI DI wiring for services |
| `security/` | JWT, Argon2 hashing, `get_current_user` |
| `db/` | Engine, session factory, Alembic base |

---

## Frontend Architecture

### Layer Diagram

```
  User tap
       │
       ▼
┌──────────────┐
│  app/ routes │  Expo Router — thin, mount screen only
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  screens/    │  Screen composition and layout
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  features/   │  Domain modules (coach, workout, nutrition, …)
│  ├─ hooks/   │  Data fetching and state
│  ├─ services/│  Factory + default service
│  └─ providers│  mock | backend | local implementations
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  api/        │  Typed fetch client (JWT, 401 refresh)
└──────────────┘
```

### Shared Infrastructure

| Module | Role |
|--------|------|
| `auth/` | `AuthContext`, secure token storage |
| `theme/` | Design tokens, `ThemeContext` (light/dark/system) |
| `components/` | Reusable UI primitives |
| `types/` | TypeScript mirrors of backend schemas |

---

## Provider Pattern (Mobile)

Each feature domain exposes a **service interface** with multiple **provider implementations**:

```
                    createXService()
                          │
              ┌───────────┼───────────┐
              ▼           ▼           ▼
           mock        backend       local
         (default)     (API stub)   (device-only)
```

**Environment resolution:** `EXPO_PUBLIC_{DOMAIN}_PROVIDER` env var selects provider; unknown values fall back to `mock`.

**Purpose:** Swap data sources without changing screens or hooks — enables mock-first development and incremental backend wiring (ADR rationale: mock → backend replacement without UI changes).

**Domains using this pattern:** coach, workout, nutrition, progress, home

---

## Factory Pattern (Mobile)

Each feature has a `*ServiceFactory.ts`:

```typescript
const PROVIDERS = { mock, backend, local };
export function createWorkoutService(providerId?) → WorkoutService
export function resolveWorkoutProviderId() → from env
```

Screens and hooks call `createWorkoutService()` — never instantiate providers directly.

---

## Repository Pattern (Backend)

Repositories encapsulate **all database access** for one aggregate:

```
Service.method()
      │
      ▼
Repository.query(session) → Model instance(s)
```

**Rules:**
- One repository per aggregate root (e.g., `ChatRepository` owns Conversation + ChatMessage)
- No SQL in services or routes
- Repositories accept `Session`; return models or domain structures

---

## Service Layer (Backend)

Services own **business logic and orchestration**:

```
Route → Service.method(user, dto) → Repository(es) + optional AI Engine
```

**Examples:**
- `WorkoutLogService` — session lifecycle, delegates cursor advance to `WorkoutResolutionService`
- `NutritionService` — meal CRUD, calls `NutritionEngine` for targets
- `CoachService` — ownership check, delegates to `AIOrchestrator`

Services are unit-tested with mocked repositories.

---

## Shared Domain

Backend Pydantic schemas define the **API contract**. Mobile TypeScript types in `app/src/types/` and feature models mirror these shapes.

```
Backend schemas/  ←── contract ──→  Mobile types/ + features/*/models/
```

Shared concepts: User, Exercise, WorkoutLog, Meal, CoachMessage, ProgressEntry, Goal

Domain logic stays server-side; mobile providers adapt API responses to feature models via adapter utilities (e.g., `workoutAdapters.ts`, `nutritionAdapters.ts`).

---

## Dependency Flow

### Backend (inward only)

```
api → services → repositories → models
api → security (auth dependency)
services → ai (orchestrator, engines)
ai/coach_engines → services (read domain data)
```

**Forbidden:** repositories → services, models → services, ai → api

### Mobile

```
routes → screens → hooks → service factory → provider → api client
auth context ← screens (session state)
theme context ← screens (styling)
```

**Forbidden:** providers → screens directly, api client → screens directly

---

## AI Subsystem (Summary)

See [AI_SYSTEM.md](./AI_SYSTEM.md) for full detail.

```
User message
     │
     ▼
CoachService (ownership check)
     │
     ▼
AIOrchestrator.process_message (async)
     ├─ MemoryEngine (context)
     ├─ classify_intent (LLM + keyword fallback)
     ├─ Route to CoachEngine adapter OR LLM fallback
     └─ Persist turns via ChatRepository
```

---

## Key Architecture Decisions

| ADR | Topic |
|-----|-------|
| 001 | FastAPI |
| 002 | PostgreSQL |
| 003 | SQLAlchemy 2.x |
| 006 | Stored cursor for program progress |
| 008 | LLMProvider abstraction |
| 017 | Coach engine adapters |
| 025 | React Native + Expo |
| 027 | Mock-first mobile shells |

Full list: [DECISIONS.md](./DECISIONS.md)
