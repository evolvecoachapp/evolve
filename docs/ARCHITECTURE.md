# EVOLVE Architecture

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-23  
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
│  → Domain Events (immutable execution events → Event Stream)    │
│  → Performance Engine (single-session snapshots from results)   │
│  → Achievement Engine (Personal Records from snapshots)         │
│  → Athlete History (immutable chronological domain record)      │
│  → Recovery Intelligence (deterministic recovery snapshots)     │
│  → Insight Engine (deterministic domain insight snapshots)      │
│  → Coach Intelligence (immutable Coaching Context preparation)  │
│  → Conversation Orchestrator (immutable Conversation Context)   │
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
  ↓
Domain Events                    ← Sprint 18.2 (implemented) — immutable execution events
  (`app/src/core/domain-events/`)
  ↓
Performance Engine               ← Sprint 18.3 (implemented) — single-session snapshots
  (`app/src/features/performance-engine/`)
  ↓
Achievement Engine               ← Sprint 18.4 (implemented) — Personal Records foundation
  (`app/src/features/achievement-engine/`)
  ↓
Athlete History                  ← Sprint 18.5 (implemented) — immutable chronological record
  (`app/src/features/athlete-history/`)
  ↓
Recovery Intelligence            ← Sprint 18.6 (implemented) — deterministic recovery snapshots
  (`app/src/features/recovery-intelligence/`)
  ↓
Insight Engine                   ← Sprint 18.7 (implemented) — deterministic domain insight snapshots
  (`app/src/features/insight-engine/`)
  ↓
Coach Intelligence               ← Sprint 18.8 (implemented) — immutable Coaching Context preparation
  (`app/src/features/coach-intelligence/`)
  ↓
Conversation Orchestrator        ← Sprint 19.0 (implemented) — immutable Conversation Context preparation
  (`app/src/features/conversation-orchestrator/`)
  ↓
Prompt Composition Engine        ← Sprint 19.1 (implemented) — immutable Prompt Package composition
  (`app/src/features/prompt-composition/`)
  ↓
AI Provider Abstraction          ← Sprint 19.2 (implemented) — provider contracts + registry
  (`app/src/features/ai-provider/`)
  ↓
OpenAI Provider                  ← Sprint 19.3 (implemented) — concrete OpenAI adapter → AIResponse
  (`app/src/features/openai-provider/`)
  ↓
AI Execution Pipeline            ← Sprint 19.4 (implemented) — provider-agnostic execution orchestration
  (`app/src/features/ai-execution/`)
  ↓
Streaming Foundation             ← Sprint 20.0 (implemented) — provider-agnostic streaming coordination
  (`app/src/features/streaming/`)
  ↓
Tool Calling Foundation          ← Sprint 20.1 (implemented) — provider-independent tool execution
  (`app/src/features/tool-calling/`)
  ↓
Domain Tool Adapters             ← Sprint 20.2 (implemented) — domain capability adapters for tools
  (`app/src/features/domain-tools/`)
