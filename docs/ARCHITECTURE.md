# EVOLVE Architecture

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-25  
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
Prompt Builder                   ← Sprint 19.1 (implemented) — immutable Prompt Package from Conversation Context
  (`app/src/features/prompt-builder/`)
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
  ↓
Response Formatter               ← Sprint 19.4 (implemented) — AIResponse → immutable CoachResponse
  (`app/src/features/response-formatter/`)
  ↓
Action Engine                    ← Sprint 20.3 (implemented) — CoachResponse → immutable ActionPlan
  (`app/src/features/action-engine/`)
  ↓
Tool Runtime Engine              ← Sprint 20.1 (implemented) — ActionPlan → Domain Tool Adapters
  (`app/src/features/tool-runtime/`)
  ↓
Agent Framework                  ← Sprint 21.1 (implemented) — shared agent contracts / lifecycle / registry
  (`app/src/features/agent-framework/`)
  ↓
Agent Runtime                    ← Sprint 21.4 (implemented) — single execution entry point for agent workflows
  (`app/src/features/agent-runtime/`)
  ↓
Workout Agent                    ← specialized framework agent — domain orchestration (Agent Runtime → Planning → Workout Domain → Result)
  (`app/src/features/workout-agent/`)
  ↓
Nutrition Agent                  ← Sprint 21.2 (implemented) — nutrition specialist domain agent (orchestration only)
  (`app/src/features/nutrition-agent/`)
  ↓
Recovery Agent                   ← Sprint 21.3 (implemented) — recovery specialist domain agent (orchestration only)
  (`app/src/features/recovery-agent/`)
  ↓
Coach Agent                      ← Sprint 21.3 (implemented) — meta-agent coordinating Workout / Recovery / Nutrition
  (`app/src/features/coach-agent/`)
  ↓
Coaching Session Runtime         ← Sprint 22.0 (implemented) — session lifecycle between Conversation Runtime and Coach Supervisor
  (`app/src/features/coaching-session/`)
  ↓
Athlete State Engine             ← Sprint 22.1 (implemented) — immutable athlete truth aggregated from specialists
  (`app/src/features/athlete-state/`)
  ↓
Context Fusion Engine            ← Sprint 22.2 (implemented) — fuse runtimes/agents into UnifiedCoachingContext
  (`app/src/features/context-fusion/`)
  ↓
Decision Engine                  ← Sprint 22.3 (implemented) — UnifiedCoachingContext → CoachingDecision
  (`app/src/features/decision-engine/`)
  ↓
Recommendation Engine            ← Sprint 22.4 (implemented) — CoachingDecision → CoachingRecommendation
  (`app/src/features/recommendation-engine/`)
  ↓
Explainability Engine            ← Sprint 22.5 (implemented) — CoachingRecommendation → CoachingExplanation
  (`app/src/features/explainability-engine/`)
  ↓
Continuous Adaptation Engine     ← Sprint 23.1 (implemented) — adaptation opportunity detection → AdaptationDecision
  (`app/src/features/continuous-adaptation/`)
  ↓
Workout Adaptation Engine        ← Sprint 24.1 (implemented) — adapt existing Workout Blueprint → UpdatedWorkoutBlueprint
  (`app/src/features/workout-adaptation/`)
  ↓
Coach Supervisor                 ← Sprint 21.8 (implemented) — central multi-agent orchestrator → UnifiedCoachResponse
  (`app/src/features/coach-supervisor/`)
  ↓
Supervisor Routing Engine        ← Sprint 21.7 (implemented) — deterministic multi-agent routing plans (foundation)
  (`app/src/features/supervisor-routing/`)
  ↓
Agent Capability Registry        ← Sprint 21.6 (implemented) — capability definitions / resolve / registry (foundation)
  (`app/src/features/agent-capability/`)
  ↓
Agent Collaboration              ← Sprint 21.5 (implemented) — deterministic Coach ↔ specialist orchestration
  (`app/src/features/agent-collaboration/`)
  ↓
Conversation Memory              ← Sprint 21.4 (implemented) — structured coaching knowledge (not chat history)
  (`app/src/features/conversation-memory/`)
