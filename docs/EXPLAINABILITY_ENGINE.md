# Explainability Engine

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-25  
**Purpose:** Document the Explainability Engine — deterministic orchestration from immutable CoachingDecisions / CoachingRecommendations into structured CoachingExplanations.  
**Source of Truth:** Yes — for Explainability Engine layout, evidence / reasoning / trace / graph, boundaries, and public API on mobile.

Related: [RECOMMENDATION_ENGINE.md](./RECOMMENDATION_ENGINE.md), [DECISION_ENGINE.md](./DECISION_ENGINE.md), [DECISION_PIPELINE.md](./DECISION_PIPELINE.md), [REASONING_PIPELINE.md](./REASONING_PIPELINE.md), [AI_RUNTIME.md](./AI_RUNTIME.md), [ARCHITECTURE.md](./ARCHITECTURE.md), [COACHING_SESSION_RUNTIME.md](./COACHING_SESSION_RUNTIME.md), [STATE_MANAGEMENT.md](./STATE_MANAGEMENT.md), [DECISIONS.md](./DECISIONS.md) (ADR-075).

---

## Responsibilities

Explainability Engine owns **deterministic explanation orchestration only**.

It **does**:

- transform immutable `CoachingDecision`s / `CoachingRecommendation`s / `ExplainabilityInput` into one or more immutable `CoachingExplanation`s
- gather structured evidence and reasoning traces (codes / keys only)
- build explanation graphs, timelines, packages, and snapshots
- produce `ExplanationPackage`, `ExplanationSummary`, `ExplanationSnapshot`, and `LLMFormatterInput`
- expose a narrow public application API

It **does not**:

- change decisions or recommendations
- generate natural language
- call AI providers / Prompt Builder / Tool Runtime
- perform AI reasoning or inference
- execute actions / Action Engine
- perform domain / business calculations
- persist state, network, or render UI

Module: `app/src/features/explainability-engine/`.

Decision Intelligence (`core/decision-intelligence`) remains domain-pipeline explainability and is separate from this coaching orchestration engine.

---

## Architecture Summary

```
UnifiedCoachingContext
      ↓
Decision Engine
      ↓
CoachingDecision
      ↓
Recommendation Engine
      ↓
CoachingRecommendation
      ↓
Explainability Engine
      ↓
CoachingExplanation
      ↓
Coach Supervisor
      ↓
LLM Response Formatter
```

---

## Module Boundaries

| Layer | Role |
|-------|------|
| `models/` | Immutable explanation / evidence / trace / graph / package / result types |
| `explanation/` | `ExplainabilityEngine` / `ExplainabilityCoordinator` / `ExplainabilitySession` |
| `reasoning/` | Decision / recommendation / dependency / constraint / priority / consistency / confidence reasoning (trace only) |
| `evidence/` | Decision / context / recommendation / constraint / dependency / state evidence builders |
| `trace/` | Decision / recommendation / dependency / timeline / graph trace builders |
| `builders/` | Explanation / package / summary / snapshot / graph / LLM formatter input builders |
| `validators/` | Integrity / evidence / trace / dependencies / decision links / recommendation links / graph / snapshots |
| `policies/` | Explainability / evidence / trace / dependency / consistency / safety |
| `selectors/` | Explanation / evidence / trace / decision / recommendation |
| `contracts/` | Decision Engine / Recommendation Engine / Context Fusion / Athlete State / Coach Supervisor ports (+ mocks) |
| `application/` | Narrow public API |
| `services/` | `ExplainabilityEngineService` facade |

---

## Public API

| Function | Purpose |
|----------|---------|
| `buildExplanation` | Decisions + recommendations → immutable `CoachingExplanation`s / `ExplanationPackage` |
| `validateExplanation` | Validate explanation package integrity |
| `describeExplanation` | Describe engine capabilities |
| `createExplanationSnapshot` | Create point-in-time `ExplanationSnapshot` |
| `packageExplanation` | Package explanations for downstream consumers |

Root export: models + application + `ExplainabilityEngineService` only — internal modules are not part of the public surface.

---

## Integration

| Consumes | Via |
|----------|-----|
| Decision Engine | `DecisionEnginePort` → `CoachingDecision` (mock in tests) |
| Recommendation Engine | `RecommendationEnginePort` → `CoachingRecommendation` / `ExplainabilityInput` (mock in tests) |
| Context Fusion Engine | `ContextFusionPort` (context presence / focus; mock in tests) |
| Athlete State Engine | `AthleteStatePort` (presence flag; mock in tests) |
| Coach Supervisor | `CoachSupervisorPort` (focus areas; mock in tests) |

| Produces | Types |
|----------|-------|
| Explanations | `CoachingExplanation`, `ExplanationPackage`, `ExplanationSnapshot`, `ExplanationSummary` |
| Graph / trace | `ExplanationGraph`, `ExplanationTrace`, `ExplanationTimeline` |
| Formatter handoff | `LLMFormatterInput` (structure only — no NL) |

---

## Rules

- Explanation orchestration happens once, downstream of Recommendation Engine and upstream of Coach Supervisor / LLM Response Formatter
- No AI reasoning, NL generation, prompts, or provider SDKs
- No mutation of decisions or recommendations
- No action execution or athlete-state mutation
- No business / domain calculations
- No networking or persistence
- Evidence / reasoning / traces use structured codes and keys only
