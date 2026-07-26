# Composition Root & Dependency Injection

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-26  
**Purpose:** Document the mobile Composition Root, Dependency Container, factories, providers, registry, and service lifecycle (Sprint 17.9 + Sprint 23.1 coaching integration).  
**Source of Truth:** Yes — for Composition Root layout and DI rules on mobile.

Related: [ARCHITECTURE.md](./ARCHITECTURE.md), [AI_SYSTEM.md](./AI_SYSTEM.md), [DECISIONS.md](./DECISIONS.md) (ADR-036).

---

## Architecture Summary

```
Application (use-cases / Coach / Dashboard)
  ↓ resolveService(token)
Composition Root
  ↓
Dependency Container (ApplicationContainer)
  ↓
Service Registry (typed ServiceMap)
  ↓
Factories + thin port adapters (object creation / wiring only)
  ↓
Feature Services
  ↓
Training Intelligence  |  Coaching Architecture Pipeline
```

Rules:

- The **Composition Root** is the only place allowed to wire/instantiate pipeline services for application defaults.
- Application code **requests** services; it must not manually `new` them.
- Factories contain **no business logic** — creation and wiring only.
- Port adapters are **thin** — structural mapping between module contracts only.
- Current providers remain **in-memory** (no persistence, networking, AI, UI, caching layer, or analytics).

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

### Coaching Architecture (Sprint 23.1)

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

Execution entry points:

| Entry | Path |
|-------|------|
| Coach UI | `createCoachConversationRuntime` → `CoachingSessionService` → Supervisor → Routing → Collaboration → Agents |
| Dashboard recommendations | `weightUpdatedPipeline` → `RecommendationEngineBridge` → Recommendation Engine ← Decision ← Context Fusion ← Athlete State |

Legacy `decisionEngine` / `recommendations` modules remain available; the Dashboard path uses a thin bridge into the new Recommendation Engine while preserving the legacy store/widget contract.

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

1. Merge configuration (locked to in-memory / default strategies).
2. Register all `SERVICE_TOKENS` with factories.
3. `validate()` — required tokens present; eager resolve surfaces circular/invalid factories.
4. `freeze()` — reject late registrations.
5. `ServiceRegistry.assertIntegrity()`.

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

## Dependency Injection

`ApplicationContainer<ServiceMap>`:

| Capability | Behavior |
|------------|----------|
| Register | `register(token, factory, { lifecycle })` |
| Resolve | `resolve(token)` |
| Duplicate prevention | Throws `DuplicateRegistrationError` |
| Missing registration | Throws `MissingRegistrationError` |
| Circular deps | Throws `CircularDependencyError` (resolution stack) |
| Invalid factory result | Throws `InvalidResolutionError` |
| Late registration | Throws `ContainerFrozenError` after `freeze()` |
| Graph validation | Throws `DependencyValidationError` for missing required tokens |

Typed registry: extend `ServiceMap` + `SERVICE_TOKENS`, then register in `CompositionRoot.create`.

---

## Service Lifecycle

| Lifecycle | Behavior |
|-----------|----------|
| `singleton` (default) | One instance per container; created on first resolve |
| `transient` | New instance on every resolve |

Pipeline services default to **singleton** (`preferSingletons: true`). Set `preferSingletons: false` in composition options to register them as transient (tests / isolated wiring).

---

## Application Consumption

```ts
import { resolveService } from "../../../core/composition";

export async function generateWorkoutProgram(
  request: WorkoutGenerationRequest,
  service = resolveService("ProgramGenerationService"),
) {
  return service.generateWorkoutProgram(request);
}
```

Coach chat resolves `CoachingSessionService` via `createCoachConversationRuntime()`. Dashboard recommendations resolve `RecommendationEngineService` via the compatibility bridge.

Callers may still inject a service explicitly (tests). Defaults never call `new` or feature factories directly.

---

## Providers

| Provider | Responsibility |
|----------|----------------|
| `ConfigurationProvider` | Frozen `CompositionConfiguration` |
| `RepositoryProvider` | In-memory repositories (feature defaults) |
| `StrategyProvider` | Default strategies / assessments |

Future external services plug in by extending providers — not by changing application use-cases.

---

## Testing

Unit suites under `app/src/core/composition/__tests__/`:

- Container registration / resolution
- Singleton vs transient
- Factory creation
- Registry integrity
- Dependency validation (missing, duplicate, circular, late, freeze)
- Coaching pipeline integration (session + recommendation bridge)

Use `resetCompositionRoot()` in `afterEach` when touching the process-wide root.
