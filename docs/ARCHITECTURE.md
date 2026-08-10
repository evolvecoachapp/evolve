# EVOLVE Architecture

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-29  
**Purpose:** Concise system architecture — layers, patterns, dependency flow.  
**Source of Truth:** Partial — summary only; deep reference is [EVOLVE_ARCHITECTURE.md](../.cursor/rules/EVOLVE_ARCHITECTURE.md). Architecture consolidation: [ARCHITECTURE_REVIEW.md](./ARCHITECTURE_REVIEW.md) (Sprint 30.7 / ADR-105).

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
Coach Agent                      ← Sprint 21.3 (deprecated Sprint 23.2 — superseded by Coach Supervisor pipeline)
  (`app/src/features/coach-agent/`)
  ↓
Coaching Session Runtime         ← Sprint 22.0 (implemented) — session lifecycle between Conversation Runtime and Coach Supervisor
Explainable Coaching Session     ← Sprint 26.1 product (implemented) — compose existing evidence into immutable session artifacts
  (`app/src/features/coaching-session/`)
  ↓
Home Experience                  ← Sprint 27.1 product (implemented) — compose coaching knowledge into Home dashboard experience
  (`app/src/features/home-experience/`)
  ↓
Athlete Daily Brief              ← Sprint 27.2 product (implemented) — compose coaching knowledge into deterministic daily brief
  (`app/src/features/daily-brief/`)
  ↓
Weekly Coach Report              ← Sprint 27.3 product (implemented) — compose week into deterministic coaching review
  (`app/src/features/weekly-report/`)
  ↓
Athlete Intelligence Workspace   ← Sprint 28.1 product (implemented) — single immutable premium coaching read model
  (`app/src/features/intelligence-workspace/`)
  ↓
Athlete Snapshot                 ← Sprint 28.2 product (implemented) — immutable point-in-time athlete representation
  (`app/src/features/athlete-snapshot/`)
  ↓
Unified Athlete Workspace        ← Sprint 28.3 product (implemented) — canonical immutable athlete read model
  (`app/src/features/unified-workspace/`)
  ↓
Athlete Identity Foundation      ← Sprint 29.1 product (implemented) — immutable identity layer for production features
  (`app/src/features/athlete-identity/`)
  ↓
Runtime Environment Foundation   ← Sprint 29.2 product (implemented) — immutable execution-environment layer for production features
  (`app/src/features/runtime-environment/`)
  ↓
Persistence Contract Foundation  ← Sprint 29.3 product (implemented) — immutable persistence contracts for future adapters
  (`app/src/core/persistence/`)
  ↓
Infrastructure Adapter Contracts ← Sprint 29.4 product (implemented) — immutable infrastructure adapter contracts for future external services
  (`app/src/core/infrastructure/`)
  ↓
SQLite Infrastructure Adapter   ← Sprint 30.1 product (implemented) — first production SQLite storage adapter behind Persistence Contracts
  (`app/src/infrastructure/sqlite/`)
  ↓
Repository Adapter Integration  ← Sprint 30.2 product (implemented) — Persistence Contracts bound to SQLite repositories via adapters
  (`app/src/infrastructure/repositories/`)
  ↓
Authentication Adapter Foundation ← Sprint 30.3 product (implemented) — first Mock Authentication Adapter behind Authentication Contracts
  (`app/src/infrastructure/authentication/`)
  ↓
Synchronization Adapter Foundation ← Sprint 30.4 product (implemented) — deterministic Synchronization Engine behind Synchronization Contracts
  (`app/src/infrastructure/synchronization/`)
  ↓
Backend API Adapter Foundation ← Sprint 30.5 product (implemented) — first Mock Backend API Adapter behind Backend API Contracts
  (`app/src/infrastructure/backend/`)
  ↓
Logging & Observability Adapter Foundation ← Sprint 30.6 product (implemented) — first Mock Logger behind Logging Contracts
  (`app/src/infrastructure/logging/`)
  ↓
Architecture Consolidation       ← Sprint 30.7 product (implemented) — architecture review & production-readiness audit (no features)
  (`docs/ARCHITECTURE_REVIEW.md`)
  ↓
Home Dashboard                   ← Sprint 31.1 product (implemented) — operational Home UI via ViewModel → Application → HomeService
  (`app/src/features/home/`)
  ↓
Workout Runtime Experience       ← Sprint 31.2 product (implemented) — operational Workout execution UI via ViewModel → Application → ExperienceService
  (`app/src/features/workout-runtime/` experience layer; engine foundation unchanged)
  ↓
Coach Experience                 ← Sprint 31.3 product (implemented) — flagship contextual AI Coach UI via ViewModel → Application → ExperienceService
  (`app/src/features/coach-experience/`)
  ↓
Progress Experience              ← Sprint 31.4 product (implemented) — athlete analytics dashboard via ViewModel → Application → ExperienceService
  (`app/src/features/progress-experience/`)
  ↓
Nutrition Experience             ← Sprint 31.5 product (implemented) — daily nutrition command center via ViewModel → Application → ExperienceService
  (`app/src/features/nutrition-experience/`)
  ↓
Progress & Analytics Framework   ← Sprint 31.8 product (implemented) — deterministic analytics domain via ViewModel → Application → ProgressAnalyticsService
  (`app/src/features/progress-analytics/`)
  ↓
Coach Timeline Framework         ← Sprint 31.9 product (implemented) — deterministic athlete-event timeline via ViewModel → Application → CoachTimelineFrameworkService
  (`app/src/features/coach-timeline/`)
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
Composition Root coaching wiring ← Sprint 23.1 + 23.2 (implemented) — DI integration; legacy decisionEngine/recommendations/coach-agent reduced to facades
  (`app/src/core/composition/`)
  ↓
Intelligent Workout Generation Pipeline ← Sprint 24.1 product (implemented) — UnifiedCoachingContext path → canonical WorkoutPlan
  (`app/src/features/workout-generation-pipeline/`)
  ↓
Intelligent Coach Conversation ← Sprint 24.2 product (implemented) — conversation + WorkoutPlan explanations via existing coaching pipeline
  (`app/src/features/coach-conversation/`)
  ↓
Adaptive Workout Modification ← Sprint 24.3 product (implemented) — living WorkoutPlan via surgical modification (no full regeneration)
  (`features/workout-generation-pipeline` modification path + `features/coach-conversation`)
  ↓
Workout Adaptation Engine        ← Sprint 24.1 engine (implemented) — adapt existing Workout Blueprint → UpdatedWorkoutBlueprint
  (`app/src/features/workout-adaptation/`)
  ↓
Nutrition Adaptation Engine      ← Sprint 24.2 engine (implemented) — adapt existing Nutrition Plan → UpdatedNutritionPlan
  (`app/src/features/nutrition-adaptation/`)
  ↓
Recovery Adaptation Engine       ← Sprint 24.3 engine (implemented) — adapt existing Recovery Plan → UpdatedRecoveryPlan
  (`app/src/features/recovery-adaptation/`)
  ↓
Goal Progress Engine             ← Sprint 24.4 (implemented) — evaluate goal progress → GoalProgressState
  (`app/src/features/goal-progress/`)
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

