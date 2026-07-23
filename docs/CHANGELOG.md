# Changelog

**Project:** EVOLVE  
**Version:** 0.6.0 (current release)
**Status:** Living Document
**Last Updated:** 2026-07-23
**Purpose:** Semantic release history; accumulate changes under `[Unreleased]` until tagged.  
**Source of Truth:** Yes — for release versions and shipped changes.
All notable changes to EVOLVE are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Versioning Policy

Given a version number `MAJOR.MINOR.PATCH`:

- **MAJOR** — incompatible API changes, or breaking changes to the database schema/contract that require migration by consumers.
- **MINOR** — new functionality added in a backward-compatible manner (e.g., a new roadmap phase delivered).
- **PATCH** — backward-compatible bug fixes and small corrections.

While the project is pre-1.0 (`0.x.y`), the API and schema may still change between minor versions as the Foundation, Authentication, and Workout Engine phases stabilize. Version `1.0.0` will mark the first production-ready release (end of Phase 6).

Each release section groups changes under: `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, `Security`.

---

## [Unreleased]

### Added
- Sprint 21.1 — Agent Framework Foundation: `features/agent-framework` shared immutable agent contracts (`IAgent`, `IAgentFactory`, `IAgentRegistry`, lifecycle / capability / result contracts), models (`Agent`, `AgentDescriptor`, `AgentContext`, `AgentRequest`, `AgentResponse`, `AgentSnapshot`, `AgentSession`, `AgentState`, `AgentStatus`, `AgentRole`, `AgentPriority`, …), lifecycle (`AgentLifecycle`, `AgentStateMachine`, `AgentInitializer`, `AgentHealthChecker`, `AgentShutdown`), registries (Agent / Capability / Role / Metadata), `AgentFactory`, capability definitions, builders, validators, selectors, policies, `AgentFrameworkService`, application API (`registerAgent`, `resolveAgent`, `listAgents`, `describeAgent`, `validateAgent`), Workout Agent migration via `WorkoutFrameworkAgent` (`IAgent` adapter), and [AGENT_FRAMEWORK.md](./AGENT_FRAMEWORK.md) / [AGENT_LIFECYCLE.md](./AGENT_LIFECYCLE.md) / [AGENT_REGISTRY.md](./AGENT_REGISTRY.md) — framework infrastructure only; no domain logic, prompts, providers, networking, or persistence
- Sprint 20.3.0 — AI Action Engine Foundation: `features/action-engine` transforms immutable `CoachResponse` into immutable `ActionPlan` with models (`ActionPlan`, `ActionStep`, `ActionIntent`, `ActionType`, `ActionTarget`, `ActionArgument`, `ActionConstraint`, `ActionPriority`, `ActionDependency`, `ActionStatus`, `ActionMetadata`, `ActionSummary`, `ActionSnapshot`, `ActionExecutionPlan`, `ActionProposal`, `ActionCandidate`, `ActionValidation`, `ActionStatistics`, `ActionContext`, `ActionPackage`), action definitions (metadata only), deterministic planners (Workout/Nutrition/Recovery/Goal/Reminder/Composite), builders, validators, selectors, structural policies, execution contracts (`ActionExecutor`, `ExecutionContext`, `ExecutionStrategy`, `ExecutionRequest`, `ExecutionResult`), application API (`buildActionPlan`, `validateActionPlan`, `summarizeActionPlan`, `estimateExecution`, `describeActions`), and [ACTION_ENGINE.md](./ACTION_ENGINE.md) / [ACTION_PLANNING.md](./ACTION_PLANNING.md) — no domain execution, networking, persistence, provider SDK, AI calls, or business logic
- Sprint 19.1.1 — Prompt Builder Foundation: `features/prompt-builder` Conversation Context → Prompt Package composition with immutable models (`PromptPackage`, `PromptBlock`, `SystemPrompt`, `UserPrompt`, `AssistantPrompt`, `PromptTemplate`, `PromptPersona`, `PromptCapability`, `PromptKnowledge`, `PromptFormatting`, `PromptToolDefinition`, `PromptSafety`, `PromptConstraint`, `PromptInstruction`, `PromptComposition`, `PromptStatistics`, `PromptSummary`, `PromptSnapshot`, `PromptBuildResult`), independent block builders, domain templates, `PromptComposer`, validators, selectors, utilities, application API (`buildPromptPackage`, `buildSystemPrompt`, `buildUserPrompt`, `validatePromptPackage`), and [PROMPT_BUILDER.md](./PROMPT_BUILDER.md) — immutable prompt composition only; no AI providers, networking, HTTP, persistence, or response generation; preserves legacy coach-backed path under `models/coach/`
- Sprint 20.2.0 — Domain Tool Adapters: `features/domain-tools` thin adapters exposing existing domain capabilities to Tool Calling Foundation (`WorkoutToolAdapter`, `RecoveryToolAdapter`, `CoachToolAdapter`, `AthleteToolAdapter`) with isolated request/result mappers, `FoundationToolResultBuilder` / `AdapterContextBuilder`, validators (input/output mapping, adapter integrity, tool compatibility, execution context), `DomainToolService` (resolve → execute → immutable `FoundationToolResult`), application API (`executeDomainTool`, `listDomainTools`, `describeDomainTool`), and [DOMAIN_TOOL_ADAPTERS.md](./DOMAIN_TOOL_ADAPTERS.md) (Adapter Flow + Tool Integration + Future Adapter Extensions) — no business logic, algorithms, provider-specific code, or OpenAI code; consumes Tool Calling Foundation + Workout Generation + Performance/Achievement/Athlete History/Recovery/Insight/Coach engines without modifying existing domains
- Sprint 20.1.0 — Tool Calling Foundation: `features/tool-calling` provider-independent tool execution layer with immutable `ToolCall` / `ToolCallRequest` / `ToolEngineResult` models (`ToolDefinition`, `ToolDescriptor`, `ToolCategory`, `ToolCapability`, `ToolCallResponse`, `ToolExecution`, `ToolExecutionContext`, `ToolExecutionStatus`, `ToolExecutionResult`, `ToolExecutionMetadata`, `ToolExecutionError`, `ToolInput`, `ToolOutput`, `ToolParameter`, `ToolSchema`, `ToolRegistrySnapshot`), contracts (`ITool`, `IToolExecutor`, `IToolRegistry`, `IToolValidator`, `IToolProvider`), `ToolCallingEngine` (validate / resolve / prepare context / invoke executor / collect result), `FoundationToolExecutor`, `FoundationToolRegistry`, validators, builders, utilities, application API (`executeTool`, `listTools`, `describeTool`), and [TOOL_CALLING_FOUNDATION.md](./TOOL_CALLING_FOUNDATION.md) (Tool Registry + Execution Flow + Future Domain Tool Integration) — no Workout/Recovery/Nutrition/Coach implementations, business logic, or provider-specific code; consumes Streaming Foundation + AI Execution Pipeline + AI Provider Abstraction via context links; preserves legacy Conversation/Workflow `AITool` / `ToolExecutor` surfaces
- Sprint 20.0.0 — Streaming Foundation: `features/streaming` provider-agnostic streaming coordination with immutable `StreamRequest` / `StreamResponse` / `StreamState` / `StreamSnapshot` models (`StreamChunk`, `StreamToken`, `StreamEvent`, `StreamEventType`, `StreamStatus`, `StreamLifecycle`, `StreamMetadata`, `StreamMetrics`, `StreamTrace`, `StreamCancellation`, `StreamCompletion`, `StreamSummary`, `StreamError`), `StreamingEngine` (start / receive events / aggregate / update state / complete / cancel), isolated handlers (Lifecycle/Chunk/Token/Completion/Cancellation/Error), aggregators (Chunk/Token/Summary), validators, builders, utilities, application API (`startStream`, `cancelStream`, `summarizeStream`), and [STREAMING_FOUNDATION.md](./STREAMING_FOUNDATION.md) (Stream Lifecycle + Future Tool Calling Integration) — no OpenAI streaming implementation, memory, tool calling, conversation history, or provider-specific code; consumes AI Execution Pipeline + AI Provider Abstraction via `IStreamSource` without modifying previous domains
- Sprint 19.4.0 — AI Execution Pipeline Foundation: `features/ai-execution` provider-agnostic execution orchestration over Prompt Packages with immutable `AIExecutionRequest` / `AIExecutionResult` / `AIExecutionContext` models (`AIExecutionStage`, `AIExecutionState`, `AIExecutionStatus`, `AIExecutionLifecycle`, `AIExecutionTrace`, `AIExecutionMetrics`, `AIExecutionMetadata`, `AIExecutionError`, `AIExecutionEvent`, `AIExecutionCancellation`, `AIExecutionTimeout`, `AIExecutionPolicy`, `AIExecutionSummary`), modular stages (Validation/Context/ProviderResolution/Execution/Result/Lifecycle), policy interfaces only (`RetryPolicy`, `TimeoutPolicy`, `CancellationPolicy`, `ExecutionPolicy`), `AIExecutionPipeline`, validators, builders, utilities, application API (`executeAI`, `createExecutionContext`, `summarizeExecution`), and [AI_EXECUTION_PIPELINE.md](./AI_EXECUTION_PIPELINE.md) (Execution Lifecycle + Future Streaming / Retry / Tool Calling) — no streaming, retry implementation, tool calling, memory, HTTP, or provider-specific code; consumes `PromptPackage` + AI Provider Abstraction + OpenAI via executor wrapper without modifying previous domains
- Sprint 19.3.0 — OpenAI Provider Foundation: `features/openai-provider` concrete OpenAI adapter over AI Provider Abstraction with immutable `OpenAIRequest` / `OpenAIResponse` models (`OpenAIMessage`, `OpenAIChoice`, `OpenAIUsage`, `OpenAIError`, `OpenAIModelConfiguration`, `OpenAIExecutionResult`, `OpenAIProviderConfiguration`, `OpenAIClientOptions`), `OpenAIProvider` (`IAIProvider` + health/model + `execute()` / `health()` / `listModels()`), `OpenAIClient` (OpenAI SDK; SDK types confined to client), mappers (`PromptPackageMapper`, `ResponseMapper`, `ErrorMapper`), validators, builders, utilities, application API (`executePrompt`, `checkHealth`, `listAvailableModels`), env configuration (`OPENAI_API_KEY`, `OPENAI_MODEL`, `OPENAI_TIMEOUT`), and [OPENAI_PROVIDER.md](./OPENAI_PROVIDER.md) (Provider Flow + Configuration + Future Streaming Support) — no streaming, memory, tool calling, or conversation history; consumes `PromptPackage` + AI Provider Abstraction without modifying previous domains
- Sprint 19.2.0 — AI Provider Abstraction Foundation: `features/ai-provider` provider contract layer with immutable `AIRequest` / `AIResponse` / `AIProvider` models (`AIProviderId`, `AIProviderCapabilities`, `AIProviderConfiguration`, `AIProviderMetadata`, `AIProviderStatus`, `AIProviderHealth`, `AIProviderLimits`, `AIProviderError`, `AIProviderResult`, `AIExecutionContext`, `AIExecutionOptions`, `AITokenUsage`, `AIFinishReason`, `AIResponseChunk`, `AIModel`, `AIModelInfo`), contracts (`IAIProvider`, `IAIStreamingProvider`, `IAIHealthProvider`, `IAIModelProvider`, `IAIProviderRegistry`), `AIProviderRegistry`, validators, builders, utilities, `AIProviderEngine`, application API (`prepareAIRequest`, `resolveProvider`, `createExecutionContext`), and [AI_PROVIDER_ABSTRACTION.md](./AI_PROVIDER_ABSTRACTION.md) (Provider Registry + Future OpenAI Integration + Future Multi-provider Support) — interfaces and orchestration only; no OpenAI/Anthropic/Gemini/Ollama implementations, HTTP, networking, or SDKs; consumes `PromptPackage` without modifying Prompt Composition
- Sprint 19.1.0 — Prompt Composition Engine Foundation: `features/prompt-composition` Prompt Package composition layer with immutable `PromptPackage` / `PromptSnapshot` / `PromptSummary` models (`PromptBlock`, `PromptBlockType`, `PromptSection`, `PromptPriority`, `PromptMetadata`, `PromptContext`, `PromptConstraints`, `PromptInstruction`, `PromptKnowledge`, `PromptConversation`, `PromptMemory`, `PromptSafety`, `PromptIdentity`, `PromptUserInput`, `PromptEngineResult`, `PromptCompositionInput`, `PromptEngineError`), isolated composers (System/Identity/Knowledge/Conversation/Memory/Constraint/Safety/UserInput/Summary), validators, builders, utilities, `PromptCompositionEngine`, application API (`composePromptPackage`, `createPromptSnapshot`, `summarizePromptPackage`), and [PROMPT_COMPOSITION.md](./PROMPT_COMPOSITION.md) (Prompt Package + Future Provider Mapping) — immutable structured prompt composition only; no AI, networking, HTTP, OpenAI/Anthropic/Gemini/Ollama, or provider-specific string prompt generation; consumes `ConversationContext` without modifying Conversation Orchestrator or upstream domains
- Sprint 19.0.0 — Conversation Orchestrator Foundation: `features/conversation-orchestrator` Conversation Context preparation layer with immutable `ConversationContext` / `ConversationSnapshot` / `ConversationSummary` models (`ConversationSession`, `ConversationMessage`, `ConversationTurn`, `ConversationIntent`, `ConversationGoal`, `ConversationAudience`, `ConversationPriority`, `ConversationConstraint`, `ConversationMetadata`, `ConversationKnowledge`, `ConversationEvidence`, `ConversationEngineResult`, `ConversationPreparation`, `ConversationState`, `ConversationStage`, `ConversationRequest`, `ConversationResponsePlaceholder`), isolated selectors (Knowledge/Priority/Goal/Evidence/Constraint/Session), validators, builders, utilities, `ConversationOrchestratorEngine`, application API (`prepareConversation`, `createConversationSnapshot`, `summarizeConversation`), and [CONVERSATION_ORCHESTRATOR.md](./CONVERSATION_ORCHESTRATOR.md) (Conversation Context + Future Prompt Builder placeholder) — immutable orchestration only; no AI, prompts, LLM, networking, HTTP, persistence, or conversation generation; consumes `CoachingContext` without modifying Coach Intelligence or upstream domains
- Sprint 18.8.0 — Coach Intelligence Foundation: `features/coach-intelligence` Coaching Context preparation layer with immutable `CoachingContext` / `CoachContextSnapshot` / `CoachingContextSummary` models (`CoachSession`, `CoachObjective`, `CoachIntent`, `CoachPriority`, `CoachConstraint`, `CoachInstruction`, `CoachFocus`, `CoachEvidence`, `CoachMetadata`, `CoachEngineResult`, `CoachPreparation`, `CoachAudience`, `CoachCommunicationStyle`, `CoachKnowledge`, `CoachReason`), isolated selectors (Insight/Priority/Evidence/Recovery/History/Objective), validators, builders, utilities, `CoachIntelligenceEngine`, application API (`prepareCoachingContext`, `createCoachSnapshot`, `summarizeCoachingContext`), and [COACH_INTELLIGENCE.md](./COACH_INTELLIGENCE.md) (Coaching Context + Future Prompt Builder + Future AI Provider placeholders) — immutable coaching context preparation only; no AI, prompts, LLM, networking, HTTP, persistence, or conversation; preserves existing history-backed coach insights API
- Sprint 18.7.0 — Insight Engine Foundation: `features/insight-engine` with immutable `InsightSnapshot` / `Insight` / `InsightCollection` models (`InsightType`, `InsightCategory`, `InsightSeverity`, `InsightPriority`, `InsightStatus`, `InsightContext`, `InsightEvidence`, `InsightReason`, `InsightMetadata`, `InsightSummary`, `InsightEngineResult`), isolated generators (Performance/Achievement/Recovery/History/Summary), validators, builders, utilities, `InsightEngine`, application API (`generateInsights`, `createInsightSnapshot`, `summarizeInsights`), and [INSIGHT_ENGINE.md](./INSIGHT_ENGINE.md) (Insight Model + Future Coach Integration placeholder) — deterministic domain insights only; no AI, recommendations, persistence, networking, prompts, LLM, or conversation
- Sprint 18.6.0 — Recovery Intelligence Foundation: `features/recovery-intelligence` with immutable `RecoverySnapshot` / `RecoveryMetrics` / `RecoveryStatus` / `RecoveryAssessment` models (TrainingLoad, FatigueScore, DensityLoad, FrequencyLoad, RecoveryWindow, RecoveryIndicator, RecoveryEvidence, RecoveryContext, RecoverySummary, RecoveryEngineResult), isolated calculators, validators, builders, utilities, `RecoveryIntelligenceEngine`, application API (`analyzeRecovery`, `createRecoverySnapshot`, `summarizeRecovery`), and [RECOVERY_INTELLIGENCE.md](./RECOVERY_INTELLIGENCE.md) (Recovery Metrics + Future Readiness Model placeholder) — deterministic recovery metrics only; no AI, recommendations, persistence, networking, predictions, sleep, or wearables
- Sprint 18.5.0 — Athlete History Foundation: `features/athlete-history` with immutable `AthleteHistory` / `HistorySnapshot` / `HistoryEntry` models (workout/performance/achievement specializations; nutrition/recovery/sleep/bodyweight/coach/goals/milestones/challenges reserved), isolated aggregators, validators, builders, utilities, `AthleteHistoryEngine`, application API (`buildAthleteHistory`, `createHistorySnapshot`, `summarizeHistory`), and [ATHLETE_HISTORY.md](./ATHLETE_HISTORY.md) — immutable domain modeling only; no AI, persistence, networking, storage, querying/filtering, timeline UI, or calendar
- Sprint 18.4.0 — Achievement Engine Foundation (Personal Records): `features/achievement-engine` with immutable `Achievement` / Personal Record models, extensible type/category architecture (milestones/badges/goals/challenges/streaks reserved), isolated PR detectors (weight/volume/tonnage/reps/sets/density/session/exercise volume), validators, builders, utilities, engine-emitted `AchievementUnlockedEvent` / `PersonalRecordUnlockedEvent` (no subscribers), injected `PersonalRecordBaselineProvider` comparison only, application API (`evaluateAchievements`, `detectPersonalRecords`, `summarizeAchievements`), and [ACHIEVEMENT_ENGINE.md](./ACHIEVEMENT_ENGINE.md) — achievements only; no AI, persistence, networking, history store, badges/streaks/gamification implementation
- Sprint 18.3.0 — Performance Engine Foundation: `features/performance-engine` with immutable `PerformanceSnapshot` / metric groups (volume/intensity/density/completion), exercise/session/movement performance, grade/summary/context/result, single-session `PerformanceTrend` placeholder, isolated calculators, validators, builders, utilities, `PerformanceEngine`, application API (`analyzeWorkoutPerformance`, `summarizePerformance`, `gradePerformance`), Workout Runtime + Domain Events integration, and [PERFORMANCE_ENGINE.md](./PERFORMANCE_ENGINE.md) — single-session analytics only; no AI, persistence, networking, history, PRs, recovery, or recommendations
- Sprint 18.2.0 — Session Events Foundation: `core/domain-events` with immutable `DomainEvent` lifecycle models, `EventStream` / `EventStreamStore`, synchronous `DomainEventDispatcher`, subscriber interfaces only (Performance/Timeline/Coach/Analytics/Achievement/Recovery), builders/validators/utilities, application API (`publishEvent`, `subscribe`, `unsubscribe`, `getEventStream`, `summarizeEvents`), Workout + Rest Runtime emission integration, and [DOMAIN_EVENTS.md](./DOMAIN_EVENTS.md) — domain events only; not an event bus; no persistence, networking, async queues, brokers, analytics implementations, or subscriber implementations
- Sprint 18.1.0 — Rest & Time Runtime Foundation: `features/rest-runtime` with `RestRuntime` / `RestSession` / `RestState` / `RestStatus`, validated lifecycle (`Idle`→`Running`↔`Paused`→`Completed`/`Cancelled`/`Expired`), `RestRuntimeEngine` (start/pause/resume/cancel/complete + injected `updateElapsedTime`, remaining/overtime/completion %), builders/validators/utilities, opaque `ActiveRest` + application API (`startRest`, `pauseRest`, `resumeRest`, `cancelRest`, `completeRest`, `updateElapsedTime`), optional `WorkoutRuntime.restRuntime` ownership, and [REST_RUNTIME.md](./REST_RUNTIME.md) — no UI, platform timers, persistence, networking, AI, notifications, or analytics
- Sprint 18.0.0 — Workout Runtime Foundation: `features/workout-runtime` with `WorkoutRuntime` / `ExerciseRuntime` / `SetRuntime`, validated `WorkoutState`/`SessionState` machine, `WorkoutRuntimeEngine` (start/pause/resume/finish, exercise/set progression, completion %), builders/validators/utilities, opaque `ActiveWorkout` + application API (`startWorkout`, `pauseWorkout`, `resumeWorkout`, `completeWorkout`, `skipExercise`, `completeSet`), and [WORKOUT_RUNTIME.md](./WORKOUT_RUNTIME.md) — execution state only; consumes immutable `WorkoutSession`; no Program Generation changes, UI, persistence, networking, timers, analytics, history, or AI
- Sprint 17.10.0 — Decision Intelligence Foundation: `app/src/core/decision-intelligence/` with immutable decision graph (`DecisionNode` / `DecisionEdge` / `DecisionGraph`), `DecisionRecorder`, template-based `ExplanationBuilder`, `DecisionReport` / `ExecutionReport`, validators, utilities, application API (`createDecisionReport`, `createExecutionReport`, `explainWorkoutDecision`, `summarizeDecisionGraph`), pipeline integration via existing engine explanations + `ProgramGenerationOrchestrator.buildDecisionIntelligence`, and [DECISION_INTELLIGENCE.md](./DECISION_INTELLIGENCE.md) — structured domain explanations only; no engine/business logic changes, AI, networking, persistence, telemetry, logging framework, analytics platform, or UI
- Sprint 17.9.0 — Composition Root & Dependency Injection Foundation: `app/src/core/composition/` with `CompositionRoot`, `ApplicationContainer` (singleton/transient, freeze, validation), typed `ServiceRegistry` / `ServiceMap`, creation-only factories, in-memory configuration/repository/strategy providers, application defaults via `resolveService`, and [COMPOSITION_ROOT.md](./COMPOSITION_ROOT.md) — wiring only; no AI, networking, persistence, UI, caching, analytics, or engine/business logic changes
- Sprint 17.8.0 — Integration Framework Foundation: `app/tests/integration/` with immutable athlete fixtures, fluent builders, domain assertions (`expectWorkout`), complete-pipeline scenario tests, normalized golden snapshots, snapshot/pipeline utilities, and [INTEGRATION_TESTING.md](./INTEGRATION_TESTING.md) — testing infrastructure only; no production behavior, AI, networking, persistence, analytics, caching, UI, or engine changes
- Sprint 17.7.0 — Program Generation Orchestrator Foundation: `features/program-generation` with immutable `WorkoutGenerationResult` / `PipelineExecutionSummary` / `PipelineExecutionTrace`, `ProgramGenerationOrchestrator` (validate → context → blueprint → selection → programming → progression → adaptation → assembly → freeze), validators, structural utilities, thin `ProgramGenerationService`, application use-cases (`generateWorkoutProgram`, `previewWorkoutProgram`, `explainWorkoutGeneration`) — coordination only; no engine duplication, AI, networking, persistence, caching, execution state, analytics, UI
- Sprint 17.6.0 — Workout Assembly Engine Foundation: `features/workout-assembly` with immutable `WorkoutSession` / `WorkoutExercise` / `WorkoutBlock` / `WorkoutSummary`, `WorkoutAssemblyEngine` (context → resolve recommendations → assemble exercises → blocks → summary → freeze), validators, utilities, in-memory result cache, application use-cases (`assembleWorkout`, `previewWorkout`, `explainWorkout`) — assembly only; no strategy, programming, progression, readiness, execution state, timers, analytics, UI, or networking
- Sprint 17.5.0 — Training Adaptation Engine Foundation: `features/training-adaptation` with immutable `TrainingAdaptationResult` / `ReadinessAssessment` / `AdaptationRecommendation`, `TrainingAdaptationEngine` (recovery/fatigue/constraint/execution assessments + volume/intensity/swap/recovery-day/schedule strategies), validators, utilities, in-memory result cache, application use-cases (`evaluateTrainingReadiness`, `previewAdaptations`, `explainAdaptations`) — recommendations only; no wearables, athlete history, physiological APIs, workout modification, UI, or networking
- Sprint 17.4.0 — Progression Engine Foundation: `features/progression` with immutable `ProgressionPlan` / `ExerciseProgression` / `ProgressionStep`, `ProgressionEngine` (linear/volume/intensity/frequency/rotation strategies), validators, timeline utilities, in-memory plan cache, application use-cases (`generateProgression`, `previewProgression`, `explainProgression`) — no athlete feedback, load calculation, autoregulation, fatigue, deload, UI, or networking
- Sprint 17.3.0 — Programming Engine Foundation: `features/programming` with `ExercisePrescription` / `ProgrammingResult`, `ProgrammingEngine` (volume/intensity/rest/tempo/order/priority strategies), validators, estimates, in-memory result cache, application use-cases (`programExercises`, `previewProgramming`, `explainProgramming`) — no progression, weekly planning, workout assembly, UI, or networking
- Sprint 17.2.0 — Exercise Selection Engine Foundation: `features/exercise-selection` with deterministic `ExerciseSelectionEngine`, `SelectionContext`, strategy/selector pipelines, ranking/filtering, in-memory result cache, application use-cases (`selectExercises`, `previewExerciseCandidates`, `explainSelection`) — no sets/reps/RPE/volume/programming
- Sprint 17.1.0 — Exercise Knowledge Base Foundation: `features/exercise-kb` read-only bounded context with immutable `ExerciseDefinition`, relationship graph, validators, illustrative in-memory catalog, `ExerciseKnowledgeService` + application queries — no workout logic, selection, UI, or durable persistence
- Sprint 14.0.0 — Workout Analytics Foundation: `features/analytics` domain with `WorkoutAnalytics` / `ExerciseAnalytics` / `WeeklyAnalytics` / `WorkoutTrend` models, `WorkoutAnalyticsRepository` (`HistoryBackedWorkoutAnalyticsRepository` over `WorkoutHistoryRepository`), application use-cases + `useWorkoutAnalytics` hook, volume/frequency trend APIs — no screens, charts, dashboards, or AI
- Sprint 13.2.0 — Workout Detail Experience: `WorkoutDetailScreen` + reusable `WorkoutDetailHero` / `WorkoutMetricsGrid` / `WorkoutExerciseCard` / `WorkoutSetRow` / `WorkoutDetailFooter`, `getCompletedSession` / `useWorkoutDetail`, empty/not-found state — loads via `WorkoutHistoryRepository.getCompletedSession`; completed exercises/sets persisted on `CompletedWorkout`; no editing, deletion, analytics, PRs, sharing, export, or AI
- Sprint 13.1.0 — Workout History Timeline: `WorkoutHistoryScreen` + reusable `WorkoutHistoryCard`, `listCompletedSessions` / `useWorkoutHistory`, empty state, and detail-route stub — reads exclusively via `WorkoutHistoryRepository`; newest-first; no analytics, charts, filters, search, export, or cloud sync
- Sprint 13.0.0 — Workout History Persistence Foundation: on-device `CompletedWorkout` domain model, `StorageAdapter` / `AsyncStorageAdapter`, `WorkoutHistoryRepository` (`saveCompletedSession`, `getCompletedSessions`, `getCompletedSession`, `getRecentSessions`, `clearHistory`), and application `persistCompletedSession` — auto-saves after summary build with no UI changes; no analytics, charts, or dashboards
- Sprint 12.7.0 — Finish Workout Flow: local session completion detection, Finish Workout CTA, `WorkoutSessionSummary` mapper, in-memory summary handoff, and `WorkoutSessionCompleteScreen` — still no persistence, sync, AI, WorkoutSessionBuilder, or Training Engine changes
- Sprint 12.6.0 — Rest Timer & Set Flow: local `useSessionTiming` rest countdown (pause / resume / skip), automatic next-set selection, active-set highlight, and auto-scroll on `WorkoutSessionScreen` — still no persistence, sync, AI, WorkoutSessionBuilder, or Training Engine changes
- Sprint 12.5.0 — Interactive Workout Session: local-only set interaction via `useLocalSessionInteraction` (complete/uncomplete/skip, edit completed reps/load, session + exercise progress) without mutating immutable `WorkoutSession`, persistence, timers, AI, or the Training Engine
- Sprint 12.4.0 — Connect Start Workout flow: `useStartWorkoutSession` invokes application-layer `WorkoutSessionBuilder`, in-memory `executableSessionHandoff`, and `WorkoutSessionScreen` renders immutable application `WorkoutSession` models (title, subtitle, ordered sets, reps, intensity, rest, progression)
- Restored Expo Router tree under `app/app/` (thin routes) so preview → session navigation works again
- Default program auto-assignment on first workout access (Sprint 6.3.1)
- `WorkoutService.ensure_active_assignment()` and `assign_default_program()` — reuses `assign_program()` with `Settings.default_program_slug`
- `database/seeds/seed_default_program.py` — idempotent `beginner-foundation` program seed
- `DEFAULT_PROGRAM_SLUG` setting (default: `beginner-foundation`)
- Workout Engine v1 — production backend integration for mobile Workout domain (Sprint 6.3)
- `GET /api/v1/workouts/current` — workout resolution preview alias
- `POST /api/v1/workouts/session` and `PATCH /api/v1/workouts/session/{id}` — session lifecycle aliases (`finish`/`skip`/notes)
- `GET /api/v1/workouts` + `GET /api/v1/workouts/{id_or_slug}` — read-only workout template browsing with embedded exercise catalog refs
- `POST /api/v1/workout-logs/{id}/exercises/{exercise_id}/skip` — per-exercise skip within a session (`WorkoutLogExercise.skipped`, migration `37fd64b528a8`)
- `BackendWorkoutService` — full `WorkoutService` implementation against `/workout-resolution/*`, `/workouts/*`, `/workout-logs/*`
- `app/src/api/workouts.ts` — typed workout domain API client
- `backendWorkoutAdapters.ts` — DTO → production model mapping (muscle/equipment slugs, placeholder sets, history)
- `useWorkout()` hook — loads today's workout via `workoutService.getTodayWorkout()`; surfaces `error` for non-training-day states
- Workout unit/integration tests: `test_workouts_api.py`, `test_workout_logs_api.py`, `BackendWorkoutService.test.ts`, `useWorkout.test.ts`
- `UserService` with `update_profile()` — partial profile updates with email/username conflict detection
- `PATCH /api/v1/users/me` route wired through `get_user_service()` dependency
- Mobile user profile provider stack: `BackendUserService`, `MockCurrentUserService`, `useCurrentUser()` hook
- `updateCurrentUser()` API client for profile PATCH
- Unit tests (`test_user_service.py`) and integration tests (`test_users_api.py`)
- Profile edit mode on `ProfileScreen` — `useProfileEdit`, `ProfileEditForm`, validation, save/cancel (Sprint 6.1)
- `CurrentUserService.updateProfile()` and `useCurrentUser().updateProfile()` / `saving` state (Sprint 6.1)
- Profile form utilities (`profileForm`, `profileValidation`, `profileLabels`) and screen/service tests (Sprint 6.1)
- Official project knowledge base under `docs/` (Sprint DOC-1): README index, master report, project state, sprint history, architecture summary, status reports, API inventory, known issues
- [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md) and [TECH_STACK.md](./TECH_STACK.md) (Sprint DOC-1.1)
- Standardized document headers across all `docs/` markdown files
- Documentation Maintenance Policy in [README.md](./README.md)

### Changed
- Architecture docs now describe Workout Runtime (18.0) after Decision Intelligence — live execution state of assembled `WorkoutSession` without Program Generation changes
- Architecture docs now describe the mobile AI workout pipeline through Program Generation Orchestrator (17.1–17.7)
- `CompletedWorkout` / `WorkoutSessionSummary` now carry ordered exercise snapshots with completed sets (weight, reps, set number) for detail rendering; legacy history entries parse with empty `exercises` (Sprint 13.2.0)
- Optional `programName` on `WorkoutSessionSummary` / `CompletedWorkout` (from session `programTitle`); history entry from Workout tab; card press → detail stub (Sprint 13.1.0)
- `useSessionFinish.buildSummary()` persists a `CompletedWorkout` via the application layer after mapping (fire-and-forget; finish navigation unchanged) (Sprint 13.0.0)
- `WorkoutSessionScreen` orchestrates interaction + timing + finish hooks; when all sets are accounted, Finish Workout builds a local `WorkoutSessionSummary` and navigates to Workout Complete (Sprint 12.7.0)
- `WorkoutSessionScreen` orchestrates `useLocalSessionInteraction` + `useSessionTiming`; rest timer, active-set highlight, and auto-scroll guide set flow locally (Sprint 12.6.0)
- `WorkoutSessionScreen` consumes `useLocalSessionInteraction` for local execution overlay; `SessionHero` / `SessionExerciseList` / `SessionSetRow` show live progress and set actions (Sprint 12.5.0)
- `WorkoutScreen` Start Workout CTA builds a session via `WorkoutSessionBuilder` (selected preview day) and navigates to `/(app)/workout/session` — React holds UI state only; no Training Engine changes (Sprint 12.4.0)
- `WorkoutSessionScreen` now displays application-layer executable sessions (read-only briefing); logging remains deferred
- `GET /workout-resolution/today` and `GET /workouts/current` auto-assign the default beginner program when the user has no active assignment; return **503** when the default program is not seeded (Sprint 6.3.1)
- `EXPO_PUBLIC_WORKOUT_PROVIDER` defaults to `backend` (mirrors user profile provider)
- API endpoint counts reconciled: **56 implemented**, **6 planned** ([API_STATUS.md](./API_STATUS.md))
- `ProfileScreen` now supports read/edit modes with backend-backed save via `useCurrentUser()` (Sprint 6.1)
- `ProfileScreen` now consumes `useCurrentUser()` instead of `profileMock` + direct `useAuth()` user fields
- `CurrentUserService` extended with `providerId` and `refresh()` for async backend loading
- API endpoint counts reconciled: **50 implemented**, **6 planned** ([API_STATUS.md](./API_STATUS.md))
- `docs/ROADMAP.md` — phase completion status table
- `docs/DECISIONS.md` — standard document header
- API endpoint counts reconciled: **49 implemented**, **7 planned** ([API_STATUS.md](./API_STATUS.md))

### Architecture
- Three new mobile bounded contexts: Exercise Knowledge Base (read-only), Exercise Selection Engine (deterministic), Programming Engine (immutable prescriptions)
- Pipeline boundary clarified: Programming stops at prescriptions; progression/assembly/program generation are separate future engines
- ADRs 028–030 appended for Knowledge / Selection / Programming boundaries

### Testing
- Jest suites added for `exercise-kb` (6), `exercise-selection` (8), and `programming` (7) covering models/engine/strategies/validators/utils/repository/service/application

### Typecheck
- New domains are TypeScript-strict application modules under `app/src/features/`; no new HTTP contracts or schema migrations
---

## [0.5.0] — Mobile App (Partial)

**Corresponds to:** Roadmap Phase 5 — Mobile App (Sprints 5.1, 5.2, 5.6)

### Added
- React Native + Expo mobile client at `app/` (ADR-025)
- JWT auth flow with expo-secure-store token persistence (ADR-026)
- Design system with light/dark/system theme support
- 6-tab navigation: Home, Workout, Nutrition, Coach, Progress, Profile
- Feature-module architecture with service factory + provider pattern
- Workout domain foundation (types, hooks, mock program data)
- UI polish: animations, hero components, settings screens, haptics
- Mobile test suite (Jest + Testing Library)

### Notes
- All feature data uses mock providers; backend integration is Sprint 5.3
- Dark mode added in Sprint 5.6 (extends ADR-027 light-only scope)

---

## [0.4.0] — AI Coach

**Corresponds to:** Roadmap Phase 4 — AI Coach (Sprints 4.1–4.6)

### Added
- Workout Resolution Engine with stored program cursor (ADR-006)
- AI Orchestrator, Memory Engine, Conversation/ChatMessage persistence (ADRs 007–009)
- Nutrition Engine — rule-based BMR/TDEE/macros (ADRs 010–013)
- Recovery Engine — readiness scoring from check-ins + training load (ADRs 014–016)
- Coach API with Workout/Nutrition/Recovery engine adapters (ADRs 017–019)
- Goal and Progress domains with Progress Analyzer (ADRs 022–023)
- OpenAI-compatible LLM provider with graceful degradation (ADRs 020–021)
- LLM-primary intent classification with keyword fallback (ADR-024)
- Endpoints: `/coach`, `/nutrition`, `/recovery`, `/goals`, `/progress`

---

## [0.3.0] — Workout Engine

**Corresponds to:** Roadmap Phase 3 — Workout Engine (Sprints 3.1–3.3, 4.1)

### Added
- Exercise catalog with read-only API and seed data
- Program, workout template, and program assignment models
- Full workout logging lifecycle (start → log sets → finish/skip → history)
- Workout Resolution Engine (`GET /workout-resolution/today`)
- 8 Alembic migrations covering full fitness domain schema
- Comprehensive unit and integration test suite

### Notes
- Program/workout authoring exists in service layer but has no HTTP API yet

---

## [0.2.0] — Authentication

**Corresponds to:** Roadmap Phase 2 — Authentication (Sprints 2.1–2.2)

### Added
- `User` model with Argon2 password hashing
- JWT access + refresh token flow
- `AuthService`, `UserRepository`, `get_current_user` dependency
- Endpoints: `POST /auth/register`, `/auth/login`, `/auth/refresh`, `GET /users/me`
- First Alembic migration (`users` table)

### Notes
- Profile update endpoint and role field deferred to Sprint 2.3 completion

---

## [0.1.0] — Foundation

**Corresponds to:** Roadmap Phase 1 — Foundation

### Added
- SQLAlchemy 2.x database engine, session factory, and `get_db()` dependency (`backend/app/db/database.py`).
- Environment-based application configuration via Pydantic Settings (`backend/app/core/config.py`).
- `DATABASE_URL` and core application environment variables documented in `.env.example`.
- Alembic fully configured (`alembic.ini`, `env.py`, `script.py.mako`), wired to read the database URL from application settings.
- Model registration hook (`backend/app/db/base.py`) for future Alembic autogeneration.
- Project architecture reference (`EVOLVE_ARCHITECTURE.md`) covering vision, backend architecture, folder structure, AI architecture, database entities, roadmap, coding standards, and deployment strategy.
- Cursor project rules (`evolve.mdc`) defining Clean Architecture conventions for all future contributions.

### Changed
- Consolidated `backend/requirements.txt`, removing duplicate and conflicting dependencies (`psycopg2-binary` in favor of `psycopg[binary]`); added `pydantic-settings`.

### Notes
- No Alembic migrations have been generated yet — the migration chain begins with the `User` model in Phase 2.
- `backend/app/main.py` intentionally remains unchanged from its original minimal health-check form; database wiring at startup is deferred until the foundation is fully verified and migrations exist.
- No authentication, user, or AI functionality is included in this release — strictly database and configuration foundation.

---

*Next release: `1.0.0` (Production — Phase 6).*
