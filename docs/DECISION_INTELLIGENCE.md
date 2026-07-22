# Decision Intelligence

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-22  
**Purpose:** Document the Decision Intelligence layer — structured domain explanations for workout generation (Sprint 17.10).  
**Source of Truth:** Yes — for Decision Intelligence layout and rules on mobile.

Related: [ARCHITECTURE.md](./ARCHITECTURE.md), [AI_SYSTEM.md](./AI_SYSTEM.md), [DECISIONS.md](./DECISIONS.md) (ADR-037), [COMPOSITION_ROOT.md](./COMPOSITION_ROOT.md).

---

## Architecture Summary

```
Program Generation
        ↓
Decision Recorder
        ↓
Decision Graph
        ↓
Execution Report
        ↓
Explanation Report
        ↓
Coach AI (future consumer)
```

This layer records and explains **domain decisions** performed during workout generation.

It is **not**:

- a logging framework
- a telemetry platform
- an analytics platform
- an AI / LLM layer
- a persistence or networking layer

Module: `app/src/core/decision-intelligence/`.

---

## Decision Graph

Immutable directed graph of domain decisions:

| Concept | Role |
|---------|------|
| `DecisionNode` | One domain decision (category, reasons, evidence, confidence, parents) |
| `DecisionEdge` | Relationship (`depends_on`, `derived_from`, `supports`, `overrides`, `sequence`) |
| `DecisionGraph` | Frozen nodes + edges + root ids for one generation |
| `DecisionTimeline` | Chronological sequence of decisions |
| `DecisionReason` / `DecisionEvidence` | Machine-readable support — codes only |
| `DecisionCategory` | `blueprint`, `selection`, `programming`, `progression`, `adaptation`, `assembly`, `orchestration`, `validation` |

Graphs represent blueprint → selection → programming → progression → adaptation → assembly decisions, dependency chains, and reason propagation.

---

## Explainability

`ExplanationBuilder` produces **template-based** explanations only (no AI):

| Style | Audience |
|-------|----------|
| `human` | Readable summary of title + reasons + confidence |
| `developer` | Compact machine-oriented line with ids/parents/evidence |
| `compact` | `summaryCode@category` |
| `detailed` | Multi-line structured dump |

Public API: `explainWorkoutDecision()`, `summarizeDecisionGraph()`.

---

## Execution Reports

`ExecutionReport` freezes:

- Pipeline summary (`PipelineExecutionSummary`)
- Execution stages (from `PipelineExecutionTrace`)
- Decision summary + timeline + graph
- Explanation output
- Metrics reference (summary + trace pointers)

`DecisionReport` is the decision-only subset (graph, timeline, explanations, validation issues).

Public API: `createDecisionReport()`, `createExecutionReport()`.

---

## Pipeline Integration

- Engines are **not** modified.
- Structured decisions are **extracted** from existing engine explanations/reasons plus stage roots.
- `ProgramGenerationOrchestrator.buildDecisionIntelligence(result)` and `ProgramGenerationService.buildDecisionIntelligence(result)` build an `ExecutionReport` from an in-hand `WorkoutGenerationResult`.
- `WorkoutGenerationResult` shape is unchanged — Decision Intelligence is additive.

---

## Coach AI Preparation

Future Coach AI / explainability / analytics / dashboards / recommendations will **consume** Decision Intelligence reports.

This sprint only prepares the structured domain explanation substrate. No Coach UI, no LLM calls, no recommendation engine.

---

## Rules

- Immutable models (`Object.freeze` / freeze helpers)
- Domain decisions only — never implementation details
- No business-logic changes in engines
- No AI, networking, persistence, telemetry, or logging frameworks
- Validators enforce graph consistency, parents, orphans, edges, duplicates, confidence range, timeline consistency