Full runtime detail: [AI_SYSTEM.md](./AI_SYSTEM.md). AI Runtime: [AI_RUNTIME.md](./AI_RUNTIME.md). Integration tests: [INTEGRATION_TESTING.md](./INTEGRATION_TESTING.md). DI: [COMPOSITION_ROOT.md](./COMPOSITION_ROOT.md). Decision Intelligence: [DECISION_INTELLIGENCE.md](./DECISION_INTELLIGENCE.md). Decision Pipeline: [DECISION_PIPELINE.md](./DECISION_PIPELINE.md). Workout Runtime: [WORKOUT_RUNTIME.md](./WORKOUT_RUNTIME.md). Rest Runtime: [REST_RUNTIME.md](./REST_RUNTIME.md). Domain Events: [DOMAIN_EVENTS.md](./DOMAIN_EVENTS.md). Performance Engine: [PERFORMANCE_ENGINE.md](./PERFORMANCE_ENGINE.md). Achievement Engine: [ACHIEVEMENT_ENGINE.md](./ACHIEVEMENT_ENGINE.md). Athlete History: [ATHLETE_HISTORY.md](./ATHLETE_HISTORY.md). Athlete State Engine: [ATHLETE_STATE_ENGINE.md](./ATHLETE_STATE_ENGINE.md). Context Fusion Engine: [CONTEXT_FUSION_ENGINE.md](./CONTEXT_FUSION_ENGINE.md). Decision Engine: [DECISION_ENGINE.md](./DECISION_ENGINE.md). Recommendation Engine: [RECOMMENDATION_ENGINE.md](./RECOMMENDATION_ENGINE.md). Explainability Engine: [EXPLAINABILITY_ENGINE.md](./EXPLAINABILITY_ENGINE.md). Continuous Adaptation Engine: [CONTINUOUS_ADAPTATION_ENGINE.md](./CONTINUOUS_ADAPTATION_ENGINE.md). Workout Generation Pipeline: [WORKOUT_PIPELINE.md](./WORKOUT_PIPELINE.md). Coach Conversation: [COACH_CONVERSATION.md](./COACH_CONVERSATION.md). Workout Adaptation Engine: [WORKOUT_ADAPTATION_ENGINE.md](./WORKOUT_ADAPTATION_ENGINE.md). Workout Pipeline: [WORKOUT_PIPELINE.md](./WORKOUT_PIPELINE.md). Nutrition Adaptation Engine: [NUTRITION_ADAPTATION_ENGINE.md](./NUTRITION_ADAPTATION_ENGINE.md). Nutrition Pipeline: [NUTRITION_PIPELINE.md](./NUTRITION_PIPELINE.md). Recovery Adaptation Engine: [RECOVERY_ADAPTATION_ENGINE.md](./RECOVERY_ADAPTATION_ENGINE.md). Recovery Pipeline: [RECOVERY_PIPELINE.md](./RECOVERY_PIPELINE.md). Goal Progress Engine: [GOAL_PROGRESS_ENGINE.md](./GOAL_PROGRESS_ENGINE.md). Goal Evaluation Pipeline: [GOAL_EVALUATION_PIPELINE.md](./GOAL_EVALUATION_PIPELINE.md). Adaptive Coaching: [ADAPTIVE_COACHING.md](./ADAPTIVE_COACHING.md). Reasoning Pipeline: [REASONING_PIPELINE.md](./REASONING_PIPELINE.md). State Management: [STATE_MANAGEMENT.md](./STATE_MANAGEMENT.md). Recovery Intelligence: [RECOVERY_INTELLIGENCE.md](./RECOVERY_INTELLIGENCE.md). Insight Engine: [INSIGHT_ENGINE.md](./INSIGHT_ENGINE.md). Coach Intelligence: [COACH_INTELLIGENCE.md](./COACH_INTELLIGENCE.md). Conversation Orchestrator: [CONVERSATION_ORCHESTRATOR.md](./CONVERSATION_ORCHESTRATOR.md). Prompt Builder: [PROMPT_BUILDER.md](./PROMPT_BUILDER.md). Prompt Composition: [PROMPT_COMPOSITION.md](./PROMPT_COMPOSITION.md). AI Provider Abstraction: [AI_PROVIDER_ABSTRACTION.md](./AI_PROVIDER_ABSTRACTION.md). OpenAI Provider: [OPENAI_PROVIDER.md](./OPENAI_PROVIDER.md). AI Execution Pipeline: [AI_EXECUTION_PIPELINE.md](./AI_EXECUTION_PIPELINE.md). Streaming Foundation: [STREAMING_FOUNDATION.md](./STREAMING_FOUNDATION.md). Tool Calling Foundation: [TOOL_CALLING_FOUNDATION.md](./TOOL_CALLING_FOUNDATION.md). Domain Tool Adapters: [DOMAIN_TOOL_ADAPTERS.md](./DOMAIN_TOOL_ADAPTERS.md). Response Formatter: [RESPONSE_FORMATTER.md](./RESPONSE_FORMATTER.md). Action Engine: [ACTION_ENGINE.md](./ACTION_ENGINE.md). Tool Runtime: [TOOL_RUNTIME.md](./TOOL_RUNTIME.md). Agent Framework: [AGENT_FRAMEWORK.md](./AGENT_FRAMEWORK.md). Agent Lifecycle: [AGENT_LIFECYCLE.md](./AGENT_LIFECYCLE.md). Agent Registry: [AGENT_REGISTRY.md](./AGENT_REGISTRY.md). Workout Agent: [WORKOUT_AGENT.md](./WORKOUT_AGENT.md). Nutrition Agent: [NUTRITION_AGENT.md](./NUTRITION_AGENT.md). Recovery Agent: [RECOVERY_AGENT.md](./RECOVERY_AGENT.md). Coach Agent: [COACH_AGENT.md](./COACH_AGENT.md). Coaching Session Runtime: [COACHING_SESSION_RUNTIME.md](./COACHING_SESSION_RUNTIME.md). Session Lifecycle: [SESSION_LIFECYCLE.md](./SESSION_LIFECYCLE.md). Coach Supervisor: [COACH_SUPERVISOR.md](./COACH_SUPERVISOR.md). Supervisor Routing: [SUPERVISOR_ROUTING.md](./SUPERVISOR_ROUTING.md). Multi-Agent Routing: [MULTI_AGENT_ROUTING.md](./MULTI_AGENT_ROUTING.md). Multi-Agent Runtime: [MULTI_AGENT_RUNTIME.md](./MULTI_AGENT_RUNTIME.md). Supervisor Runtime: [SUPERVISOR_RUNTIME.md](./SUPERVISOR_RUNTIME.md). Agent Platform: [AGENT_PLATFORM.md](./AGENT_PLATFORM.md). Agent Capability: [AGENT_CAPABILITY.md](./AGENT_CAPABILITY.md). Agent Collaboration: [AGENT_COLLABORATION.md](./AGENT_COLLABORATION.md). Conversation Memory: [CONVERSATION_MEMORY.md](./CONVERSATION_MEMORY.md). Agent Runtime: [AGENT_RUNTIME.md](./AGENT_RUNTIME.md). Workout Intelligence: [WORKOUT_INTELLIGENCE.md](./WORKOUT_INTELLIGENCE.md). Nutrition Intelligence: [NUTRITION_INTELLIGENCE.md](./NUTRITION_INTELLIGENCE.md).

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

### Composition Root & Dependency Injection (`core/composition`) — Sprint 17.9 + 23.1 + Phase 29–30

| Aspect | Implementation |
|--------|----------------|
| **Purpose** | Centralized object creation and dependency wiring for pipeline + foundation services |
| **Flow** | Application → Composition Root → `ApplicationContainer` → `ServiceRegistry` → Factories + thin adapters → Feature Services / Infrastructure Adapters |
| **Container** | Register / resolve, singleton + transient lifecycles, freeze after init, duplicate/missing/circular/late validation |
| **Registry** | Typed `ServiceMap` (55 tokens): Training Intelligence, Coaching Architecture, Persistence/Infrastructure contracts, SQLite, Repository Adapters, Auth, Sync, Backend, Logging |
| **Factories** | Creation-only factories (no business logic); Phase 29–30 composition factories wrap infrastructure factories |
| **Adapters** | Thin port adapters between coaching modules + legacy Recommendation Engine bridge (`RecommendationEngineBridge` / `DefaultRecommendationService` facade) |
| **Providers** | Configuration, in-memory training repositories, default strategies |
| **Infrastructure wiring** | `PersistenceContractsFactory`, `InfrastructureAdapterFactory`, `SQLiteAdapterFactory`, `RepositoryAdapterFactory`, `AuthenticationFactory`, `SynchronizationFactory`, `BackendFactory`, `LoggerFactory` |
| **Application API** | Use-cases / Coach / Dashboard resolve defaults via `resolveService(token)` — no manual `new` |
| **Design** | **Wiring only.** Factories create objects; no AI/business logic in the Composition Root. Persistence/infra adapters are owned here; Domain never imports them. |

Full detail: [COMPOSITION_ROOT.md](./COMPOSITION_ROOT.md). Consolidation: [ARCHITECTURE_REVIEW.md](./ARCHITECTURE_REVIEW.md).

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

### Coach Agent (`features/coach-agent`) — Sprint 21.3 Meta-Agent (**deprecated**)

| Aspect | Implementation |
|--------|----------------|
| **Status** | **Deprecated (Sprint 23.2).** Superseded by Composition Root: Coaching Session → Coach Supervisor → Supervisor Routing → Agent Collaboration. Not registered in DI; no production app call sites. Retained for compatibility / unit tests only. |
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
| **Replacement** | Prefer `resolveService("CoachSupervisorService")` / `resolveService("CoachingSessionService")` |

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

### Intelligent Coach Conversation (`features/coach-conversation`) — Sprint 24.2 product

| Aspect | Implementation |
|--------|----------------|
| **Purpose** | Conversational coaching experience grounded in active WorkoutPlan + session context |
| **Flow** | Conversation → Intent Routing → Coaching Session → Supervisor Routing → Coach Supervisor → WorkoutPlan + Recommendations + Memory → Explainable Coaching Session → coaching response |
| **Models** | `CoachConversationRequest`, `CoachConversationResult`, `CoachConversationIntent`, `CoachConversationContext`, `CoachConversationResponse` |
| **Orchestration** | `CoachConversationOrchestrator` / `CoachConversationService` — product orchestration only |
| **Application API** | `processCoachConversationTurn`, `attachWorkoutPlanToConversation` |
| **Integration** | Composition Root `CoachConversationService`; Coach Screen Generate Workout → attach plan → natural conversation; Sprint 26.1 explainable session on every turn |
| **Design** | **No new engines.** Reuses Session, Supervisor Routing, Supervisor, Conversation Memory, WorkoutPlan, Timeline, Insights, Explainable Session |

Full detail: [COACH_CONVERSATION.md](./COACH_CONVERSATION.md). Workout Pipeline: [WORKOUT_PIPELINE.md](./WORKOUT_PIPELINE.md). ADR-081: [DECISIONS.md](./DECISIONS.md).

### Adaptive Workout Modification — Sprint 24.3 product

| Aspect | Implementation |
|--------|----------------|
| **Purpose** | Modify the active `WorkoutPlan` through natural coaching requests without regenerating the entire program |
| **Flow** | WorkoutPlan → Modification Request → Workout Agent → Plan Validation → Updated WorkoutPlan → Conversation Reply |
| **Models** | `WorkoutModificationRequest`, `WorkoutModificationResult`, `WorkoutModificationKind`, `WorkoutModificationChange` |
| **Orchestration** | Pipeline `modifyWorkoutPlan` + Coach Conversation `WORKOUT_MODIFICATION` intent — product orchestration only |
| **Application API** | `modifyWorkoutPlan`, `validateAdaptedWorkoutPlan`; conversation replies explain what changed / preserved / progression / recovery impact |
| **Integration** | Composition Root injects `WorkoutGenerationPipelineService` into `CoachConversationService`; Coach Screen Generate → Modify (chat) → Updated plan continuity |
| **Design** | **No new engines.** Surgical edits only. Preserves progression week, recommendations, decision package, and ordering when possible |

Full detail: [WORKOUT_PIPELINE.md](./WORKOUT_PIPELINE.md). Coach Conversation: [COACH_CONVERSATION.md](./COACH_CONVERSATION.md). ADR-082: [DECISIONS.md](./DECISIONS.md).

### Plan History (`features/plan-history`) — Sprint 25.2 foundation

| Aspect | Implementation |
|--------|----------------|
| **Purpose** | Append-only immutable versioned snapshots for Workout and Nutrition lineages |
| **Flow** | Plan publish → PlanSnapshot + PlanVersion → lineage history |
| **Models** | `PlanHistory`, `PlanSnapshot`, `PlanVersion`, `PlanChangeReason`, `PlanType` |
| **Service** | `PlanHistoryService` / `PlanHistoryStore` — in-memory only |
| **Application API** | `publishPlanVersion`, `getPlanHistory` |
| **Integration** | Composition Root `PlanHistoryService`; consumed by Coach Conversation + Plan Restore |
| **Design** | **No persistence, no engines, no mutation of prior versions** |

