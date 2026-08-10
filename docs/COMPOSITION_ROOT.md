# Composition Root & Dependency Injection

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-29  
**Purpose:** Document the mobile Composition Root, Dependency Container, factories, providers, registry, and service lifecycle (Sprint 17.9 + Sprint 23.1 coaching integration + Sprint 23.2 legacy consolidation + Phase 29–30 persistence/infrastructure wiring).  
**Source of Truth:** Yes — for Composition Root layout and DI rules on mobile.

Related: [ARCHITECTURE.md](./ARCHITECTURE.md), [ARCHITECTURE_REVIEW.md](./ARCHITECTURE_REVIEW.md), [AI_SYSTEM.md](./AI_SYSTEM.md), [DECISIONS.md](./DECISIONS.md) (ADR-036, ADR-105).

---

## Architecture Summary

```
Application (use-cases / Coach / Dashboard)
  ↓ resolveService(token)
Composition Root
  ↓
Dependency Container (ApplicationContainer)
  ↓
Service Registry (typed ServiceMap — 57 tokens)
  ↓
Factories + thin port adapters (object creation / wiring only)
  ↓
Feature Services  |  Persistence/Infra Contracts  |  Infrastructure Adapters
  ↓
Training Intelligence  |  Coaching Architecture Pipeline  |  SQLite / Repos / Auth / Sync / Backend / Logging
```

Rules:

- The **Composition Root** is the only place allowed to wire/instantiate registered pipeline and foundation services for application defaults.
- Application code **requests** services; it must not manually `new` them.
- Factories contain **no business logic** — creation and wiring only.
- Port adapters are **thin** — structural mapping between module contracts only.
- Training Intelligence providers remain **in-memory** for engine defaults.
- Persistence and Infrastructure **implementations** are created only in the Composition Root and must never be imported by Domain/features.
- Domain depends on **contracts** (`core/persistence`, `core/infrastructure`); Composition Root binds contracts to adapters.

Module: `app/src/core/composition/`.

---

## Dependency Graph

### Training Intelligence

```
CompositionRoot
 ├─ ConfigurationProvider → CompositionConfiguration
 ├─ RepositoryProvider    → in-memory repositories
 ├─ StrategyProvider      → default strategies / assessments
 └─ ApplicationContainer
      ├─ WorkoutBlueprintService
      ├─ ExerciseSelectionService
      ├─ ProgrammingService
      ├─ ProgressionService
      ├─ TrainingAdaptationService
      ├─ WorkoutAssemblyService
      └─ ProgramGenerationService
           └─ ProgramGenerationOrchestrator → (six leaf services)
```

### Coaching Architecture (Sprint 23.1+)

```
AgentCapabilityService
  └─ SupervisorRoutingService
       └─ (via RoutingPort adapter) CoachSupervisorService
AgentCollaborationService
  └─ (via CollaborationPort adapter) CoachSupervisorService
       └─ (via CoachSupervisorPort adapter) CoachingSessionService

WorkoutAgentService ─┐
NutritionAgentService├─ AthleteStateService
RecoveryAgentService─┘
       └─ ContextFusionService ← CoachingSession / Supervisor / Agents
            └─ DecisionEngineService
                 └─ RecommendationEngineService
```

Product composition services (Home, Daily Brief, Weekly Report, Workspaces, Identity, Runtime Environment, Plan History/Restore, Timeline, Insights, Explainable Session, Coach Conversation, Workout Generation Pipeline) are also registered in the same container.

### Persistence & Infrastructure (Phase 29–30)