```

Full runtime detail: [AI_SYSTEM.md](./AI_SYSTEM.md). Integration tests: [INTEGRATION_TESTING.md](./INTEGRATION_TESTING.md). DI: [COMPOSITION_ROOT.md](./COMPOSITION_ROOT.md). Decision Intelligence: [DECISION_INTELLIGENCE.md](./DECISION_INTELLIGENCE.md). Workout Runtime: [WORKOUT_RUNTIME.md](./WORKOUT_RUNTIME.md). Rest Runtime: [REST_RUNTIME.md](./REST_RUNTIME.md). Domain Events: [DOMAIN_EVENTS.md](./DOMAIN_EVENTS.md). Performance Engine: [PERFORMANCE_ENGINE.md](./PERFORMANCE_ENGINE.md). Achievement Engine: [ACHIEVEMENT_ENGINE.md](./ACHIEVEMENT_ENGINE.md). Athlete History: [ATHLETE_HISTORY.md](./ATHLETE_HISTORY.md). Recovery Intelligence: [RECOVERY_INTELLIGENCE.md](./RECOVERY_INTELLIGENCE.md). Insight Engine: [INSIGHT_ENGINE.md](./INSIGHT_ENGINE.md). Coach Intelligence: [COACH_INTELLIGENCE.md](./COACH_INTELLIGENCE.md). Conversation Orchestrator: [CONVERSATION_ORCHESTRATOR.md](./CONVERSATION_ORCHESTRATOR.md). Prompt Composition: [PROMPT_COMPOSITION.md](./PROMPT_COMPOSITION.md). AI Provider Abstraction: [AI_PROVIDER_ABSTRACTION.md](./AI_PROVIDER_ABSTRACTION.md). OpenAI Provider: [OPENAI_PROVIDER.md](./OPENAI_PROVIDER.md). AI Execution Pipeline: [AI_EXECUTION_PIPELINE.md](./AI_EXECUTION_PIPELINE.md). Streaming Foundation: [STREAMING_FOUNDATION.md](./STREAMING_FOUNDATION.md). Tool Calling Foundation: [TOOL_CALLING_FOUNDATION.md](./TOOL_CALLING_FOUNDATION.md). Domain Tool Adapters: [DOMAIN_TOOL_ADAPTERS.md](./DOMAIN_TOOL_ADAPTERS.md).

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

### Domain Events (`core/domain-events`) — Sprint 18.2

| Aspect | Implementation |
|--------|----------------|
| **Purpose** | Strongly typed immutable domain events for workout execution |
| **Flow** | Workout Runtime → Rest Runtime → Domain Events → Event Stream → Future Subscribers |
| **Models** | `DomainEvent` (+ lifecycle variants), `EventMetadata`, `EventContext`, `EventCategory`, `EventSeverity`, `EventSource`, `EventSequence`, `EventStream` |
| **Stream** | Append-only ordered `EventStreamStore`; filter by category/source/type; no persistence |
| **Dispatcher** | Synchronous `DomainEventDispatcher` — freeze → validate → append → notify (no queues/async) |
| **Subscribers** | Interfaces only: Performance / Timeline / Coach / Analytics / Achievement / Recovery |
| **Application API** | `publishEvent`, `subscribe`, `unsubscribe`, `getEventStream`, `summarizeEvents` |
| **Integration** | Workout + Rest engines emit events on lifecycle actions; business logic unchanged |
| **Design** | **Domain events only.** Not an event bus/broker. No persistence, networking, async queues, Kafka/RabbitMQ, analytics implementations, or subscriber implementations |

Full detail: [DOMAIN_EVENTS.md](./DOMAIN_EVENTS.md).

### Performance Engine (`features/performance-engine`) — Sprint 18.3

| Aspect | Implementation |
|--------|----------------|
| **Purpose** | Single-session analytics from completed workout execution |
| **Flow** | Domain Events → Workout Result → Performance Engine → Performance Snapshot → Future Consumers |
| **Models** | `PerformanceSnapshot`, metrics (volume/intensity/density/completion), exercise/session/movement performance, grade/summary/context/result, trend placeholder |
| **Engine** | `PerformanceEngine` — volume/tonnage/sets/reps/completion/density/duration; no multi-session trends |
| **Calculators** | Isolated `Volume` / `Intensity` / `Density` / `Completion` / `Duration` calculators |
| **Validators** | Completed workout, metric consistency, negatives, division-by-zero, missing execution data |
| **Application API** | `analyzeWorkoutPerformance`, `summarizePerformance`, `gradePerformance` |
| **Integration** | Consumes `WorkoutResult` + `EventStream`; optional `DecisionReport` id reference only |
| **Design** | **Single-session analytics only.** No AI, persistence, networking, history, PRs, recovery, or recommendations. Never mutates execution or program generation |

Full detail: [PERFORMANCE_ENGINE.md](./PERFORMANCE_ENGINE.md).

### Achievement Engine (`features/achievement-engine`) — Sprint 18.4

| Aspect | Implementation |
|--------|----------------|
| **Purpose** | Detect immutable achievements from completed workout analytics |
| **Flow** | Performance Snapshot → Achievement Engine → Achievement Result → Achievement Events → Future Consumers |
| **Models** | `Achievement`, type/category/level/status/reason/rule/evidence/context/metadata, `PersonalRecord` + PR types/evidence/result, `AchievementResult` / summary / engine result / events |
| **Engine** | `AchievementEngine` — Personal Record detection via injected baselines; extensible detector list |
| **Detectors** | Isolated Weight / Volume / Tonnage / Repetition / Completed Sets / Density / Session Volume / Exercise Volume PR detectors |
| **Validators** | Integrity, duplicates, invalid categories, evidence/rule consistency, metadata |
| **Events** | Immutable `AchievementUnlockedEvent`, `PersonalRecordUnlockedEvent` (no subscribers yet) |
| **Application API** | `evaluateAchievements`, `detectPersonalRecords`, `summarizeAchievements` |
| **Integration** | Consumes `PerformanceSnapshot` + `WorkoutResult`; baseline provider injected; DomainEventStream reference only |
| **Design** | **Achievements only.** No AI, persistence, networking, history store, badges/streaks/goals/challenges implementation. Never mutates Performance Engine or Workout Runtime |

Full detail: [ACHIEVEMENT_ENGINE.md](./ACHIEVEMENT_ENGINE.md).

### Athlete History (`features/athlete-history`) — Sprint 18.5

| Aspect | Implementation |
|--------|----------------|
| **Purpose** | Immutable chronological record of an athlete's journey (domain facts only) |
| **Flow** | Workout Runtime → Domain Events → Performance Snapshot → Achievement Result → Athlete History → History Snapshot → Future Consumers |
| **Models** | `AthleteHistory`, `HistorySnapshot`, `HistoryEntry` (+ workout/performance/achievement specializations), type/category/context/metadata/reference/evidence/summary/statistics/engine result |
| **Engine** | `AthleteHistoryEngine` — chronological ordering, reference linking, snapshot + summary generation |
| **Aggregators** | Isolated Workout / Performance / Achievement / Statistics / Summary aggregators |
| **Validators** | Chronology, duplicates, broken references, timestamps, categories, snapshot consistency |
| **Application API** | `buildAthleteHistory`, `createHistorySnapshot`, `summarizeHistory` |
| **Integration** | Consumes `WorkoutResult` + `PerformanceSnapshot` + `AchievementResult`; DomainEventStream reference only |
| **Design** | **History domain modeling only.** No AI, persistence, networking, storage, querying/filtering, timeline UI, or calendar. Never mutates upstream engines |

Full detail: [ATHLETE_HISTORY.md](./ATHLETE_HISTORY.md).

### Recovery Intelligence (`features/recovery-intelligence`) — Sprint 18.6

| Aspect | Implementation |
|--------|----------------|
| **Purpose** | Deterministic recovery analysis from completed training context |
| **Flow** | Athlete History → Performance Snapshot → Recovery Intelligence Engine → Recovery Snapshot → Future Consumers |
| **Models** | `RecoverySnapshot`, `RecoveryMetrics`, `RecoveryStatus`, `RecoveryContext`, `RecoverySummary`, `RecoveryWindow`, `RecoveryIndicator`, `TrainingLoad`, `FatigueScore`, `DensityLoad`, `FrequencyLoad`, `RecoveryAssessment`, `RecoveryEvidence`, `RecoveryEngineResult` |
| **Engine** | `RecoveryIntelligenceEngine` — load/fatigue/frequency/window/status calculation + snapshot generation |
| **Calculators** | Isolated TrainingLoad / Fatigue / DensityLoad / Frequency / RecoveryWindow / RecoveryStatus calculators |
| **Validators** | Metric consistency, negative values, recovery windows, timestamps, assessment consistency, snapshot integrity |
| **Application API** | `analyzeRecovery`, `createRecoverySnapshot`, `summarizeRecovery` |
| **Integration** | Consumes `AthleteHistory` + `PerformanceSnapshot` (+ optional `WorkoutResult`); `AchievementResult` reference only |
| **Design** | **Deterministic recovery metrics only.** No AI, recommendations, persistence, networking, predictions, sleep, or wearables. Never mutates upstream engines |

Full detail: [RECOVERY_INTELLIGENCE.md](./RECOVERY_INTELLIGENCE.md).

### Insight Engine (`features/insight-engine`) — Sprint 18.7

| Aspect | Implementation |
|--------|----------------|
| **Purpose** | Aggregate deterministic domain facts into immutable Insight Snapshots |
| **Flow** | Performance Snapshot → Achievement Result → Recovery Snapshot → Athlete History → Insight Engine → Insight Snapshot → Future Consumers |
| **Models** | `InsightSnapshot`, `Insight`, `InsightType`, `InsightCategory`, `InsightSeverity`, `InsightPriority`, `InsightStatus`, `InsightContext`, `InsightEvidence`, `InsightReason`, `InsightMetadata`, `InsightCollection`, `InsightSummary`, `InsightEngineResult` |
| **Engine** | `InsightEngine` — modular generators + aggregation + snapshot generation |
| **Generators** | Isolated Performance / Achievement / Recovery / History / Summary generators |
| **Validators** | Consistency, duplicates, priorities, severity, evidence, snapshot integrity |
| **Application API** | `generateInsights`, `createInsightSnapshot`, `summarizeInsights` |
| **Integration** | Consumes `PerformanceSnapshot` + `AchievementResult` + `RecoverySnapshot` + `AthleteHistory` |
| **Design** | **Deterministic domain insights only.** No AI, recommendations, persistence, networking, prompts, LLM, or conversation. Never mutates upstream engines |

Full detail: [INSIGHT_ENGINE.md](./INSIGHT_ENGINE.md) (Insight Model + Future Coach Integration).

### Coach Intelligence (`features/coach-intelligence`) — Sprint 18.8

| Aspect | Implementation |
|--------|----------------|
| **Purpose** | Transform deterministic domain knowledge into immutable Coaching Context |
| **Flow** | Insight Snapshot → Coach Intelligence → Coaching Context → Conversation Orchestrator → Conversation Context → Prompt Composition Engine → Prompt Package → AI Provider Abstraction → Future AI Providers |
| **Models** | `CoachingContext`, `CoachSession`, `CoachObjective`, `CoachIntent`, `CoachPriority`, `CoachConstraint`, `CoachInstruction`, `CoachFocus`, `CoachEvidence`, `CoachMetadata`, `CoachingContextSummary`, `CoachContextSnapshot`, `CoachEngineResult`, `CoachPreparation`, `CoachAudience`, `CoachCommunicationStyle`, `CoachKnowledge`, `CoachReason` (legacy history-backed `CoachSummary` retained) |
| **Engine** | `CoachIntelligenceEngine` — modular selectors + context preparation |
| **Selectors** | Isolated Insight / Priority / Evidence / Recovery / History / Objective selectors |
| **Validators** | Context consistency, objectives, priorities, evidence, constraints, snapshot integrity, missing information |
| **Application API** | `prepareCoachingContext`, `createCoachSnapshot`, `summarizeCoachingContext` |
| **Integration** | Consumes `InsightSnapshot`; optionally references Recovery / History / Performance / Achievement |
| **Design** | **Immutable coaching context only.** No AI, prompts, LLM, networking, HTTP, persistence, or conversation. Never mutates upstream engines |

Full detail: [COACH_INTELLIGENCE.md](./COACH_INTELLIGENCE.md) (Coaching Context + Conversation / Prompt Composition handoff).

### Conversation Orchestrator (`features/conversation-orchestrator`) — Sprint 19.0

| Aspect | Implementation |
|--------|----------------|
| **Purpose** | Coordinate Coach Intelligence → future AI by preparing immutable Conversation Context |
| **Flow** | Coaching Context → Conversation Orchestrator → Conversation Context → Prompt Composition Engine → Prompt Package → AI Provider Abstraction → Future AI Providers |
| **Models** | `ConversationContext`, `ConversationSession`, `ConversationMessage`, `ConversationTurn`, `ConversationIntent`, `ConversationGoal`, `ConversationAudience`, `ConversationPriority`, `ConversationConstraint`, `ConversationMetadata`, `ConversationKnowledge`, `ConversationEvidence`, `ConversationSummary`, `ConversationSnapshot`, `ConversationEngineResult`, `ConversationPreparation`, `ConversationState`, `ConversationStage`, `ConversationRequest`, `ConversationResponsePlaceholder` |
| **Engine** | `ConversationOrchestratorEngine` — modular selectors + context preparation |
| **Selectors** | Isolated Knowledge / Priority / Goal / Evidence / Constraint / Session selectors |
| **Validators** | Context consistency, goals, priorities, knowledge, constraints, snapshot integrity, missing information |
| **Application API** | `prepareConversation`, `createConversationSnapshot`, `summarizeConversation` |
| **Integration** | Consumes `CoachingContext`; optionally references Insight / Recovery / History / Performance / Achievement |
| **Design** | **Immutable conversation orchestration only.** No AI, prompts, LLM, networking, HTTP, persistence, or conversation generation. Never mutates upstream engines |

Full detail: [CONVERSATION_ORCHESTRATOR.md](./CONVERSATION_ORCHESTRATOR.md) (Conversation Context + handoff to Prompt Composition).

### Prompt Composition Engine (`features/prompt-composition`) — Sprint 19.1

| Aspect | Implementation |
|--------|----------------|
| **Purpose** | Transform immutable Conversation Context into immutable Prompt Package of structured blocks |
| **Flow** | Conversation Context → Prompt Composition Engine → Prompt Package → AI Provider Abstraction → Future AI Providers |
| **Models** | `PromptPackage`, `PromptBlock`, `PromptBlockType`, `PromptSection`, `PromptPriority`, `PromptMetadata`, `PromptContext`, `PromptConstraints`, `PromptInstruction`, `PromptKnowledge`, `PromptConversation`, `PromptMemory`, `PromptSafety`, `PromptIdentity`, `PromptUserInput`, `PromptSummary`, `PromptSnapshot`, `PromptEngineResult`, `PromptCompositionInput`, `PromptEngineError` |
| **Engine** | `PromptCompositionEngine` — modular composers + package composition |
| **Composers** | Isolated System / Identity / Knowledge / Conversation / Memory / Constraint / Safety / UserInput / Summary composers |
| **Validators** | Block consistency, duplicates, mandatory blocks, ordering, priorities, package consistency, snapshot integrity |
| **Application API** | `composePromptPackage`, `createPromptSnapshot`, `summarizePromptPackage` |
| **Integration** | Consumes `ConversationContext`; optionally references CoachingContext / InsightSnapshot |
| **Design** | **Immutable prompt composition only.** No AI, networking, HTTP, OpenAI/Anthropic/Gemini/Ollama, or provider-specific string prompt generation. Never mutates upstream domains |

Full detail: [PROMPT_COMPOSITION.md](./PROMPT_COMPOSITION.md) (Prompt Package + handoff to AI Provider Abstraction).

### AI Provider Abstraction (`features/ai-provider`) — Sprint 19.2

| Aspect | Implementation |
|--------|----------------|
| **Purpose** | Define common provider contracts and orchestration primitives for future AI providers |
| **Flow** | Prompt Package → AI Provider Abstraction → Future Providers (OpenAI / Anthropic / Gemini / Ollama) → Standard AI Response |
| **Models** | `AIRequest`, `AIResponse`, `AIProvider`, `AIProviderId`, `AIProviderCapabilities`, `AIProviderConfiguration`, `AIProviderMetadata`, `AIProviderStatus`, `AIProviderHealth`, `AIProviderLimits`, `AIProviderError`, `AIProviderResult`, `AIExecutionContext`, `AIExecutionOptions`, `AITokenUsage`, `AIFinishReason`, `AIResponseChunk`, `AIModel`, `AIModelInfo` |
| **Contracts** | `IAIProvider`, `IAIStreamingProvider`, `IAIHealthProvider`, `IAIModelProvider`, `IAIProviderRegistry` |
| **Registry** | `AIProviderRegistry` — register / resolve / list / availability validation |
| **Engine** | `AIProviderEngine` — validate request, resolve provider, prepare execution context (no execution) |
| **Application API** | `prepareAIRequest`, `resolveProvider`, `createExecutionContext` |
| **Integration** | Consumes `PromptPackage`; does not modify Prompt Composition |
| **Design** | **Interfaces and orchestration only.** No OpenAI/Anthropic/Gemini/Ollama implementations, HTTP, networking, or SDKs |

Full detail: [AI_PROVIDER_ABSTRACTION.md](./AI_PROVIDER_ABSTRACTION.md) (Provider Registry + Future OpenAI Integration + Future Multi-provider Support).

### OpenAI Provider (`features/openai-provider`) — Sprint 19.3

| Aspect | Implementation |
|--------|----------------|
| **Purpose** | First concrete AI provider adapter over AI Provider Abstraction |
| **Flow** | Prompt Package → AI Provider Engine → OpenAI Provider → Prompt Mapper → OpenAI Client → Raw OpenAI Response → Response Mapper → AIResponse |
| **Models** | `OpenAIRequest`, `OpenAIResponse`, `OpenAIMessage`, `OpenAIChoice`, `OpenAIUsage`, `OpenAIError`, `OpenAIModelConfiguration`, `OpenAIExecutionResult`, `OpenAIProviderConfiguration`, `OpenAIClientOptions` |
| **Contracts** | Implements `IAIProvider`, `IAIHealthProvider`, `IAIModelProvider`; adapter methods `execute()`, `health()`, `listModels()` |
| **Mappers** | `PromptPackageMapper`, `ResponseMapper`, `ErrorMapper` (immutable; no business logic) |
| **Client** | `OpenAIClient` — OpenAI SDK calls; SDK types never leave the client layer |
| **Application API** | `executePrompt`, `checkHealth`, `listAvailableModels` |
| **Configuration** | `OPENAI_API_KEY`, `OPENAI_MODEL`, `OPENAI_TIMEOUT` (env; no hardcoded secrets) |
| **Integration** | Consumes `PromptPackage` + AI Provider Abstraction; does not modify previous domains |
| **Design** | **No streaming, memory, tool calling, or conversation history.** Provider-specific logic stays in this layer |

Full detail: [OPENAI_PROVIDER.md](./OPENAI_PROVIDER.md) (Provider Flow + Configuration + Future Streaming Support).

### AI Execution Pipeline (`features/ai-execution`) — Sprint 19.4

| Aspect | Implementation |
|--------|----------------|
| **Purpose** | Provider-agnostic orchestration of AI execution over Prompt Packages |
| **Flow** | Prompt Package → AI Execution Pipeline → AI Provider → AI Response |
| **Models** | `AIExecutionRequest`, `AIExecutionResult`, `AIExecutionContext`, `AIExecutionStage`, `AIExecutionState`, `AIExecutionStatus`, `AIExecutionLifecycle`, `AIExecutionTrace`, `AIExecutionMetrics`, `AIExecutionMetadata`, `AIExecutionError`, `AIExecutionEvent`, `AIExecutionCancellation`, `AIExecutionTimeout`, `AIExecutionPolicy`, `AIExecutionSummary` |
| **Pipeline** | `AIExecutionPipeline` — validate → context → resolve provider → execute → metrics → result |
| **Stages** | Validation / Context / ProviderResolution / Execution / Result / Lifecycle |
| **Policies** | `RetryPolicy`, `TimeoutPolicy`, `CancellationPolicy`, `ExecutionPolicy` (interfaces only; no algorithms) |
| **Application API** | `executeAI`, `createExecutionContext`, `summarizeExecution` |
| **Integration** | Consumes `PromptPackage` + AI Provider Abstraction + OpenAI via `IAIProviderExecutor` wrapper; does not modify previous domains |
| **Design** | **No streaming implementation inside the pipeline, retry algorithms, tool calling, memory, HTTP, or provider-specific code.** Pipeline only. Streaming is owned by Streaming Foundation (Sprint 20.0). |

Full detail: [AI_EXECUTION_PIPELINE.md](./AI_EXECUTION_PIPELINE.md) (Execution Lifecycle + Future Retry / Tool Calling). Streaming: [STREAMING_FOUNDATION.md](./STREAMING_FOUNDATION.md).

### Streaming Foundation (`features/streaming`) — Sprint 20.0

| Aspect | Implementation |
|--------|----------------|
| **Purpose** | Provider-agnostic coordination of AI provider streaming |
| **Flow** | AI Execution Pipeline → Streaming Engine → Streaming Provider → Provider Stream → Stream State |
| **Models** | `StreamRequest`, `StreamResponse`, `StreamChunk`, `StreamToken`, `StreamEvent`, `StreamEventType`, `StreamState`, `StreamStatus`, `StreamLifecycle`, `StreamMetadata`, `StreamMetrics`, `StreamTrace`, `StreamCancellation`, `StreamCompletion`, `StreamSummary`, `StreamSnapshot`, `StreamError` |
| **Engine** | `StreamingEngine` — start → receive events → aggregate → update state → complete / cancel |
| **Handlers** | Lifecycle / Chunk / Token / Completion / Cancellation / Error |
| **Aggregators** | Chunk / Token / Summary |
| **Application API** | `startStream`, `cancelStream`, `summarizeStream` |
| **Integration** | Consumes AI Execution Pipeline (optional `executionRequestId`) + AI Provider Abstraction via `IStreamSource`; does not modify previous domains |
| **Design** | **No OpenAI streaming implementation, memory, tool calling, conversation history, or provider-specific code.** Streaming infrastructure only |

Full detail: [STREAMING_FOUNDATION.md](./STREAMING_FOUNDATION.md) (Stream Lifecycle + Future Tool Calling Integration).

### Tool Calling Foundation (`features/tool-calling`) — Sprint 20.1

| Aspect | Implementation |
|--------|----------------|
| **Purpose** | Provider-independent tool execution layer — LLM requests tools; domain remains source of truth |
| **Flow** | Streaming Engine → Tool Calling Engine → Tool Registry → Tool Executor → Domain Tools → Tool Result → AI Response |
| **Models** | `ToolDefinition`, `ToolDescriptor`, `ToolCategory`, `ToolCapability`, `ToolCall`, `ToolCallRequest`, `ToolCallResponse`, `ToolExecution`, `ToolExecutionContext`, `ToolExecutionStatus`, `ToolExecutionResult`, `ToolExecutionMetadata`, `ToolExecutionError`, `ToolInput`, `ToolOutput`, `ToolParameter`, `ToolSchema`, `ToolRegistrySnapshot`, `ToolEngineResult` |
| **Contracts** | `ITool`, `IToolExecutor`, `IToolRegistry`, `IToolValidator`, `IToolProvider` (interfaces only) |
| **Engine** | `ToolCallingEngine` — validate → resolve → prepare context → invoke executor → collect result |
| **Executor** | `FoundationToolExecutor` — orchestration only; no domain implementation |
| **Registry** | `FoundationToolRegistry` / `InMemoryToolRegistry` — register / resolve / list / category / snapshot |
| **Application API** | `executeTool`, `listTools`, `describeTool` |
| **Integration** | Consumes Streaming Foundation + AI Execution Pipeline + AI Provider Abstraction links via context ids; does not implement domain tools or provider SDKs |
| **Design** | **No Workout / Recovery / Nutrition / Coach implementations, business logic, or provider-specific logic.** Foundation only |

Full detail: [TOOL_CALLING_FOUNDATION.md](./TOOL_CALLING_FOUNDATION.md) (Tool Registry + Execution Flow + Future Domain Tool Integration).

### Domain Tool Adapters (`features/domain-tools`) — Sprint 20.2

| Aspect | Implementation |
|--------|----------------|
| **Purpose** | Expose existing domain capabilities to Tool Calling Foundation via thin adapters |
| **Flow** | Tool Calling Engine → Domain Tool Adapters → Existing Domain → Foundation Tool Result |
| **Adapters** | `WorkoutToolAdapter`, `RecoveryToolAdapter`, `CoachToolAdapter`, `AthleteToolAdapter` |
| **Mappers** | Request/Result mappers per domain (immutable mappings only) |
| **Builders** | `FoundationToolResultBuilder`, `AdapterContextBuilder` |
| **Service** | `DomainToolService` — resolve adapter → execute → immutable `FoundationToolResult` |
| **Application API** | `executeDomainTool`, `listDomainTools`, `describeDomainTool` |
| **Integration** | Consumes Tool Calling Foundation + Workout Generation + Performance/Achievement/Athlete History/Recovery/Insight/Coach engines; does not modify existing domains |
| **Design** | **No business logic, algorithms, provider-specific code, or OpenAI code.** Adapters + mappings + orchestration only |

Full detail: [DOMAIN_TOOL_ADAPTERS.md](./DOMAIN_TOOL_ADAPTERS.md) (Adapter Flow + Tool Integration + Future Adapter Extensions).

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