Full detail: [PLAN_HISTORY.md](./PLAN_HISTORY.md). ADR-083: [DECISIONS.md](./DECISIONS.md).

### Immutable Plan Restore (`features/plan-restore`) — Sprint 25.3 product

| Aspect | Implementation |
|--------|----------------|
| **Purpose** | Restore any prior plan snapshot by publishing it as a brand-new version |
| **Flow** | Resolve Target → Preview → Validate → Restore Snapshot → Publish New Version |
| **Models** | `PlanRestoreRequest`, `PlanRestoreTarget`, `PlanRestorePreview`, `PlanRestoreValidation`, `PlanRestoreResult`, `RestoreConflict` |
| **Services** | `resolveRestoreTarget`, `previewRestore`, `validateRestore`, `restoreWorkoutPlan`, `restoreNutritionPlan`, `applyRestore`, `PlanRestoreService` |
| **Targets** | LAST / PREVIOUS / INITIAL / VERSION_NUMBER / TIMESTAMP / CHANGE_REASON / MANUAL_SELECTION |
| **Integration** | Coach Conversation intent `plan_restore`; Composition Root `PlanRestoreService` |
| **Design** | **Not regeneration. Not adaptation.** Never mutates history. Corrupted snapshots rejected. |

Full detail: [PLAN_HISTORY.md](./PLAN_HISTORY.md). Workout Pipeline: [WORKOUT_PIPELINE.md](./WORKOUT_PIPELINE.md). Nutrition Pipeline: [NUTRITION_PIPELINE.md](./NUTRITION_PIPELINE.md). Coach Conversation: [COACH_CONVERSATION.md](./COACH_CONVERSATION.md). ADR-085: [DECISIONS.md](./DECISIONS.md).

### Coach Timeline & Decision Journal (`features/coach-timeline`) — Sprint 25.4 product

| Aspect | Implementation |
|--------|----------------|
| **Purpose** | Chronological reasoning history of the AI Coach (decision journal) |
| **Flow** | Conversation → Coach Decision → Journal Entry → Timeline → Coach Memory → Conversation |
| **Models** | `CoachTimeline`, `CoachTimelineEntry`, `CoachTimelineEvent`, `CoachTimelineSummary`, `CoachTimelineSnapshot`, `CoachDecisionReason`, `CoachTimelineJournalFilter`, `TimelineQuery`, `TimelineResult` |
| **Services** | `appendTimelineEntry`, `buildTimelineSummary`, `queryTimeline`, `filterTimeline`, `groupTimelineEvents`, `validateTimeline`, `CoachTimelineService` |
| **Integration** | Coach Conversation `timeline_query`; Plan History / Restore; Nutrition / Recovery / Decision / Goal Progress hooks; Composition Root `CoachTimelineService` |
| **Design** | **Not chat history. Not analytics. Not an event bus. No persistence.** Append-only immutable entries; grounded answers only |

Full detail: [COACH_TIMELINE.md](./COACH_TIMELINE.md). ADR-086: [DECISIONS.md](./DECISIONS.md).

### Coach Timeline Framework (`features/coach-timeline`) — Sprint 31.9 product

| Aspect | Implementation |
|--------|----------------|
| **Purpose** | Deterministic athlete-event timeline domain — chronological events from every future EVOLVE module for presentation |
| **Flow** | React UI → `CoachTimelineViewModel` → Application APIs → Mappers → `CoachTimelineFrameworkService` → Mock/Backend/Local providers |
| **Models** | `TimelineEvent`, `TimelineEventType`, `TimelineCategory`, `TimelinePriority`, `TimelineSection`, `TimelineFilter`, `TimelinePeriod`, `TimelineMetadata`, `TimelineStatistics`, `TimelineSnapshot`, `TimelinePagination`, `TimelineCursor`, `TimelineGroup`, `TimelineAction`, `TimelineBadge`, `TimelineAttachment`, `AthleteTimeline`, loading/error states |
| **Application** | `loadTimeline` / `refreshTimeline` / `loadMoreTimeline` / `filterTimeline` / `searchTimeline` / `loadTimelineStatistics` / `loadTimelineSnapshot` |
| **UI** | `CoachTimelineScreen` + header / event card / group header / statistics / filter / search / section / load more / skeleton / empty / error; pull-to-refresh |
| **Design** | **No event sourcing. No realtime. No WebSocket/SignalR. No Firebase/Supabase. No networking. No persistence. No search engine. No analytics calculations. Presentation only.** Coexists with ADR-086 Decision Journal; destinations prepared |

Full detail: [COACH_TIMELINE_ARCHITECTURE.md](./COACH_TIMELINE_ARCHITECTURE.md). ADR-114: [DECISIONS.md](./DECISIONS.md).

### Proactive Coach Insights (`features/proactive-insights`) — Sprint 25.5 product

| Aspect | Implementation |
|--------|----------------|
| **Purpose** | Deterministic proactive coaching insights from existing domain evidence |
| **Flow** | Athlete State → Timeline → Plan History → Goal Progress → Recovery → Insight Analysis → Coach Insight → Conversation / Dashboard |
| **Models** | `CoachInsight`, `CoachInsightType`, `CoachInsightSeverity`, `CoachInsightReason`, `CoachInsightEvidence`, `CoachInsightRecommendation`, `CoachInsightSnapshot`, `CoachInsightSummary`, `InsightAnalysisResult`, `InsightQuery`, `InsightFilter` |
| **Services** | `analyzeTimeline`, `analyzeGoalProgress`, `analyzeWorkoutPatterns`, `analyzeNutritionPatterns`, `analyzeRecoveryPatterns`, `buildCoachInsights`, `prioritizeInsights`, `filterInsights`, `validateInsights`, `ProactiveInsightsService` |
| **Integration** | Coach Conversation `coach_insight`; Coach Timeline / Plan History / Goal / Recovery / Decision / Recommendation / Explainability refs; Composition Root `ProactiveInsightsService` |
| **Design** | **No LLM. No ML. No persistence. No event bus. No scheduler. No UI redesign.** Distinct from Sprint 18.7 Insight Engine domain-fact snapshots |

Full detail: [PROACTIVE_INSIGHTS.md](./PROACTIVE_INSIGHTS.md). ADR-087: [DECISIONS.md](./DECISIONS.md).

### Explainable Coaching Session (`features/coaching-session/composition`) — Sprint 26.1 product

| Aspect | Implementation |
|--------|----------------|
| **Purpose** | Package every coaching turn as a structured, evidence-backed explainable session |
| **Flow** | User Request → Coach Conversation → Athlete Context → Timeline → Decision → Recommendation → Explainability → Proactive Insights → Coaching Session → Conversation Response |
| **Models** | `CoachingSession`, `CoachingSessionContext`, `CoachingSessionEvidence`, `CoachingSessionDecision`, `CoachingSessionRecommendation`, `CoachingSessionInsight`, `CoachingSessionExplanation`, `CoachingSessionSummary`, `CoachingSessionConfidence`, `CoachingSessionResult` |
| **Services** | `collectEvidence`, `collectTimelineContext`, `collectDecisionContext`, `collectRecommendationContext`, `collectInsightContext`, `buildSessionSummary`, `calculateSessionConfidence`, `validateCoachingSession`, `buildCoachingSession`, `ExplainableCoachingSessionService` |
| **Integration** | Coach Conversation every turn (`EXPLAINABLE_SESSION`); Timeline / Plan History / Insights / Decision / Recommendation / Explainability refs; Composition Root `ExplainableCoachingSessionService` |
| **Design** | **Compose existing architecture only. No new engines. No LLM reasoning. No persistence. No event bus. No UI redesign.** Distinct from Sprint 22.0 lifecycle runtime descriptor |

Full detail: [COACHING_SESSION.md](./COACHING_SESSION.md). ADR-088: [DECISIONS.md](./DECISIONS.md).

### Home Experience (`features/home-experience`) — Sprint 27.1 product

| Aspect | Implementation |
|--------|----------------|
| **Purpose** | Transform Home into a deterministic composition of existing coaching knowledge (not a widget collection) |
| **Flow** | Athlete State → Timeline → Plan History → Goal Progress → Recovery → Workout → Nutrition → Proactive Insights → Explainable Coaching Session → Home Experience → Dashboard |
| **Models** | `HomeExperience`, `HomeSummary`, `HomeWorkoutCard`, `HomeNutritionCard`, `HomeRecoveryCard`, `HomeGoalCard`, `HomeInsightCard`, `HomeTimelineCard`, `HomeCoachCard`, `HomeQuickAction`, `HomeExperienceResult` |
| **Services** | `buildWorkoutCard`, `buildNutritionCard`, `buildRecoveryCard`, `buildGoalCard`, `buildInsightCard`, `buildTimelineCard`, `buildCoachCard`, `buildQuickActions`, `buildHomeExperience`, `validateHomeExperience`, `HomeExperienceService` |
| **Integration** | Workout / Nutrition / Recovery / Goal / Timeline / Plan History / Insights / Explainable Session; Composition Root `HomeExperienceService` |
| **Design** | **Compose existing architecture only. No new engines. No LLM. No persistence. No event bus. No UI redesign.** Distinct from `features/home` UI providers |

Full detail: [HOME_EXPERIENCE.md](./HOME_EXPERIENCE.md). ADR-089: [DECISIONS.md](./DECISIONS.md).

### Athlete Daily Brief (`features/daily-brief`) — Sprint 27.2 product

