/**
 * Sprint 24.2 — Nutrition Adaptation Engine generator (part 4: tests + docs).
 * Run: node scripts/generate-nutrition-adaptation-part4.mjs
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve("app/src/features/nutrition-adaptation");
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
  evaluateAdherence,
  evaluateCalorie,
  evaluateConsistency,
  evaluateHydration,
  evaluateMacro,
  evaluateMealTiming,
  evaluateNutritionSignals,
  evaluateRecoveryNutrition,
} from "../evaluation";

describe("nutrition-adaptation evaluation", () => {
  it("returns frozen ordinals from signal keys", () => {
    const keys = Object.freeze([
      "decision:key:calorie",
      "decision:key:macro",
      "state:hydration",
      "state:recovery",
      "state:adherence",
    ]);
    const calorie = evaluateCalorie(keys);
    expect(calorie.present).toBe(true);
    expect(Object.isFrozen(calorie)).toBe(true);
    expect(Object.isFrozen(calorie.matchedKeys)).toBe(true);

    expect(evaluateMacro(keys).present).toBe(true);
    expect(evaluateHydration(keys).present).toBe(true);
    expect(evaluateRecoveryNutrition(keys).present).toBe(true);
    expect(evaluateAdherence(keys).present).toBe(true);
    expect(evaluateMealTiming(keys).present).toBe(false);
    expect(evaluateConsistency(keys).present).toBe(false);

    const bundle = evaluateNutritionSignals(keys);
    expect(Object.isFrozen(bundle)).toBe(true);
    expect(bundle.calorie.ordinal).toBeLessThanOrEqual(3);
  });
});
`,
);

write(
  "__tests__/planning.test.ts",
  `import { planNutritionAdaptation } from "../planning";

describe("nutrition-adaptation planning", () => {
  it("returns immutable plan step/target keys from decision keys", () => {
    const plans = planNutritionAdaptation({
      id: "plan-test",
      decisionKeys: Object.freeze([
        "decision:key:calorie",
        "decision:key:macro",
        "decision:key:hydration",
      ]),
      signalKeys: Object.freeze(["state:hydration"]),
      planKeys: Object.freeze(["plan:1"]),
      mealKeys: Object.freeze(["meal:breakfast"]),
      macroKeys: Object.freeze(["macro:protein"]),
      timingKeys: Object.freeze(["timing:pre"]),
      weekKeys: Object.freeze(["week:1"]),
    });
    expect(Object.isFrozen(plans)).toBe(true);
    expect(Object.isFrozen(plans.nutrition)).toBe(true);
    expect(plans.nutrition.stepKeys.length).toBeGreaterThan(0);
    expect(plans.meal.targetKeys).toContain("target:meal:breakfast");
    expect(plans.macro.stepKeys.some((k) => k.includes("macro") || k.includes("calorie"))).toBe(
      true,
    );
  });
});
`,
);

write(
  "__tests__/application.test.ts",
  `import {
  adaptNutrition,
  compareNutrition,
  createNutritionSnapshot,
  describeNutritionAdaptation,
  validateNutritionAdaptation,
} from "../application";
import { NutritionAdaptationInputKinds } from "../models/NutritionAdaptationInput";
import { NutritionOperationKinds } from "../models/NutritionResult";
import {
  createNutritionAdaptationInput,
  createTestNutritionAdaptationEngineService,
} from "../testSupport/fixtures";

describe("nutrition-adaptation application", () => {
  it("exposes public API adapt → compare → snapshot → validate → describe", () => {
    const service = createTestNutritionAdaptationEngineService();

    const adapted = adaptNutrition({
      service,
      input: createNutritionAdaptationInput({ kind: NutritionAdaptationInputKinds.ADAPT }),
    });
    expect(adapted.success).toBe(true);
    expect(adapted.operation).toBe(NutritionOperationKinds.ADAPT);
    expect(adapted.adaptation).not.toBeNull();
    expect(adapted.updatedPlan).not.toBeNull();
    expect(adapted.runtimeInput).not.toBeNull();
    expect(Object.isFrozen(adapted)).toBe(true);
    expect(Object.isFrozen(adapted.adaptation!)).toBe(true);
    expect(Object.isFrozen(adapted.updatedPlan!)).toBe(true);

    const compared = compareNutrition({
      service,
      input: createNutritionAdaptationInput({
        id: "request:compare",
        kind: NutritionAdaptationInputKinds.COMPARE,
      }),
    });
    expect(compared.success).toBe(true);
    expect(compared.operation).toBe(NutritionOperationKinds.COMPARE);
    expect(compared.comparison).not.toBeNull();

    const snap = createNutritionSnapshot({
      service,
      input: createNutritionAdaptationInput({
        id: "request:snapshot",
        kind: NutritionAdaptationInputKinds.SNAPSHOT,
      }),
    });
    expect(snap.success).toBe(true);
    expect(snap.snapshot).not.toBeNull();
    expect(Object.isFrozen(snap.snapshot!)).toBe(true);

    const validated = validateNutritionAdaptation({
      service,
      input: createNutritionAdaptationInput({
        id: "request:validate",
        kind: NutritionAdaptationInputKinds.VALIDATE,
      }),
    });
    expect(validated.success).toBe(true);

    const caps = describeNutritionAdaptation({ service });
    expect(caps.name).toBe("Nutrition Adaptation Engine");
    expect(caps.capabilities).toEqual(
      expect.arrayContaining([
        "adaptNutrition",
        "compareNutrition",
        "describeNutritionAdaptation",
        "createNutritionSnapshot",
        "validateNutritionAdaptation",
      ]),
    );
  });

  it("rejects adaptation without existing plan id", () => {
    const service = createTestNutritionAdaptationEngineService();
    const result = adaptNutrition({
      service,
      input: createNutritionAdaptationInput({ planId: "" }),
    });
    expect(result.success).toBe(false);
    expect(result.errors.some((e) => e.code === "missing_plan")).toBe(true);
  });
});
`,
);

write(
  "__tests__/comparison.test.ts",
  `import { compareMeals } from "../comparison/MealComparator";
import { comparePlans } from "../comparison/PlanComparator";
import { diffKeys } from "../comparison/diffHelpers";
import { FIXED_TIMESTAMP } from "../testSupport/fixtures";

describe("nutrition-adaptation comparison", () => {
  it("produces immutable key diffs", () => {
    const diff = diffKeys(
      Object.freeze(["a", "b"]),
      Object.freeze(["b", "c"]),
    );
    expect(diff.added).toEqual(["c"]);
    expect(diff.removed).toEqual(["a"]);
    expect(diff.shared).toEqual(["b"]);
    expect(Object.isFrozen(diff)).toBe(true);

    const comparison = comparePlans({
      id: "cmp",
      athleteId: "athlete:1",
      planId: "plan:1",
      beforeKeys: Object.freeze(["a"]),
      afterKeys: Object.freeze(["a", "b"]),
      at: FIXED_TIMESTAMP,
    });
    expect(Object.isFrozen(comparison)).toBe(true);
    expect(comparison.addedKeys).toEqual(["b"]);

    expect(compareMeals(["m1"], ["m1", "m2"]).added).toEqual(["m2"]);
  });
});
`,
);

write(
  "__tests__/builders.test.ts",
  `import { buildNutritionDescriptor } from "../builders/DescriptorBuilder";
import { buildNutritionAdaptation } from "../builders/NutritionAdaptationBuilder";
import { buildNutritionResult } from "../builders/ResultBuilder";
import { NutritionOperationKinds } from "../models/NutritionResult";
import { FIXED_TIMESTAMP } from "../testSupport/fixtures";

describe("nutrition-adaptation builders", () => {
  it("freezes built artifacts", () => {
    const adaptation = buildNutritionAdaptation({
      id: "na:1",
      athleteId: "athlete:1",
      planId: "plan:1",
      contextId: "context:1",
      decisionKeys: Object.freeze(["decision:key:calorie"]),
      signalKeys: Object.freeze(["state:hydration"]),
      at: FIXED_TIMESTAMP,
    });
    expect(Object.isFrozen(adaptation)).toBe(true);

    const descriptor = buildNutritionDescriptor({
      id: "runtime:test",
      createdAt: FIXED_TIMESTAMP,
    });
    expect(descriptor.version).toBe("24.2.0");
    expect(Object.isFrozen(descriptor)).toBe(true);

    const result = buildNutritionResult({
      id: "result:1",
      operation: NutritionOperationKinds.ADAPT,
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
  `import { adaptNutrition } from "../application";
import { validateNutritionPackage } from "../validators";
import {
  createNutritionAdaptationInput,
  createTestNutritionAdaptationEngineService,
} from "../testSupport/fixtures";

describe("nutrition-adaptation validators", () => {
  it("validates successful adapt package", () => {
    const service = createTestNutritionAdaptationEngineService();
    const result = adaptNutrition({
      service,
      input: createNutritionAdaptationInput(),
    });
    expect(result.package).not.toBeNull();
    const validation = validateNutritionPackage(result.package!);
    expect(validation.valid).toBe(true);
    expect(Object.isFrozen(validation)).toBe(true);
  });
});
`,
);

write(
  "__tests__/policies.test.ts",
  `import { adaptNutrition } from "../application";
import { applyNutritionAdaptationPolicy } from "../policies/NutritionAdaptationPolicy";
import { applySafetyPolicy } from "../policies/SafetyPolicy";
import {
  createNutritionAdaptationInput,
  createTestNutritionAdaptationEngineService,
} from "../testSupport/fixtures";

describe("nutrition-adaptation policies", () => {
  it("allows valid adapted packages", () => {
    const service = createTestNutritionAdaptationEngineService();
    const result = adaptNutrition({
      service,
      input: createNutritionAdaptationInput(),
    });
    expect(result.success).toBe(true);
    expect(applyNutritionAdaptationPolicy(result.adaptation).length).toBe(0);
    expect(applySafetyPolicy(result.package!).length).toBe(0);
  });
});
`,
);

write(
  "__tests__/integration.test.ts",
  `import { adaptNutrition, createNutritionSnapshot } from "../application";
import { createMockAthleteStatePort } from "../contracts/AthleteStatePort";
import { createMockCoachContextPort } from "../contracts/CoachContextPort";
import { createMockContinuousAdaptationPort } from "../contracts/ContinuousAdaptationPort";
import { createMockNutritionPlanPort } from "../contracts/NutritionPlanPort";
import { createMockNutritionRuntimePort } from "../contracts/NutritionRuntimePort";
import { createNutritionAdaptationEngineService } from "../services";
import {
  createFixedClock,
  createNutritionAdaptationInput,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("nutrition-adaptation integration", () => {
  it("resolves upstream ports and produces runtime handoff", () => {
    const service = createNutritionAdaptationEngineService({
      nutritionPlanPort: createMockNutritionPlanPort(),
      nutritionRuntimePort: createMockNutritionRuntimePort(),
      athleteStatePort: createMockAthleteStatePort(),
      continuousAdaptationPort: createMockContinuousAdaptationPort(),
      coachContextPort: createMockCoachContextPort(),
      clock: createFixedClock(),
    });

    const input = createNutritionAdaptationInput({
      planKeys: Object.freeze([]),
      mealKeys: Object.freeze([]),
      macroKeys: Object.freeze([]),
      timingKeys: Object.freeze([]),
      weekKeys: Object.freeze([]),
      dayKeys: Object.freeze([]),
      decisionKeys: Object.freeze([]),
      signalKeys: Object.freeze([]),
    });

    const result = adaptNutrition({ service, input });
    expect(result.success).toBe(true);
    expect(result.createdAt).toBe(FIXED_TIMESTAMP);
    expect(result.updatedPlan?.planId).toBe("plan:1");
    expect(result.updatedPlan!.mealKeys.length).toBeGreaterThan(0);
    expect(result.runtimeInput?.updatedPlanId).toBe(result.updatedPlan!.id);
    expect(result.adaptation!.decisionKeys.length).toBeGreaterThan(0);

    const snap = createNutritionSnapshot({ service, input });
    expect(snap.success).toBe(true);
    expect(snap.snapshot?.modificationIds.length).toBeGreaterThan(0);
  });

  it("does not generate from empty plan without keys or port data", () => {
    const service = createNutritionAdaptationEngineService({
      clock: createFixedClock(),
    });
    const result = adaptNutrition({
      service,
      input: createNutritionAdaptationInput({
        planKeys: Object.freeze([]),
        mealKeys: Object.freeze([]),
        macroKeys: Object.freeze([]),
        timingKeys: Object.freeze([]),
        weekKeys: Object.freeze([]),
        dayKeys: Object.freeze([]),
      }),
    });
    expect(result.success).toBe(false);
    expect(result.errors.some((e) => e.code === "empty_plan")).toBe(true);
  });
});
`,
);

write(
  "__tests__/regression.test.ts",
  `import {
  adaptNutrition,
  compareNutrition,
  createNutritionSnapshot,
  describeNutritionAdaptation,
  validateNutritionAdaptation,
} from "../application";
import * as publicApi from "../index";
import { NutritionAdaptationInputKinds } from "../models/NutritionAdaptationInput";
import {
  createNutritionAdaptationInput,
  createTestNutritionAdaptationEngineService,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("nutrition-adaptation regression", () => {
  it("keeps public root surface limited to models + application + service", () => {
    expect(typeof publicApi.adaptNutrition).toBe("function");
    expect(typeof publicApi.compareNutrition).toBe("function");
    expect(typeof publicApi.describeNutritionAdaptation).toBe("function");
    expect(typeof publicApi.createNutritionSnapshot).toBe("function");
    expect(typeof publicApi.validateNutritionAdaptation).toBe("function");
    expect(publicApi.NutritionAdaptationEngineService).toBeDefined();
    expect(typeof publicApi.createNutritionAdaptationEngineService).toBe("function");
    expect(publicApi.NutritionAdaptationInputKinds).toBeDefined();
    expect((publicApi as Record<string, unknown>).NutritionAdaptationCoordinator).toBeUndefined();
    expect((publicApi as Record<string, unknown>).adaptMeal).toBeUndefined();
    expect((publicApi as Record<string, unknown>).evaluateCalorie).toBeUndefined();
  });

  it("is deterministic for fixed clock + fixtures", () => {
    const service = createTestNutritionAdaptationEngineService();
    const input = createNutritionAdaptationInput({ kind: NutritionAdaptationInputKinds.ADAPT });
    const a = adaptNutrition({ service, input });
    const b = adaptNutrition({
      service: createTestNutritionAdaptationEngineService(),
      input,
    });
    expect(a.success).toBe(true);
    expect(b.success).toBe(true);
    expect(a.createdAt).toBe(FIXED_TIMESTAMP);
    expect(a.adaptation!.id).toBe(b.adaptation!.id);
    expect(a.adaptation!.decisionKeys).toEqual(b.adaptation!.decisionKeys);
    expect(a.updatedPlan!.id).toBe(b.updatedPlan!.id);
    expect(a.updatedPlan!.modificationIds).toEqual(b.updatedPlan!.modificationIds);
    expect(a.runtimeInput!.id).toBe(b.runtimeInput!.id);

    expect(compareNutrition({ service, input }).success).toBe(true);
    expect(createNutritionSnapshot({ service, input }).success).toBe(true);
    expect(validateNutritionAdaptation({ service, input }).success).toBe(true);
    expect(describeNutritionAdaptation({ service }).version).toBe("24.2.0");
  });

  it("requires existing plan — no AI / no generation from scratch", () => {
    const service = createTestNutritionAdaptationEngineService();
    const missing = adaptNutrition({
      service,
      input: createNutritionAdaptationInput({ planId: "" }),
    });
    expect(missing.success).toBe(false);

    const caps = describeNutritionAdaptation({ service });
    expect(caps.boundaries).toEqual(
      expect.arrayContaining([
        "no_ai",
        "no_nutrition_generation_from_scratch",
        "adapts_existing_plan_only",
      ]),
    );
  });
});
`,
);

// ─── DOCS ─────────────────────────────────────────────────────────────────────

write(
  "NUTRITION_ADAPTATION_ENGINE.md",
  `# Nutrition Adaptation Engine

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-26  
**Purpose:** Document the Nutrition Adaptation Engine — deterministic adaptation of an existing nutrition plan according to Continuous Adaptation decisions.  
**Source of Truth:** Yes — for Nutrition Adaptation Engine layout, evaluation / planning / adapters / comparison / policies, boundaries, and public API on mobile.

Related: [CONTINUOUS_ADAPTATION_ENGINE.md](./CONTINUOUS_ADAPTATION_ENGINE.md), [NUTRITION_PIPELINE.md](./NUTRITION_PIPELINE.md), [ADAPTIVE_COACHING.md](./ADAPTIVE_COACHING.md), [REASONING_PIPELINE.md](./REASONING_PIPELINE.md), [AI_RUNTIME.md](./AI_RUNTIME.md), [ARCHITECTURE.md](./ARCHITECTURE.md), [DECISIONS.md](./DECISIONS.md) (ADR-078).

---

## Responsibilities

Nutrition Adaptation Engine owns **existing-plan adaptation only**.

It **does**:

- adapt an existing nutrition plan using Continuous Adaptation decision keys / signal keys
- evaluate calorie / macro / hydration / meal timing / recovery nutrition / adherence / consistency via fixed ordinal tables
- plan deterministic step / target key structures (no execution)
- map plan + evaluation keys → immutable modification / adjustment records (adapters)
- compare plan / meal / macro / progress / history key sets
- produce immutable \`NutritionAdaptation\`, \`UpdatedNutritionPlan\`, \`NutritionRuntimeInput\`, packages, and snapshots
- expose a narrow public application API

It **does not**:

- generate nutrition plans from scratch / empty plans
- change athlete goals
- invent calorie / macro prescriptions via calculations
- perform AI reasoning, prediction, inference, or heuristics
- call AI providers / Prompt Builder / Tool Runtime / Action Engine
- persist state, network, or render UI

Module: \`app/src/features/nutrition-adaptation/\`.

---

## Architecture Summary

\`\`\`
Nutrition Plan + Nutrition Runtime + Athlete State +
Continuous Adaptation Decision + Coach Context
      ↓
Nutrition Adaptation Engine
  ├── Evaluation   (fixed ordinals / flags)
  ├── Planning     (step / target keys only)
  ├── Adapters     (key → modification records)
  ├── Comparison   (immutable key diffs)
  ├── Policies     (safety / recovery / consistency / hydration / adherence)
  └── Validators   (integrity / consistency / package)
      ↓
Updated Nutrition Plan
      ↓
Nutrition Runtime
\`\`\`

---

## Module Boundaries

| Layer | Role |
|-------|------|
| \`models/\` | Immutable nutrition adaptation / modification / package / result types |
| \`adaptation/\` | \`NutritionAdaptationEngine\` / \`NutritionAdaptationCoordinator\` / \`NutritionAdaptationSession\` |
| \`evaluation/\` | Calorie / macro / hydration / meal timing / recovery nutrition / adherence / consistency |
| \`planning/\` | Nutrition / meal / macro / timing / hydration / week planners (structures only) |
| \`application/\` | Adapters (internal) + narrow public API |
| \`comparison/\` | Plan / meal / macro / progress / history comparators |
| \`builders/\` | Adaptation / package / summary / snapshot / descriptor / result builders |
| \`validators/\` | Plan / adaptation / meal / macro / weekly / dependencies / history / snapshot / package |
| \`policies/\` | Adaptation / safety / recovery / consistency / hydration / adherence |
| \`selectors/\` | Nutrition / meal / macro / timing / week |
| \`contracts/\` | Plan / Runtime / Athlete State / Continuous Adaptation / Coach Context ports (+ mocks) |
| \`services/\` | \`NutritionAdaptationEngineService\` facade |

---

## Public API

| Function | Purpose |
|----------|---------|
| \`adaptNutrition\` | Resolve → evaluate → plan → adapt → package → policy → validate → freeze |
| \`compareNutrition\` | Compare prior snapshot / plan keys after adapt path |
| \`describeNutritionAdaptation\` | Describe engine capabilities / boundaries |
| \`createNutritionSnapshot\` | Create point-in-time \`NutritionSnapshot\` from adapt path |
| \`validateNutritionAdaptation\` | Validate nutrition adaptation package integrity |

Root export: models + application + \`NutritionAdaptationEngineService\` only — internal modules are not part of the public surface.

Adapters live under \`application/\` but are **not** re-exported from \`application/index.ts\` or the root.

---

## Integration

| Consumes | Via |
|----------|-----|
| Nutrition Plan | \`NutritionPlanPort\` (structure keys; mock in tests) |
| Nutrition Runtime | \`NutritionRuntimePort\` (runtime keys; mock in tests) |
| Athlete State Engine | \`AthleteStatePort\` (state / signal keys; mock in tests) |
| Continuous Adaptation Engine | \`ContinuousAdaptationPort\` (decision ids / keys; mock in tests) |
| Coach Context | \`CoachContextPort\` (context / focus; mock in tests) |

| Produces | Types |
|----------|-------|
| Adaptation | \`NutritionAdaptation\`, \`NutritionPackage\`, \`NutritionSnapshot\`, \`NutritionSummary\` |
| Plan handoff | \`UpdatedNutritionPlan\` (structure keys only) |
| Runtime handoff | \`NutritionRuntimeInput\` |

\`UpdatedNutritionPlan\` carries **structure keys only** (\`id\`, \`athleteId\`, \`planId\`, \`dayKeys\`, \`mealKeys\`, \`macroKeys\`, \`timingKeys\`, \`weekKeys\`, \`modificationIds\`, \`metadata\`, \`createdAt\`) — not full nutrition generation.

---

## Coordinator Pipeline

\`NutritionAdaptationCoordinator.adapt(input)\`:

1. Validate \`athleteId\` + \`planId\` present
2. Resolve upstream via ports (or use input refs/keys)
3. Run evaluators on signal/decision keys → evaluation bundle
4. Run planners → plan bundle
5. Run adapters → modifications/adjustments
6. Build \`NutritionAdaptation\` + \`UpdatedNutritionPlan\` + \`NutritionRuntimeInput\`
7. Apply policies (safety / recovery / consistency / hydration / adherence / adaptation)
8. Validate package
9. Freeze everything
10. Return \`NutritionResult\`

---

## Rules

- Adaptation happens downstream of Continuous Adaptation Engine and upstream of Nutrition Runtime
- Requires an existing plan id and structure keys — empty plan without port resolution fails
- No AI reasoning, prediction, inference, heuristics, prompts, or provider SDKs
- No nutrition generation from scratch
- No athlete goal mutation
- No networking or persistence
- Evaluation / planning / adapters use structured codes, keys, and fixed ordinal tables only
`,
  DOCS,
);

write(
  "NUTRITION_PIPELINE.md",
  `# Nutrition Pipeline

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-26  
**Purpose:** Document the AI Nutrition Pipeline path and where the Nutrition Adaptation Engine sits relative to Continuous Adaptation and Nutrition Runtime.  
**Source of Truth:** Partial — subsystem details live in linked docs.

Related: [NUTRITION_ADAPTATION_ENGINE.md](./NUTRITION_ADAPTATION_ENGINE.md), [CONTINUOUS_ADAPTATION_ENGINE.md](./CONTINUOUS_ADAPTATION_ENGINE.md), [ADAPTIVE_COACHING.md](./ADAPTIVE_COACHING.md), [WORKOUT_PIPELINE.md](./WORKOUT_PIPELINE.md), [ARCHITECTURE.md](./ARCHITECTURE.md).

---

## Pipeline Path

\`\`\`
Athlete State / Context Fusion / Decision / Recommendation / Explainability
      ↓
Continuous Adaptation Engine          ← opportunity detection only
      ↓
AdaptationDecision (nutrition handoff keys)
      ↓
Nutrition Adaptation Engine           ← adapts EXISTING Nutrition Plan
      ↓
Updated Nutrition Plan
      ↓
Nutrition Runtime
\`\`\`

The Nutrition Adaptation Engine is **not** a generation engine. Upstream nutrition plan generation remains separate. This stage only applies Continuous Adaptation decisions to an already-existing plan before runtime handoff.

---

## Nutrition Adaptation Placement

| Stage | Owns |
|-------|------|
| Continuous Adaptation | Whether nutrition adaptation opportunities exist |
| Nutrition Adaptation Engine | How an existing plan structure is adjusted (keys / modifications) |
| Nutrition Runtime | Execution / logging of the updated plan |

\`\`\`
Nutrition Plan
+ Nutrition Runtime
+ Athlete State
+ Continuous Adaptation Decision
+ Coach Context
      ↓
Nutrition Adaptation Engine
      ↓
Updated Nutrition Plan → Nutrition Runtime
\`\`\`

---

## Boundaries

- Nutrition Adaptation adapts existing plans only — never generates from scratch
- No AI reasoning / prompts / providers in the adaptation layer
- No networking or persistence in the adaptation layer
- Structure keys only on \`UpdatedNutritionPlan\` / \`NutritionRuntimeInput\`

---

## Rules

- Nutrition Adaptation sits **after** Continuous Adaptation and **before** Nutrition Runtime
- Requires existing \`planId\` + structure keys (or port resolution)
- Parallel to Workout Adaptation Engine (domain-specific, same architectural role)
`,
  DOCS,
);

console.log(`Wrote ${fileCount} files`);
