# Multi-Agent Routing

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-24  
**Purpose:** Describe how EVOLVE turns capability requirements into ordered multi-agent routing plans.  
**Source of Truth:** Partial — behavior lives in [SUPERVISOR_ROUTING.md](./SUPERVISOR_ROUTING.md).

Related: [SUPERVISOR_ROUTING.md](./SUPERVISOR_ROUTING.md), [SUPERVISOR_RUNTIME.md](./SUPERVISOR_RUNTIME.md), [AGENT_CAPABILITY.md](./AGENT_CAPABILITY.md), [AGENT_COLLABORATION.md](./AGENT_COLLABORATION.md), [ARCHITECTURE.md](./ARCHITECTURE.md).

---

## Flow

```
User / Coach Request
  → required capabilities + declared dependencies / priorities / constraints
  → Capability Registry exact resolution (capability → owner agent)
  → dependency graph (acyclic)
  → deterministic execution order (topological + declared priority ties)
  → immutable RoutingPlan
  → Coach Supervisor / Agent Collaboration consume plan targets / order
  → Specialist Agents
  → Aggregation → UnifiedCoachResponse
```

---

## Determinism Rules

1. **Exact capability match only** — no fuzzy matching, scoring, or ML.
2. **Owner agent comes from Capability Registry** — Coach reasons in capabilities, not hard-coded specialist names.
3. **Dependencies are declared** — `RoutingDependency` and `capability.dependsOn`.
4. **Order is topological** — Kahn sort with lexicographic ready-queue for stability.
5. **Priority is declared, not learned** — `critical` / `high` / `normal` / `low` ranks only.
6. **Plans are frozen** — consumers receive immutable snapshots.

---

## What Routing Is Not

| Concern | Owned by |
|---------|----------|
| Agent execution | Agent Runtime / Collaboration |
| Prompt / provider calls | Prompt / AI Provider layers |
| Domain business logic | Workout / Nutrition / Recovery domains |
| Collaboration dispatch / merge | Agent Collaboration |
| Capability registration | Agent Capability Registry |

---

## Example

Request capabilities:

- `GenerateWorkout` (high)
- `EvaluateRecovery` depends on `GenerateWorkout` (normal)

Resolved owners:

- `GenerateWorkout` → `agent:workout`
- `EvaluateRecovery` → `agent:recovery`

Execution order:

1. Workout step  
2. Recovery step  

Output: immutable `RoutingPlan` + optional `RoutingSnapshot` for Supervisor Runtime.
