# Workout Agent

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-23  
**Purpose:** Document the Workout Agent as a specialized framework agent that orchestrates the workout domain.  
**Source of Truth:** Yes — for Workout Agent layout, domain orchestration, reasoning / planning layers, and public API on mobile.

Related: [ARCHITECTURE.md](./ARCHITECTURE.md), [AGENT_FRAMEWORK.md](./AGENT_FRAMEWORK.md), [AGENT_RUNTIME.md](./AGENT_RUNTIME.md), [WORKOUT_INTELLIGENCE.md](./WORKOUT_INTELLIGENCE.md), [COACH_INTELLIGENCE.md](./COACH_INTELLIGENCE.md), [CONVERSATION_ORCHESTRATOR.md](./CONVERSATION_ORCHESTRATOR.md), [ACTION_ENGINE.md](./ACTION_ENGINE.md), [TOOL_RUNTIME.md](./TOOL_RUNTIME.md), [DECISIONS.md](./DECISIONS.md) (ADR-059, ADR-060, ADR-064).

---

## Architecture Summary

```
Agent Runtime
      ↓
Workout Framework Agent
      ↓
Planning
      ↓
Workout Domain
      ↓
Workout Result
```

Module: `app/src/features/workout-agent/`.

The Workout Agent is a specialized framework agent. It orchestrates existing workout domain capabilities and returns an immutable `WorkoutAgentResult`.

It contains **no** business logic, provider logic, prompts, networking, persistence, or memory.

It **does**:

- receive workout requests
- build execution / planning context
- select planning strategy and domain capabilities
- invoke existing workout domain engines (when payloads / ports are supplied)
- collect immutable orchestration results
- return `WorkoutAgentResult`

It **does not**:

- generate prompts
- call AI providers
- execute tools directly
- network / persist / render UI
- duplicate domain calculations

---

## Execution Flow

1. **Agent Runtime** selects / executes `WorkoutFrameworkAgent` (`IAgent`).
2. **Workout Framework Agent** adapts the immutable Workout Agent descriptor.
3. **Planning** resolves intent → objective → strategy → planners / policies.
4. **Workout Domain** is invoked via `WorkoutDomainGateway` (Program Generation, Programming, Progression, Training Adaptation, Workout Assembly, Exercise Knowledge Base, Decision Intelligence).
5. **Workout Result** is frozen as `WorkoutAgentResult` (includes `domainInvocations`).

---

## Integration

### Consumes (existing domains — not modified)

| Domain | Role |
|--------|------|
| Program Generation | Full pipeline generation when `generationRequest` provided |
| Programming Engine | Prescriptions when `programmingRequest` provided |
| Progression Engine | Progression plans when `progressionRequest` provided |
| Training Adaptation Engine | `adaptWorkout()` / adaptation payloads |
| Workout Assembly Engine | Session assembly when `assemblyRequest` provided |
| Exercise Knowledge Base | Catalog queries when requested |
| Decision Intelligence | Decision reports from generation sources |

Also consumes Conversation Context / optional CoachResponse / ActionPlan / ToolExecutionResult for planning context only.

### Produces

| Output | Role |
|--------|------|
| **WorkoutAgentResult** | Immutable primary agent output |
| WorkoutPlanProposal | Planning-only proposal |
| WorkoutDomainInvocation[] | Selected / invoked / skipped domain capability records |
| WorkoutValidation | Integrity checks |

---

## Module Layout

| Folder | Role |
|--------|------|
| `models/` | Immutable agent + domain invocation models |
| `agent/` | WorkoutAgent facade, Engine, Coordinator, Session, State |
| `framework/` | `WorkoutFrameworkAgent` — Agent Framework `IAgent` adapter |
| `orchestrator/` | Runtime wiring + `WorkoutDomainGateway` |
| `reasoning/` | Deterministic reasoners (no AI) |
| `planning/` | Planners (no execution) |
| `strategies/` | Strength / Hypertrophy / Powerbuilding / Powerlifting / General Fitness |
| `policies/` | Safety / Recovery / Progression / Volume / Exercise |
| `selectors/` | Intent / Objective / Strategy / Split / Exercise / DomainCapability |
| `builders/` | Context / Plan / Recommendation builders |
| `validators/` | Objective / split / exercise / volume / intensity / recovery / progression |
| `services/` | WorkoutAgentService (`asFrameworkAgent` / `registerWithFramework` / `registerWithRuntime`) |
| `application/` | Public API only |
| `utils/` | Metrics, helpers, FreezeAgentState |

---

## Public API

```ts
processWorkoutRequest()
buildWorkoutPlan()
adaptWorkout()
evaluateWorkout()
describeWorkoutCapabilities()
validateWorkoutPlan()
```

Internals (reasoners, planners, policies, domain gateway, engine) are not part of the public surface.

---

## Design Rules

- No OpenAI SDK / provider-specific logic
- No networking / persistence / UI
- No business logic duplication — delegate to existing domain modules
- Workout Agent is an **orchestrator**, not a replacement for the Workout Domain
- Domain payloads are supplied by callers — the agent never fabricates engine inputs
