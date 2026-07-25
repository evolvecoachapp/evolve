# Decision Pipeline

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-25  
**Purpose:** Describe the coaching decision pipeline from fused context through Decision Engine to Recommendation Engine / Coach Supervisor.  
**Source of Truth:** Partial — subsystem details live in linked docs.

Related: [DECISION_ENGINE.md](./DECISION_ENGINE.md), [CONTEXT_FUSION_ENGINE.md](./CONTEXT_FUSION_ENGINE.md), [DECISION_INTELLIGENCE.md](./DECISION_INTELLIGENCE.md), [AI_RUNTIME.md](./AI_RUNTIME.md), [ARCHITECTURE.md](./ARCHITECTURE.md), [STATE_MANAGEMENT.md](./STATE_MANAGEMENT.md).

---

## Pipeline Overview

```
Conversation Runtime
+ Coaching Session Runtime
+ Athlete State Engine
+ Specialist Agents (Workout / Nutrition / Recovery / Goal)
+ Coach Supervisor Context
      ↓
Context Fusion Engine          ← Sprint 22.2 (immutable fusion only)
      ↓
Unified Coaching Context
      ↓
Decision Engine                ← Sprint 22.3 (deterministic orchestration)
      ↓
CoachingDecision / DecisionPackage
      ↓
Recommendation Engine          ← consumes RecommendationEngineInput
      ↓
Coach Supervisor
```

Context Fusion Engine is the **single fusion boundary** before decisioning. Decision Engine is the **single decision orchestration boundary** — it does not fuse sources, call AI, generate NL, or execute actions.

---

## Ownership

| Stage | Module | Owns |
|-------|--------|------|
| Upstream facts | Conversation / Session / Athlete State / Agents / Supervisor | Source-specific immutable context |
| Fusion | `features/context-fusion` | `UnifiedCoachingContext`, snapshots, summaries, conflict resolution |
| Decisioning | `features/decision-engine` | `CoachingDecision`, `DecisionPackage`, analysis / evaluation / planning / resolution |
| Recommendations | Recommendation Engine (downstream) | Recommendation composition from `RecommendationEngineInput` |
| Explainability | Decision Intelligence | Explanations for domain pipeline decisions (see [DECISION_INTELLIGENCE.md](./DECISION_INTELLIGENCE.md)) |

---

## Handoff Contract

Context Fusion produces:

| Type | Role |
|------|------|
| `UnifiedCoachingContext` | Single immutable fused coaching context |
| `ContextSnapshot` | Point-in-time capture |
| `ContextSummary` | Compact fusion summary |
| `DecisionEngineContext` | Explicit Decision Engine handoff package |

Decision Engine produces:

| Type | Role |
|------|------|
| `CoachingDecision` | Immutable orchestration decision |
| `DecisionPackage` | Full package (candidates, graph, plan, diagnostics) |
| `DecisionSummary` / `DecisionSnapshot` | Compact / point-in-time views |
| `RecommendationEngineInput` | Explicit Recommendation Engine handoff |

Decision Engine consumes `DecisionEngineContext` / `UnifiedCoachingContext` and must not re-fuse upstream sources.

---

## Rules

- Fusion happens once, upstream of Decision Engine
- Decision orchestration happens once, upstream of Recommendation Engine / action execution
- No AI reasoning inside Context Fusion or Decision Engine
- No business / domain calculations inside Context Fusion or Decision Engine
- Decision Intelligence remains explanation-only for domain pipeline decisions
- No provider SDKs, networking, or persistence in fusion or decision stages
