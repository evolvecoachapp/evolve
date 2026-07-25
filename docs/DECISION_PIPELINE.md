# Decision Pipeline

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-25  
**Purpose:** Describe the coaching decision pipeline from fused context into Decision Engine consumption.  
**Source of Truth:** Partial — subsystem details live in linked docs.

Related: [CONTEXT_FUSION_ENGINE.md](./CONTEXT_FUSION_ENGINE.md), [DECISION_INTELLIGENCE.md](./DECISION_INTELLIGENCE.md), [AI_RUNTIME.md](./AI_RUNTIME.md), [ARCHITECTURE.md](./ARCHITECTURE.md), [STATE_MANAGEMENT.md](./STATE_MANAGEMENT.md).

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
Decision Engine                ← consumes fused context (no fusion here)
      ↓
Decision / coaching outputs
```

Context Fusion Engine is the **single fusion boundary** before decisioning. It does not decide, score, or reason — it only produces immutable fused context.

---

## Ownership

| Stage | Module | Owns |
|-------|--------|------|
| Upstream facts | Conversation / Session / Athlete State / Agents / Supervisor | Source-specific immutable context |
| Fusion | `features/context-fusion` | `UnifiedCoachingContext`, snapshots, summaries, conflict resolution |
| Decisioning | Decision Engine (+ Decision Intelligence explainability) | Decisions / explanations — not fusion |

---

## Handoff Contract

Context Fusion produces:

| Type | Role |
|------|------|
| `UnifiedCoachingContext` | Single immutable fused coaching context |
| `ContextSnapshot` | Point-in-time capture |
| `ContextSummary` | Compact fusion summary |
| `DecisionEngineContext` | Explicit Decision Engine handoff package |

Decision Engine consumes `DecisionEngineContext` / `UnifiedCoachingContext` and must not re-fuse upstream sources.

---

## Rules

- Fusion happens once, upstream of Decision Engine
- No AI reasoning inside Context Fusion
- No business calculations inside Context Fusion
- Decision Intelligence remains explanation-only for domain pipeline decisions (see [DECISION_INTELLIGENCE.md](./DECISION_INTELLIGENCE.md))
- No provider SDKs, networking, or persistence in the fusion stage
