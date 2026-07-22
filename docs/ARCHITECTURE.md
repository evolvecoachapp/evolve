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
│  Application → Composition Root → Container → Registry →        │
│  Factories → Feature Services → Program Generation Orchestrator │
│  → Blueprint → Knowledge → Selection → Programming →            │
│  Progression → Adaptation → Assembly → WorkoutSession           │
│  → Decision Intelligence (decision graph / execution reports)   │
│  → Workout Runtime (live execution state of WorkoutSession)     │
│  → Rest Runtime (deterministic rest periods; injected elapsed)  │
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
Training Adaptation Engine       ← Sprint 17.5 (implemented)
  ↓
Workout Assembly Engine          ← Sprint 17.6 (implemented)
  ↓
Program Generation Orchestrator  ← Sprint 17.7 (implemented)
  ↓
Integration Testing Framework    ← Sprint 17.8 (implemented) — tests only

Composition Root & DI            ← Sprint 17.9 (implemented) — wiring only
  (`app/src/core/composition/`)
  ↓
Decision Intelligence            ← Sprint 17.10 (implemented) — explanations only
  (`app/src/core/decision-intelligence/`)
  ↓
Workout Runtime                  ← Sprint 18.0 (implemented) — live session state
  (`app/src/features/workout-runtime/`)
  ↓
Rest Runtime                     ← Sprint 18.1 (implemented) — rest periods (injected elapsed)
  (`app/src/features/rest-runtime/`)
