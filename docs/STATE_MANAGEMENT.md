# State Management

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-25  
**Purpose:** Index immutable state ownership across the mobile coaching stack.  
**Source of Truth:** Partial — subsystem details live in linked docs.

Related: [ATHLETE_STATE_ENGINE.md](./ATHLETE_STATE_ENGINE.md), [CONTEXT_FUSION_ENGINE.md](./CONTEXT_FUSION_ENGINE.md), [DECISION_ENGINE.md](./DECISION_ENGINE.md), [RECOMMENDATION_ENGINE.md](./RECOMMENDATION_ENGINE.md), [DECISION_PIPELINE.md](./DECISION_PIPELINE.md), [COACHING_SESSION_RUNTIME.md](./COACHING_SESSION_RUNTIME.md), [WORKOUT_RUNTIME.md](./WORKOUT_RUNTIME.md), [ATHLETE_HISTORY.md](./ATHLETE_HISTORY.md), [ARCHITECTURE.md](./ARCHITECTURE.md).

---

## Ownership Map

| Concern | Module | Immutable model(s) | Notes |
|---------|--------|--------------------|-------|
| Current athlete truth | `features/athlete-state` | `AthleteState`, `AthleteSnapshot` | Sprint 22.1 — aggregation + evolution only |
| Unified coaching context | `features/context-fusion` | `UnifiedCoachingContext`, `ContextSnapshot` | Sprint 22.2 — fusion only; feeds Decision Engine |
| Coaching decisions | `features/decision-engine` | `CoachingDecision`, `DecisionPackage`, `DecisionSnapshot` | Sprint 22.3 — orchestration only; feeds Recommendation Engine |
| Coaching recommendations | `features/recommendation-engine` | `CoachingRecommendation`, `RecommendationPackage`, `RecommendationSnapshot` | Sprint 22.4 — orchestration only; feeds Explainability / Coach Supervisor |
| Coaching interaction lifecycle | `features/coaching-session` | `SessionContext`, `SessionSnapshot` | Sprint 22.0 |
| Live workout execution | `features/workout-runtime` | workout session state | Runtime execution, not athlete aggregate |
| Chronological journey facts | `features/athlete-history` | history entries / snapshots | Historical record; not current truth |
| Athlete profile inputs | `features/athlete-context` | profile / preferences | Input profile; not unified state engine |

---

## Athlete State Engine Placement

```
Specialist Agents (Workout / Nutrition / Recovery / Goal)
      ↓
Athlete State Engine          ← current immutable athlete truth
      ↓
Coach Supervisor Context
      ↓
Coach Supervisor / Unified Coach Response
```

Athlete State Engine is the **single immutable source of truth** describing the current athlete. It does not calculate readiness scores, predict outcomes, persist data, or call AI.

---

## Context Fusion Placement

```
Conversation + Session + Athlete State + Agents + Supervisor
      ↓
Context Fusion Engine         ← immutable UnifiedCoachingContext
      ↓
Decision Engine
```

Context Fusion Engine is the **single fusion boundary** combining runtime sources into one immutable coaching context. It does not reason, calculate, persist, or network.

---

## Decision Engine Placement

```
UnifiedCoachingContext
      ↓
Decision Engine               ← immutable CoachingDecision / DecisionPackage
      ↓
RecommendationEngineInput
      ↓
Recommendation Engine
```

Decision Engine is the **single decision orchestration boundary**. It does not fuse sources, call AI, generate NL, execute actions, calculate domain scores, persist, or network.

---

## Recommendation Engine Placement

```
CoachingDecision / RecommendationEngineInput
      ↓
Recommendation Engine         ← immutable CoachingRecommendation / RecommendationPackage
      ↓
ExplainabilityInput
      ↓
Explainability Engine / Coach Supervisor
```

Recommendation Engine is the **single recommendation orchestration boundary**. It does not call AI, generate NL, execute actions, modify athlete state, calculate domain scores, persist, or network.

---

## Rules

- Prefer immutable frozen models (`Object.freeze`) at module boundaries
- Evolution creates new versions; never mutate prior state
- Domain calculations stay in specialist / domain engines — not in state modules
- Persistence / networking remain outside these foundations
