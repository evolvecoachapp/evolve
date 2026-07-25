# Recovery Adaptation Engine

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-26  
**Purpose:** Document the Recovery Adaptation Engine — deterministic adaptation of an existing recovery plan according to Continuous Adaptation decisions.  
**Source of Truth:** Yes — for Recovery Adaptation Engine layout, evaluation / planning / adapters / comparison / policies, boundaries, and public API on mobile.

Related: [CONTINUOUS_ADAPTATION_ENGINE.md](./CONTINUOUS_ADAPTATION_ENGINE.md), [RECOVERY_PIPELINE.md](./RECOVERY_PIPELINE.md), [ADAPTIVE_COACHING.md](./ADAPTIVE_COACHING.md), [REASONING_PIPELINE.md](./REASONING_PIPELINE.md), [AI_RUNTIME.md](./AI_RUNTIME.md), [ARCHITECTURE.md](./ARCHITECTURE.md), [DECISIONS.md](./DECISIONS.md) (ADR-079).

---

## Responsibilities

Recovery Adaptation Engine owns **existing-plan adaptation only**.

It **does**:

- adapt an existing recovery plan using Continuous Adaptation decision keys / signal keys
- evaluate sleep / fatigue / readiness / stress / recovery / HRV / consistency via fixed ordinal tables
- plan deterministic step / target key structures (no execution)
- map plan + evaluation keys → immutable modification / adjustment records (adapters)
- compare plan / state / timeline / progress / history key sets
- produce immutable `RecoveryAdaptation`, `UpdatedRecoveryPlan`, `RecoveryRuntimeInput`, packages, and snapshots
- expose a narrow public application API

It **does not**:

- generate recovery plans from scratch / empty plans
- change athlete goals
- invent sleep / deload / mobility prescriptions via calculations
- perform AI reasoning, prediction, inference, or heuristics
- call AI providers / Prompt Builder / Tool Runtime / Action Engine
- persist state, network, or render UI

Module: `app/src/features/recovery-adaptation/`.

---

## Architecture Summary

```
Recovery Plan + Recovery Runtime + Athlete State +
Continuous Adaptation Decision + Coach Context
      ↓
Recovery Adaptation Engine
  ├── Evaluation   (fixed ordinals / flags)
  ├── Planning     (step / target keys only)
  ├── Adapters     (key → modification records)
  ├── Comparison   (immutable key diffs)
  ├── Policies     (safety / recovery / consistency / sleep / fatigue)
  └── Validators   (integrity / consistency / package)
      ↓
Updated Recovery Plan
      ↓
Recovery Runtime
```

---

## Module Boundaries

| Layer | Role |
|-------|------|
| `models/` | Immutable recovery adaptation / modification / package / result types |
| `adaptation/` | `RecoveryAdaptationEngine` / `RecoveryAdaptationCoordinator` / `RecoveryAdaptationSession` |
| `evaluation/` | Sleep / fatigue / readiness / stress / recovery / HRV / consistency |
| `planning/` | Recovery / sleep / deload / mobility / stress / week planners (structures only) |
| `application/` | Adapters (internal) + narrow public API |
| `comparison/` | Plan / history / state / timeline / progress comparators |
| `builders/` | Adaptation / package / summary / snapshot / descriptor / result builders |
| `validators/` | Plan / adaptation / day / protocol / weekly / dependencies / history / snapshot / package |
| `policies/` | Adaptation / safety / recovery / consistency / sleep / fatigue |
| `selectors/` | Recovery / sleep / readiness / fatigue / week |
| `contracts/` | Plan / Runtime / Athlete State / Continuous Adaptation / Coach Context ports (+ mocks) |
| `services/` | `RecoveryAdaptationEngineService` facade |

---

## Public API

| Function | Purpose |
|----------|---------|
| `adaptRecovery` | Resolve → evaluate → plan → adapt → package → policy → validate → freeze |
| `compareRecovery` | Compare prior snapshot / plan keys after adapt path |
| `describeRecoveryAdaptation` | Describe engine capabilities / boundaries |
| `createRecoverySnapshot` | Create point-in-time `RecoverySnapshot` from adapt path |
| `validateRecoveryAdaptation` | Validate recovery adaptation package integrity |

Root export: models + application + `RecoveryAdaptationEngineService` only — internal modules are not part of the public surface.

Adapters live under `application/` but are **not** re-exported from `application/index.ts` or the root.

---

## Integration

| Consumes | Via |
|----------|-----|
| Recovery Plan | `RecoveryPlanPort` (structure keys; mock in tests) |
| Recovery Runtime | `RecoveryRuntimePort` (runtime keys; mock in tests) |
| Athlete State Engine | `AthleteStatePort` (state / signal keys; mock in tests) |
| Continuous Adaptation Engine | `ContinuousAdaptationPort` (decision ids / keys; mock in tests) |
| Coach Context | `CoachContextPort` (context / focus; mock in tests) |

| Produces | Types |
|----------|-------|
| Adaptation | `RecoveryAdaptation`, `RecoveryPackage`, `RecoverySnapshot`, `RecoverySummary` |
| Plan handoff | `UpdatedRecoveryPlan` (structure keys only) |
| Runtime handoff | `RecoveryRuntimeInput` |

`UpdatedRecoveryPlan` carries **structure keys only** (`id`, `athleteId`, `planId`, `dayKeys`, `sleepKeys`, `protocolKeys`, `mobilityKeys`, `weekKeys`, `modificationIds`, `metadata`, `createdAt`) — not full recovery generation.

---

## Coordinator Pipeline

`RecoveryAdaptationCoordinator.adapt(input)`:

1. Validate `athleteId` + `planId` present
2. Resolve upstream via ports (or use input refs/keys)
3. Run evaluators on signal/decision keys → evaluation bundle
4. Run planners → plan bundle
5. Run adapters → modifications/adjustments
6. Build `RecoveryAdaptation` + `UpdatedRecoveryPlan` + `RecoveryRuntimeInput`
7. Apply policies (safety / recovery / consistency / sleep / fatigue / adaptation)
8. Validate package
9. Freeze everything
10. Return `RecoveryResult`

---

## Rules

- Adaptation happens downstream of Continuous Adaptation Engine and upstream of Recovery Runtime
- Requires an existing plan id and structure keys — empty plan without port resolution fails
- No AI reasoning, prediction, inference, heuristics, prompts, or provider SDKs
- No recovery generation from scratch
- No athlete goal mutation
- No networking or persistence
- Evaluation / planning / adapters use structured codes, keys, and fixed ordinal tables only
