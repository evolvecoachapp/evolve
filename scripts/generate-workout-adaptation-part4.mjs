/**
 * Sprint 24.1 — Workout Adaptation Engine generator (part 4: tests + docs).
 * Run: node scripts/generate-workout-adaptation-part4.mjs
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve("app/src/features/workout-adaptation");
const DOCS = path.resolve("docs");
let fileCount = 0;

function write(rel, contents, root = ROOT) {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, contents.replace(/\r?\n/g, "\n"), "utf8");
  fileCount++;
}

write(
  "__tests__/evaluation.test.ts",
  `import {
  evaluateConsistency,
  evaluateFatigue,
  evaluateFrequency,
  evaluateIntensity,
  evaluatePlateau,
  evaluateProgression,
  evaluateRecovery,
  evaluateVolume,
  evaluateWorkoutSignals,
} from "../evaluation";

describe("workout-adaptation evaluation", () => {
  it("returns frozen ordinals from signal keys", () => {
    const keys = Object.freeze([
      "decision:key:volume",
      "decision:key:intensity",
      "state:fatigue",
      "state:recovery",
      "decision:key:progression",
    ]);
    const volume = evaluateVolume(keys);
    expect(volume.present).toBe(true);
    expect(Object.isFrozen(volume)).toBe(true);
    expect(Object.isFrozen(volume.matchedKeys)).toBe(true);

    expect(evaluateIntensity(keys).present).toBe(true);
    expect(evaluateFatigue(keys).present).toBe(true);
    expect(evaluateRecovery(keys).present).toBe(true);
    expect(evaluateProgression(keys).present).toBe(true);
    expect(evaluateFrequency(keys).present).toBe(false);
    expect(evaluatePlateau(keys).present).toBe(false);
    expect(evaluateConsistency(keys).present).toBe(false);

    const bundle = evaluateWorkoutSignals(keys);
    expect(Object.isFrozen(bundle)).toBe(true);
    expect(bundle.volume.ordinal).toBeLessThanOrEqual(3);
  });
});
`,
);

write(
  "__tests__/planning.test.ts",
  `import { planWorkoutAdaptation } from "../planning";

describe("workout-adaptation planning", () => {
  it("returns immutable plan step/target keys from decision keys", () => {
    const plans = planWorkoutAdaptation({
      id: "plan-test",
      decisionKeys: Object.freeze([
        "decision:key:volume",
        "decision:key:progression",
        "decision:key:frequency",
      ]),
      signalKeys: Object.freeze(["state:fatigue"]),
      blueprintKeys: Object.freeze(["blueprint:1"]),
      exerciseKeys: Object.freeze(["exercise:squat"]),
      sessionKeys: Object.freeze(["session:a"]),
      weekKeys: Object.freeze(["week:1"]),
    });
    expect(Object.isFrozen(plans)).toBe(true);
    expect(Object.isFrozen(plans.workout)).toBe(true);
    expect(plans.workout.stepKeys.length).toBeGreaterThan(0);
    expect(plans.exercise.targetKeys).toContain("target:exercise:squat");
    expect(plans.progression.stepKeys.some((k) => k.includes("progression"))).toBe(true);
  });
});
`,
);

write(
  "__tests__/application.test.ts",
  `import {
  adaptWorkout,
  compareWorkout,
  createWorkoutSnapshot,
  describeWorkoutAdaptation,
  validateWorkoutAdaptation,
} from "../application";
import { WorkoutAdaptationInputKinds } from "../models/WorkoutAdaptationInput";
import { WorkoutOperationKinds } from "../models/WorkoutResult";
import {
  createTestWorkoutAdaptationEngineService,
  createWorkoutAdaptationInput,
} from "../testSupport/fixtures";

describe("workout-adaptation application", () => {
  it("exposes public API adapt → compare → snapshot → validate → describe", () => {
    const service = createTestWorkoutAdaptationEngineService();

    const adapted = adaptWorkout({
      service,
      input: createWorkoutAdaptationInput({ kind: WorkoutAdaptationInputKinds.ADAPT }),
    });
    expect(adapted.success).toBe(true);
    expect(adapted.operation).toBe(WorkoutOperationKinds.ADAPT);
    expect(adapted.adaptation).not.toBeNull();
    expect(adapted.updatedBlueprint).not.toBeNull();
    expect(adapted.runtimeInput).not.toBeNull();
    expect(Object.isFrozen(adapted)).toBe(true);
    expect(Object.isFrozen(adapted.adaptation!)).toBe(true);
    expect(Object.isFrozen(adapted.updatedBlueprint!)).toBe(true);

    const compared = compareWorkout({
      service,
      input: createWorkoutAdaptationInput({
        id: "request:compare",
        kind: WorkoutAdaptationInputKinds.COMPARE,
      }),
    });
    expect(compared.success).toBe(true);
    expect(compared.operation).toBe(WorkoutOperationKinds.COMPARE);
    expect(compared.comparison).not.toBeNull();

    const snap = createWorkoutSnapshot({
      service,
      input: createWorkoutAdaptationInput({
        id: "request:snapshot",
        kind: WorkoutAdaptationInputKinds.SNAPSHOT,
      }),
    });
    expect(snap.success).toBe(true);
    expect(snap.snapshot).not.toBeNull();
    expect(Object.isFrozen(snap.snapshot!)).toBe(true);

    const validated = validateWorkoutAdaptation({
      service,
      input: createWorkoutAdaptationInput({
        id: "request:validate",
        kind: WorkoutAdaptationInputKinds.VALIDATE,
      }),
    });
    expect(validated.success).toBe(true);

    const caps = describeWorkoutAdaptation({ service });
    expect(caps.name).toBe("Workout Adaptation Engine");
    expect(caps.capabilities).toEqual(
      expect.arrayContaining([
        "adaptWorkout",
        "compareWorkout",
        "describeWorkoutAdaptation",
        "createWorkoutSnapshot",
        "validateWorkoutAdaptation",
      ]),
    );
  });

  it("rejects adaptation without existing blueprint id", () => {
    const service = createTestWorkoutAdaptationEngineService();
    const result = adaptWorkout({
      service,
      input: createWorkoutAdaptationInput({ blueprintId: "" }),
    });
    expect(result.success).toBe(false);
    expect(result.errors.some((e) => e.code === "missing_blueprint")).toBe(true);
  });
});
`,
);

write(
  "__tests__/comparison.test.ts",
  `import { compareBlueprints } from "../comparison/BlueprintComparator";
import { compareExercises } from "../comparison/ExerciseComparator";
import { diffKeys } from "../comparison/diffHelpers";
import { FIXED_TIMESTAMP } from "../testSupport/fixtures";

describe("workout-adaptation comparison", () => {
  it("produces immutable key diffs", () => {
    const diff = diffKeys(
      Object.freeze(["a", "b"]),
      Object.freeze(["b", "c"]),
    );
    expect(diff.added).toEqual(["c"]);
    expect(diff.removed).toEqual(["a"]);
    expect(diff.shared).toEqual(["b"]);
    expect(Object.isFrozen(diff)).toBe(true);

    const comparison = compareBlueprints({
      id: "cmp",
      athleteId: "athlete:1",
      blueprintId: "blueprint:1",
      beforeKeys: Object.freeze(["a"]),
      afterKeys: Object.freeze(["a", "b"]),
      at: FIXED_TIMESTAMP,
    });
    expect(Object.isFrozen(comparison)).toBe(true);
    expect(comparison.addedKeys).toEqual(["b"]);

    expect(compareExercises(["e1"], ["e1", "e2"]).added).toEqual(["e2"]);
  });
});
`,
);

write(
  "__tests__/builders.test.ts",
  `import { buildWorkoutDescriptor } from "../builders/DescriptorBuilder";
import { buildWorkoutResult } from "../builders/ResultBuilder";
import { buildWorkoutAdaptation } from "../builders/WorkoutAdaptationBuilder";
import { WorkoutOperationKinds } from "../models/WorkoutResult";
import { FIXED_TIMESTAMP } from "../testSupport/fixtures";

describe("workout-adaptation builders", () => {
  it("freezes built artifacts", () => {
    const adaptation = buildWorkoutAdaptation({
      id: "wa:1",
      athleteId: "athlete:1",
      blueprintId: "blueprint:1",
      contextId: "context:1",
      decisionKeys: Object.freeze(["decision:key:volume"]),
      signalKeys: Object.freeze(["state:fatigue"]),
      at: FIXED_TIMESTAMP,
    });
    expect(Object.isFrozen(adaptation)).toBe(true);

    const descriptor = buildWorkoutDescriptor({
      id: "runtime:test",
      createdAt: FIXED_TIMESTAMP,
    });
    expect(descriptor.version).toBe("24.1.0");
    expect(Object.isFrozen(descriptor)).toBe(true);

    const result = buildWorkoutResult({
      id: "result:1",
      operation: WorkoutOperationKinds.ADAPT,
      success: true,
      adaptation,
      createdAt: FIXED_TIMESTAMP,
    });
    expect(Object.isFrozen(result)).toBe(true);
  });
});
`,
);

write(
  "__tests__/validators.test.ts",
  `import { adaptWorkout } from "../application";
import { validateWorkoutPackage } from "../validators";
import {
  createTestWorkoutAdaptationEngineService,
  createWorkoutAdaptationInput,
} from "../testSupport/fixtures";

describe("workout-adaptation validators", () => {
  it("validates successful adapt package", () => {
    const service = createTestWorkoutAdaptationEngineService();
    const result = adaptWorkout({
      service,
      input: createWorkoutAdaptationInput(),
    });
    expect(result.package).not.toBeNull();
    const validation = validateWorkoutPackage(result.package!);
    expect(validation.valid).toBe(true);
    expect(Object.isFrozen(validation)).toBe(true);
  });
});
`,
);

write(
  "__tests__/policies.test.ts",
  `import { adaptWorkout } from "../application";
import { applySafetyPolicy } from "../policies/SafetyPolicy";
import { applyWorkoutAdaptationPolicy } from "../policies/WorkoutAdaptationPolicy";
import {
  createTestWorkoutAdaptationEngineService,
  createWorkoutAdaptationInput,
} from "../testSupport/fixtures";

describe("workout-adaptation policies", () => {
  it("allows valid adapted packages", () => {
    const service = createTestWorkoutAdaptationEngineService();
    const result = adaptWorkout({
      service,
      input: createWorkoutAdaptationInput(),
    });
    expect(result.success).toBe(true);
    expect(applyWorkoutAdaptationPolicy(result.adaptation).length).toBe(0);
    expect(applySafetyPolicy(result.package!).length).toBe(0);
  });
});
`,
);

write(
  "__tests__/integration.test.ts",
  `import { adaptWorkout, createWorkoutSnapshot } from "../application";
import { createMockAthleteStatePort } from "../contracts/AthleteStatePort";
import { createMockCoachContextPort } from "../contracts/CoachContextPort";
import { createMockContinuousAdaptationPort } from "../contracts/ContinuousAdaptationPort";
import { createMockWorkoutBlueprintPort } from "../contracts/WorkoutBlueprintPort";
import { createMockWorkoutRuntimePort } from "../contracts/WorkoutRuntimePort";
import { createWorkoutAdaptationEngineService } from "../services";
import {
  createFixedClock,
  createWorkoutAdaptationInput,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("workout-adaptation integration", () => {
  it("resolves upstream ports and produces runtime handoff", () => {
    const service = createWorkoutAdaptationEngineService({
      workoutBlueprintPort: createMockWorkoutBlueprintPort(),
      workoutRuntimePort: createMockWorkoutRuntimePort(),
      athleteStatePort: createMockAthleteStatePort(),
      continuousAdaptationPort: createMockContinuousAdaptationPort(),
      coachContextPort: createMockCoachContextPort(),
      clock: createFixedClock(),
    });

    const input = createWorkoutAdaptationInput({
      blueprintKeys: Object.freeze([]),
      exerciseKeys: Object.freeze([]),
      sessionKeys: Object.freeze([]),
      weekKeys: Object.freeze([]),
      dayKeys: Object.freeze([]),
      decisionKeys: Object.freeze([]),
      signalKeys: Object.freeze([]),
    });

    const result = adaptWorkout({ service, input });
    expect(result.success).toBe(true);
    expect(result.createdAt).toBe(FIXED_TIMESTAMP);
    expect(result.updatedBlueprint?.blueprintId).toBe("blueprint:1");
    expect(result.updatedBlueprint!.exerciseKeys.length).toBeGreaterThan(0);
    expect(result.runtimeInput?.updatedBlueprintId).toBe(result.updatedBlueprint!.id);
    expect(result.adaptation!.decisionKeys.length).toBeGreaterThan(0);

    const snap = createWorkoutSnapshot({ service, input });
    expect(snap.success).toBe(true);
    expect(snap.snapshot?.modificationIds.length).toBeGreaterThan(0);
  });

  it("does not generate from empty blueprint without keys or port data", () => {
    const service = createWorkoutAdaptationEngineService({
      clock: createFixedClock(),
    });
    const result = adaptWorkout({
      service,
      input: createWorkoutAdaptationInput({
        blueprintKeys: Object.freeze([]),
        exerciseKeys: Object.freeze([]),
        sessionKeys: Object.freeze([]),
        weekKeys: Object.freeze([]),
        dayKeys: Object.freeze([]),
      }),
    });
    expect(result.success).toBe(false);
    expect(result.errors.some((e) => e.code === "empty_blueprint")).toBe(true);
  });
});
`,
);

write(
  "__tests__/regression.test.ts",
  `import {
  adaptWorkout,
  compareWorkout,
  createWorkoutSnapshot,
  describeWorkoutAdaptation,
  validateWorkoutAdaptation,
} from "../application";
import * as publicApi from "../index";
import { WorkoutAdaptationInputKinds } from "../models/WorkoutAdaptationInput";
import {
  createTestWorkoutAdaptationEngineService,
  createWorkoutAdaptationInput,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("workout-adaptation regression", () => {
  it("keeps public root surface limited to models + application + service", () => {
    expect(typeof publicApi.adaptWorkout).toBe("function");
    expect(typeof publicApi.compareWorkout).toBe("function");
    expect(typeof publicApi.describeWorkoutAdaptation).toBe("function");
    expect(typeof publicApi.createWorkoutSnapshot).toBe("function");
    expect(typeof publicApi.validateWorkoutAdaptation).toBe("function");
    expect(publicApi.WorkoutAdaptationEngineService).toBeDefined();
    expect(typeof publicApi.createWorkoutAdaptationEngineService).toBe("function");
    expect(publicApi.WorkoutAdaptationInputKinds).toBeDefined();
    expect((publicApi as Record<string, unknown>).WorkoutAdaptationCoordinator).toBeUndefined();
    expect((publicApi as Record<string, unknown>).adaptExercise).toBeUndefined();
    expect((publicApi as Record<string, unknown>).evaluateVolume).toBeUndefined();
  });

  it("is deterministic for fixed clock + fixtures", () => {
    const service = createTestWorkoutAdaptationEngineService();
    const input = createWorkoutAdaptationInput({ kind: WorkoutAdaptationInputKinds.ADAPT });
    const a = adaptWorkout({ service, input });
    const b = adaptWorkout({
      service: createTestWorkoutAdaptationEngineService(),
      input,
    });
    expect(a.success).toBe(true);
    expect(b.success).toBe(true);
    expect(a.createdAt).toBe(FIXED_TIMESTAMP);
    expect(a.adaptation!.id).toBe(b.adaptation!.id);
    expect(a.adaptation!.decisionKeys).toEqual(b.adaptation!.decisionKeys);
    expect(a.updatedBlueprint!.id).toBe(b.updatedBlueprint!.id);
    expect(a.updatedBlueprint!.modificationIds).toEqual(b.updatedBlueprint!.modificationIds);
    expect(a.runtimeInput!.id).toBe(b.runtimeInput!.id);

    expect(compareWorkout({ service, input }).success).toBe(true);
    expect(createWorkoutSnapshot({ service, input }).success).toBe(true);
    expect(validateWorkoutAdaptation({ service, input }).success).toBe(true);
    expect(describeWorkoutAdaptation({ service }).version).toBe("24.1.0");
  });

  it("requires existing blueprint — no AI / no generation from scratch", () => {
    const service = createTestWorkoutAdaptationEngineService();
    const missing = adaptWorkout({
      service,
      input: createWorkoutAdaptationInput({ blueprintId: "" }),
    });
    expect(missing.success).toBe(false);

    const caps = describeWorkoutAdaptation({ service });
    expect(caps.boundaries).toEqual(
      expect.arrayContaining([
        "no_ai",
        "no_workout_generation_from_scratch",
        "adapts_existing_blueprint_only",
      ]),
    );
  });
});
`,
);

// ─── DOCS ─────────────────────────────────────────────────────────────────────

write(
  "WORKOUT_ADAPTATION_ENGINE.md",
  `# Workout Adaptation Engine

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-26  
**Purpose:** Document the Workout Adaptation Engine — deterministic adaptation of an existing workout blueprint according to Continuous Adaptation decisions.  
**Source of Truth:** Yes — for Workout Adaptation Engine layout, evaluation / planning / adapters / comparison / policies, boundaries, and public API on mobile.

Related: [CONTINUOUS_ADAPTATION_ENGINE.md](./CONTINUOUS_ADAPTATION_ENGINE.md), [WORKOUT_PIPELINE.md](./WORKOUT_PIPELINE.md), [WORKOUT_RUNTIME.md](./WORKOUT_RUNTIME.md), [REASONING_PIPELINE.md](./REASONING_PIPELINE.md), [ARCHITECTURE.md](./ARCHITECTURE.md), [DECISIONS.md](./DECISIONS.md).

---

## Responsibilities

Workout Adaptation Engine owns **existing-blueprint adaptation only**.

It **does**:

- adapt an existing workout blueprint using Continuous Adaptation decision keys / signal keys
- evaluate volume / intensity / frequency / recovery / fatigue / progression / plateau / consistency via fixed ordinal tables
- plan deterministic step / target key structures (no execution)
- map plan + evaluation keys → immutable modification / adjustment records (adapters)
- compare blueprint / session / exercise / progress / history key sets
- produce immutable \`WorkoutAdaptation\`, \`UpdatedWorkoutBlueprint\`, \`WorkoutRuntimeInput\`, packages, and snapshots
- expose a narrow public application API

It **does not**:

- generate workouts from scratch / empty blueprints
- change athlete goals
- invent load / rep / set prescriptions via calculations
- perform AI reasoning, prediction, inference, or heuristics
- call AI providers / Prompt Builder / Tool Runtime / Action Engine
- persist state, network, or render UI

Module: \`app/src/features/workout-adaptation/\`.

---

## Architecture Summary

\`\`\`
Workout Blueprint + Workout Runtime + Athlete State +
Continuous Adaptation Decision + Coach Context
      ↓
Workout Adaptation Engine
  ├── Evaluation   (fixed ordinals / flags)
  ├── Planning     (step / target keys only)
  ├── Adapters     (key → modification records)
  ├── Comparison   (immutable key diffs)
  ├── Policies     (safety / recovery / consistency / progression / regression)
  └── Validators   (integrity / consistency / package)
      ↓
Updated Workout Blueprint
      ↓
Workout Runtime
\`\`\`

---

## Module Boundaries

| Layer | Role |
|-------|------|
| \`models/\` | Immutable workout adaptation / modification / package / result types |
| \`adaptation/\` | \`WorkoutAdaptationEngine\` / \`WorkoutAdaptationCoordinator\` / \`WorkoutAdaptationSession\` |
| \`evaluation/\` | Volume / intensity / frequency / recovery / fatigue / progression / plateau / consistency (fixed tables) |
| \`planning/\` | Workout / exercise / progression / regression / session / week planners (structures only) |
| \`application/\` | Adapters (internal) + narrow public API |
| \`comparison/\` | Blueprint / session / exercise / progress / history comparators |
| \`builders/\` | Adaptation / package / summary / snapshot / descriptor / result builders |
| \`validators/\` | Blueprint / adaptation / exercise / weekly / dependencies / history / snapshot / package |
| \`policies/\` | Adaptation / safety / recovery / consistency / progression / regression |
| \`selectors/\` | Workout / exercise / week / session / progression |
| \`contracts/\` | Blueprint / Runtime / Athlete State / Continuous Adaptation / Coach Context ports (+ mocks) |
| \`services/\` | \`WorkoutAdaptationEngineService\` facade |

---

## Public API

| Function | Purpose |
|----------|---------|
| \`adaptWorkout\` | Resolve → evaluate → plan → adapt → package → policy → validate → freeze |
| \`compareWorkout\` | Compare prior snapshot / blueprint keys after adapt path |
| \`describeWorkoutAdaptation\` | Describe engine capabilities / boundaries |
| \`createWorkoutSnapshot\` | Create point-in-time \`WorkoutSnapshot\` from adapt path |
| \`validateWorkoutAdaptation\` | Validate workout adaptation package integrity |

Root export: models + application + \`WorkoutAdaptationEngineService\` only — internal modules are not part of the public surface.

Adapters live under \`application/\` but are **not** re-exported from \`application/index.ts\` or the root.

---

## Integration

| Consumes | Via |
|----------|-----|
| Workout Blueprint | \`WorkoutBlueprintPort\` (structure keys; mock in tests) |
| Workout Runtime | \`WorkoutRuntimePort\` (runtime keys; mock in tests) |
| Athlete State Engine | \`AthleteStatePort\` (state / signal keys; mock in tests) |
| Continuous Adaptation Engine | \`ContinuousAdaptationPort\` (decision ids / keys; mock in tests) |
| Coach Context | \`CoachContextPort\` (context / focus; mock in tests) |

| Produces | Types |
|----------|-------|
| Adaptation | \`WorkoutAdaptation\`, \`WorkoutPackage\`, \`WorkoutSnapshot\`, \`WorkoutSummary\` |
| Blueprint handoff | \`UpdatedWorkoutBlueprint\` (structure keys only) |
| Runtime handoff | \`WorkoutRuntimeInput\` |

\`UpdatedWorkoutBlueprint\` carries **structure keys only** (\`id\`, \`athleteId\`, \`blueprintId\`, \`dayKeys\`, \`exerciseKeys\`, \`sessionKeys\`, \`weekKeys\`, \`modificationIds\`, \`metadata\`, \`createdAt\`) — not full workout generation.

---

## Coordinator Pipeline

\`WorkoutAdaptationCoordinator.adapt(input)\`:

1. Validate \`athleteId\` + \`blueprintId\` present
2. Resolve upstream via ports (or use input refs/keys)
3. Run evaluators on signal/decision keys → evaluation bundle
4. Run planners → plan bundle
5. Run adapters → modifications/adjustments
6. Build \`WorkoutAdaptation\` + \`UpdatedWorkoutBlueprint\` + \`WorkoutRuntimeInput\`
7. Apply policies (safety / recovery / consistency / progression / regression / adaptation)
8. Validate package
9. Freeze everything
10. Return \`WorkoutResult\`

---

## Rules

- Adaptation happens downstream of Continuous Adaptation Engine and upstream of Workout Runtime
- Requires an existing blueprint id and structure keys — empty blueprint without port resolution fails
- No AI reasoning, prediction, inference, heuristics, prompts, or provider SDKs
- No workout generation from scratch
- No athlete goal mutation
- No networking or persistence
- Evaluation / planning / adapters use structured codes, keys, and fixed ordinal tables only
`,
  DOCS,
);

write(
  "WORKOUT_PIPELINE.md",
  `# Workout Pipeline

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-26  
**Purpose:** Document the AI Workout Pipeline path and where the Workout Adaptation Engine sits relative to Continuous Adaptation and Workout Runtime.  
**Source of Truth:** Partial — subsystem details live in linked docs.

Related: [WORKOUT_ADAPTATION_ENGINE.md](./WORKOUT_ADAPTATION_ENGINE.md), [CONTINUOUS_ADAPTATION_ENGINE.md](./CONTINUOUS_ADAPTATION_ENGINE.md), [WORKOUT_RUNTIME.md](./WORKOUT_RUNTIME.md), [REASONING_PIPELINE.md](./REASONING_PIPELINE.md), [AI_RUNTIME.md](./AI_RUNTIME.md), [ARCHITECTURE.md](./ARCHITECTURE.md).

---

## Pipeline Overview

\`\`\`
Athlete State Engine
      +
Context Fusion Engine
      ↓
Decision Engine → Recommendation Engine → Explainability Engine
      ↓
Continuous Adaptation Engine          ← opportunity detection (no plan mutation)
      ↓
AdaptationDecision / AdaptationPackage
      ↓
Workout Adaptation Engine             ← adapts EXISTING Workout Blueprint
  (decision keys + blueprint structure keys → modifications)
      ↓
Updated Workout Blueprint             ← structure keys + modification ids
      ↓
Workout Runtime                       ← live session execution
      ↓
WorkoutResult / Domain Events
\`\`\`

The Workout Adaptation Engine is **not** a generation engine. Upstream program / blueprint generation remains separate. This stage only applies Continuous Adaptation decisions to an already-existing blueprint before runtime handoff.

---

## Stage Ownership

| Stage | Module | Owns |
|-------|--------|------|
| Continuous opportunity detection | \`features/continuous-adaptation\` | Whether meaningful adaptation opportunities exist |
| Workout blueprint adaptation | \`features/workout-adaptation\` | How an existing blueprint structure is adjusted (keys / modifications) |
| Live session execution | \`features/workout-runtime\` | Mutable in-engine runtime graph while performing |

---

## Workout Adaptation Placement

\`\`\`
Continuous Adaptation Decision
      +
Existing Workout Blueprint
      +
Athlete State / Coach Context / Runtime refs
      ↓
Workout Adaptation Engine
      ↓
UpdatedWorkoutBlueprint → WorkoutRuntimeInput → Workout Runtime
\`\`\`

### Inputs

- Workout Blueprint structure keys (\`blueprintId\`, day / exercise / session / week keys)
- Continuous Adaptation decision ids / keys
- Athlete State signal keys
- Coach Context focus / context keys
- Optional prior \`WorkoutSnapshot\` for comparison

### Outputs

- \`WorkoutAdaptation\` (immutable modification / adjustment records)
- \`UpdatedWorkoutBlueprint\` (structure keys + \`modificationIds\` only)
- \`WorkoutRuntimeInput\` (handoff to Workout Runtime)
- \`WorkoutPackage\` / \`WorkoutSnapshot\` / \`WorkoutSummary\`

---

## Boundaries

| Allowed | Not allowed |
|---------|-------------|
| Adapt existing blueprint structure keys | Generate workouts from empty / missing blueprint |
| Deterministic key → modification mapping | AI / prompts / provider SDKs |
| Fixed ordinal evaluation tables | Invent numeric prescriptions |
| Immutable packages / snapshots | Persistence / networking / UI |
| Handoff to Workout Runtime | Athlete goal changes |

---

## Related Engines (future / parallel)

Continuous Adaptation also produces handoff inputs for:

- Nutrition Adaptation Engine
- Recovery Adaptation Engine
- Goal Progress Engine

Those paths are parallel consumers of \`AdaptationDecision\` and are outside this Workout Pipeline document.

---

## Rules

- Workout Adaptation sits **after** Continuous Adaptation and **before** Workout Runtime
- Blueprint must already exist — adaptation fails closed on missing / empty blueprint without resolvable keys
- No AI in the adaptation stage
- Runtime receives structural handoff only (\`WorkoutRuntimeInput\`), not generation payloads
`,
  DOCS,
);

console.log(`Wrote ${fileCount} files (feature + docs)`);
