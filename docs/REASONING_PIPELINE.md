# Reasoning Pipeline

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-25  
**Purpose:** Describe the deterministic coaching reasoning / explainability pipeline from fused context through Decision → Recommendation → Explainability.  
**Source of Truth:** Partial — subsystem details live in linked docs.

Related: [EXPLAINABILITY_ENGINE.md](./EXPLAINABILITY_ENGINE.md), [DECISION_PIPELINE.md](./DECISION_PIPELINE.md), [DECISION_ENGINE.md](./DECISION_ENGINE.md), [RECOMMENDATION_ENGINE.md](./RECOMMENDATION_ENGINE.md), [AI_RUNTIME.md](./AI_RUNTIME.md), [ARCHITECTURE.md](./ARCHITECTURE.md), [DECISIONS.md](./DECISIONS.md) (ADR-075).

---

## Pipeline Overview

```
UnifiedCoachingContext
      ↓
Decision Engine                 ← deterministic decision orchestration
      ↓
CoachingDecision
      ↓
Recommendation Engine           ← deterministic recommendation orchestration
      ↓
CoachingRecommendation
      ↓
Explainability Engine           ← deterministic explanation orchestration
  ├── Evidence layer            (Decision / Context / Recommendation / Constraint / Dependency / State)
  ├── Reasoning layer           (Decision / Recommendation / Dependency / Constraint / Priority / Consistency / Confidence)
  └── Trace / Graph layer       (Decision / Recommendation / Dependency / Timeline / Graph)
      ↓
CoachingExplanation / ExplanationPackage / LLMFormatterInput
      ↓
Coach Supervisor
      ↓
LLM Response Formatter          ← may render NL later; not part of this engine
```

"Reasoning" here means **structured reasoning traces** (codes, keys, links) — not AI inference and not natural language generation.

---

## Ownership

| Stage | Module | Owns |
|-------|--------|------|
| Decision orchestration | `features/decision-engine` | Why a decision exists (decision reasons / scores / constraints) |
| Recommendation orchestration | `features/recommendation-engine` | What to recommend / order / package; handoff `ExplainabilityInput` |
| Explanation orchestration | `features/explainability-engine` | Why a recommendation exists — evidence + reasoning traces + graph |
| Domain pipeline explainability | `core/decision-intelligence` | Template-based domain Decision Intelligence reports (separate) |

---

## Explainability Reasoning Modules

| Module | Role |
|--------|------|
| `DecisionReasoning` | Trace decision → explanation reasons (codes / evidence keys) |
| `RecommendationReasoning` | Trace recommendation → explanation reasons |
| `DependencyReasoning` | Trace recommendation / decision dependencies |
| `ConstraintReasoning` | Trace constraints applied to the recommendation |
| `PriorityReasoning` | Trace priority / urgency ordinals (fixed tables only) |
| `ConsistencyReasoning` | Trace consistency checks across links |
| `ConfidenceReasoning` | Trace confidence stamps (no scoring math) |

All modules are pure, deterministic, and produce immutable structured records only.

---

## Evidence Modules

| Module | Role |
|--------|------|
| `DecisionEvidence` | Immutable evidence from `CoachingDecision` |
| `RecommendationEvidence` | Immutable evidence from `CoachingRecommendation` |
| `ContextEvidence` | Immutable evidence from fused context references |
| `ConstraintEvidence` | Immutable evidence from constraints |
| `DependencyEvidence` | Immutable evidence from dependencies |
| `StateEvidence` | Immutable evidence from athlete-state presence flags |

---

## Rules

- No OpenAI SDK, Prompt Builder, Tool Runtime, or Action Engine
- No AI reasoning / inference / NL generation inside Explainability Engine
- No business / domain calculations — only packaging of already-decided structure
- Decisions and recommendations are never mutated
- LLM Response Formatter consumes `LLMFormatterInput` structure; prose rendering is out of scope here
