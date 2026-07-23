# Coach Agent (Meta-Agent)

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-23  
**Purpose:** Document the Coach Agent as a meta-agent that coordinates specialized agents.  
**Source of Truth:** Yes — for Coach Agent layout, meta-agent orchestration, result merging, and public API on mobile.

Related: [ARCHITECTURE.md](./ARCHITECTURE.md), [AGENT_FRAMEWORK.md](./AGENT_FRAMEWORK.md), [AGENT_RUNTIME.md](./AGENT_RUNTIME.md), [WORKOUT_AGENT.md](./WORKOUT_AGENT.md), [NUTRITION_AGENT.md](./NUTRITION_AGENT.md), [RECOVERY_AGENT.md](./RECOVERY_AGENT.md), [COACH_INTELLIGENCE.md](./COACH_INTELLIGENCE.md).

---

## Architecture Summary

```
Agent Runtime
      ↓
Coach Agent
      ↓
Agent Coordinator
      ↓
Workout Agent / Recovery Agent / Nutrition Agent
      ↓
Merge Results
      ↓
CoachDecisionResult (CoachAgentResult)
```

Module: `app/src/features/coach-agent/`.

The Coach Agent is a **meta-agent**. It orchestrates existing specialized agents and returns an immutable `CoachAgentResult`.

It contains **no** business logic, provider logic, prompts, networking, persistence, or memory.

It **does**:

- receive coaching requests
- determine required specialist agents
- build an execution plan
- invoke Workout / Recovery / Nutrition agents via their public APIs
- collect and merge outputs deterministically
- return `CoachAgentResult`

It **does not**:

- generate prompts
- call AI providers
- execute tools
- network / persist / render UI
- duplicate specialist domain logic

---

## Meta-Agent Flow

1. **Agent Runtime** selects / executes `CoachFrameworkAgent` (`IAgent`, role `coach_supervisor`).
2. **Coach Agent Engine** receives an immutable `CoachRequest`.
3. **AgentCapabilityResolver** maps intent / hints → specialist agent kinds (one or many).
4. **CoachExecutionPlan** is built (steps + order).
5. **CoachCoordinator** invokes selected specialists through injectable ports (default: public application APIs).
6. **CoachResultMerger** merges recommendations, detects conflicts, prioritizes agents.
7. **CoachAgentResult** is frozen and returned.

---

## Agent Collaboration

| Specialist | Invocation | Notes |
|------------|------------|-------|
| **Workout Agent** | `processWorkoutRequest` | Planning / training focus |
| **Recovery Agent** | `processRecoveryRequest` | Fatigue / readiness / deload focus |
| **Nutrition Agent** | `processNutritionRequest` | Macros / meals / hydration focus |
| Sleep / Mobility / Injury / Planning | Reserved | Recognized by resolver; not invocable yet |

Coach supports executing **one or many** agents in a single request (`agentHints` or intent-based selection).

---

## Execution Flow

```
processCoachRequest
  → validateCoachRequest
  → inferIntent / resolve agents
  → build CoachExecutionPlan
  → invoke specialists (Workout / Recovery / Nutrition)
  → CoachResultMerger.merge
  → validateMergedResult
  → freeze CoachAgentResult
```

Plan-only path: `buildCoachingPlan` → immutable `CoachExecutionPlan` (no specialist invocation).

---

## Capability Matrix

| Intent | Agents |
|--------|--------|
| `workout_focus` | Workout |
| `recovery_focus` | Recovery |
| `nutrition_focus` | Nutrition |
| `holistic` / `multi_domain` | Workout + Recovery + Nutrition |
| `education` | Workout + Nutrition |
| `unknown` | Workout (default) |
| explicit `agentHints` | Filtered to implemented agents |

Merge priority (deterministic): Recovery > Workout > Nutrition.

---

## Integration

### Consumes (existing agents — not modified)

| Agent | Public API |
|-------|------------|
| Workout Agent | `processWorkoutRequest` |
| Recovery Agent | `processRecoveryRequest` |
| Nutrition Agent | `processNutritionRequest` |

Also consumes optional Conversation Context / CoachResponse / ActionPlan / ToolExecutionResult for pass-through context only.

### Produces

| Output | Role |
|--------|------|
| **CoachAgentResult** | Immutable primary meta-agent output |
| CoachExecutionPlan | Plan-only specialist selection |
| CoachDecision / CoachDecisionResult | Merged coaching decision |
| CoachEvaluation / CoachValidation | Integrity checks |
| CoachSummary | Compact run summary |

---

## Module Layout

| Folder | Role |
|--------|------|
| `models/` | Immutable coach / execution / decision models |
| `agent/` | `CoachAgentEngine`, `CoachAgentFacade` |
| `framework/` | `CoachFrameworkAgent` — Agent Framework `IAgent` adapter |
| `coordinator/` | `CoachCoordinator` + specialist ports |
| `orchestrator/` | Thin service → engine boundary |
| `selectors/` | `AgentCapabilityResolver` |
| `mergers/` | `CoachResultMerger` (deterministic, no AI) |
| `evaluators/` | `CoachDecisionEvaluator` |
| `builders/` | Request / Context / Plan / Result builders |
| `validators/` | Request / plan / compatibility / merge / lifecycle |
| `services/` | `CoachAgentService` |
| `application/` | Public API only |
| `utils/` | `FreezeCoachState` |
| `testSupport/` | Fixtures + mock specialist ports |

---

## Public API

| Function | Role |
|----------|------|
| `processCoachRequest` | Full meta-agent orchestration → `CoachAgentResult` |
| `buildCoachingPlan` | Build `CoachExecutionPlan` without invoking specialists |
| `evaluateCoachDecision` | Evaluate a merged `CoachDecision` |
| `describeCoachCapabilities` | Immutable `CoachAgent` descriptor |
| `validateCoachPlan` | Validate an execution plan |

Internals (coordinator, merger, ports) are not part of the public application surface.

---

## Design Rules

- **No business logic** — specialists own domain decisions
- **No AI provider** / prompts / networking / persistence / memory
- **Only orchestration** — select, invoke, merge, return
- **Immutable models** — deep-frozen via `FreezeCoachState`
- **Do not modify** Workout / Recovery / Nutrition agents

---

## Related Docs

- [AGENT_FRAMEWORK.md](./AGENT_FRAMEWORK.md) — `IAgent` / `coach_supervisor`
- [AGENT_RUNTIME.md](./AGENT_RUNTIME.md) — runtime entry point
- [WORKOUT_AGENT.md](./WORKOUT_AGENT.md) / [RECOVERY_AGENT.md](./RECOVERY_AGENT.md) / [NUTRITION_AGENT.md](./NUTRITION_AGENT.md)
