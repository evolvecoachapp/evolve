# Action Planning

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-23  
**Purpose:** Document Action Engine planning units (planners, selectors, policies).  
**Source of Truth:** Yes — for Action Planning internals within [ACTION_ENGINE.md](./ACTION_ENGINE.md).

Related: [ACTION_ENGINE.md](./ACTION_ENGINE.md), [RESPONSE_FORMATTER.md](./RESPONSE_FORMATTER.md), [ARCHITECTURE.md](./ARCHITECTURE.md).

---

## Overview

Action Planning converts structured `CoachResponse` fields into ordered immutable `ActionStep` lists, then assembles an `ActionPlan`.

Planners produce **ActionSteps only**.  
Selectors choose planners / priorities / dependencies deterministically.  
Policies apply structural rules without domain or provider logic.

---

## Planners

| Planner | Maps from | Produces |
|---------|-----------|----------|
| **WorkoutPlanner** | `exercises`, `actions[kind=start_workout]` | workout steps |
| **NutritionPlanner** | `nutrition` | nutrition steps |
| **RecoveryPlanner** | `recovery` | recovery steps |
| **GoalPlanner** | training/general/technique recommendations | goal steps |
| **ReminderPlanner** | `questions` | reminder steps |
| **CompositePlanner** | selected planners | merged ordered steps |

Each planner has one responsibility. No execution. No networking.

---

## Selectors

| Selector | Role |
|----------|------|
| **PlannerSelector** | Choose planners from CoachResponse contents |
| **ActionSelector** | Filter steps / candidates by type or priority |
| **PrioritySelector** | Derive plan priority / highest step |
| **DependencySelector** | Topological order / dependency edges |

All selectors are deterministic.

---

## Policies

| Policy | Role |
|--------|------|
| **ConflictPolicy** | Detect duplicate same-type labels |
| **PriorityPolicy** | Order steps by priority |
| **DependencyPolicy** | Structural dependency satisfaction |
| **ExecutionPolicy** | Plan-time readiness + ordered ids |
| **SafetyPolicy** | Structural safety constraints (e.g. max steps) |

No provider-specific logic. No business / coaching logic.

---

## Builders

| Builder | Output |
|---------|--------|
| **ActionPlanBuilder** | `ActionPlan` |
| **ActionStepBuilder** | `ActionStep` |
| **ActionProposalBuilder** | `ActionProposal` |

Builders always freeze outputs.

---

## Validators

Validate plan integrity only:

- Action integrity
- Dependencies (incl. cycles)
- Arguments
- Targets
- Priority
- Constraints
- Plan consistency
- Package completeness

No execution validation.

---

## Action Definitions

Immutable metadata definitions under `actions/` (no execution):

`WorkoutAction`, `NutritionAction`, `RecoveryAction`, `GoalAction`, `ReminderAction`, `ProgressAction`, `EngineCoachAction`, `SystemAction`.