| Aspect | Implementation |
|--------|----------------|
| **Purpose** | Deterministic daily coaching brief composed from existing coaching knowledge (not chat, not notifications, not an LLM summary) |
| **Flow** | Athlete State → Home Experience → Timeline → Plan History → Recovery → Goal Progress → Workout → Nutrition → Proactive Insights → Explainable Coaching Session → Daily Brief → Dashboard |
| **Models** | `DailyBrief`, `DailyBriefSummary`, `DailyBriefWorkout`, `DailyBriefNutrition`, `DailyBriefRecovery`, `DailyBriefGoals`, `DailyBriefInsights`, `DailyBriefCoachMessage`, `DailyBriefPriority`, `DailyBriefConfidence`, `DailyBriefResult` |
| **Services** | `buildWorkoutSection`, `buildNutritionSection`, `buildRecoverySection`, `buildGoalSection`, `buildInsightSection`, `buildCoachMessage`, `calculatePriority`, `calculateConfidence`, `buildDailyBrief`, `validateDailyBrief`, `DailyBriefService` |
| **Integration** | Home Experience / Workout / Nutrition / Recovery / Goal / Timeline / Plan History / Insights / Explainable Session / Decision / Recommendation; Composition Root `DailyBriefService` |
| **Design** | **Compose existing architecture only. No new engines. No LLM. No persistence. No scheduler. No notifications. No UI redesign.** |

Full detail: [DAILY_BRIEF.md](./DAILY_BRIEF.md). ADR-090: [DECISIONS.md](./DECISIONS.md).

### Weekly Coach Report (`features/weekly-report`) — Sprint 27.3 product

| Aspect | Implementation |
|--------|----------------|
| **Purpose** | Deterministic weekly coaching review composed from existing coaching knowledge (not a PDF, not a UI, not an LLM summary) |
| **Flow** | Athlete State → Coach Timeline → Plan History → Workout → Nutrition → Recovery → Goal Progress → Proactive Insights → Explainable Coaching Session → Daily Brief → Weekly Coach Report → Dashboard / Export |
| **Models** | `WeeklyCoachReport`, `WeeklyExecutiveSummary`, `WeeklyWorkoutReport`, `WeeklyNutritionReport`, `WeeklyRecoveryReport`, `WeeklyGoalReport`, `WeeklyInsightReport`, `WeeklyDecisionReport`, `WeeklyRecommendationReport`, `WeeklyEvidence`, `WeeklyConfidence`, `WeeklyReportResult` |
| **Services** | `buildExecutiveSummary`, `buildWorkoutReport`, `buildNutritionReport`, `buildRecoveryReport`, `buildGoalReport`, `buildInsightReport`, `buildDecisionReport`, `buildRecommendationReport`, `buildEvidence`, `calculateWeeklyConfidence`, `buildWeeklyCoachReport`, `validateWeeklyCoachReport`, `WeeklyCoachReportService` |
| **Integration** | Home Experience / Daily Brief / Workout / Nutrition / Recovery / Goal / Timeline / Plan History / Insights / Explainable Session / Decision / Recommendation; Composition Root `WeeklyCoachReportService` |
| **Design** | **Compose existing architecture only. No new engines. No LLM. No persistence. No scheduler. No notifications. No PDF. No UI redesign.** |

Full detail: [WEEKLY_REPORT.md](./WEEKLY_REPORT.md). ADR-091: [DECISIONS.md](./DECISIONS.md).

### Athlete Intelligence Workspace (`features/intelligence-workspace`) — Sprint 28.1 product

| Aspect | Implementation |
|--------|----------------|
| **Purpose** | Single immutable premium coaching read model composed from existing artifacts (not a dashboard, not a UI, not a new engine) |
| **Flow** | Athlete State → Home Experience → Daily Brief → Weekly Coach Report → Coach Timeline → Proactive Insights → Explainable Coaching Session → Athlete Intelligence Workspace → Dashboard / UI / APIs |
| **Models** | `AthleteWorkspace`, `WorkspaceOverview`, `WorkspaceStatus`, `WorkspaceHome`, `WorkspaceDailyBrief`, `WorkspaceWeeklyReport`, `WorkspaceTimeline`, `WorkspaceInsights`, `WorkspaceCoach`, `WorkspaceMetadata`, `WorkspaceResult` |
| **Services** | `buildOverview`, `buildStatus`, `buildHomeProjection`, `buildDailyProjection`, `buildWeeklyProjection`, `buildTimelineProjection`, `buildInsightProjection`, `buildCoachProjection`, `buildMetadata`, `buildAthleteWorkspace`, `validateWorkspace`, `AthleteWorkspaceService` |
| **Integration** | Athlete State / Home Experience / Daily Brief / Weekly Coach Report / Coach Timeline / Plan History / Plan Restore / Proactive Insights / Explainable Coaching Session; Composition Root `AthleteWorkspaceService` |
| **Design** | **Compose existing architecture only. No new engines. No LLM. No persistence. No caching. No scheduler. No UI redesign.** |

Full detail: [INTELLIGENCE_WORKSPACE.md](./INTELLIGENCE_WORKSPACE.md). ADR-092: [DECISIONS.md](./DECISIONS.md).

### Athlete Snapshot (`features/athlete-snapshot`) — Sprint 28.2 product

| Aspect | Implementation |
|--------|----------------|
| **Purpose** | Immutable point-in-time athlete representation composed from existing artifacts (not persistence, not a DB model, not an event store) |
| **Flow** | Athlete State → Home Experience → Daily Brief → Weekly Coach Report → Athlete Workspace → Coach Timeline → Explainable Coaching Session → Athlete Snapshot → Future Cloud / Offline / Cache / Restore / Export / Analytics |
| **Models** | `AthleteSnapshot`, `SnapshotIdentity`, `SnapshotState`, `SnapshotWorkspace`, `SnapshotTimeline`, `SnapshotCoach`, `SnapshotMetadata`, `SnapshotVersion`, `SnapshotEvidence`, `SnapshotIntegrity`, `SnapshotResult` |
| **Services** | `buildIdentity`, `buildState`, `buildWorkspaceProjection`, `buildTimelineProjection`, `buildCoachProjection`, `buildMetadata`, `buildVersion`, `buildEvidence`, `validateIntegrity`, `validateSnapshot`, `buildAthleteSnapshot`, `AthleteSnapshotService` |
| **Integration** | Athlete Workspace / Athlete State / Home Experience / Daily Brief / Weekly Coach Report / Coach Timeline / Explainable Coaching Session; Composition Root `AthleteSnapshotService` |

Full detail: [ATHLETE_SNAPSHOT.md](./ATHLETE_SNAPSHOT.md). ADR-093: [DECISIONS.md](./DECISIONS.md).

### Unified Athlete Workspace (`features/unified-workspace`) — Sprint 28.3 product

| Aspect | Implementation |
|--------|----------------|
| **Purpose** | Canonical immutable athlete read model aggregating every athlete artifact for future sync / portal / dashboard / export / cache / analytics consumers (not a new engine, not business logic, not AI) |
| **Flow** | Athlete State → Home Experience → Daily Brief → Weekly Report → Coach Timeline → Explainable Coaching Session → Athlete Snapshot → Unified Athlete Workspace → Consumers |
| **Models** | `Workspace`, `WorkspaceHeader`, `WorkspaceSummary`, `WorkspaceHealth`, `WorkspaceGoals`, `WorkspaceWorkout`, `WorkspaceNutrition`, `WorkspaceRecovery`, `WorkspaceInsights`, `WorkspaceTimeline`, `WorkspaceCoach`, `WorkspaceSnapshot`, `WorkspaceMetadata`, `WorkspaceResult` |
| **Services** | `buildWorkspaceHeader`, `buildWorkspaceSummary`, `buildWorkspaceHealth`, `buildWorkspaceGoals`, `buildWorkspaceWorkout`, `buildWorkspaceNutrition`, `buildWorkspaceRecovery`, `buildWorkspaceInsights`, `buildWorkspaceTimeline`, `buildWorkspaceCoach`, `buildWorkspaceSnapshot`, `buildWorkspaceMetadata`, `validateWorkspace`, `buildUnifiedWorkspace`, `UnifiedWorkspaceService` |
| **Integration** | Athlete State / Home Experience / Daily Brief / Weekly Report / Coach Timeline / Goal Progress / Workout / Nutrition / Recovery / Explainable Coaching Session / Athlete Snapshot; Composition Root `UnifiedWorkspaceService` |

Full detail: [UNIFIED_WORKSPACE.md](./UNIFIED_WORKSPACE.md). ADR-094: [DECISIONS.md](./DECISIONS.md).

### Athlete Identity Foundation (`features/athlete-identity`) — Sprint 29.1 product

| Aspect | Implementation |
|--------|----------------|
| **Purpose** | Immutable identity foundation for future Auth / Sync / Cache / Analytics / Coach Portal / Sharing / Export (not authentication, not persistence, not Athlete State) |
| **Flow** | Identity → Athlete State → Snapshot → Unified Workspace |
| **Models** | `AthleteIdentity`, `AthleteProfile`, `AthletePreferences`, `AthleteSettings`, `AthleteLocale`, `AthleteUnits`, `AthleteTimeZone`, `AthleteMetadata`, `AthleteIdentityResult` |
| **Services** | `buildProfile`, `buildPreferences`, `buildSettings`, `buildLocale`, `buildUnits`, `buildTimeZone`, `validateIdentity`, `buildAthleteIdentity`, `AthleteIdentityService` |
| **Integration** | Composition Root `AthleteIdentityService` via `AthleteIdentityFactory`; application APIs `getAthleteIdentity` / `getAthleteProfile` / `getPreferences` / `getSettings` |
| **Design** | **Immutable domain modeling only. No authentication. No OAuth/JWT. No persistence. No database. No cache. No cloud. No networking. No event bus. No scheduler. No LLM.** |

Full detail: [ATHLETE_IDENTITY.md](./ATHLETE_IDENTITY.md). ADR-095: [DECISIONS.md](./DECISIONS.md).

### Runtime Environment Foundation (`features/runtime-environment`) — Sprint 29.2 product

