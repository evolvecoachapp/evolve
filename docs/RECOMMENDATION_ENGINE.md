# Recommendation Engine

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-25  
**Purpose:** Document the Recommendation Engine — deterministic orchestration from immutable CoachingDecisions to structured CoachingRecommendations.  
**Source of Truth:** Yes — for Recommendation Engine layout, planning / prioritization / packaging, boundaries, and public API on mobile.

Related: [DECISION_ENGINE.md](./DECISION_ENGINE.md), [DECISION_PIPELINE.md](./DECISION_PIPELINE.md), [AI_RUNTIME.md](./AI_RUNTIME.md), [ARCHITECTURE.md](./ARCHITECTURE.md), [COACHING_SESSION_RUNTIME.md](./COACHING_SESSION_RUNTIME.md), [STATE_MANAGEMENT.md](./STATE_MANAGEMENT.md), [DECISIONS.md](./DECISIONS.md) (ADR-074).

---

## Responsibilities

Recommendation Engine owns **deterministic recommendation orchestration only**.

It **does**:

- transform immutable `CoachingDecision`s / `RecommendationEngineInput` into one or more immutable `CoachingRecommendation`s
- run deterministic planning, prioritization, and packaging
- produce `RecommendationPackage`, `RecommendationSummary`, `RecommendationSnapshot`, and `ExplainabilityInput`
- expose a narrow public application API

It **does not**:

- generate natural language
- call AI providers / Prompt Builder / Tool Runtime
- execute actions / Action Engine
- modify athlete state
- perform domain / business calculations
- persist state, network, or render UI

Module: `app/src/features/recommendation-engine/`.

Legacy UI recommendation widgets under `features/recommendations/` are separate and out of scope for this foundation.

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
Coach Supervisor
```

---

## Module Boundaries

| Layer | Role |
|-------|------|
| `models/` | Immutable recommendation / action / plan / package / result types |
| `recommendation/` | `RecommendationEngine` / `RecommendationCoordinator` / `RecommendationSession` |
| `planning/` | Recommendation / action / priority / grouping / dependency / sequence planners (no execution) |
| `prioritization/` | Priority / urgency / dependency / ordering / conflict resolvers |
| `packaging/` | Packager / assembler / formatter / exporter (structured only) |
| `builders/` | Recommendation / package / summary / snapshot / explainability builders |
| `validators/` | Integrity / dependencies / conflicts / ordering / packages / snapshots / context |
| `policies/` | Recommendation / priority / dependency / consistency / conflict / safety |
| `selectors/` | Recommendation / priority / action / package / context |
| `contracts/` | Decision Engine / Context Fusion / Athlete State / Coach Supervisor ports (+ mocks) |
| `application/` | Narrow public API |
| `services/` | `RecommendationEngineService` facade |

---

## Public API

| Function | Purpose |
|----------|---------|
| `buildRecommendations` | Decisions → immutable `CoachingRecommendation`s / `RecommendationPackage` |
| `prioritizeRecommendations` | Re-prioritize / resolve conflicts in the current package |
| `packageRecommendations` | Package recommendations for downstream consumers |
| `describeRecommendations` | Describe engine capabilities |
| `validateRecommendations` | Validate recommendation package integrity |

Root export: models + application + `RecommendationEngineService` only — internal modules are not part of the public surface.

---

## Integration

| Consumes | Via |
|----------|-----|
| Decision Engine | `DecisionEnginePort` → `CoachingDecision` / `RecommendationEngineInput` (mock in tests) |
| Context Fusion Engine | `ContextFusionPort` (focus areas; mock in tests) |
| Athlete State Engine | `AthleteStatePort` (presence flag; mock in tests) |
| Coach Supervisor | `CoachSupervisorPort` (focus areas; mock in tests) |

| Produces | Types |
|----------|-------|
| Recommendations | `CoachingRecommendation`, `RecommendationPackage`, `RecommendationSnapshot`, `RecommendationSummary` |
| Explainability handoff | `ExplainabilityInput` |

---

## Rules

- Recommendation orchestration happens once, downstream of Decision Engine and upstream of Explainability / Coach Supervisor
- No AI reasoning, NL generation, prompts, or provider SDKs
- No action execution or athlete-state mutation
- No business / domain calculations
- No networking or persistence
- Fixed-table priority / urgency / conflict resolution only
`}