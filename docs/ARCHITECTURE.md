# EVOLVE Architecture

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-22  
**Purpose:** Concise system architecture — layers, patterns, dependency flow.  
**Source of Truth:** Partial — summary only; deep reference is [EVOLVE_ARCHITECTURE.md](../.cursor/rules/EVOLVE_ARCHITECTURE.md).

See [TECH_STACK.md](./TECH_STACK.md) for versions. Onboarding: [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md).

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        MOBILE CLIENT (app/)                      │
│  Expo Router → Screens → Features → Service Factory → Provider  │
│                                                                 │
│  AI runtime (application layer, in-memory):                     │
│  Conversation → Workflow → Blueprint → Knowledge → Selection    │
│  → Programming → Progression  (Recovery / Assembly — planned)   │
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

## AI Workout Pipeline (Mobile Application Layer)

Deterministic training intelligence domains live under `app/src/features/`. They are **not** HTTP APIs and do **not** persist to PostgreSQL.

```
Coach
  ↓
Conversation Engine
  ↓
Workflow Engine
  ↓
Workout Blueprint Generator
  ↓
Exercise Knowledge Base          ← Sprint 17.1 (implemented)
  ↓
Exercise Selection Engine        ← Sprint 17.2 (implemented)
  ↓
Programming Engine               ← Sprint 17.3 (implemented)
  ↓
Progression Engine               ← Sprint 17.4 (implemented)
  ↓
Fatigue & Recovery               ← planned (Sprint 17.5)
  ↓
Workout Assembly                 ← planned (Sprint 17.6)
  ↓
Program Generation               ← planned (Sprint 17.7)
```

Full runtime detail: [AI_SYSTEM.md](./AI_SYSTEM.md).

### Exercise Knowledge Base (`features/exercise-kb`)

| Aspect | Implementation |
|--------|----------------|
| **Purpose** | Read-only structured knowledge about exercises for selection and future AI workflows |
| **Responsibilities** | Define, validate, query, and resolve relationships for immutable `ExerciseDefinition` entries |
| **Models** | `ExerciseDefinition`, difficulty/category/muscles/equipment, `ExerciseRelationship`, constraints, tags, metadata, result/error types |
| **Repository** | `ExerciseKnowledgeRepository` + `InMemoryExerciseKnowledgeRepository` (no durable storage) |
| **Service** | `ExerciseKnowledgeService` — search, relationship resolution, alternatives/progressions/regressions |
| **Validators** | Definition, constraints, relationships, metadata |
| **Utilities** | Freeze/normalize, complexity & equipment scores, alternative ranking |
| **Application** | `queryExerciseKnowledge`, `searchExercises`, `findAlternativeExercises`, `findProgressions`, `findRegressions` |
| **Catalog** | Illustrative in-memory catalog (~25 exercises) for tests/local orchestration |
| **Relationship graph** | Directed edges: `alternative`, `progression`, `regression`, `variation`, `related` |
| **Immutability** | Definitions frozen via `freezeExerciseDefinition`; repository returns immutable objects |
| **Design** | Read-only. **No workout logic**, no sets/reps, no athlete state, no networking, no UI |

### Exercise Selection Engine (`features/exercise-selection`)

| Aspect | Implementation |
|--------|----------------|
| **Purpose** | Deterministically select ranked exercise candidates for a workout blueprint day |
| **Input** | `WorkoutBlueprint` day + Exercise Knowledge Base catalog |
| **Output** | `ExerciseSelectionResult` — candidates, role groups, rejections, explanations |
| **SelectionContext** | Immutable derived context from blueprint (focus, goals, equipment, difficulty cap, constraints) |
| **Strategy Pattern** | `MovementPattern`, `Equipment`, `Difficulty`, `Goal`, `Constraint`, `Relationship` strategies |
| **Selectors** | `PrimaryExerciseSelector`, `SecondaryExerciseSelector`, `AccessoryExerciseSelector` |
| **Ranking / filtering** | Score merge + deterministic sort (`score desc`, then `id asc`); hard rejects tracked separately |
| **Candidate generation** | Role-grouped candidates; no sets, reps, RPE, volume, or progression |
| **Repository** | `SelectionRepository` + `InMemorySelectionRepository` (result cache only) |
| **Application** | `selectExercises`, `previewExerciseCandidates`, `explainSelection` |
| **Design** | Fully deterministic. Independent from LLM. **No programming** |

### Programming Engine (`features/programming`)

| Aspect | Implementation |
|--------|----------------|
| **Purpose** | Transform selected candidates into immutable per-exercise training prescriptions |
| **ExercisePrescription** | Sets, volume, intensity, rest, tempo, execution, order, priority, estimates, score, reasons |
| **ProgrammingResult** | Ordered prescriptions + explanations + validation issues + aggregate score |
| **Strategy Pattern** | `Volume`, `Intensity`, `Rest`, `Tempo`, `ExerciseOrder`, `Priority` strategies |
| **Validators** | Consistency, uniqueness, volume/intensity/rest ranges, execution order |
| **Utilities** | Context build, normalize, freeze, score, duration/fatigue/workload estimates, sort |
| **Repository** | `ProgrammingRepository` + `InMemoryProgrammingRepository` (result cache only) |
| **Application** | `programExercises`, `previewProgramming`, `explainProgramming` |
| **Design** | Deterministic. **No progression**, **no fatigue adaptation**, **no weekly planning**, **no workout assembly** |

### Progression Engine (`features/progression`)

| Aspect | Implementation |
|--------|----------------|
| **Purpose** | Transform programming prescriptions into immutable multi-week progression timelines |
| **ProgressionPlan** | Exercise progressions + week-ordered timeline + explanations + validation issues + aggregate score |
| **ExerciseProgression / ProgressionStep** | Per-exercise week steps with targets, difficulty/volume/intensity trends, notes |
| **Strategy Pattern** | `Linear`, `Volume`, `Intensity`, `Frequency`, `ExerciseRotation` strategies |
| **Validators** | Timeline consistency, exercise continuity, progression consistency, week ordering, constraints |
| **Utilities** | Context build, normalize/freeze plan, score, workload trend, sort timeline |
| **Repository** | `ProgressionRepository` + `InMemoryProgressionRepository` (plan cache only) |
| **Application** | `generateProgression`, `previewProgression`, `explainProgression` |
| **Design** | Deterministic. **No athlete feedback**, **no load calculation**, **no autoregulation**, **no fatigue**, **no deload**, **no workout assembly** |

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
| 028 | Exercise Knowledge is a dedicated read-only bounded context |
| 029 | Exercise Selection is deterministic and independent from AI |
| 030 | Programming produces immutable `ExercisePrescription` objects |

Full list: [DECISIONS.md](./DECISIONS.md)