| Aspect | Implementation |
|--------|----------------|
| **Purpose** | Immutable execution-environment foundation for future Auth / Cloud Sync / Push / Offline Cache / Feature Flags / Analytics / Telemetry / Device Sync / Coach Portal (not infrastructure, not React Native, not Expo, not platform APIs) |
| **Flow** | Runtime Environment → Athlete Identity → Athlete State → Snapshot → Unified Workspace |
| **Models** | `RuntimeEnvironment`, `DeviceInfo`, `PlatformInfo`, `ApplicationInfo`, `Capabilities`, `FeatureSupport`, `LocaleInfo`, `ConnectivityInfo`, `EnvironmentMetadata`, `RuntimeEnvironmentResult` |
| **Services** | `buildDeviceInfo`, `buildPlatformInfo`, `buildApplicationInfo`, `buildCapabilities`, `buildFeatureSupport`, `buildLocaleInfo`, `buildConnectivityInfo`, `validateRuntimeEnvironment`, `buildRuntimeEnvironment`, `RuntimeEnvironmentService` |
| **Integration** | Composition Root `RuntimeEnvironmentService` via `RuntimeEnvironmentFactory`; application APIs `getRuntimeEnvironment` / `getCapabilities` / `getPlatformInfo` / `getApplicationInfo` / `getConnectivityInfo` |
| **Design** | **Immutable domain modeling only. No React Native. No Expo. No Device APIs. No networking. No persistence. No cache. No cloud. No event bus. No scheduler. No LLM. No business logic.** |

Full detail: [RUNTIME_ENVIRONMENT.md](./RUNTIME_ENVIRONMENT.md). ADR-096: [DECISIONS.md](./DECISIONS.md).

### Persistence Contract Foundation (`core/persistence`) — Sprint 29.3 product

| Aspect | Implementation |
|--------|----------------|
| **Purpose** | Immutable persistence contract foundation for future SQLite / PostgreSQL / Supabase / IndexedDB / AsyncStorage / Filesystem / Cloud Sync adapters (not storage, not adapters) |
| **Flow** | Domain → Persistence Contracts → Future Adapters → Storage Technologies |
| **Repository contracts** | `AthleteRepository`, `IdentityRepository`, `WorkspaceRepository`, `SnapshotRepository`, `TimelineRepository`, `PlanRepository`, `WorkoutRepository`, `NutritionRepository`, `RecoveryRepository`, `SettingsRepository`, `RuntimeRepository` |
| **Storage ports** | `StorageReader`, `StorageWriter`, `StorageTransaction`, `StorageSession`, `StorageHealth`, `StorageMetadata`, `StorageResult` |
| **Registries** | `PersistenceContractRegistry`, `RepositoryRegistry`, `StorageContractRegistry` |
| **Integration** | Composition Root via `PersistenceContractsFactory`; application APIs `getPersistenceContracts` / `getRepositoryRegistry` / `validatePersistenceContracts` |
| **Design** | **Contracts only. No SQLite. No PostgreSQL. No Supabase. No AsyncStorage. No Realm. No IndexedDB. No filesystem. No network. No persistence I/O. No serialization. No adapters. No DI framework. No business logic.** |

Full detail: [PERSISTENCE_CONTRACTS.md](./PERSISTENCE_CONTRACTS.md). ADR-097: [DECISIONS.md](./DECISIONS.md).

### Infrastructure Adapter Contracts (`core/infrastructure`) — Sprint 29.4 product

| Aspect | Implementation |
|--------|----------------|
| **Purpose** | Immutable infrastructure adapter contracts for future SQLite / PostgreSQL / Supabase / Firebase / Apple Health / Google Fit / Push / Analytics / Logging / Feature Flag implementations (not implementations) |
| **Flow** | Domain → Infrastructure Adapter Contracts → Future Adapter Implementations → External Services |
| **Adapter contracts** | `StorageAdapter`, `AuthenticationAdapter`, `NotificationAdapter`, `AnalyticsAdapter`, `SynchronizationAdapter`, `BackendAdapter`, `LoggingAdapter`, `FeatureFlagAdapter`, `HealthPlatformAdapter`, `MediaAdapter`, `ExportAdapter`, `ImportAdapter`, `ClockAdapter`, `IdentifierGenerator`, `ConfigurationProvider` |
| **Registry models** | `AdapterRegistry`, `AdapterMetadata`, `AdapterCapabilities`, `AdapterRegistration`, `AdapterResult` |
| **Integration** | Composition Root via `InfrastructureAdapterFactory`; application APIs `getAdapterRegistry` / `getRegisteredAdapters` / `validateAdapters` / `getAdapterCapabilities` |
| **Design** | **Contracts only. No SQLite. No PostgreSQL. No Firebase. No Supabase. No HTTP. No REST. No GraphQL. No SDK imports. No Expo. No React Native. No network. No filesystem. No persistence. No business logic.** |

Full detail: [INFRASTRUCTURE_ADAPTERS.md](./INFRASTRUCTURE_ADAPTERS.md). ADR-098: [DECISIONS.md](./DECISIONS.md).

### SQLite Infrastructure Adapter (`infrastructure/sqlite`) — Sprint 30.1 product

| Aspect | Implementation |
|--------|----------------|
| **Purpose** | First production infrastructure adapter implementing Persistence Contracts + Infrastructure `StorageAdapter` against a SQLite-compatible engine |
| **Flow** | Domain → Persistence Contracts → SQLite Adapter → SQLite Database |
| **Connection** | `SQLiteConnection` / `SQLiteConnectionFactory` / `SQLiteSession` / `SQLiteTransaction` / `ConnectionHealth` |
| **Repositories** | Athlete / Identity / Workspace / Snapshot / Timeline / Workout / Nutrition / Recovery / Settings / Runtime |
| **Mappers** | Pure `PersistenceRecord` ↔ `SQLiteRow` mappers (no domain logic) |
| **Health** | `isConnected` / `databaseVersion` / `storageUsage` / `adapterVersion` |
| **Integration** | Composition Root via `SQLiteAdapterFactory`; application APIs `getSQLiteHealth` / `getSQLiteRepositories` / `getSQLiteConnection` |
| **Design** | **Infrastructure only. Domain never imports SQLite. No React Native. No Expo. No cloud sync. No authentication. No networking. No business logic. No AI.** |

Full detail: [SQLITE_ADAPTER.md](./SQLITE_ADAPTER.md). ADR-099: [DECISIONS.md](./DECISIONS.md).

### Repository Adapter Integration (`infrastructure/repositories`) — Sprint 30.2 product

| Aspect | Implementation |
|--------|----------------|
| **Purpose** | First production repository adapter layer binding Persistence Contracts to SQLite repositories |
| **Flow** | Domain → Persistence Contracts → Repository Adapters → SQLite Repositories → SQLite Engine |
| **Adapters** | Athlete / Identity / Workspace / Snapshot / Timeline / Workout / Nutrition / Recovery / Settings / Runtime |
| **Registry** | `RepositoryAdapterRegistry` / `RepositoryAdapterMetadata` / `RepositoryAdapterResult` / `RepositoryAdapterRegistration` |
| **Validation** | Missing repository / duplicate registrations / contract compliance / adapter registration / repository compatibility |
| **Integration** | Composition Root via `RepositoryAdapterFactory`; application APIs `getRepositoryAdapters` / `getRepositoryAdapter` / `validateRepositoryAdapters` |
| **Design** | **Infrastructure only. Delegation only. No domain changes. No SQLite in Domain. No business logic. No AI. No networking. No cloud. No auth. No cache. No sync.** |

Full detail: [REPOSITORY_ADAPTERS.md](./REPOSITORY_ADAPTERS.md). ADR-100: [DECISIONS.md](./DECISIONS.md).

### Authentication Adapter Foundation (`infrastructure/authentication`) — Sprint 30.3 product

| Aspect | Implementation |
|--------|----------------|
| **Purpose** | First authentication infrastructure adapter implementing Infrastructure `AuthenticationAdapter` via in-memory Mock provider |
| **Flow** | Application → Authentication Contract → Authentication Adapter → Mock Authentication Provider |
| **Models** | `AuthenticatedUser` / `AuthenticationSession` / `AuthenticationToken` / `RefreshToken` / `AuthenticationMetadata` / `AuthenticationState` / `AuthenticationResult` / `AuthenticationCapabilities` (immutable) |
| **Provider** | `MockAuthenticationProvider` / `AuthenticationProviderFactory` / `AuthenticationSessionManager` / `AuthenticationValidator` |
| **Operations** | `signIn` / `signOut` / `refreshSession` / `getCurrentUser` / `getCurrentSession` / `isAuthenticated` / `validateSession` |
| **Registry** | `AuthenticationRegistry` / `AuthenticationProviderRegistration` / `AuthenticationProviderMetadata` / `AuthenticationProviderResult` |
| **Integration** | Composition Root via `AuthenticationFactory`; application APIs `getAuthentication` / `getCurrentUser` / `getCurrentSession` / `isAuthenticated` / `validateAuthentication` |
| **Design** | **Infrastructure only. In-memory Mock. No Supabase. No Firebase. No Auth0. No OAuth. No JWT. No OpenID. No HTTP. No networking. No cloud. No SDK. No encryption. No persistence. No business logic. Future providers replaceable without Domain changes.** |

Full detail: [AUTHENTICATION_ADAPTER.md](./AUTHENTICATION_ADAPTER.md). ADR-101: [DECISIONS.md](./DECISIONS.md).

### Synchronization Adapter Foundation (`infrastructure/synchronization`) — Sprint 30.4 product

| Aspect | Implementation |
|--------|----------------|
| **Purpose** | First synchronization infrastructure adapter — deterministic engine managing state, pending operations, conflict models, and policies |
| **Flow** | Application → Synchronization Contract → Synchronization Adapter → Synchronization Engine → Future Remote Provider |
| **Models** | `SynchronizationState` / `SynchronizationOperation` / `SynchronizationBatch` / `SynchronizationQueue` / `SynchronizationConflict` / `SynchronizationPolicy` / `SynchronizationMetadata` / `SynchronizationStatistics` / `SynchronizationCapabilities` / `SynchronizationResult` / `SynchronizationCheckpoint` (immutable) |
| **Engine** | `SynchronizationEngine` / `SynchronizationCoordinator` / `SynchronizationValidator` / `SynchronizationBatchProcessor` / `SynchronizationStateManager` |
| **Operations** | `enqueue` / `dequeue` / `peek` / `markCompleted` / `markFailed` / `cancel` / `clear` / `retry` |
| **Registry** | `SynchronizationRegistry` / `SynchronizationProviderRegistration` / `SynchronizationProviderMetadata` / `SynchronizationProviderResult` |
| **Integration** | Composition Root via `SynchronizationFactory`; application APIs `getSynchronization` / `getSynchronizationQueue` / `getSynchronizationState` / `getSynchronizationStatistics` / `validateSynchronization` |
| **Design** | **Infrastructure only. Local orchestration. No networking. No HTTP. No REST. No GraphQL. No Supabase. No Firebase. No PostgreSQL. No cloud. No sockets. No persistence. No background services. No business logic. No synchronization execution. Future providers replaceable without Domain changes.** |

