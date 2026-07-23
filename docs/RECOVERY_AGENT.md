# Recovery Agent

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-23  
**Purpose:** Document the Recovery Agent foundation (Sprint 21.3).  
**Source of Truth:** Yes — for Recovery Agent layout, reasoning / planning layers, and public API on mobile.

Related: [ARCHITECTURE.md](./ARCHITECTURE.md), [AGENT_FRAMEWORK.md](./AGENT_FRAMEWORK.md), [AGENT_RUNTIME.md](./AGENT_RUNTIME.md), [RECOVERY_INTELLIGENCE.md](./RECOVERY_INTELLIGENCE.md), [COACH_INTELLIGENCE.md](./COACH_INTELLIGENCE.md), [CONVERSATION_ORCHESTRATOR.md](./CONVERSATION_ORCHESTRATOR.md), [ACTION_ENGINE.md](./ACTION_ENGINE.md), [TOOL_RUNTIME.md](./TOOL_RUNTIME.md), [DECISIONS.md](./DECISIONS.md) (ADR-062).

---

## Architecture Summary

```
User Request
      ↓
Conversation Runtime
      ↓
Recovery Agent
      ↓
Coach Intelligence
      ↓
Prompt Builder
      ↓
AI Provider
      ↓
Response Formatter
      ↓
Action Engine
      ↓
Tool Runtime
      ↓
Recovery Domain
```

Module: `app/src/features/recovery-agent/`.

The Recovery Agent is the intelligent recovery specialist of EVOLVE. It evaluates recovery status, fatigue, readiness, sleep, stress, soreness, workload tolerance, and recovery recommendations.

It extends the Agent Framework via `RecoveryFrameworkAgent` (`IAgent` adapter) and registers through the Agent Registry.

It consumes the complete AI Runtime but **owns no infrastructure**.

It does **not**:

- generate prompts
- call providers directly
- execute tools directly
- network / persist / render UI
- duplicate Recovery Domain business logic

It **orchestrates** existing components and organizes domain knowledge before AI interaction.

---

## Integration

### Consumes

| Input | Source |
|-------|--------|
| Conversation Context | Conversation Orchestrator |
| Conversation Memory | Coach memory (turn counts / history) |
| CoachResponse | Response Formatter (optional handoff) |
| ActionPlan | Action Engine (optional handoff) |
| ToolExecutionResult | Tool Runtime (optional feedback) |
| Recovery Domain facts | Existing recovery modules (delegated, not duplicated) |
| Workout Agent contracts | Shared context only |
| Nutrition Agent contracts | Shared context only |

### Produces

| Output | Role |
|--------|------|
| **RecoveryAgentResult** | Immutable primary agent output |
| RecoveryPlan | Planning-only proposal |
| RecoveryDecision / Recommendations / Explanation | Decision surface |
| RecoveryValidation | Integrity checks |

---

## Module Layout

| Folder | Role |
|--------|------|
| `models/` | Immutable agent models |
| `agent/` | RecoveryAgent, Engine, Coordinator, Session, State |
| `framework/` | `RecoveryFrameworkAgent` — Agent Framework `IAgent` adapter |
| `orchestrator/` | Runtime artifact wiring |
| `reasoning/` | Deterministic reasoners (no AI) |
| `planning/` | Planners (no execution) |
| `strategies/` | Full / Active / Sleep / Fatigue / Stress / Performance / Powerlifting / Hypertrophy / Competition / General Wellness |
| `policies/` | Safety / Recovery / Sleep / Stress / Fatigue / Training Load / Wellness / Deload |
| `selectors/` | Strategy / Recovery / Protocol / Recommendation / Goal / Constraint / Priority / Intent / Planner |
| `builders/` | Context / Plan / Recommendation / Assessment builders |
| `validators/` | Recovery score / sleep / stress / load / fatigue / DOMS / protocol / recommendations / safety / consistency |
| `services/` | RecoveryAgentService (`asFrameworkAgent` / `registerWithFramework`) |
| `application/` | Public API only |
| `utils/` | Recovery/Fatigue/Sleep/Stress/TrainingLoad helpers, FreezeRecoveryState |

---

## Reasoning Layer

Deterministic modules that organize domain knowledge **before** AI interaction:

- FatigueReasoner, ReadinessReasoner, SleepReasoner, StressReasoner
- TrainingLoadReasoner, DOMSReasoner, RecoveryScoreReasoner
- DeloadReasoner, AdaptationReasoner, HRVReasoner
- WellnessReasoner, RecoveryEducationReasoner, GoalReasoner

No AI. No provider logic.

---

## Planning Layer

Planners produce planning decisions only:

- RecoveryPlanner, DeloadPlanner, SleepPlanner, StressPlanner
- ReadinessPlanner, RecoverySessionPlanner, TrainingLoadPlanner
- FatiguePlanner, WellnessPlanner, RecoveryProtocolPlanner

No execution. No tool calls.

---

## Public API

```ts
processRecoveryRequest()
buildRecoveryPlan()
evaluateRecovery()
describeRecoveryCapabilities()
validateRecoveryPlan()
```

Internals (reasoners, planners, policies, engine) are not part of the public surface.

---

## Design Rules

- No OpenAI SDK / provider-specific logic
- No networking / persistence / UI
- No business logic duplication — delegate to existing Recovery Domain modules whenever possible
- Recovery Agent is an **orchestrator**, not a replacement for the Recovery Domain