```

Full runtime detail: [AI_SYSTEM.md](./AI_SYSTEM.md). AI Runtime: [AI_RUNTIME.md](./AI_RUNTIME.md). Integration tests: [INTEGRATION_TESTING.md](./INTEGRATION_TESTING.md). DI: [COMPOSITION_ROOT.md](./COMPOSITION_ROOT.md). Decision Intelligence: [DECISION_INTELLIGENCE.md](./DECISION_INTELLIGENCE.md). Decision Pipeline: [DECISION_PIPELINE.md](./DECISION_PIPELINE.md). Workout Runtime: [WORKOUT_RUNTIME.md](./WORKOUT_RUNTIME.md). Rest Runtime: [REST_RUNTIME.md](./REST_RUNTIME.md). Domain Events: [DOMAIN_EVENTS.md](./DOMAIN_EVENTS.md). Performance Engine: [PERFORMANCE_ENGINE.md](./PERFORMANCE_ENGINE.md). Achievement Engine: [ACHIEVEMENT_ENGINE.md](./ACHIEVEMENT_ENGINE.md). Athlete History: [ATHLETE_HISTORY.md](./ATHLETE_HISTORY.md). Athlete State Engine: [ATHLETE_STATE_ENGINE.md](./ATHLETE_STATE_ENGINE.md). Context Fusion Engine: [CONTEXT_FUSION_ENGINE.md](./CONTEXT_FUSION_ENGINE.md). Decision Engine: [DECISION_ENGINE.md](./DECISION_ENGINE.md). Recommendation Engine: [RECOMMENDATION_ENGINE.md](./RECOMMENDATION_ENGINE.md). Explainability Engine: [EXPLAINABILITY_ENGINE.md](./EXPLAINABILITY_ENGINE.md). Continuous Adaptation Engine: [CONTINUOUS_ADAPTATION_ENGINE.md](./CONTINUOUS_ADAPTATION_ENGINE.md). Workout Adaptation Engine: [WORKOUT_ADAPTATION_ENGINE.md](./WORKOUT_ADAPTATION_ENGINE.md). Workout Pipeline: [WORKOUT_PIPELINE.md](./WORKOUT_PIPELINE.md). Adaptive Coaching: [ADAPTIVE_COACHING.md](./ADAPTIVE_COACHING.md). Reasoning Pipeline: [REASONING_PIPELINE.md](./REASONING_PIPELINE.md). State Management: [STATE_MANAGEMENT.md](./STATE_MANAGEMENT.md). Recovery Intelligence: [RECOVERY_INTELLIGENCE.md](./RECOVERY_INTELLIGENCE.md). Insight Engine: [INSIGHT_ENGINE.md](./INSIGHT_ENGINE.md). Coach Intelligence: [COACH_INTELLIGENCE.md](./COACH_INTELLIGENCE.md). Conversation Orchestrator: [CONVERSATION_ORCHESTRATOR.md](./CONVERSATION_ORCHESTRATOR.md). Prompt Builder: [PROMPT_BUILDER.md](./PROMPT_BUILDER.md). Prompt Composition: [PROMPT_COMPOSITION.md](./PROMPT_COMPOSITION.md). AI Provider Abstraction: [AI_PROVIDER_ABSTRACTION.md](./AI_PROVIDER_ABSTRACTION.md). OpenAI Provider: [OPENAI_PROVIDER.md](./OPENAI_PROVIDER.md). AI Execution Pipeline: [AI_EXECUTION_PIPELINE.md](./AI_EXECUTION_PIPELINE.md). Streaming Foundation: [STREAMING_FOUNDATION.md](./STREAMING_FOUNDATION.md). Tool Calling Foundation: [TOOL_CALLING_FOUNDATION.md](./TOOL_CALLING_FOUNDATION.md). Domain Tool Adapters: [DOMAIN_TOOL_ADAPTERS.md](./DOMAIN_TOOL_ADAPTERS.md). Response Formatter: [RESPONSE_FORMATTER.md](./RESPONSE_FORMATTER.md). Action Engine: [ACTION_ENGINE.md](./ACTION_ENGINE.md). Tool Runtime: [TOOL_RUNTIME.md](./TOOL_RUNTIME.md). Agent Framework: [AGENT_FRAMEWORK.md](./AGENT_FRAMEWORK.md). Agent Lifecycle: [AGENT_LIFECYCLE.md](./AGENT_LIFECYCLE.md). Agent Registry: [AGENT_REGISTRY.md](./AGENT_REGISTRY.md). Workout Agent: [WORKOUT_AGENT.md](./WORKOUT_AGENT.md). Nutrition Agent: [NUTRITION_AGENT.md](./NUTRITION_AGENT.md). Recovery Agent: [RECOVERY_AGENT.md](./RECOVERY_AGENT.md). Coach Agent: [COACH_AGENT.md](./COACH_AGENT.md). Coaching Session Runtime: [COACHING_SESSION_RUNTIME.md](./COACHING_SESSION_RUNTIME.md). Session Lifecycle: [SESSION_LIFECYCLE.md](./SESSION_LIFECYCLE.md). Coach Supervisor: [COACH_SUPERVISOR.md](./COACH_SUPERVISOR.md). Supervisor Routing: [SUPERVISOR_ROUTING.md](./SUPERVISOR_ROUTING.md). Multi-Agent Routing: [MULTI_AGENT_ROUTING.md](./MULTI_AGENT_ROUTING.md). Multi-Agent Runtime: [MULTI_AGENT_RUNTIME.md](./MULTI_AGENT_RUNTIME.md). Supervisor Runtime: [SUPERVISOR_RUNTIME.md](./SUPERVISOR_RUNTIME.md). Agent Platform: [AGENT_PLATFORM.md](./AGENT_PLATFORM.md). Agent Capability: [AGENT_CAPABILITY.md](./AGENT_CAPABILITY.md). Agent Collaboration: [AGENT_COLLABORATION.md](./AGENT_COLLABORATION.md). Conversation Memory: [CONVERSATION_MEMORY.md](./CONVERSATION_MEMORY.md). Agent Runtime: [AGENT_RUNTIME.md](./AGENT_RUNTIME.md). Workout Intelligence: [WORKOUT_INTELLIGENCE.md](./WORKOUT_INTELLIGENCE.md). Nutrition Intelligence: [NUTRITION_INTELLIGENCE.md](./NUTRITION_INTELLIGENCE.md).

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

### Prompt Builder (`features/prompt-builder`) — Sprint 19.1

| Aspect | Implementation |
|--------|----------------|
| **Purpose** | Transform immutable Conversation Context into immutable Prompt Package of independently built blocks |
| **Flow** | Conversation Context → Prompt Builder → Prompt Package → Future AI Provider |
| **Models** | `PromptPackage`, `PromptBlock`, `SystemPrompt`, `UserPrompt`, `AssistantPrompt`, `PromptTemplate`, `PromptPersona`, `PromptCapability`, `PromptKnowledge`, `PromptFormatting`, `PromptToolDefinition`, `PromptSafety`, `PromptConstraint`, `PromptInstruction`, `PromptComposition`, `PromptStatistics`, `PromptSummary`, `PromptSnapshot`, `PromptBuildResult` |
| **Blocks** | Independent System / Persona / Capabilities / Knowledge / Conversation / Athlete / Recovery / Insight / Constraint / Formatting / Tool / Safety / Summary builders |
| **Composer** | `PromptComposer` — deterministic block assembly → frozen package |
| **Application API** | `buildPromptPackage`, `buildSystemPrompt`, `buildUserPrompt`, `validatePromptPackage` |
| **Integration** | Consumes `ConversationContext` read-only; no provider calls |
| **Design** | **Immutable prompt composition only.** No AI, networking, HTTP, OpenAI/Anthropic/Gemini, persistence, or response generation. Legacy coach-backed path preserved under `models/coach/` |

Full detail: [PROMPT_BUILDER.md](./PROMPT_BUILDER.md) (Prompt Package + Prompt Composition relationship).

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
| **Flow** | Prompt Package → AI Provider Abstraction → Unified AI Response → Response Formatter |
| **Models** | `AIRequest`, `AIResponse`, `AIMessage`, `AIChoice`, `AIUsage`, `AITokenUsage`, `AIError`, `AIProvider`, `AIProviderResult`, `AIProviderSnapshot`, `AIProviderFeatures`, `AIModel`, `AIModelVersion`, `AIStreamingChunk`, `AIToolCall`, `AIToolResult`, `AIExecutionResult`, … |
| **Contracts** | `IAIProvider`, `IAIProviderFactory`, `IAIProviderRegistry`, streaming / tool / vision / embedding / reasoning / function-calling extensions |
| **Registry** | `AIProviderRegistry`, `ProviderRegistry`, `ProviderDescriptor`, `CapabilityRegistry`, `ModelRegistry` |
| **Factory** | `AIProviderFactory` — resolve by id / model / capability / default |
| **Selectors** | `ProviderSelector`, `CapabilitySelector`, `ModelSelector`, `PricingSelector` |
| **Engine** | `AIProviderEngine` — validate request, resolve provider, prepare execution context (no execution) |
| **Application API** | `createAIRequest`, `validateProvider`, `resolveProvider`, `listProviders`, `describeProvider` |
| **Integration** | Consumes `PromptPackage` → `AIRequest`; consumes `AIResponse` → `AIProviderResult` |
| **Design** | **Interfaces and orchestration only.** No OpenAI/Anthropic/Gemini/Ollama implementations, HTTP, networking, or SDKs |

Full detail: [AI_PROVIDER_ABSTRACTION.md](./AI_PROVIDER_ABSTRACTION.md) (Provider Registry + Provider Factory + Contracts + Future OpenAI / Multi-provider Support).

### OpenAI Provider (`features/openai-provider`) — Sprint 19.3

| Aspect | Implementation |
|--------|----------------|
| **Purpose** | First concrete AI provider adapter over AI Provider Abstraction |
| **Flow** | PromptPackage → AIProvider → OpenAIProvider → OpenAI SDK → Unified AIResponse |
| **Models** | `OpenAIRequest`, `OpenAIResponse`, `OpenAIMessage`, `OpenAIChoice`, `OpenAIUsage`, `OpenAIError`, `OpenAIStreamChunk`, `OpenAIRetryPolicy`, `OpenAIModelConfiguration`, `OpenAIExecutionResult`, `OpenAIProviderConfiguration`, `OpenAIClientOptions` |
| **Contracts** | Implements `IAIProvider`, `IAIHealthProvider`, `IAIModelProvider`, `IAIStreamingProvider`; adapter methods `execute()`, `executeStreaming()`, `health()` |
| **Mappers** | `OpenAIRequestBuilder` / `PromptPackageMapper`, `OpenAIResponseMapper`, `OpenAIUsageMapper`, `OpenAIErrorMapper` |
| **Client** | `OpenAIClient` — OpenAI SDK calls only; SDK types never leave the client layer |
| **Streaming** | Provider-local chunk abstraction (`OpenAIStreamingSession`) — no UI |
| **Errors** | Dedicated hierarchy → `AIError` (`AuthenticationError`, `RateLimitError`, …) |
| **Application API** | `execute`, `executeStreaming`, `healthCheck`, `validateConfiguration` |
| **Configuration** | Immutable env load: API key, org, project, base URL, model, temperature, topP, timeout, retry policy, streaming |
| **Integration** | Consumes `PromptPackage`; produces `AIResponse`; `registerOpenAIProvider` for registry/factory |
| **Design** | **No domain logic, prompt generation, conversation orchestration, or UI.** Only module allowed to import OpenAI SDK |

Full detail: [OPENAI_PROVIDER.md](./OPENAI_PROVIDER.md) (Configuration + Streaming + Error Mapping).

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

### Response Formatter (`features/response-formatter`) — Sprint 19.4

| Aspect | Implementation |
|--------|----------------|
| **Purpose** | Transform immutable `AIResponse` into immutable structured `CoachResponse` |
| **Flow** | AIResponse → Response Formatter → CoachResponse → UI / Action Engine |
| **Models** | `CoachResponse`, `CoachMessage`, `CoachRecommendation`, `CoachWarning`, `CoachInsight`, `CoachAction`, `CoachExercise`, `CoachNutritionAdvice`, `CoachRecoveryAdvice`, `CoachQuestion`, `CoachCitation`, `CoachConfidence`, `CoachMetadata`, `CoachSection`, `CoachSummary`, `CoachFormatting`, `CoachResponseSnapshot`, `CoachResponseStatistics`, `CoachParsingResult`, `CoachFormattingResult`, `CoachResponsePackage` |
| **Parsers** | Message / Recommendation / Warning / Action / Exercise / Nutrition / Recovery / Question / Citation / Metadata |
| **Extractors** | Reasoning / Insight / Confidence / ToolCall / Reference / Section |
| **Classifiers** | ResponseIntent / Severity / Confidence / Recommendation |
| **Formatters** | Markdown / PlainText / RichContent / Card / FutureJson (text payloads only; no UI) |
| **Application API** | `formatResponse`, `buildCoachResponse`, `summarizeResponse`, `validateResponse` |
| **Integration** | Consumes `AIResponse`; produces `CoachResponse`; compatible with OpenAI + future Anthropic / Gemini / Ollama via standardized response only |
| **Design** | **No provider SDKs, networking, prompt generation, conversation orchestration, business logic, or persistence.** Deterministic immutable transformation only |

Full detail: [RESPONSE_FORMATTER.md](./RESPONSE_FORMATTER.md) (Coach Response + Formatting Pipeline).

### Action Engine (`features/action-engine`) — Sprint 20.3

| Aspect | Implementation |
|--------|----------------|
| **Purpose** | Transform immutable `CoachResponse` into immutable `ActionPlan` for future runtimes |
| **Flow** | CoachResponse → Action Engine → ActionPlan → Tool Runtime → Domain Tool Adapters → Domain Platform |
| **Models** | `ActionPlan`, `ActionStep`, `ActionIntent`, `ActionType`, `ActionTarget`, `ActionArgument`, `ActionConstraint`, `ActionPriority`, `ActionDependency`, `ActionStatus`, `ActionMetadata`, `ActionSummary`, `ActionSnapshot`, `ActionExecutionPlan`, `ActionProposal`, `ActionCandidate`, `ActionValidation`, `ActionStatistics`, `ActionContext`, `ActionPackage` |
| **Planners** | Workout / Nutrition / Recovery / Goal / Reminder / Composite |
| **Selectors** | Action / Planner / Priority / Dependency |
| **Policies** | Conflict / Priority / Dependency / Execution / Safety (structural only) |
| **Executors** | `ActionExecutor`, `ExecutionContext`, `ExecutionStrategy`, `ExecutionRequest`, `ExecutionResult` (contracts only) |
| **Application API** | `buildActionPlan`, `validateActionPlan`, `summarizeActionPlan`, `estimateExecution`, `describeActions` |
| **Integration** | Consumes `CoachResponse`; produces `ActionPlan`; compatible with Conversation Memory, Response Formatter, Tool Runtime, Future Agent Runtime |
| **Design** | **No domain execution, networking, persistence, provider SDK, AI calls, or business logic.** Immutable action planning only |

Full detail: [ACTION_ENGINE.md](./ACTION_ENGINE.md) (Action Planning + Execution Pipeline).

### Tool Runtime Engine (`features/tool-runtime`) — Sprint 20.1

| Aspect | Implementation |
|--------|----------------|
| **Purpose** | Orchestrate immutable `ActionPlan` execution through Domain Tool Adapters |
| **Flow** | ActionPlan → Tool Runtime → Tool Resolver → Execution Pipeline → Domain Tool Adapters → Tool Results → Execution Result |
| **Models** | `ToolRuntime`, `ToolExecutionPlan`, `ToolExecutionStep`, `ToolExecutionRequest`, `ToolExecutionContext`, `ToolExecutionState`, `ToolExecutionStatus`, `ToolExecutionResult`, `ToolExecutionSummary`, `ToolExecutionSnapshot`, `ToolExecutionStatistics`, `ToolExecutionMetadata`, `ToolResult`, `ToolFailure`, `ToolSuccess`, `ToolDispatchResult`, `ToolPipelineResult`, `ToolRuntimePackage` |
| **Runtime** | `ToolRuntimeEngine`, `ExecutionPipeline`, `ExecutionCoordinator`, `ExecutionScheduler`, `ExecutionContextManager` |
| **Resolver** | Tool / Adapter / Capability / Action |
| **Dispatch** | `ToolDispatcher`, `DispatchContext`, `DispatchPolicy` |
| **Executors** | Sequential / Parallel / Conditional / Composite (contracts; no real parallelism required) |
| **Policies** | Retry / Timeout / Ordering / Failure / Recovery / Safety |
| **Application API** | `executeActionPlan`, `buildExecutionPlan`, `validateExecution`, `estimateExecution`, `describeRuntime` |
| **Integration** | Consumes `ActionPlan`; uses Domain Tool Adapters; produces `ToolExecutionResult` |
| **Design** | **No domain business logic, networking, persistence, provider SDK, OpenAI, Prompt Builder, or Conversation logic.** Orchestration only |

Full detail: [TOOL_RUNTIME.md](./TOOL_RUNTIME.md) (Execution Pipeline + Execution Flow).

### Agent Framework (`features/agent-framework`) — Sprint 21.1

| Aspect | Implementation |
|--------|----------------|
| **Purpose** | Shared contracts, lifecycle, registry, and factory for every intelligent agent |
| **Flow** | User Request → Agent Framework → Domain Agents → AI Runtime → Tool Runtime → Domain |
| **Contracts** | `IAgent`, `IAgentFactory`, `IAgentRegistry`, `IAgentCapability`, `IAgentLifecycle`, request/response/result/health contracts |
| **Models** | `Agent`, `AgentDescriptor`, `AgentContext`, `AgentRequest`, `AgentResponse`, `AgentSnapshot`, `AgentSession`, `AgentState`, `AgentStatus`, `AgentRole`, `AgentPriority`, … |
| **Lifecycle** | `AgentLifecycle`, `AgentStateMachine`, `AgentInitializer`, `AgentHealthChecker`, `AgentShutdown` |
| **Registry / Factory** | `AgentRegistry`, `CapabilityRegistry`, `RoleRegistry`, `MetadataRegistry`, `AgentFactory` |
| **Application API** | `registerAgent`, `resolveAgent`, `listAgents`, `describeAgent`, `validateAgent` |
| **Design** | **No domain logic, prompts, providers, networking, or persistence.** Framework infrastructure only |

Full detail: [AGENT_FRAMEWORK.md](./AGENT_FRAMEWORK.md). Lifecycle: [AGENT_LIFECYCLE.md](./AGENT_LIFECYCLE.md). Registry: [AGENT_REGISTRY.md](./AGENT_REGISTRY.md).

### Agent Runtime (`features/agent-runtime`) — Sprint 21.4

| Aspect | Implementation |
|--------|----------------|
| **Purpose** | Single execution entry point coordinating specialized agents through common contracts |
| **Flow** | User Request → Agent Runtime → Agent Registry → Agent Selection → Agent Execution → Agent Result |
| **Models** | `AgentRuntimeRequest`, `AgentRuntimeResponse`, `AgentRuntimeContext`, `AgentRuntimeState`, `AgentExecutionPlan`, `AgentExecutionResult`, `AgentRuntimeMetadata`, `AgentRuntimeSummary`, `AgentRuntimeSnapshot`, `AgentRuntimeError`, `AgentRuntimeEvent` |
| **Runtime** | `AgentRuntime` — validate → select → plan → execute → collect → immutable response |
| **Registry** | Immutable `AgentRegistry` (register/unregister return new instances; lookup by id / role / capability) |
| **Selectors** | Deterministic `AgentSelector` (role / capability / priority / fallback; no AI) |
| **Coordinators** | `ExecutionCoordinator`, `LifecycleCoordinator`, `ResponseCoordinator`, `EventCoordinator` |
| **Application API** | `executeAgent`, `listAgents`, `describeAgent`, `registerAgent`, `unregisterAgent` |
| **Integration** | Consumes `IAgent` / `WorkoutFrameworkAgent` / `RecoveryFrameworkAgent` without modifying domain agents; optional injectable executors |
| **Design** | **No business logic, providers, networking, persistence, prompts, or memory.** Runtime orchestration only |

Full detail: [AGENT_RUNTIME.md](./AGENT_RUNTIME.md).

### Workout Agent (`features/workout-agent`) — Specialized Framework Agent

| Aspect | Implementation |
|--------|----------------|
| **Purpose** | Specialized framework agent — orchestrates workout planning and existing workout domain engines |
| **Flow** | Agent Runtime → Workout Framework Agent → Planning → Workout Domain → Workout Result |
| **Models** | `WorkoutAgent`, `WorkoutRequest`, `WorkoutContext`, `WorkoutObjective`, `WorkoutIntent`, `WorkoutStrategy`, `WorkoutPlanProposal`, `WorkoutDecision`, `WorkoutRecommendation`, `WorkoutExplanation`, `WorkoutConversation`, `WorkoutAgentResult`, `WorkoutDomainInvocation`, `WorkoutDomainCapability`, `WorkoutAgentSnapshot`, … |
| **Agent** | `WorkoutAgent`, `WorkoutAgentEngine`, `WorkoutAgentCoordinator`, `WorkoutAgentSession`, `WorkoutAgentState` |
| **Framework** | `WorkoutFrameworkAgent` implements `IAgent`; `registerWithFramework` + `registerWithRuntime` |
| **Domain Gateway** | `WorkoutDomainGateway` — selects / invokes Program Generation, Programming, Progression, Training Adaptation, Workout Assembly, Exercise KB, Decision Intelligence |
| **Reasoning** | Exercise / Progression / Volume / Intensity / Fatigue / Frequency / Split / Goal (deterministic, no AI) |
| **Planning** | Workout / Progression / Exercise / Split / Accessory / Deload / Recovery (no execution) |
| **Strategies** | Strength / Hypertrophy / Powerbuilding / Powerlifting / General Fitness |
| **Policies** | Safety / Recovery / Progression / Volume / Exercise |
| **Application API** | `processWorkoutRequest`, `buildWorkoutPlan`, `adaptWorkout`, `evaluateWorkout`, `describeWorkoutCapabilities`, `validateWorkoutPlan` |
| **Integration** | Consumes Conversation Context + existing workout domain application APIs; produces immutable `WorkoutAgentResult`; registers with Agent Framework / Agent Runtime |
| **Design** | **No prompts, provider calls, tool execution, networking, persistence, UI, or business logic.** Orchestrator only — does not replace Workout Domain |

Full detail: [WORKOUT_AGENT.md](./WORKOUT_AGENT.md). Agent Framework: [AGENT_FRAMEWORK.md](./AGENT_FRAMEWORK.md). Agent Runtime: [AGENT_RUNTIME.md](./AGENT_RUNTIME.md). Workout Intelligence: [WORKOUT_INTELLIGENCE.md](./WORKOUT_INTELLIGENCE.md).

### Nutrition Agent (`features/nutrition-agent`) — Specialized Framework Agent

| Aspect | Implementation |
|--------|----------------|
| **Purpose** | Specialized framework agent — orchestrates nutrition planning and Nutrition Domain capabilities |
| **Flow** | Agent Runtime → Nutrition Framework Agent → Nutrition Domain Gateway → Capability Selector → Nutrition Domain → NutritionAgentResult |
| **Models** | `NutritionAgent`, `NutritionAgentRequest`, `NutritionRequest`, `NutritionContext`, `NutritionGoal`, `NutritionIntent`, `NutritionCapability`, `NutritionDomainInvocation`, `NutritionDomainPayloads`, `NutritionEvaluation`, `NutritionPlanSummary`, `NutritionPlan`, `NutritionDecision`, `NutritionRecommendation`, `NutritionExplanation`, `NutritionConversation`, `NutritionAgentResult`, `NutritionAgentSnapshot`, `NutritionMetadata`, … |
| **Agent** | `NutritionAgent`, `NutritionAgentEngine`, `NutritionAgentCoordinator`, `NutritionAgentSession`, `NutritionAgentState` |
| **Framework** | `NutritionFrameworkAgent` implements `IAgent`; optional `registerWithFramework` |
| **Domain Gateway** | `NutritionDomainGateway` — selects / invokes GenerateNutritionPlan, AdjustMacros, AnalyzeNutrition, MealTiming, HydrationGuidance, SupplementGuidance |
| **Capability Selector** | `NutritionCapabilitySelector` — extensible intent → capability matrix |
| **Reasoning** | Calorie / Macro / Meal Timing / Body Composition / Energy Balance / Protein / Carb / Fat / Fiber / Hydration / Supplement / Adherence / Education / Goal (deterministic, no AI) |
| **Planning** | Nutrition / Meal / Macro / Calorie / Hydration / Supplement / Diet Phase / Refeed / Reverse / Cut / Bulk / Maintenance (no execution) |
| **Strategies** | Fat Loss / Muscle Gain / Maintenance / Recomposition / Performance / Powerlifting / Hypertrophy / General Health / Contest Prep |
| **Policies** | Safety / Calorie / Macro / Meal / Hydration / Supplement / Adherence / Recovery Nutrition |
| **Application API** | `processNutritionRequest`, `buildNutritionPlan`, `adjustNutritionPlan`, `evaluateNutrition`, `describeNutritionCapabilities`, `validateNutritionPlan` |
| **Integration** | Consumes Conversation Context + Nutrition Domain port contracts; produces immutable `NutritionAgentResult` (with `domainInvocations`); registers with Agent Framework |
| **Design** | **No prompts, provider calls, tool execution, networking, persistence, UI, or business logic.** Orchestrator only — does not replace Nutrition Domain |

Full detail: [NUTRITION_AGENT.md](./NUTRITION_AGENT.md). Agent Framework: [AGENT_FRAMEWORK.md](./AGENT_FRAMEWORK.md). Agent Runtime: [AGENT_RUNTIME.md](./AGENT_RUNTIME.md). Nutrition Intelligence: [NUTRITION_INTELLIGENCE.md](./NUTRITION_INTELLIGENCE.md).

### Recovery Agent (`features/recovery-agent`) — Sprint 21.3

| Aspect | Implementation |
|--------|----------------|
| **Purpose** | Intelligent recovery specialist — fatigue, readiness, sleep, stress, soreness, workload tolerance, deload / recovery recommendations |
| **Flow** | User Request → Conversation Runtime → Recovery Agent → Coach Intelligence → Prompt Builder → AI Provider → Response Formatter → Action Engine → Tool Runtime → Recovery Domain |
| **Models** | `RecoveryAgent`, `RecoveryRequest`, `RecoveryContext`, `RecoveryGoal`, `RecoveryIntent`, `RecoveryStrategy`, `RecoveryAssessment`, `RecoveryPlan`, `RecoveryDecision`, `RecoveryRecommendation`, `RecoveryExplanation`, `RecoveryConversation`, `RecoveryAgentResult`, `RecoveryAgentSnapshot`, `RecoverySnapshot`, `RecoveryMetadata`, `RecoveryConfidence`, `RecoveryReasoning`, `RecoveryPlanningContext`, `RecoveryPlanningResult`, `RecoveryExecutionContext`, `RecoveryStatistics`, `RecoveryConstraints`, `RecoveryProfile`, `RecoveryIndicators`, `FatigueState`, `ReadinessState`, `SleepProfile`, `StressProfile`, `TrainingLoad`, `RecoveryScore`, `DeloadRecommendation` |
| **Agent** | `RecoveryAgent`, `RecoveryAgentEngine`, `RecoveryAgentCoordinator`, `RecoveryAgentSession`, `RecoveryAgentState` |
| **Framework** | `RecoveryFrameworkAgent` implements `IAgent`; optional `registerWithFramework` |
| **Reasoning** | Fatigue / Readiness / Sleep / Stress / Training Load / DOMS / Recovery Score / Deload / Adaptation / HRV / Wellness / Education / Goal (deterministic, no AI) |
| **Planning** | Recovery / Deload / Sleep / Stress / Readiness / Session / Training Load / Fatigue / Wellness / Protocol (no execution) |
| **Strategies** | Full Recovery / Active Recovery / Sleep Optimization / Fatigue Management / Stress Reduction / Performance / Powerlifting / Hypertrophy / Competition / General Wellness |
| **Policies** | Safety / Recovery / Sleep / Stress / Fatigue / Training Load / Wellness / Deload |
| **Application API** | `processRecoveryRequest`, `buildRecoveryPlan`, `evaluateRecovery`, `describeRecoveryCapabilities`, `validateRecoveryPlan` |
| **Integration** | Consumes Conversation Context / Memory, CoachResponse, ActionPlan, ToolExecutionResult; shared context with Workout / Nutrition Agents; produces immutable `RecoveryAgentResult`; registers with Agent Framework |
| **Design** | **No prompts, provider calls, tool execution, networking, persistence, or UI.** Orchestrator only — does not replace Recovery Domain |

Full detail: [RECOVERY_AGENT.md](./RECOVERY_AGENT.md). Agent Framework: [AGENT_FRAMEWORK.md](./AGENT_FRAMEWORK.md). Agent Runtime: [AGENT_RUNTIME.md](./AGENT_RUNTIME.md). Recovery Intelligence: [RECOVERY_INTELLIGENCE.md](./RECOVERY_INTELLIGENCE.md).

### Coach Agent (`features/coach-agent`) — Sprint 21.3 Meta-Agent

| Aspect | Implementation |
|--------|----------------|
| **Purpose** | Meta-agent that coordinates specialized agents (Workout / Recovery / Nutrition) |
| **Flow** | Agent Runtime → Coach Agent → Agent Coordinator → Workout / Recovery / Nutrition Agents → Merge Results → CoachAgentResult |
| **Models** | `CoachRequest`, `CoachDecision`, `CoachExecutionPlan`, `CoachExecutionContext`, `CoachAgentResult`, `CoachEvaluation`, `CoachSummary`, `CoachMetadata`, `CoachExecutionState`, `CoachExecutionEvent`, `SpecialistAgentKind`, … |
| **Agent** | `CoachAgentEngine`, `CoachAgentFacade`, `CoachCoordinator` |
| **Framework** | `CoachFrameworkAgent` implements `IAgent` (`coach_supervisor`); optional `registerWithFramework` |
| **Selector** | `AgentCapabilityResolver` — intent / hints → one or many specialist agents (future: Sleep / Mobility / Injury / Planning) |
| **Merger** | `CoachResultMerger` — deterministic merge, conflict detection, priority ordering (no AI) |
| **Application API** | `processCoachRequest`, `buildCoachingPlan`, `evaluateCoachDecision`, `describeCoachCapabilities`, `validateCoachPlan` |
| **Integration** | Consumes Workout / Recovery / Nutrition public APIs without modifying them; produces immutable `CoachAgentResult` |
| **Design** | **No business logic, prompts, providers, networking, persistence, or memory.** Orchestration only |

Full detail: [COACH_AGENT.md](./COACH_AGENT.md). Agent Framework: [AGENT_FRAMEWORK.md](./AGENT_FRAMEWORK.md). Agent Runtime: [AGENT_RUNTIME.md](./AGENT_RUNTIME.md).

### Conversation Memory (`features/conversation-memory`) — Sprint 21.4 Foundation

| Aspect | Implementation |
|--------|----------------|
| **Purpose** | Structured coaching knowledge for the Coach Agent (not chat history) |
| **Flow** | Coach Agent → Conversation Memory → Profile / Context / Decision Memory → Memory Snapshot → Memory Result |
| **Models** | `MemoryEntry`, `MemorySnapshot`, `MemoryTimeline`, `MemoryContext`, `MemoryProfile`, `MemoryDecision`, `MemoryQuery`, `MemoryUpdate`, `MemoryResult`, `MemoryEvent`, `MemoryCategory`, `MemoryScope`, `MemoryPriority`, … |
| **Memory** | `ConversationMemory` — validate, resolve category, merge/retain, timeline, snapshot |
| **Stores** | `MemoryStore` / `ProfileStore` / `ContextStore` / `DecisionStore` — contracts only (no persistence implementation) |
| **Queries** | Deterministic `MemoryQueryEngine` (category / identifier / priority / time / scope / latest / historical) |
| **Policies** | Retention / Merge / Conflict — deterministic only |
| **Timeline** | `MemoryTimelineTracker` — ordered immutable events |
| **Application API** | `saveMemory`, `loadMemory`, `queryMemory`, `updateMemory`, `buildMemorySnapshot`, `summarizeMemory` |
| **Integration** | Consumed by Coach Agent / Agent Runtime; future persistence via store ports; does not modify existing agents |
| **Design** | **No AI, prompts, providers, networking, or persistence implementation.** Contracts + orchestration only |

Full detail: [CONVERSATION_MEMORY.md](./CONVERSATION_MEMORY.md). Coach Agent: [COACH_AGENT.md](./COACH_AGENT.md). Agent Runtime: [AGENT_RUNTIME.md](./AGENT_RUNTIME.md).

### Agent Collaboration (`features/agent-collaboration`) — Sprint 21.5 Foundation

| Aspect | Implementation |
|--------|----------------|
| **Purpose** | Deterministic orchestration between Coach Agent and specialist agents |
| **Flow** | Coach Agent → Agent Collaboration → Planning → Dispatch → Execution → Aggregation → Coach Result |
| **Models** | `CollaborationRequest`, `CollaborationPlan`, `CollaborationParticipant`, `CollaborationTask`, `ExecutionBatch`, `ExecutionResult`, `AggregationContext`, `AggregationResult`, `CollaborationSnapshot`, `CollaborationResult`, … |
| **Planning** | `CollaborationPlanner` / `ParticipantSelector` / `ExecutionPlanner` — never executes |
| **Dispatch** | Sequential deterministic `CollaborationDispatcher` (no retries / queues / concurrency) |
| **Execution** | `CollaborationEngine` lifecycle coordination + metadata |
| **Aggregation** | Deterministic merge preserving order, provenance, metadata (no AI / scoring / ranking) |
| **Policies** | Execution ordering / Duplicate handling / Participant eligibility / Aggregation rules |
| **Application API** | `createCollaborationPlan`, `dispatchCollaboration`, `executeCollaboration`, `aggregateResults`, `buildCollaborationSnapshot` |
| **Integration** | Coach Agent consumes results; specialist work via injectable handlers; does not modify existing agents |
| **Design** | **No AI, prompts, providers, networking, persistence, conversation memory, or domain business logic.** Orchestration only |

Full detail: [AGENT_COLLABORATION.md](./AGENT_COLLABORATION.md). Coach Agent: [COACH_AGENT.md](./COACH_AGENT.md). Agent Runtime: [AGENT_RUNTIME.md](./AGENT_RUNTIME.md). ADR-066: [DECISIONS.md](./DECISIONS.md).

### Agent Capability Registry (`features/agent-capability`) — Sprint 21.6 Foundation

| Aspect | Implementation |
|--------|----------------|
| **Purpose** | Decouple Coach / orchestration from concrete specialists via deterministic capability registry |
| **Flow** | Coach Agent → Capability Resolver → Capability Registry → Agent Collaboration → Specialist Agents |
| **Models** | `AgentCapability`, `CapabilityId`, `CapabilityDescriptor`, `CapabilityRegistration`, `CapabilityRegistry`, `CapabilityMatch`, `CapabilityResolution`, `CapabilitySnapshot`, `CapabilityQuery`, `CapabilityResult`, `CapabilityCollection`, … |
| **Registry** | `CapabilityRegistryStore` — registration / lookup / snapshots (never executes) |
| **Resolver** | Deterministic exact-match `CapabilityResolver` (no scoring / ranking / heuristics / AI) |
| **Registration** | `CapabilityRegistrar` — immutable registrations after creation |
| **Querying** | `CapabilityQueryEngine` — find / list / exists (no execution) |
| **Policies** | Duplicate handling / Ownership / Uniqueness / Registry consistency |
| **Application API** | `registerCapability`, `resolveCapability`, `findCapability`, `findCapabilities`, `buildCapabilitySnapshot`, `validateRegistry` |
| **Integration** | Foundation only — does **not** modify Coach Agent or replace collaboration flow yet |
| **Design** | **No AI, prompts, providers, networking, persistence, memory, agent execution, or domain business logic.** Registry only |

Full detail: [AGENT_CAPABILITY.md](./AGENT_CAPABILITY.md). Coach Agent: [COACH_AGENT.md](./COACH_AGENT.md). Agent Collaboration: [AGENT_COLLABORATION.md](./AGENT_COLLABORATION.md). ADR-067: [DECISIONS.md](./DECISIONS.md).

### Supervisor Routing Engine (`features/supervisor-routing`) — Sprint 21.7 Foundation

| Aspect | Implementation |
|--------|----------------|
| **Purpose** | Transform user/coach requests into deterministic multi-agent routing plans |
| **Flow** | User Request → Routing Engine → Capability Registry → Routing Plan → Agent Collaboration → Specialist Agents |
| **Models** | `RoutingRequest`, `RoutingContext`, `RoutingPlan`, `RoutingDecision`, `RoutingTarget`, `RoutingCapability`, `RoutingDependency`, `RoutingPriority`, `RoutingPhase`, `RoutingExecutionOrder`, `RoutingGraph`, `RoutingNode`, `RoutingEdge`, `RoutingStep`, `RoutingSnapshot`, `RoutingResult`, … |
| **Routing** | `RoutingEngine` / `RoutingCoordinator` / session / state — orchestration only (never executes) |
| **Planner** | Capability / Dependency / Priority / Phase / ExecutionOrder / Graph / Routing planners |
| **Resolver** | Exact Capability Registry resolution via `CapabilityRegistryPort` (no ranking / heuristics / AI) |
| **Selectors / Policies** | Capability / Agent / Priority / Dependency / Execution / Phase; Routing / Dependency / Priority / Capability / Execution / Consistency |
| **Application API** | `buildRoutingPlan`, `resolveRouting`, `validateRoutingPlan`, `describeRouting`, `buildRoutingSnapshot` |
| **Integration** | Foundation only — consumes Capability Registry; does **not** modify Coach Agent or run Collaboration yet |
| **Design** | **No AI, prompts, providers, networking, persistence, agent execution, collaboration execution, or domain business logic.** Routing only |

Full detail: [SUPERVISOR_ROUTING.md](./SUPERVISOR_ROUTING.md). Multi-Agent Routing: [MULTI_AGENT_ROUTING.md](./MULTI_AGENT_ROUTING.md). Supervisor Runtime: [SUPERVISOR_RUNTIME.md](./SUPERVISOR_RUNTIME.md). ADR-068: [DECISIONS.md](./DECISIONS.md).

### Coach Supervisor (`features/coach-supervisor`) — Sprint 21.8 Foundation

| Aspect | Implementation |
|--------|----------------|
| **Purpose** | Central orchestrator of EVOLVE multi-agent workflow → unified coach response |
| **Flow** | User Request → Coach Supervisor → Routing → Capability Registry → Collaboration → Specialists → Aggregation → UnifiedCoachResponse |
| **Models** | `CoachSupervisorRequest`, `CoachSupervisorContext`, `CoachSupervisorPlan`, `CoordinationPlan`, `AggregationResult`, `UnifiedCoachResponse`, `CoachSupervisorResult`, … |
| **Supervisor** | `CoachSupervisorEngine` / `CoachCoordinator` / session / state — orchestration only |
| **Planning / Coordination** | Deterministic planners + Routing / Agent / Capability / Dependency / Execution coordinators |
| **Aggregation** | Result / Response / Conflict / Explanation / Summary / Diagnostics aggregators (no AI) |
| **Framework** | `CoachSupervisorFrameworkAgent` (`IAgent`, role `coach_supervisor`) |
| **Application API** | `processCoachRequest`, `buildCoordinationPlan`, `aggregateResults`, `describeSupervisorCapabilities`, `validateSupervisorPlan` |
| **Integration** | Consumes Routing + Collaboration via ports; no specialist business logic |
| **Design** | **No AI, prompts, providers, networking, persistence, UI, or domain business logic.** Orchestration only |

Full detail: [COACH_SUPERVISOR.md](./COACH_SUPERVISOR.md). Supervisor Runtime: [SUPERVISOR_RUNTIME.md](./SUPERVISOR_RUNTIME.md). Multi-Agent Runtime: [MULTI_AGENT_RUNTIME.md](./MULTI_AGENT_RUNTIME.md). Agent Platform: [AGENT_PLATFORM.md](./AGENT_PLATFORM.md). ADR-069: [DECISIONS.md](./DECISIONS.md).

### Coaching Session Runtime (`features/coaching-session`) — Sprint 22.0

| Aspect | Implementation |
|--------|----------------|
| **Purpose** | Complete coaching interaction lifecycle between Conversation Runtime and Coach Supervisor |
| **Flow** | User → Conversation Runtime → Coaching Session Runtime → Coach Supervisor → Multi-Agent Platform → Unified Coach Response → SessionResult |
| **Models** | `CoachingSession`, `SessionContext`, `SessionState`, `SessionRequest`, `SessionResponse`, `SessionHistory`, `SessionSnapshot`, `SessionResult`, … |
| **Session** | `CoachingSessionEngine` / `SessionCoordinator` / `SessionManager` / state machine / lifecycle manager — orchestration only |
| **Context** | Immutable context / history / checkpoint builders (no persistence) |
| **Planning** | Deterministic Session / Interaction / Continuation / Context / Response planners (no AI) |
| **Application API** | `startSession`, `continueSession`, `endSession`, `describeSession`, `validateSession` |
| **Integration** | Consumes Conversation Runtime + Coach Supervisor via ports; produces `SessionResult` / `SessionContext` / `SessionSummary` |
| **Design** | **No AI, prompts, providers, networking, persistence, UI, Tool Runtime, or domain business logic.** Session orchestration only |

Full detail: [COACHING_SESSION_RUNTIME.md](./COACHING_SESSION_RUNTIME.md). Session Lifecycle: [SESSION_LIFECYCLE.md](./SESSION_LIFECYCLE.md). AI Runtime: [AI_RUNTIME.md](./AI_RUNTIME.md). ADR-070: [DECISIONS.md](./DECISIONS.md).

### Athlete State Engine (`features/athlete-state`) — Sprint 22.1

| Aspect | Implementation |
|--------|----------------|
| **Purpose** | Single immutable source of truth for current athlete state |
| **Flow** | Specialist Agents → Athlete State Engine → Coach Supervisor Context → Unified Coach Response |
| **Models** | `AthleteState`, `AthleteSnapshot`, `AthleteHistory`, `AthleteTimeline`, `StateSummary`, `CoachSupervisorContext`, … |
| **State** | `AthleteStateEngine` / `AthleteStateCoordinator` / `AthleteStateManager` — orchestration only |
| **Aggregation** | Deterministic profile / training / recovery / nutrition / performance / lifestyle / goal / progress / history aggregators |
| **Evolution** | Version manager, transition planner, change tracker, snapshot / timeline builders |
| **Application API** | `buildAthleteState`, `updateAthleteState`, `createSnapshot`, `describeAthleteState`, `validateAthleteState` |
| **Integration** | Consumes Workout / Nutrition / Recovery / Goal / Coaching Session via ports; produces `AthleteState` / `AthleteSnapshot` / `StateSummary` / `CoachSupervisorContext` |
| **Design** | **No AI, prompts, providers, networking, persistence, UI, or business calculations.** State management only |

Full detail: [ATHLETE_STATE_ENGINE.md](./ATHLETE_STATE_ENGINE.md). State Management: [STATE_MANAGEMENT.md](./STATE_MANAGEMENT.md). Agent Platform: [AGENT_PLATFORM.md](./AGENT_PLATFORM.md). ADR-071: [DECISIONS.md](./DECISIONS.md).

### Context Fusion Engine (`features/context-fusion`) — Sprint 22.2

| Aspect | Implementation |
|--------|----------------|
| **Purpose** | Single immutable fused coaching context from all runtime sources |
| **Flow** | Conversation + Session + Athlete State + Agents + Supervisor → Context Fusion Engine → UnifiedCoachingContext → Decision Engine |
| **Models** | `UnifiedCoachingContext`, `ContextSnapshot`, `ContextSummary`, `ContextPackage`, `DecisionEngineContext`, … |
| **Fusion** | `ContextFusionEngine` / `ContextFusionCoordinator` / `ContextFusionSession` — fusion only |
| **Aggregation** | Deterministic conversation / session / athlete / workout / nutrition / recovery / goal / supervisor aggregators |
| **Resolution** | Priority / source / version / conflict / merge resolvers (deterministic) |
| **Application API** | `buildUnifiedContext`, `mergeContexts`, `validateUnifiedContext`, `describeContext`, `createContextSnapshot` |
| **Integration** | Consumes Conversation / Session / Athlete State / Workout / Nutrition / Recovery / Goal / Supervisor via ports; produces `UnifiedCoachingContext` / `ContextSnapshot` / `ContextSummary` / `DecisionEngineContext` |
| **Design** | **No AI, prompts, providers, networking, persistence, UI, Tool Runtime, or business calculations.** Context fusion only |

Full detail: [CONTEXT_FUSION_ENGINE.md](./CONTEXT_FUSION_ENGINE.md). Decision Pipeline: [DECISION_PIPELINE.md](./DECISION_PIPELINE.md). State Management: [STATE_MANAGEMENT.md](./STATE_MANAGEMENT.md). ADR-072: [DECISIONS.md](./DECISIONS.md).

### Decision Engine (`features/decision-engine`) — Sprint 22.3

| Aspect | Implementation |
|--------|----------------|
| **Purpose** | Deterministic orchestration from fused context to immutable coaching decisions |
| **Flow** | UnifiedCoachingContext → Decision Engine → CoachingDecision → RecommendationEngineInput → Coach Supervisor |
| **Models** | `CoachingDecision`, `DecisionCandidate`, `DecisionPackage`, `DecisionGraph`, `DecisionPlan`, `RecommendationEngineInput`, … |
| **Engine** | `DecisionEngine` / `DecisionCoordinator` / `DecisionSession` — orchestration only |
| **Analysis** | Deterministic training / nutrition / recovery / goal / lifestyle / risk / priority / dependency / context analysis |
| **Evaluation / Planning / Resolution** | Fixed-table evaluators, planners (no execution), deterministic resolvers |
| **Application API** | `buildDecision`, `evaluateDecision`, `resolveDecision`, `describeDecision`, `validateDecision` |
| **Integration** | Consumes Context Fusion / Athlete State / Coach Supervisor via ports; produces `CoachingDecision` / `DecisionPackage` / `RecommendationEngineInput` |
| **Design** | **No AI, NL, prompts, providers, networking, persistence, UI, Tool Runtime, Action Engine, or domain calculations.** Decision orchestration only |

Full detail: [DECISION_ENGINE.md](./DECISION_ENGINE.md). Decision Pipeline: [DECISION_PIPELINE.md](./DECISION_PIPELINE.md). ADR-073: [DECISIONS.md](./DECISIONS.md).

### Recommendation Engine (`features/recommendation-engine`) — Sprint 22.4

| Aspect | Implementation |
|--------|----------------|
| **Purpose** | Deterministic orchestration from immutable coaching decisions to structured recommendations |
| **Flow** | CoachingDecision → Recommendation Engine → CoachingRecommendation → ExplainabilityInput → Coach Supervisor |
| **Models** | `CoachingRecommendation`, `RecommendationPackage`, `RecommendationPlan`, `RecommendationView`, `ExplainabilityInput`, … |
| **Engine** | `RecommendationEngine` / `RecommendationCoordinator` / `RecommendationSession` — orchestration only |
| **Planning / Prioritization / Packaging** | Fixed-table planners, resolvers, structured packagers (no NL, no execution) |
| **Application API** | `buildRecommendations`, `prioritizeRecommendations`, `packageRecommendations`, `describeRecommendations`, `validateRecommendations` |
| **Integration** | Consumes Decision Engine / Context Fusion / Athlete State / Coach Supervisor via ports; produces `CoachingRecommendation` / `RecommendationPackage` / `ExplainabilityInput` |
| **Design** | **No AI, NL, prompts, providers, networking, persistence, UI, Tool Runtime, Action Engine, or domain calculations.** Recommendation orchestration only |

Full detail: [RECOMMENDATION_ENGINE.md](./RECOMMENDATION_ENGINE.md). Decision Pipeline: [DECISION_PIPELINE.md](./DECISION_PIPELINE.md). ADR-074: [DECISIONS.md](./DECISIONS.md).

### Explainability Engine (`features/explainability-engine`) — Sprint 22.5

| Aspect | Implementation |
|--------|----------------|
| **Purpose** | Deterministic orchestration from immutable decisions / recommendations into structured explanations |
| **Flow** | CoachingRecommendation → Explainability Engine → CoachingExplanation → LLMFormatterInput → Coach Supervisor / LLM Response Formatter |
| **Models** | `CoachingExplanation`, `ExplanationPackage`, `ExplanationGraph`, `ExplanationTrace`, `ExplanationEvidence`, `LLMFormatterInput`, … |
| **Engine** | `ExplainabilityEngine` / `ExplainabilityCoordinator` / `ExplainabilitySession` — orchestration only |
| **Evidence / Reasoning / Trace** | Deterministic evidence gatherers, reasoning trace modules, trace / graph builders (no AI, no NL) |
| **Application API** | `buildExplanation`, `validateExplanation`, `describeExplanation`, `createExplanationSnapshot`, `packageExplanation` |
| **Integration** | Consumes Decision Engine / Recommendation Engine / Context Fusion / Athlete State / Coach Supervisor via ports; produces `CoachingExplanation` / `ExplanationPackage` / `LLMFormatterInput` |
| **Design** | **No AI, NL, prompts, providers, networking, persistence, UI, Tool Runtime, Action Engine, or domain calculations.** Explanation orchestration only |

Full detail: [EXPLAINABILITY_ENGINE.md](./EXPLAINABILITY_ENGINE.md). Reasoning Pipeline: [REASONING_PIPELINE.md](./REASONING_PIPELINE.md). Decision Pipeline: [DECISION_PIPELINE.md](./DECISION_PIPELINE.md). ADR-075: [DECISIONS.md](./DECISIONS.md).

### Continuous Adaptation Engine (`features/continuous-adaptation`) — Sprint 23.1

| Aspect | Implementation |
|--------|----------------|
| **Purpose** | Deterministic detection of meaningful adaptation opportunities over time |
| **Flow** | Athlete State + Context Fusion + Decision + Recommendation + Explainability → Continuous Adaptation Engine → `AdaptationDecision` → Workout / Nutrition / Recovery / Goal Progress Adaptation Engines (handoff inputs) |
| **Models** | `AdaptationDecision`, `AdaptationPackage`, `AdaptationOpportunity`, `AdaptationTrigger`, `AdaptationTimeline`, `WorkoutAdaptationInput`, … |
| **Engine** | `ContinuousAdaptationEngine` / `AdaptationCoordinator` / `AdaptationSession` — detection orchestration only |
| **Monitoring / Detection / Evaluation** | Deterministic monitors, detectors, evaluators, comparators, timeline builders (no AI, no prediction, no plan mutation) |
| **Application API** | `evaluateAdaptation`, `detectAdaptation`, `describeAdaptation`, `createAdaptationSnapshot`, `validateAdaptation` |
| **Integration** | Consumes Athlete State / Context Fusion / Decision / Recommendation / Explainability via ports; produces `AdaptationDecision` / handoff inputs |
| **Design** | **No AI, prompts, providers, networking, persistence, UI, Tool Runtime, Action Engine, recommendation generation, plan mutation, or domain calculations.** Adaptation detection only |

Full detail: [CONTINUOUS_ADAPTATION_ENGINE.md](./CONTINUOUS_ADAPTATION_ENGINE.md). Adaptive Coaching: [ADAPTIVE_COACHING.md](./ADAPTIVE_COACHING.md). Reasoning Pipeline: [REASONING_PIPELINE.md](./REASONING_PIPELINE.md). ADR-076: [DECISIONS.md](./DECISIONS.md).

### Workout Adaptation Engine (`features/workout-adaptation`) — Sprint 24.1

| Aspect | Implementation |
|--------|----------------|
| **Purpose** | Deterministic adaptation of an existing workout blueprint according to Continuous Adaptation decisions |
| **Flow** | Workout Blueprint + Workout Runtime + Athlete State + Continuous Adaptation Decision + Coach Context → Workout Adaptation Engine → `UpdatedWorkoutBlueprint` → Workout Runtime |
| **Models** | `WorkoutAdaptation`, `WorkoutModification`, `UpdatedWorkoutBlueprint`, `WorkoutPackage`, `WorkoutSnapshot`, `WorkoutRuntimeInput`, … |
| **Engine** | `WorkoutAdaptationEngine` / `WorkoutAdaptationCoordinator` / `WorkoutAdaptationSession` — adaptation orchestration only |
| **Evaluation / Planning / Adapters** | Deterministic evaluators, planners, and adapters (key → modification records; no generation, no AI) |
| **Application API** | `adaptWorkout`, `compareWorkout`, `describeWorkoutAdaptation`, `createWorkoutSnapshot`, `validateWorkoutAdaptation` |
| **Integration** | Consumes Blueprint / Runtime / Athlete State / Continuous Adaptation / Coach Context via ports; produces `UpdatedWorkoutBlueprint` / `WorkoutAdaptationPackage` / `WorkoutRuntimeInput` |
| **Design** | **No AI, prompts, providers, networking, persistence, UI, Tool Runtime, Action Engine, workout generation, or athlete goal changes.** Blueprint adaptation only |

Full detail: [WORKOUT_ADAPTATION_ENGINE.md](./WORKOUT_ADAPTATION_ENGINE.md). Workout Pipeline: [WORKOUT_PIPELINE.md](./WORKOUT_PIPELINE.md). Adaptive Coaching: [ADAPTIVE_COACHING.md](./ADAPTIVE_COACHING.md). ADR-077: [DECISIONS.md](./DECISIONS.md).

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