Full detail: [SYNCHRONIZATION_ADAPTER.md](./SYNCHRONIZATION_ADAPTER.md). ADR-102: [DECISIONS.md](./DECISIONS.md).

### Backend API Adapter Foundation (`infrastructure/backend`) — Sprint 30.5 product

| Aspect | Implementation |
|--------|----------------|
| **Purpose** | First backend API infrastructure adapter — deterministic Mock representing every future backend communication |
| **Flow** | Application → Backend API Contract → Backend API Adapter → Mock Backend Provider |
| **Models** | `BackendRequest` / `BackendResponse` / `BackendEndpoint` / `BackendRoute` / `BackendMetadata` / `BackendCapabilities` / `BackendResult` / `BackendStatus` / `BackendHealth` / `BackendError` (immutable) |
| **Provider** | `MockBackendProvider` / `BackendProviderFactory` / `BackendRequestDispatcher` / `BackendResponseMapper` / `BackendValidator` |
| **Operations** | `send` / `execute` / `dispatch` / `health` / `capabilities` / `listEndpoints` |
| **Routing** | `/auth` `/workout` `/nutrition` `/recovery` `/coach` `/sync` `/profile` `/settings` (routes only; no URL building; no HTTP verbs) |
| **Responses** | Success / Failure / Unavailable / Unauthorized / Forbidden / Conflict / ValidationError / NotFound (representation only) |
| **Registry** | `BackendRegistry` / `BackendRegistration` / `BackendMetadata` / `BackendResult` |
| **Integration** | Composition Root via `BackendFactory`; application APIs `getBackend` / `getBackendHealth` / `getBackendCapabilities` / `listBackendEndpoints` / `validateBackend` |
| **Design** | **Infrastructure only. Deterministic Mock. No HTTP. No REST. No GraphQL. No sockets. No networking. No FastAPI. No ASP.NET. No Express. No NestJS. No serialization. No JSON parsing. No cloud. No business logic. Future backends replaceable without Domain changes.** |

Full detail: [BACKEND_API_ADAPTER.md](./BACKEND_API_ADAPTER.md). ADR-103: [DECISIONS.md](./DECISIONS.md).

### Logging & Observability Adapter Foundation (`infrastructure/logging`) — Sprint 30.6 product

| Aspect | Implementation |
|--------|----------------|
| **Purpose** | First logging infrastructure adapter — deterministic Mock used by every EVOLVE layer |
| **Flow** | Application → Logging Contract → Logging Adapter → Mock Logger |
| **Models** | `LogEvent` / `LogEntry` / `LogContext` / `LogScope` / `LogLevel` / `LogMetadata` / `LogCapabilities` / `LogStatistics` / `LogResult` (immutable) |
| **Logger** | `MockLogger` / `LoggerFactory` / `LoggerRegistry` / `LoggerValidator` / `LogDispatcher` |
| **Operations** | `trace` / `debug` / `info` / `warn` / `error` / `fatal` / `flush` / `clear` / `statistics` |
| **Levels** | Trace / Debug / Information / Warning / Error / Fatal |
| **Context scopes** | Workout / Nutrition / Recovery / Coach / Synchronization / Authentication / Backend / Application |
| **Registry** | `LoggerRegistry` / `LoggerRegistration` / `LoggerMetadata` / `LoggerResult` |
| **Integration** | Composition Root via `LoggerFactory`; application APIs `getLogger` / `log` / `getLogStatistics` / `clearLogs` / `validateLogging` |
| **Design** | **Infrastructure only. Deterministic Mock. No console. No files. No OpenTelemetry. No Sentry. No Datadog. No Azure Monitor. No Grafana. No Elastic. No cloud. No networking. No persistence. No business logic. Future providers replaceable without Domain changes.** |

Full detail: [LOGGING_ADAPTER.md](./LOGGING_ADAPTER.md). ADR-104: [DECISIONS.md](./DECISIONS.md).

### Architecture Consolidation (Sprint 30.7 product)

| Aspect | Implementation |
|--------|----------------|
| **Purpose** | Complete architecture audit before Product Development (Phase 31) — review, validate, consolidate; no business features |
| **Scope** | Domain, Application, Infrastructure, Composition Root, dependency direction, adapters/factories/registries, public APIs, naming, documentation, tests |
| **Deliverable** | [ARCHITECTURE_REVIEW.md](./ARCHITECTURE_REVIEW.md) — strengths, weaknesses, refactors, debt, production readiness, risks, MVP readiness |
| **Cleanup** | Composition Root public factory exports aligned with `factories/index.ts`; documentation aligned with Phase 29–30 wiring |
| **ADR** | ADR-105 |
| **Design** | **Review only.** No new features; no module redesign; no business-logic changes |

### Home Dashboard (`features/home`) — Sprint 31.1 product

| Aspect | Implementation |
|--------|----------------|
| **Purpose** | Operational Home dashboard hub — presentation composition over Application APIs |
| **Flow** | React UI → `HomeDashboardViewModel` → Application APIs → Mappers → `HomeService` → Mock/Backend/Local providers |
| **Models** | `HomeDashboard`, `AthleteSnapshotCard`, `WorkoutSummaryCard`, `NutritionSummaryCard`, `RecoverySummaryCard`, `CoachSummaryCard`, `QuickAction`, `HomeLoadingState`, `HomeErrorState` |
| **Application** | `loadHomeDashboard` / `refreshHomeDashboard` / `loadQuickActions` / `loadAthleteSnapshot` |
| **UI** | `HomeDashboardScreen` + reusable cards / skeleton / empty / error; pull-to-refresh; quick-action placeholders |
| **Design** | **No business logic in React. No repository/infrastructure calls from components. No mock data in components. No visual redesign.** Distinct from `features/home-experience` domain composition |

Full detail: [HOME_DASHBOARD_ARCHITECTURE.md](./HOME_DASHBOARD_ARCHITECTURE.md). ADR-106: [DECISIONS.md](./DECISIONS.md).

### Workout Runtime Experience (`features/workout-runtime` experience layer) — Sprint 31.2 product

| Aspect | Implementation |
|--------|----------------|
| **Purpose** | Operational Workout execution experience — presentation composition over Application APIs |
| **Flow** | React UI → `WorkoutRuntimeViewModel` → Application APIs → Mappers → `WorkoutRuntimeExperienceService` → Mock/Backend/Local providers |
| **Models** | Experience read models under `models/experience/` (`WorkoutRuntime`, `WorkoutExercise`, `WorkoutSet`, `WorkoutProgress`, `WorkoutTimer`, `WorkoutStatistics`, `WorkoutNotes`, loading/error/runtime states) |
| **Application** | `loadWorkoutRuntime` / `refreshWorkoutRuntime` / `completeWorkoutSet` / `updateWorkoutSet` / `navigateWorkout` / `finishWorkout` / rest-timer helpers |
| **UI** | `WorkoutRuntimeScreen` + header / carousel / set editors / rest timer / progress / statistics / bottom bar / finish dialog / skeleton / empty / error; pull-to-refresh |
| **Design** | **No business logic in React. No repository/infrastructure calls from components. No mock data in components. No visual redesign. Sprint 18.0 engine foundation untouched.** Distinct from engine domain `WorkoutRuntime` graph |

Full detail: [WORKOUT_RUNTIME_ARCHITECTURE.md](./WORKOUT_RUNTIME_ARCHITECTURE.md). ADR-107: [DECISIONS.md](./DECISIONS.md).

### Coach Experience (`features/coach-experience`) — Sprint 31.3 product

| Aspect | Implementation |
|--------|----------------|
| **Purpose** | Flagship contextual AI Coach experience — presentation composition over Application APIs |
| **Flow** | React UI → `CoachExperienceViewModel` → Application APIs → Mappers → `CoachExperienceService` → Mock/Backend/Local providers |
| **Models** | `CoachExperience`, `CoachConversation`, `CoachMessage`, `CoachInsight`, `CoachRecommendation`, `CoachQuickAction`, `CoachMemorySummary`, conversation/typing/loading/error states |
| **Application** | `loadCoachConversation` / `sendCoachMessage` / `loadDailyInsight` / `loadRecommendations` / `loadQuickActions` / `refreshCoachExperience` / `pinCoachInsight` / `dismissCoachInsight` / `regenerateCoachResponse` / `loadConversationHistory` |
| **UI** | `CoachExperienceScreen` + header / insights / recommendations / memory / quick actions / conversation / typing / skeleton / empty / error; pull-to-refresh |
| **Design** | **No business logic in React. No repository/infrastructure calls from components. No provider code in components. No OpenAI SDK. No networking. No mock data in components. No visual redesign.** Streaming/markdown/citations prepared. Distinct from domain Coach Intelligence / legacy `features/coach` chat |

Full detail: [COACH_EXPERIENCE_ARCHITECTURE.md](./COACH_EXPERIENCE_ARCHITECTURE.md). ADR-108: [DECISIONS.md](./DECISIONS.md).

### Progress Experience (`features/progress-experience`) — Sprint 31.4 product

| Aspect | Implementation |
|--------|----------------|
| **Purpose** | Athlete analytics center — one operational dashboard aggregating training, recovery, nutrition, body metrics, goals, records, and coach insights |
| **Flow** | React UI → `ProgressExperienceViewModel` → Application APIs → Mappers → `ProgressExperienceService` → Mock/Backend/Local providers |
| **Models** | `ProgressDashboard`, `StrengthProgress`, `VolumeProgress`, `RecoveryProgress`, `NutritionProgress`, `BodyMetrics`, `CoachInsightSummary`, `PersonalRecord`, `TrainingStreak`, `GoalProgress`, `TimeRange`, loading/error states, reusable chart models |
| **Application** | `loadProgressDashboard` / `refreshProgressDashboard` / `loadStrengthProgress` / `loadVolumeProgress` / `loadRecoveryProgress` / `loadNutritionProgress` / `loadBodyMetrics` / `loadCoachInsights` / `changeTimeRange` |
| **UI** | `ProgressExperienceScreen` + header / time-range selector / analytics cards / coach insights / records / streak / goal / skeleton / empty / error; pull-to-refresh |
| **Design** | **No business logic in React. No repository/infrastructure calls from components. No provider code in components. No chart dependency introduced. No mock data in components. No visual redesign.** Future detailed-analytics/body-metrics/exercise-history routes prepared only |