```
PersistenceContractsFactory → PersistenceContractRegistry / RepositoryRegistry / StorageContractRegistry
InfrastructureAdapterFactory → InfrastructureAdapterRegistry (contracts metadata)
SQLiteAdapterFactory → SQLiteConnection / SQLiteAdapter / SQLiteRepositories
RepositoryAdapterFactory → RepositoryAdapterRegistry / RepositoryAdapters
AuthenticationFactory → AuthenticationRegistry / MockAuthenticationProvider / AuthenticationFactory
SynchronizationFactory → SynchronizationRegistry / SynchronizationEngine / SynchronizationFactory
BackendFactory → BackendRegistry / MockBackendProvider / BackendFactory
LoggerFactory → LoggerRegistry / MockLogger / LoggerFactory
WorkoutProgressIntegrationFactory → WorkoutProgressPublisher / ProgressAnalyticsSubscriber
NutritionProgressIntegrationFactory → NutritionProgressPublisher / NutritionProgressSubscriber
RecoveryProgressIntegrationFactory → RecoveryProgressPublisher / RecoveryProgressSubscriber
GoalProgressIntegrationFactory → GoalProgressPublisher / GoalProgressSubscriber
```

Execution entry points:

| Entry | Path |
|-------|------|
| Coach UI | `createCoachConversationRuntime` → `CoachingSessionService` → Supervisor → Routing → Collaboration → Agents |
| Dashboard recommendations | `weightUpdatedPipeline` → `RecommendationEngineBridge` → Recommendation Engine ← Decision ← Context Fusion ← Athlete State |
| Persistence / infra | `resolveService("SQLiteAdapter" \| "RepositoryAdapters" \| "MockAuthenticationProvider" \| …)` |

Legacy `decisionEngine` / `recommendations` modules remain as **compatibility
facades** (Sprint 23.2). Application recommendation generation defaults to the
Composition Root Recommendation Engine via `DefaultRecommendationService` →
`RecommendationEngineBridge`. Legacy rule generation is fallback-only.

### Deprecated / Compatibility Modules (Sprint 23.2)

| Module | Status | Replacement |
|--------|--------|-------------|
| `features/decisionEngine` | Deprecated — types + rule fallback | `features/decision-engine` + Recommendation Engine |
| `features/recommendations` service (rule path) | Thin facade; `LegacyRuleRecommendationService` deprecated | Composition Root + bridge; store/widget retained |
| `features/coach-agent` | Deprecated — no production call sites | Coach Supervisor + Routing + Collaboration |
| `features/coach/hooks/useCoachChat` | Deprecated | `useCoachConversation` + `createCoachConversationRuntime` |

Do not add new call sites to deprecated modules. Keep public exports stable until a later removal sprint.

---

## Composition Root

Public API (`app/src/core/composition`):

| API | Role |
|-----|------|
| `createCompositionRoot(options?)` | Build a fresh frozen root |
| `getCompositionRoot()` | Process-wide lazy singleton root |
| `resetCompositionRoot()` | Clear process root (tests) |
| `resolveService(token)` | Typed resolve from process root |

`CompositionRoot` also exposes typed getters and the underlying `container` / `registry`.

Bootstrap sequence:

1. Merge configuration (locked to in-memory / default strategies for training providers).
2. Register all `SERVICE_TOKENS` with factories.
3. `validate()` — required tokens present; eager resolve surfaces circular/invalid factories.
4. `freeze()` — reject late registrations.
5. `ServiceRegistry.assertIntegrity()`.

Default lifecycle: **singleton** (`preferSingletons: true`). Prefer singletons for the SQLite graph.

---

## Factories

### Training Intelligence

| Factory | Creates |
|---------|---------|
| `WorkoutBlueprintFactory` | `WorkoutBlueprintService` |
| `SelectionFactory` / `ExerciseSelectionFactory` | `ExerciseSelectionService` |
| `ProgrammingFactory` | `ProgrammingService` |
| `ProgressionFactory` | `ProgressionService` |
| `TrainingAdaptationFactory` | `TrainingAdaptationService` |
| `WorkoutAssemblyFactory` | `WorkoutAssemblyService` |
| `ProgramGenerationFactory` | `ProgramGenerationService` + orchestrator |

### Coaching Architecture