```

Full runtime detail: [AI_SYSTEM.md](./AI_SYSTEM.md). Integration tests: [INTEGRATION_TESTING.md](./INTEGRATION_TESTING.md). DI: [COMPOSITION_ROOT.md](./COMPOSITION_ROOT.md). Decision Intelligence: [DECISION_INTELLIGENCE.md](./DECISION_INTELLIGENCE.md). Workout Runtime: [WORKOUT_RUNTIME.md](./WORKOUT_RUNTIME.md). Rest Runtime: [REST_RUNTIME.md](./REST_RUNTIME.md).

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

### Training Adaptation Engine (`features/training-adaptation`)

| Aspect | Implementation |
|--------|----------------|
| **Purpose** | Evaluate whether an existing Progression Plan should be adapted before execution |
| **Input** | `ProgressionPlan` + `WorkoutBlueprint` |
| **Output** | `TrainingAdaptationResult` — readiness, recommendations, adapted progression view |
| **Assessments** | Recovery, Fatigue, Constraint, ExecutionReadiness (independent, immutable) |
| **Strategy Pattern** | Volume, Intensity, ExerciseSwap, RecoveryDay, ScheduleAdjustment |
| **Validators** | Assessment consistency, recommendation consistency, constraint compatibility, adaptation ordering |
| **Utilities** | Context build, freeze/normalize, readiness score, aggregate assessments, sort recommendations |
| **Repository** | `TrainingAdaptationRepository` + `InMemoryTrainingAdaptationRepository` (result cache only) |
| **Application** | `evaluateTrainingReadiness`, `previewAdaptations`, `explainAdaptations` |
| **Design** | Deterministic. **Recommendations only**. **No wearables**, **no athlete history**, **no physiological APIs**, **no workout modification**, **no Programming/Progression replacement** |

### Workout Assembly Engine (`features/workout-assembly`)

| Aspect | Implementation |
|--------|----------------|
| **Purpose** | Assemble the final executable `WorkoutSession` from prior pipeline outputs |
| **Input** | `WorkoutBlueprint` + `ExerciseSelectionResult` + `ProgrammingResult` + `ProgressionPlan` + `TrainingAdaptationResult` |
| **Output** | `WorkoutAssemblyResult` — immutable `WorkoutSession`, blocks, summary, explanations |
| **Assembly Steps** | Build context → resolve recommendations → assemble exercises → group blocks → summary → freeze |
| **Validators** | Exercise ordering, prescription consistency, adaptation consistency, duplicate prevention, session integrity |
| **Utilities** | Freeze/normalize session, estimate duration/workload, sort exercises, build summary |
| **Repository** | `WorkoutAssemblyRepository` + `InMemoryWorkoutAssemblyRepository` (result cache only) |
| **Application** | `assembleWorkout`, `previewWorkout`, `explainWorkout` |
| **Design** | Deterministic. **No strategy generation**, **no programming**, **no progression**, **no readiness evaluation**, **no execution state**, **no timers**, **no analytics**, **no persistence** |

### Program Generation Orchestrator (`features/program-generation`)

| Aspect | Implementation |
|--------|----------------|
| **Purpose** | Single public entry point that coordinates the complete workout generation pipeline |
| **Input** | `WorkoutGenerationRequest` (+ `AthleteContext`, optional `ConversationContext` / `WorkflowContext`, pre-supplied `blueprintSource`) |
| **Output** | Immutable `WorkoutGenerationResult` — `WorkoutSession`, engine outputs, `PipelineExecutionSummary`, `PipelineExecutionTrace` |
| **Orchestration** | Validate → Context → Blueprint → Selection → Programming → Progression → Adaptation → Assembly → Freeze |
| **Validators** | Pipeline integrity, execution order, required outputs, missing dependencies, pipeline consistency |
| **Utilities** | Freeze result, normalize pipeline, build execution trace, structural metrics, aggregate summaries |
| **Service** | `ProgramGenerationService` — thin wrapper over `ProgramGenerationOrchestrator` (no cache/persistence) |
| **Application** | `generateWorkoutProgram`, `previewWorkoutProgram`, `explainWorkoutGeneration` |
| **Design** | Coordination only. **No engine duplication**, **no business logic**, **no AI**, **no networking**, **no persistence**, **no execution state**, **no analytics**, **no history**, **no caching** |

### Integration Testing Framework (`app/tests/integration/`) — Sprint 17.8

| Aspect | Implementation |
|--------|----------------|
| **Purpose** | Reusable infrastructure to validate every future evolution of the Training Intelligence Engine |
| **Flow** | `WorkoutGenerationRequest` → Orchestrator → `WorkoutGenerationResult` → Domain Assertions → Golden Validation |
| **Fixtures** | Immutable athlete fixtures (beginner BB, advanced PL, powerbuilding, home gym, cutting, bulking, …) |
| **Builders** | Fluent `AthleteBuilder`, `WorkoutRequestBuilder`, `ConversationBuilder`, `WorkflowBuilder` |
| **Assertions** | `expectWorkout(result)` domain matchers (validity, engines present, order, duplicates, immutability) |
| **Scenarios** | End-to-end complete-pipeline scenarios (powerlifting, bodybuilding, powerbuilding, cutting, bulking, general fitness) |
| **Goldens** | Normalized deterministic snapshots under `golden/*.golden.json` |
| **Design** | **Testing infrastructure only.** No production behavior changes, no AI, networking, persistence, analytics, caching, UI, or engine modifications |

Full detail: [INTEGRATION_TESTING.md](./INTEGRATION_TESTING.md).

### Composition Root & Dependency Injection (`core/composition`) — Sprint 17.9

| Aspect | Implementation |
|--------|----------------|
| **Purpose** | Centralized object creation and dependency wiring for pipeline services |
| **Flow** | Application → Composition Root → `ApplicationContainer` → `ServiceRegistry` → Factories → Feature Services → Orchestrator → Engines |
| **Container** | Register / resolve, singleton + transient lifecycles, freeze after init, duplicate/missing/circular/late validation |
| **Registry** | Typed `ServiceMap` for Blueprint, Selection, Programming, Progression, Adaptation, Assembly, Program Generation |
| **Factories** | Creation-only factories (no business logic) |
| **Providers** | Configuration, in-memory repositories, default strategies |
| **Application API** | Use-cases resolve defaults via `resolveService(token)` — no manual `new` |
| **Design** | **Wiring only.** No AI, networking, persistence, UI, caching layer, analytics, or engine/business logic changes |

Full detail: [COMPOSITION_ROOT.md](./COMPOSITION_ROOT.md).

### Decision Intelligence (`core/decision-intelligence`) — Sprint 17.10

| Aspect | Implementation |
|--------|----------------|
| **Purpose** | Structured domain explanation of workout-generation decisions |
| **Flow** | Program Generation → Decision Recorder → Decision Graph → Execution Report → Explanation Report → (future) Coach AI |
| **Models** | Immutable `DecisionNode` / `DecisionEdge` / `DecisionGraph` / `DecisionTimeline` / `DecisionReport` / `ExecutionReport` / `DecisionExplanation` |
| **Recorder** | `DecisionRecorder` — domain decisions only (no implementation details) |
| **Explainability** | Template-based `ExplanationBuilder` (human / developer / compact / detailed) — **no AI** |
| **Validators** | Graph consistency, missing parents, orphans, invalid edges, duplicates, confidence range, timeline consistency |
| **Application API** | `createDecisionReport`, `createExecutionReport`, `explainWorkoutDecision`, `summarizeDecisionGraph` |
| **Integration** | Reads `PipelineExecutionTrace` / `PipelineExecutionSummary` / engine explanations; orchestrator exposes `buildDecisionIntelligence` |
| **Design** | **Explanation substrate only.** No engine/business logic changes, AI, networking, persistence, telemetry, logging framework, analytics platform, or UI |

Full detail: [DECISION_INTELLIGENCE.md](./DECISION_INTELLIGENCE.md).

### Workout Runtime (`features/workout-runtime`) — Sprint 18.0

| Aspect | Implementation |
|--------|----------------|
| **Purpose** | Live execution state of an immutable assembled `WorkoutSession` |
| **Flow** | `WorkoutSession` → `WorkoutRuntime` → `ExerciseRuntime` → `SetRuntime` → `SessionState` → `WorkoutResult` |
| **Lifecycle** | `NotStarted` → `Running` ↔ `Paused` → `Completed` / `Cancelled` (validated transitions) |
| **Engine** | `WorkoutRuntimeEngine` — start/pause/resume/finish, current exercise/set, advance, completion % |
| **Models** | Runtime + state + progress/summary/result/event/metrics/configuration |
| **Validators** | State transitions, set/exercise progression, completion, invalid operations |
| **Application API** | `startWorkout`, `pauseWorkout`, `resumeWorkout`, `completeWorkout`, `skipExercise`, `completeSet` |
| **Design** | **Execution state only.** Consumes immutable `WorkoutSession`. May own optional `RestRuntime`. **No Program Generation changes**, UI, persistence, networking, timers, analytics, history, or AI |

Full detail: [WORKOUT_RUNTIME.md](./WORKOUT_RUNTIME.md).

### Rest Runtime (`features/rest-runtime`) — Sprint 18.1

| Aspect | Implementation |
|--------|----------------|
| **Purpose** | Deterministic rest-period domain for live workouts |
| **Flow** | `WorkoutRuntime` → `RestRuntime` → `RestSession` → `RestResult` |
| **Lifecycle** | `Idle` → `Running` ↔ `Paused` → `Completed` / `Cancelled` / `Expired` (validated) |
| **Time model** | Elapsed injected via `updateElapsedTime`; no `setTimeout` / `setInterval` |
| **Engine** | `RestRuntimeEngine` — start/pause/resume/cancel/complete, elapsed/remaining/overtime/% |
| **Models** | Session/runtime/state/status/progress/summary/result/event/metrics/configuration |
| **Validators** | State transitions, duration consistency, completion, expiration, invalid operations |
| **Application API** | `startRest`, `pauseRest`, `resumeRest`, `cancelRest`, `completeRest`, `updateElapsedTime` |
| **Design** | **Rest state only.** Foundation for future timers/notifications/Live Activities/Coach AI. **No UI**, platform timers, persistence, networking, AI, analytics, or notifications |

Full detail: [REST_RUNTIME.md](./REST_RUNTIME.md).

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

# Training Intelligence pipeline (application layer)
application use-cases → Composition Root → container/registry → factories → feature services → orchestrator → engines
orchestrator / generation result → Decision Intelligence (recorder → graph → execution/explanation reports)
```

**Forbidden:** providers → screens directly, api client → screens directly, application use-cases → `new` feature services (resolve via Composition Root)

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
| 034 | Program Generation Orchestrator coordinates the pipeline |
| 035 | Integration Testing Framework is isolated test infrastructure |
| 036 | Composition Root owns mobile pipeline DI |
| 037 | Decision Intelligence is a structured domain explanation layer |

Full list: [DECISIONS.md](./DECISIONS.md)