Full detail: [PROGRESS_EXPERIENCE_ARCHITECTURE.md](./PROGRESS_EXPERIENCE_ARCHITECTURE.md). ADR-109: [DECISIONS.md](./DECISIONS.md).

### Nutrition Experience (`features/nutrition-experience`) — Sprint 31.5 product

| Aspect | Implementation |
|--------|----------------|
| **Purpose** | Daily nutrition command center — contextual meal, macro, hydration, and coach guidance integrated with Workout, Recovery, and Coach rather than a calorie tracker |
| **Flow** | React UI → `NutritionExperienceViewModel` → Application APIs → Mappers → `NutritionExperienceService` → Mock/Backend/Local providers |
| **Models** | `NutritionDashboard`, `MealSummary`, `Meal`, `MealFood`, `MacroProgress`, `HydrationProgress`, `NutritionCoachSuggestion`, `DailyCalories`, `DailyProtein`, `DailyCarbohydrates`, `DailyFat`, `NutritionDay`, loading/error states |
| **Application** | `loadNutritionDashboard` / `refreshNutritionDashboard` / `loadMeals` / `loadMacros` / `loadHydration` / `loadCoachSuggestions` / `toggleMealCompletion` / `changeNutritionDay` |
| **UI** | `NutritionExperienceScreen` + header / day selector / summary / calories / hydration / macro targets / meal adherence / meal timeline / coach suggestions / skeleton / empty / error; pull-to-refresh |
| **Design** | **No business logic in React. No repository/infrastructure calls from components. No provider code in components. No networking. No duplicated state. No mock data in components. No visual redesign.** Future meal-details / food-search / barcode-scanner / history routes prepared only |

Full detail: [NUTRITION_EXPERIENCE_ARCHITECTURE.md](./NUTRITION_EXPERIENCE_ARCHITECTURE.md). ADR-110: [DECISIONS.md](./DECISIONS.md).

### Progress & Analytics Framework (`features/progress-analytics`) — Sprint 31.8 product

| Aspect | Implementation |
|--------|----------------|
| **Purpose** | Deterministic analytics domain — athlete progress, trends, body measurements, training/recovery/nutrition statistics, and performance summaries for future engine/wearable/backend feeds |
| **Flow** | React UI → `ProgressAnalyticsViewModel` → Application APIs → Mappers → `ProgressAnalyticsService` → Mock/Backend/Local providers |
| **Models** | `AthleteProgress`, `ProgressSummary`, `WorkoutHistory`, `WorkoutStatistics`, `StrengthProgress`, `VolumeProgress`, `BodyMeasurement`, `BodyComposition`, `BodyWeightHistory`, `NutritionStatistics`, `RecoveryStatistics`, `SleepStatistics`, `PerformanceTrend`, `GoalProgress`, `PersonalRecord`, `TrainingConsistency`, `ProgressChart`, `AnalyticsPeriod`, `AnalyticsFilter`, `AnalyticsSnapshot`, loading/error states |
| **Application** | `loadAnalytics` / `refreshAnalytics` / `loadWorkoutHistory` / `loadBodyMeasurements` / `loadStrengthProgress` / `loadNutritionStatistics` / `loadRecoveryStatistics` / `loadGoalProgress` / `loadPersonalRecords` / `loadAnalyticsSnapshot` |
| **UI** | `ProgressAnalyticsScreen` + header / summary / workout history / strength / body measurements / nutrition / recovery / goals / personal records / chart data / filter / skeleton / empty / error; pull-to-refresh |
| **Design** | **No calculations. No chart libraries. No Victory/Recharts/D3. No persistence. No networking. No backend. No wearable APIs. Presentation only.** Categories/periods/charts represent data only; destinations prepared |

Full detail: [PROGRESS_ANALYTICS_ARCHITECTURE.md](./PROGRESS_ANALYTICS_ARCHITECTURE.md). ADR-113: [DECISIONS.md](./DECISIONS.md).

### Workout Progress Integration (`integrations/workout-progress`) — Sprint 32.1 integration

| Aspect | Implementation |
|--------|----------------|
| **Purpose** | Deterministic integration layer publishing immutable workout progress events and updating Progress Analytics read models through contracts |
| **Flow** | Workout Feature → Workout Progress Integration → Progress Analytics Contract → Progress Analytics Service → Mock Analytics Provider |
| **Models** | `WorkoutProgressEvent`, `WorkoutProgressSnapshot`, `WorkoutMetric`, `WorkoutAnalyticsPayload`, `WorkoutProgressMetadata`, `WorkoutProgressResult` |
| **Publisher / Subscriber** | `WorkoutProgressPublisher` publishes immutable events; `ProgressAnalyticsSubscriber` consumes via `ProgressAnalyticsService.applyWorkoutProgressEvent` |
| **Application** | `publishWorkoutProgress` / `publishWorkoutCompletion` / `publishWorkoutCancellation` / `publishPersonalRecord` |
| **Composition Root** | `WorkoutProgressIntegrationFactory` registers `WorkoutProgressPublisher` + `ProgressAnalyticsSubscriber` |
| **Design** | **No analytics calculations. No repository changes. No persistence. No networking. No backend. No synchronization. No event sourcing. Workout feature never imports Progress Analytics internals.** Contract-only communication |

Full detail: [WORKOUT_PROGRESS_INTEGRATION.md](./WORKOUT_PROGRESS_INTEGRATION.md). ADR-115: [DECISIONS.md](./DECISIONS.md).

### Nutrition Progress Integration (`integrations/nutrition-progress`) — Sprint 32.2 integration

| Aspect | Implementation |
|--------|----------------|
| **Purpose** | Deterministic integration layer publishing immutable nutrition progress events and updating Progress Analytics read models through contracts |
| **Flow** | Nutrition Feature → Nutrition Progress Integration → Progress Analytics Contract → Progress Analytics Service → Mock Analytics Provider |
| **Models** | `NutritionProgressEvent`, `NutritionProgressSnapshot`, `NutritionMetric`, `NutritionAnalyticsPayload`, `NutritionProgressMetadata`, `NutritionProgressResult` |
| **Publisher / Subscriber** | `NutritionProgressPublisher` publishes immutable events; `NutritionProgressSubscriber` consumes via `ProgressAnalyticsService.applyNutritionProgressEvent` |
| **Application** | `publishNutritionProgress` / `publishMealLogged` / `publishDailyNutritionCompleted` / `publishHydrationLogged` |
| **Composition Root** | `NutritionProgressIntegrationFactory` registers `NutritionProgressPublisher` + `NutritionProgressSubscriber` |
| **Design** | **No analytics calculations. No repository changes. No persistence. No networking. No backend. No synchronization. No event sourcing. Nutrition feature never imports Progress Analytics internals.** Contract-only communication |

Full detail: [NUTRITION_PROGRESS_INTEGRATION.md](./NUTRITION_PROGRESS_INTEGRATION.md). ADR-116: [DECISIONS.md](./DECISIONS.md).

### Recovery Progress Integration (`integrations/recovery-progress`) — Sprint 32.3 integration

| Aspect | Implementation |
|--------|----------------|
| **Purpose** | Deterministic integration layer publishing immutable recovery progress events and updating Progress Analytics read models through contracts |
| **Flow** | Recovery Feature → Recovery Progress Integration → Progress Analytics Contract → Progress Analytics Service → Mock Analytics Provider |
| **Models** | `RecoveryProgressEvent`, `RecoveryProgressSnapshot`, `RecoveryMetric`, `RecoveryAnalyticsPayload`, `RecoveryProgressMetadata`, `RecoveryProgressResult` |
| **Publisher / Subscriber** | `RecoveryProgressPublisher` publishes immutable events; `RecoveryProgressSubscriber` consumes via `ProgressAnalyticsService.applyRecoveryProgressEvent` |
| **Application** | `publishRecoveryProgress` / `publishRecoveryAssessed` / `publishSleepLogged` / `publishReadinessUpdated` |
| **Composition Root** | `RecoveryProgressIntegrationFactory` registers `RecoveryProgressPublisher` + `RecoveryProgressSubscriber` |
| **Design** | **No analytics calculations. No repository changes. No persistence. No networking. No backend. No synchronization. No event sourcing. Recovery feature never imports Progress Analytics internals.** Contract-only communication |

Full detail: [RECOVERY_PROGRESS_INTEGRATION.md](./RECOVERY_PROGRESS_INTEGRATION.md). ADR-117: [DECISIONS.md](./DECISIONS.md).

### Goal Progress Integration (`integrations/goal-progress`) — Sprint 32.4 integration

| Aspect | Implementation |
|--------|----------------|
| **Purpose** | Deterministic integration layer publishing immutable goal progress events and updating Progress Analytics read models through contracts |
| **Flow** | Goal Progress Feature → Goal Progress Integration → Progress Analytics Contract → Progress Analytics Service → Mock Analytics Provider |
| **Models** | `GoalProgressEvent`, `GoalProgressSnapshot`, `GoalMetric`, `GoalAnalyticsPayload`, `GoalProgressMetadata`, `GoalProgressResult` |
| **Publisher / Subscriber** | `GoalProgressPublisher` publishes immutable events; `GoalProgressSubscriber` consumes via `ProgressAnalyticsService.applyGoalProgressEvent` |
| **Application** | `publishGoalProgress` / `publishGoalProgressUpdated` / `publishGoalMilestoneReached` / `publishGoalCompleted` |
| **Composition Root** | `GoalProgressIntegrationFactory` registers `GoalProgressPublisher` + `GoalProgressSubscriber` |
| **Design** | **No analytics calculations. No repository changes. No persistence. No networking. No backend. No synchronization. No event sourcing. Goal Progress feature never imports Progress Analytics internals.** Contract-only communication |