| Factory | Creates |
|---------|---------|
| `AgentCapabilityFactory` | `AgentCapabilityService` (seeded specialists) |
| `WorkoutAgentFactory` / `NutritionAgentFactory` / `RecoveryAgentFactory` | Specialist agents |
| `SupervisorRoutingFactory` | `SupervisorRoutingService` (Capability Registry port) |
| `AgentCollaborationFactory` | `AgentCollaborationService` |
| `CoachSupervisorFactory` | `CoachSupervisorService` (live Routing + Collaboration ports) |
| `CoachingSessionFactory` | `CoachingSessionService` (live Supervisor port) |
| `AthleteStateFactory` | `AthleteStateService` (live agent contribution ports) |
| `ContextFusionFactory` | `ContextFusionService` (live upstream ports) |
| `DecisionEngineFactory` | `DecisionEngineService` (live Context Fusion port) |
| `RecommendationEngineFactory` | `RecommendationEngineService` (live Decision Engine port) |
| `WorkoutGenerationPipelineFactory` | `WorkoutGenerationPipelineService` |
| `PlanHistoryFactory` | `PlanHistoryService` (append-only versions) |
| `PlanRestoreFactory` | `PlanRestoreService` (history → new version) |
| `CoachConversationFactory` | `CoachConversationService` (pipeline + history + restore) |
| `CoachTimelineFactory` / `ProactiveInsightsFactory` / `ExplainableCoachingSessionFactory` | Product coaching composition |
| `HomeExperienceFactory` / `DailyBriefFactory` / `WeeklyCoachReportFactory` | Dashboard composition |
| `AthleteWorkspaceFactory` / `AthleteSnapshotFactory` / `UnifiedWorkspaceFactory` | Workspace composition |
| `AthleteIdentityFactory` / `RuntimeEnvironmentFactory` | Identity + runtime environment |

### Persistence & Infrastructure (Phase 29–30)

| Factory | Creates / registers |
|---------|---------------------|
| `PersistenceContractsFactory` | Contract registries (no I/O) |
| `InfrastructureAdapterFactory` | Adapter contract registry (metadata) |
| `SQLiteAdapterFactory` | Connection + Adapter + Repositories |
| `RepositoryAdapterFactory` | Adapter registry + Persistence-bound adapters |
| `AuthenticationFactory` | Registry + MockAuthenticationProvider |
| `SynchronizationFactory` | Registry + SynchronizationEngine |
| `BackendFactory` | Registry + MockBackendProvider |
| `LoggerFactory` | Registry + MockLogger |

Composition factories are thin wrappers over `infrastructure/*` factories. Prefer importing composition aliases from `core/composition` when wiring application defaults.

Factories accept explicit deps from providers / container resolves. Feature-level `create*Service()` helpers remain for unit tests and optional overrides; application defaults go through the Composition Root.

---

## Thin Adapters

Located in `app/src/core/composition/adapters/`:

| Adapter | Bridges |
|---------|---------|
| `SupervisorRoutingPortAdapter` | Routing Service → Supervisor `RoutingPort` |
| `AgentCollaborationPortAdapter` | Collaboration Service → Supervisor `CollaborationPort` |
| `CoachSupervisorPortAdapter` | Supervisor Service → Session `CoachSupervisorPort` |
| `DecisionContextFusionPortAdapter` | Context Fusion → Decision Engine port |
| `RecommendationDecisionEnginePortAdapter` | Decision Engine → Recommendation Engine port |
| Contribution / presence ports | Agents / Session / Supervisor / Athlete State ↔ Fusion / Decision / Recommendation |
| `RecommendationEngineBridge` | Recommendation Engine → legacy `RecommendationService` store contract |

---

## Service Lifecycle

| Mode | Behavior |
|------|----------|
| `singleton` (default) | One instance per token for the container lifetime |
| `transient` | New instance per resolve — **avoid for SQLite graph** |

---

## Integrity Rules

- Every `SERVICE_TOKENS` entry must be registered exactly once.
- Container freezes after bootstrap — no late registration.
- Circular dependencies fail at validate/eager resolve.
- Domain/features must not import `app/src/infrastructure/*`.
- Real providers replace mocks via the same Factory → Registry → Composition Root path (new ADR per swap).

See [ARCHITECTURE_REVIEW.md](./ARCHITECTURE_REVIEW.md) for consolidation findings (Sprint 30.7).