Full detail: [GOAL_PROGRESS_INTEGRATION.md](./GOAL_PROGRESS_INTEGRATION.md). ADR-118: [DECISIONS.md](./DECISIONS.md).

### Analytics Timeline Projection (`integrations/analytics-timeline`) — Sprint 32.5 integration

| Aspect | Implementation |
|--------|----------------|
| **Purpose** | Deterministic projection layer translating immutable Progress Analytics events into immutable Coach Timeline entries |
| **Flow** | Progress Analytics Service → Analytics Timeline Projector → Coach Timeline Service |
| **Models** | `AnalyticsTimelineEvent`, `AnalyticsTimelineProjectionResult`, `AnalyticsTimelineProjectionSnapshot` |
| **Projector** | `AnalyticsTimelineProjector` validates ingest DTOs, maps to `AppendTimelineEntryRequest`, appends via `CoachTimelineService` |
| **Application** | `projectAnalyticsEventToTimeline` / domain-specific projection helpers |
| **Composition Root** | `AnalyticsTimelineIntegrationFactory` registers `AnalyticsTimelineProjector` |
| **Design** | **No analytics publisher. No analytics calculations. No persistence. No networking. No event bus. No scheduler. Progress Analytics remains producer; Coach Timeline is consumer only.** Contract-only communication |

Full detail: [ANALYTICS_TIMELINE_PROJECTION.md](./ANALYTICS_TIMELINE_PROJECTION.md). ADR-119: [DECISIONS.md](./DECISIONS.md).

### Dashboard Projection (`integrations/dashboard-projection`) — Sprint 32.6 integration

| Aspect | Implementation |
|--------|----------------|
| **Purpose** | Deterministic projection layer translating immutable Unified Workspace snapshots into immutable Dashboard read models |
| **Flow** | Unified Workspace Service → Dashboard Projector → Dashboard Projection |
| **Models** | `DashboardProjection`, `DashboardProjectionResult`, `DashboardProjectionSnapshot`, card models |
| **Projector** | `DashboardProjector` validates workspace input, maps sections to Dashboard cards |
| **Application** | `projectWorkspaceToDashboard` / `projectAthleteWorkspaceToDashboard` |
| **Composition Root** | `DashboardProjectionFactory` registers `DashboardProjector` |
| **Design** | **No business logic. No persistence. No networking. No event bus. No scheduler. Unified Workspace remains producer; Dashboard is consumer only.** Dashboard never directly consumes Workout, Nutrition, Recovery, Goal Progress, or Coach Timeline |

Full detail: [DASHBOARD_PROJECTION.md](./DASHBOARD_PROJECTION.md). ADR-120: [DECISIONS.md](./DECISIONS.md).

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

### Nutrition Adaptation Engine (`features/nutrition-adaptation`) — Sprint 24.2

| Aspect | Implementation |
|--------|----------------|
| **Purpose** | Deterministic adaptation of an existing nutrition plan according to Continuous Adaptation decisions |
| **Flow** | Nutrition Plan + Nutrition Runtime + Athlete State + Continuous Adaptation Decision + Coach Context → Nutrition Adaptation Engine → `UpdatedNutritionPlan` → Nutrition Runtime |
| **Models** | `NutritionAdaptation`, `NutritionModification`, `UpdatedNutritionPlan`, `NutritionPackage`, `NutritionSnapshot`, `NutritionRuntimeInput`, … |
| **Engine** | `NutritionAdaptationEngine` / `NutritionAdaptationCoordinator` / `NutritionAdaptationSession` — adaptation orchestration only |
| **Evaluation / Planning / Adapters** | Deterministic evaluators, planners, and adapters (key → modification records; no generation, no AI) |
| **Application API** | `adaptNutrition`, `compareNutrition`, `describeNutritionAdaptation`, `createNutritionSnapshot`, `validateNutritionAdaptation` |
| **Integration** | Consumes Plan / Runtime / Athlete State / Continuous Adaptation / Coach Context via ports; produces `UpdatedNutritionPlan` / `NutritionAdaptationPackage` / `NutritionRuntimeInput` |
| **Design** | **No AI, prompts, providers, networking, persistence, UI, Tool Runtime, Action Engine, nutrition generation, or athlete goal changes.** Plan adaptation only |

Full detail: [NUTRITION_ADAPTATION_ENGINE.md](./NUTRITION_ADAPTATION_ENGINE.md). Nutrition Pipeline: [NUTRITION_PIPELINE.md](./NUTRITION_PIPELINE.md). Adaptive Coaching: [ADAPTIVE_COACHING.md](./ADAPTIVE_COACHING.md). ADR-078: [DECISIONS.md](./DECISIONS.md).

### Recovery Adaptation Engine (`features/recovery-adaptation`) — Sprint 24.3

| Aspect | Implementation |
|--------|----------------|
| **Purpose** | Deterministic adaptation of an existing recovery plan according to Continuous Adaptation decisions |
| **Flow** | Recovery Plan + Recovery Runtime + Athlete State + Continuous Adaptation Decision + Coach Context → Recovery Adaptation Engine → `UpdatedRecoveryPlan` → Recovery Runtime |
| **Models** | `RecoveryAdaptation`, `RecoveryModification`, `UpdatedRecoveryPlan`, `RecoveryPackage`, `RecoverySnapshot`, `RecoveryRuntimeInput`, … |
| **Engine** | `RecoveryAdaptationEngine` / `RecoveryAdaptationCoordinator` / `RecoveryAdaptationSession` — adaptation orchestration only |
| **Evaluation / Planning / Adapters** | Deterministic evaluators, planners, and adapters (key → modification records; no generation, no AI) |
| **Application API** | `adaptRecovery`, `compareRecovery`, `describeRecoveryAdaptation`, `createRecoverySnapshot`, `validateRecoveryAdaptation` |
| **Integration** | Consumes Plan / Runtime / Athlete State / Continuous Adaptation / Coach Context via ports; produces `UpdatedRecoveryPlan` / `RecoveryAdaptationPackage` / `RecoveryRuntimeInput` |
| **Design** | **No AI, prompts, providers, networking, persistence, UI, Tool Runtime, Action Engine, recovery generation, or athlete goal changes.** Plan adaptation only |

Full detail: [RECOVERY_ADAPTATION_ENGINE.md](./RECOVERY_ADAPTATION_ENGINE.md). Recovery Pipeline: [RECOVERY_PIPELINE.md](./RECOVERY_PIPELINE.md). Adaptive Coaching: [ADAPTIVE_COACHING.md](./ADAPTIVE_COACHING.md). ADR-079: [DECISIONS.md](./DECISIONS.md).

### Goal Progress Engine (`features/goal-progress`) — Sprint 24.4

| Aspect | Implementation |
|--------|----------------|
| **Purpose** | Deterministic evaluation of athlete progress toward active goals — evaluation only, no plan adaptation |
| **Flow** | Athlete State + Workout/Nutrition/Recovery Adaptation Engines + Decision History + Recommendation History → Goal Progress Engine → `GoalProgressState` → `ContinuousAdaptationInput` → Continuous Adaptation Engine |
| **Models** | `GoalProgress`, `GoalProgressState`, `GoalPackage`, `GoalSnapshot`, `GoalMilestone`, `GoalCheckpoint`, `GoalAchievement`, `GoalTimeline`, `GoalHistory`, … |
| **Engine** | `GoalProgressEngine` / `GoalProgressCoordinator` / `GoalProgressSession` — evaluation orchestration only |
| **Evaluation / Tracking / Comparison / Timeline** | Deterministic evaluators, trackers, comparators, and timeline builders (fixed ordinal tables and key diffs only; no AI, no prediction) |
| **Application API** | `evaluateGoalProgress`, `trackGoalProgress`, `describeGoalProgress`, `createGoalSnapshot`, `validateGoalProgress` |
| **Integration** | Consumes Athlete State / Workout / Nutrition / Recovery Adaptation / Decision / Recommendation history via ports; produces `GoalProgressState` / `GoalPackage` / `ContinuousAdaptationInput` |
| **Design** | **No AI, prompts, providers, networking, persistence, UI, Tool Runtime, Action Engine, workout/nutrition/recovery plan adaptation, or athlete goal mutation.** Goal evaluation only |

Full detail: [GOAL_PROGRESS_ENGINE.md](./GOAL_PROGRESS_ENGINE.md). Goal Evaluation Pipeline: [GOAL_EVALUATION_PIPELINE.md](./GOAL_EVALUATION_PIPELINE.md). Adaptive Coaching: [ADAPTIVE_COACHING.md](./ADAPTIVE_COACHING.md). ADR-080: [DECISIONS.md](./DECISIONS.md).

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
| 095 | Athlete Identity Foundation |
| 096 | Runtime Environment Foundation |
| 097 | Persistence Contract Foundation |
| 098 | Infrastructure Adapter Contracts |
| 099 | SQLite Infrastructure Adapter |
| 100 | Repository Adapter Integration |
| 101 | Authentication Adapter Foundation |
| 102 | Synchronization Adapter Foundation |
| 103 | Backend API Adapter Foundation |
| 104 | Logging & Observability Adapter Foundation |
| 105 | Architecture Consolidation Complete (Sprint 30.7) |
| 106 | Home Dashboard Architecture (Sprint 31.1) |
| 107 | Workout Runtime Experience (Sprint 31.2) |
| 108 | Coach Experience (Sprint 31.3) |
| 109 | Progress Experience (Sprint 31.4) |
| 110 | Nutrition Experience (Sprint 31.5) |
| 111 | Profile Experience (Sprint 31.6) |
| 112 | Notification & Reminder Framework Foundation (Sprint 31.7) |
| 113 | Progress & Analytics Framework Foundation (Sprint 31.8) |
| 114 | Coach Timeline Framework Foundation (Sprint 31.9) |

Full list: [DECISIONS.md](./DECISIONS.md). Audit: [ARCHITECTURE_REVIEW.md](./ARCHITECTURE_REVIEW.md).
