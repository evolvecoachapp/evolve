/**
 * Sprint 24.2 — Nutrition Adaptation Engine generator (part 2: evaluation, planning, adapters, builders, comparison).
 * Run: node scripts/generate-nutrition-adaptation-part2.mjs
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve("app/src/features/nutrition-adaptation");
let fileCount = 0;

function write(rel, contents) {
  const full = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, contents.replace(/\r?\n/g, "\n"), "utf8");
  fileCount++;
}

function evaluator(name, prefixes, ordinalTable) {
  const short = name.replace("Evaluator", "");
  write(
    `evaluation/${name}.ts`,
    `/** Deterministic ordinal / flag lookup only — no prescription invention. */
export interface ${short}Evaluation {
  readonly ordinal: number;
  readonly label: string;
  readonly present: boolean;
  readonly matchedKeys: readonly string[];
}

const ORDINAL_TABLE: Readonly<Record<string, number>> = Object.freeze(${JSON.stringify(ordinalTable)});

const PREFIXES: readonly string[] = Object.freeze(${JSON.stringify(prefixes)});

function labelForOrdinal(ordinal: number): string {
  if (ordinal <= 0) return "critical";
  if (ordinal === 1) return "high";
  if (ordinal === 2) return "normal";
  return "low";
}

export function evaluate${short}(signalKeys: readonly string[]): ${short}Evaluation {
  const matched: string[] = [];
  let ordinal = 3;
  for (const key of signalKeys) {
    for (const prefix of PREFIXES) {
      if (key.startsWith(prefix) || key.includes(prefix)) {
        matched.push(key);
        const tableOrdinal = ORDINAL_TABLE[prefix] ?? ORDINAL_TABLE[key] ?? 2;
        if (tableOrdinal < ordinal) ordinal = tableOrdinal;
      }
    }
  }
  const present = matched.length > 0;
  return Object.freeze({
    ordinal: present ? ordinal : 3,
    label: labelForOrdinal(present ? ordinal : 3),
    present,
    matchedKeys: Object.freeze([...matched].sort()),
  });
}
`,
  );
}

evaluator("CalorieEvaluator", ["calorie", "decision:key:calorie"], { calorie: 1, "decision:key:calorie": 1 });
evaluator("MacroEvaluator", ["macro", "protein", "carbohydrate", "fat", "fiber", "decision:key:macro"], {
  macro: 1,
  protein: 1,
  carbohydrate: 2,
  fat: 2,
  fiber: 2,
  "decision:key:macro": 1,
});
evaluator("HydrationEvaluator", ["hydration", "state:hydration"], { hydration: 0, "state:hydration": 0 });
evaluator("MealTimingEvaluator", ["timing", "meal-timing", "decision:key:timing"], {
  timing: 2,
  "meal-timing": 2,
  "decision:key:timing": 2,
});
evaluator("RecoveryNutritionEvaluator", ["recovery-nutrition", "recovery", "state:recovery"], {
  "recovery-nutrition": 0,
  recovery: 0,
  "state:recovery": 0,
});
evaluator("AdherenceEvaluator", ["adherence", "state:adherence", "decision:key:adherence"], {
  adherence: 1,
  "state:adherence": 1,
  "decision:key:adherence": 1,
});
evaluator("ConsistencyEvaluator", ["consistency", "decision:key:consistency"], {
  consistency: 2,
  "decision:key:consistency": 2,
});

write(
  "evaluation/index.ts",
  `export * from "./AdherenceEvaluator";
export * from "./CalorieEvaluator";
export * from "./ConsistencyEvaluator";
export * from "./HydrationEvaluator";
export * from "./MacroEvaluator";
export * from "./MealTimingEvaluator";
export * from "./RecoveryNutritionEvaluator";

import { evaluateAdherence } from "./AdherenceEvaluator";
import { evaluateCalorie } from "./CalorieEvaluator";
import { evaluateConsistency } from "./ConsistencyEvaluator";
import { evaluateHydration } from "./HydrationEvaluator";
import { evaluateMacro } from "./MacroEvaluator";
import { evaluateMealTiming } from "./MealTimingEvaluator";
import { evaluateRecoveryNutrition } from "./RecoveryNutritionEvaluator";

export interface NutritionEvaluationBundle {
  readonly calorie: ReturnType<typeof evaluateCalorie>;
  readonly macro: ReturnType<typeof evaluateMacro>;
  readonly hydration: ReturnType<typeof evaluateHydration>;
  readonly mealTiming: ReturnType<typeof evaluateMealTiming>;
  readonly recoveryNutrition: ReturnType<typeof evaluateRecoveryNutrition>;
  readonly adherence: ReturnType<typeof evaluateAdherence>;
  readonly consistency: ReturnType<typeof evaluateConsistency>;
}

export function evaluateNutritionSignals(signalKeys: readonly string[]): NutritionEvaluationBundle {
  return Object.freeze({
    calorie: evaluateCalorie(signalKeys),
    macro: evaluateMacro(signalKeys),
    hydration: evaluateHydration(signalKeys),
    mealTiming: evaluateMealTiming(signalKeys),
    recoveryNutrition: evaluateRecoveryNutrition(signalKeys),
    adherence: evaluateAdherence(signalKeys),
    consistency: evaluateConsistency(signalKeys),
  });
}
`,
);

// ─── PLANNING ─────────────────────────────────────────────────────────────────

write(
  "planning/NutritionPlanner.ts",
  `import { uniqueSorted } from "../utils/NutritionAdaptationHelpers";

export interface NutritionPlan {
  readonly id: string;
  readonly stepKeys: readonly string[];
  readonly targetKeys: readonly string[];
  readonly decisionKeys: readonly string[];
}

/** Deterministic planning structures only — no execution. */
export function planNutrition(input: {
  readonly id: string;
  readonly decisionKeys: readonly string[];
  readonly planKeys: readonly string[];
}): NutritionPlan {
  const stepKeys = uniqueSorted(
    input.decisionKeys.map((k) => \`step:nutrition:\${k}\`),
  );
  const targetKeys = uniqueSorted([
    ...input.planKeys.map((k) => \`target:\${k}\`),
    ...input.decisionKeys.map((k) => \`target:decision:\${k}\`),
  ]);
  return Object.freeze({
    id: \`plan:nutrition:\${input.id}\`,
    stepKeys,
    targetKeys,
    decisionKeys: uniqueSorted(input.decisionKeys),
  });
}
`,
);

write(
  "planning/MealPlanner.ts",
  `import { uniqueSorted } from "../utils/NutritionAdaptationHelpers";

export interface MealPlan {
  readonly id: string;
  readonly stepKeys: readonly string[];
  readonly targetKeys: readonly string[];
  readonly mealKeys: readonly string[];
}

export function planMeals(input: {
  readonly id: string;
  readonly decisionKeys: readonly string[];
  readonly mealKeys: readonly string[];
}): MealPlan {
  const relevant = input.decisionKeys.filter(
    (k) => k.includes("meal") || k.includes("calorie") || k.includes("macro") || k.includes("timing"),
  );
  return Object.freeze({
    id: \`plan:meal:\${input.id}\`,
    stepKeys: uniqueSorted(relevant.map((k) => \`step:meal:\${k}\`)),
    targetKeys: uniqueSorted(input.mealKeys.map((k) => \`target:\${k}\`)),
    mealKeys: uniqueSorted(input.mealKeys),
  });
}
`,
);

write(
  "planning/MacroPlanner.ts",
  `import { uniqueSorted } from "../utils/NutritionAdaptationHelpers";

export interface MacroPlan {
  readonly id: string;
  readonly stepKeys: readonly string[];
  readonly targetKeys: readonly string[];
  readonly macroKeys: readonly string[];
}

export function planMacros(input: {
  readonly id: string;
  readonly decisionKeys: readonly string[];
  readonly macroKeys: readonly string[];
}): MacroPlan {
  const keys = input.decisionKeys.filter(
    (k) =>
      k.includes("macro") ||
      k.includes("protein") ||
      k.includes("carbohydrate") ||
      k.includes("fat") ||
      k.includes("fiber") ||
      k.includes("calorie"),
  );
  return Object.freeze({
    id: \`plan:macro:\${input.id}\`,
    stepKeys: uniqueSorted(keys.map((k) => \`step:macro:\${k}\`)),
    targetKeys: uniqueSorted([
      ...input.macroKeys.map((k) => \`target:\${k}\`),
      ...keys.map((k) => \`target:macro:\${k}\`),
    ]),
    macroKeys: uniqueSorted(input.macroKeys),
  });
}
`,
);

write(
  "planning/TimingPlanner.ts",
  `import { uniqueSorted } from "../utils/NutritionAdaptationHelpers";

export interface TimingPlan {
  readonly id: string;
  readonly stepKeys: readonly string[];
  readonly targetKeys: readonly string[];
  readonly timingKeys: readonly string[];
}

export function planTiming(input: {
  readonly id: string;
  readonly decisionKeys: readonly string[];
  readonly timingKeys: readonly string[];
}): TimingPlan {
  return Object.freeze({
    id: \`plan:timing:\${input.id}\`,
    stepKeys: uniqueSorted(
      input.decisionKeys
        .filter((k) => k.includes("timing") || k.includes("meal"))
        .map((k) => \`step:timing:\${k}\`),
    ),
    targetKeys: uniqueSorted(input.timingKeys.map((k) => \`target:\${k}\`)),
    timingKeys: uniqueSorted(input.timingKeys),
  });
}
`,
);

write(
  "planning/HydrationPlanner.ts",
  `import { uniqueSorted } from "../utils/NutritionAdaptationHelpers";

export interface HydrationPlan {
  readonly id: string;
  readonly stepKeys: readonly string[];
  readonly targetKeys: readonly string[];
}

export function planHydration(input: {
  readonly id: string;
  readonly decisionKeys: readonly string[];
  readonly signalKeys: readonly string[];
}): HydrationPlan {
  const keys = uniqueSorted([
    ...input.decisionKeys.filter((k) => k.includes("hydration")),
    ...input.signalKeys.filter((k) => k.includes("hydration")),
  ]);
  return Object.freeze({
    id: \`plan:hydration:\${input.id}\`,
    stepKeys: uniqueSorted(keys.map((k) => \`step:hydration:\${k}\`)),
    targetKeys: uniqueSorted(keys.map((k) => \`target:hydration:\${k}\`)),
  });
}
`,
);

write(
  "planning/WeeklyPlanner.ts",
  `import { uniqueSorted } from "../utils/NutritionAdaptationHelpers";

export interface WeekPlan {
  readonly id: string;
  readonly stepKeys: readonly string[];
  readonly targetKeys: readonly string[];
  readonly weekKeys: readonly string[];
}

export function planWeeks(input: {
  readonly id: string;
  readonly decisionKeys: readonly string[];
  readonly weekKeys: readonly string[];
}): WeekPlan {
  return Object.freeze({
    id: \`plan:week:\${input.id}\`,
    stepKeys: uniqueSorted(
      input.decisionKeys
        .filter(
          (k) =>
            k.includes("week") ||
            k.includes("refeed") ||
            k.includes("diet-break") ||
            k.includes("calorie"),
        )
        .map((k) => \`step:week:\${k}\`),
    ),
    targetKeys: uniqueSorted(input.weekKeys.map((k) => \`target:\${k}\`)),
    weekKeys: uniqueSorted(input.weekKeys),
  });
}
`,
);

write(
  "planning/index.ts",
  `export * from "./HydrationPlanner";
export * from "./MacroPlanner";
export * from "./MealPlanner";
export * from "./NutritionPlanner";
export * from "./TimingPlanner";
export * from "./WeeklyPlanner";

import { planHydration, type HydrationPlan } from "./HydrationPlanner";
import { planMacros, type MacroPlan } from "./MacroPlanner";
import { planMeals, type MealPlan } from "./MealPlanner";
import { planNutrition, type NutritionPlan } from "./NutritionPlanner";
import { planTiming, type TimingPlan } from "./TimingPlanner";
import { planWeeks, type WeekPlan } from "./WeeklyPlanner";

export interface NutritionPlanBundle {
  readonly nutrition: NutritionPlan;
  readonly meal: MealPlan;
  readonly macro: MacroPlan;
  readonly timing: TimingPlan;
  readonly hydration: HydrationPlan;
  readonly week: WeekPlan;
}

export function planNutritionAdaptation(input: {
  readonly id: string;
  readonly decisionKeys: readonly string[];
  readonly signalKeys: readonly string[];
  readonly planKeys: readonly string[];
  readonly mealKeys: readonly string[];
  readonly macroKeys: readonly string[];
  readonly timingKeys: readonly string[];
  readonly weekKeys: readonly string[];
}): NutritionPlanBundle {
  return Object.freeze({
    nutrition: planNutrition(input),
    meal: planMeals(input),
    macro: planMacros(input),
    timing: planTiming(input),
    hydration: planHydration(input),
    week: planWeeks(input),
  });
}
`,
);

// ─── ADAPTERS ─────────────────────────────────────────────────────────────────

function adapter(fileName, fnName, modelImport, modelType, buildBody) {
  write(
    `application/${fileName}`,
    `import { EMPTY_NUTRITION_METADATA } from "../models/NutritionMetadata";
import type { ${modelType} } from "../models/${modelImport}";
import { freeze${modelType} } from "../utils/FreezeNutritionAdaptation";

/** Deterministic key → modification mapping. NO nutrition generation. */
export function ${fnName}(input: {
  readonly id: string;
  readonly decisionKeys: readonly string[];
  readonly planStepKeys: readonly string[];
  readonly targetKeys: readonly string[];
  readonly at: string;
}): readonly ${modelType}[] {
${buildBody}
}
`,
  );
}

adapter(
  "MealAdapter.ts",
  "adaptMeal",
  "MealAdjustment",
  "MealAdjustment",
  `  const out: MealAdjustment[] = [];
  for (const target of input.targetKeys) {
    if (!target.includes("meal")) continue;
    out.push(
      freezeMealAdjustment({
        id: \`adj:meal:\${input.id}:\${target}\`,
        mealKey: target.replace(/^target:/, ""),
        targetKey: target,
        sourceDecisionKeys: Object.freeze([...input.decisionKeys]),
        planStepKeys: Object.freeze([...input.planStepKeys]),
        metadata: EMPTY_NUTRITION_METADATA,
        createdAt: input.at,
      }),
    );
  }
  return Object.freeze(out);
`,
);

adapter(
  "CalorieAdapter.ts",
  "adaptCalorie",
  "CalorieAdjustment",
  "CalorieAdjustment",
  `  const out: CalorieAdjustment[] = [];
  for (const key of input.decisionKeys) {
    if (!key.includes("calorie")) continue;
    out.push(
      freezeCalorieAdjustment({
        id: \`adj:calorie:\${input.id}:\${key}\`,
        calorieKey: \`calorie:\${key}\`,
        targetKey: \`target:calorie:\${key}\`,
        sourceDecisionKeys: Object.freeze([key]),
        planStepKeys: Object.freeze([...input.planStepKeys]),
        metadata: EMPTY_NUTRITION_METADATA,
        createdAt: input.at,
      }),
    );
  }
  return Object.freeze(out);
`,
);

adapter(
  "MacroAdapter.ts",
  "adaptMacro",
  "MacroDistributionAdjustment",
  "MacroDistributionAdjustment",
  `  const out: MacroDistributionAdjustment[] = [];
  for (const key of input.decisionKeys) {
    if (
      !key.includes("macro") &&
      !key.includes("protein") &&
      !key.includes("carbohydrate") &&
      !key.includes("fat") &&
      !key.includes("fiber")
    ) {
      continue;
    }
    out.push(
      freezeMacroDistributionAdjustment({
        id: \`adj:macro:\${input.id}:\${key}\`,
        macroKey: \`macro:\${key}\`,
        targetKey: \`target:macro:\${key}\`,
        sourceDecisionKeys: Object.freeze([key]),
        planStepKeys: Object.freeze([...input.planStepKeys]),
        metadata: EMPTY_NUTRITION_METADATA,
        createdAt: input.at,
      }),
    );
  }
  for (const target of input.targetKeys) {
    if (!target.includes("macro")) continue;
    out.push(
      freezeMacroDistributionAdjustment({
        id: \`adj:macro:\${input.id}:\${target}\`,
        macroKey: target.replace(/^target:/, ""),
        targetKey: target,
        sourceDecisionKeys: Object.freeze([...input.decisionKeys]),
        planStepKeys: Object.freeze([...input.planStepKeys]),
        metadata: EMPTY_NUTRITION_METADATA,
        createdAt: input.at,
      }),
    );
  }
  return Object.freeze(out);
`,
);

adapter(
  "TimingAdapter.ts",
  "adaptTiming",
  "MealTimingAdjustment",
  "MealTimingAdjustment",
  `  const out: MealTimingAdjustment[] = [];
  for (const target of input.targetKeys) {
    if (!target.includes("timing")) continue;
    out.push(
      freezeMealTimingAdjustment({
        id: \`adj:timing:\${input.id}:\${target}\`,
        timingKey: target.replace(/^target:/, ""),
        targetKey: target,
        sourceDecisionKeys: Object.freeze([...input.decisionKeys]),
        planStepKeys: Object.freeze([...input.planStepKeys]),
        metadata: EMPTY_NUTRITION_METADATA,
        createdAt: input.at,
      }),
    );
  }
  return Object.freeze(out);
`,
);

adapter(
  "HydrationAdapter.ts",
  "adaptHydration",
  "HydrationAdjustment",
  "HydrationAdjustment",
  `  const out: HydrationAdjustment[] = [];
  for (const key of input.decisionKeys) {
    if (!key.includes("hydration")) continue;
    out.push(
      freezeHydrationAdjustment({
        id: \`adj:hydration:\${input.id}:\${key}\`,
        hydrationKey: \`hydration:\${key}\`,
        targetKey: \`target:hydration:\${key}\`,
        sourceDecisionKeys: Object.freeze([key]),
        planStepKeys: Object.freeze([...input.planStepKeys]),
        metadata: EMPTY_NUTRITION_METADATA,
        createdAt: input.at,
      }),
    );
  }
  return Object.freeze(out);
`,
);

adapter(
  "SupplementAdapter.ts",
  "adaptSupplement",
  "SupplementAdjustment",
  "SupplementAdjustment",
  `  const out: SupplementAdjustment[] = [];
  for (const key of input.decisionKeys) {
    if (!key.includes("supplement")) continue;
    out.push(
      freezeSupplementAdjustment({
        id: \`adj:supplement:\${input.id}:\${key}\`,
        supplementKey: \`supplement:\${key}\`,
        targetKey: \`target:supplement:\${key}\`,
        sourceDecisionKeys: Object.freeze([key]),
        planStepKeys: Object.freeze([...input.planStepKeys]),
        metadata: EMPTY_NUTRITION_METADATA,
        createdAt: input.at,
      }),
    );
  }
  return Object.freeze(out);
`,
);

adapter(
  "RefeedAdapter.ts",
  "adaptRefeed",
  "RefeedAdjustment",
  "RefeedAdjustment",
  `  const out: RefeedAdjustment[] = [];
  for (const key of input.decisionKeys) {
    if (!key.includes("refeed")) continue;
    out.push(
      freezeRefeedAdjustment({
        id: \`adj:refeed:\${input.id}:\${key}\`,
        refeedKey: \`refeed:\${key}\`,
        targetKey: \`target:refeed:\${key}\`,
        sourceDecisionKeys: Object.freeze([key]),
        planStepKeys: Object.freeze([...input.planStepKeys]),
        metadata: EMPTY_NUTRITION_METADATA,
        createdAt: input.at,
      }),
    );
  }
  return Object.freeze(out);
`,
);

adapter(
  "DietBreakAdapter.ts",
  "adaptDietBreak",
  "DietBreakAdjustment",
  "DietBreakAdjustment",
  `  const out: DietBreakAdjustment[] = [];
  for (const key of input.decisionKeys) {
    if (!key.includes("diet-break") && !key.includes("dietbreak")) continue;
    out.push(
      freezeDietBreakAdjustment({
        id: \`adj:diet-break:\${input.id}:\${key}\`,
        dietBreakKey: \`diet-break:\${key}\`,
        targetKey: \`target:diet-break:\${key}\`,
        sourceDecisionKeys: Object.freeze([key]),
        planStepKeys: Object.freeze([...input.planStepKeys]),
        metadata: EMPTY_NUTRITION_METADATA,
        createdAt: input.at,
      }),
    );
  }
  return Object.freeze(out);
`,
);

write(
  "application/index.ts",
  `import type { NutritionDescriptor } from "../models/NutritionDescriptor";
import type { NutritionAdaptationInput } from "../models/NutritionAdaptationInput";
import type { NutritionResult } from "../models/NutritionResult";
import {
  createNutritionAdaptationEngineService,
  type NutritionAdaptationEngineService,
  type NutritionAdaptationEngineServiceDeps,
} from "../services/NutritionAdaptationEngineService";

function resolveService(
  service?: NutritionAdaptationEngineService,
  deps?: NutritionAdaptationEngineServiceDeps,
): NutritionAdaptationEngineService {
  return service ?? createNutritionAdaptationEngineService(deps);
}

/** Public API — adapt existing nutrition plan from continuous adaptation decisions. */
export function adaptNutrition(options: {
  readonly input: NutritionAdaptationInput;
  readonly service?: NutritionAdaptationEngineService;
  readonly deps?: NutritionAdaptationEngineServiceDeps;
}): NutritionResult {
  return resolveService(options.service, options.deps).adaptNutrition(options.input);
}

/** Public API — compare plan / snapshot keys. */
export function compareNutrition(options: {
  readonly input: NutritionAdaptationInput;
  readonly service?: NutritionAdaptationEngineService;
  readonly deps?: NutritionAdaptationEngineServiceDeps;
}): NutritionResult {
  return resolveService(options.service, options.deps).compareNutrition(options.input);
}

/** Public API — describe Nutrition Adaptation Engine capabilities. */
export function describeNutritionAdaptation(options: {
  readonly service?: NutritionAdaptationEngineService;
  readonly deps?: NutritionAdaptationEngineServiceDeps;
} = {}): NutritionDescriptor {
  return resolveService(options.service, options.deps).describeNutritionAdaptation();
}

/** Public API — create nutrition adaptation snapshot. */
export function createNutritionSnapshot(options: {
  readonly input: NutritionAdaptationInput;
  readonly service?: NutritionAdaptationEngineService;
  readonly deps?: NutritionAdaptationEngineServiceDeps;
}): NutritionResult {
  return resolveService(options.service, options.deps).createNutritionSnapshot(options.input);
}

/** Public API — validate nutrition adaptation package. */
export function validateNutritionAdaptation(options: {
  readonly input: NutritionAdaptationInput;
  readonly service?: NutritionAdaptationEngineService;
  readonly deps?: NutritionAdaptationEngineServiceDeps;
}): NutritionResult {
  return resolveService(options.service, options.deps).validateNutritionAdaptation(options.input);
}

export type { NutritionAdaptationEngineServiceDeps };
`,
);

// ─── COMPARISON ───────────────────────────────────────────────────────────────

write(
  "comparison/diffHelpers.ts",
  `export interface KeyDiff {
  readonly added: readonly string[];
  readonly removed: readonly string[];
  readonly shared: readonly string[];
}

export function diffKeys(
  before: readonly string[],
  after: readonly string[],
): KeyDiff {
  const a = new Set(before);
  const b = new Set(after);
  const added: string[] = [];
  const removed: string[] = [];
  const shared: string[] = [];
  for (const k of b) {
    if (a.has(k)) shared.push(k);
    else added.push(k);
  }
  for (const k of a) {
    if (!b.has(k)) removed.push(k);
  }
  return Object.freeze({
    added: Object.freeze(added.sort()),
    removed: Object.freeze(removed.sort()),
    shared: Object.freeze(shared.sort()),
  });
}
`,
);

write(
  "comparison/PlanComparator.ts",
  `import { EMPTY_NUTRITION_METADATA } from "../models/NutritionMetadata";
import type { NutritionComparison } from "../models/NutritionComparison";
import { freezeComparison } from "../utils/FreezeNutritionAdaptation";
import { diffKeys } from "./diffHelpers";

export function comparePlans(input: {
  readonly id: string;
  readonly athleteId: string;
  readonly planId: string;
  readonly beforeKeys: readonly string[];
  readonly afterKeys: readonly string[];
  readonly at: string;
}): NutritionComparison {
  const diff = diffKeys(input.beforeKeys, input.afterKeys);
  return freezeComparison({
    id: \`comparison:plan:\${input.id}\`,
    athleteId: input.athleteId,
    planId: input.planId,
    beforeKeys: Object.freeze([...input.beforeKeys]),
    afterKeys: Object.freeze([...input.afterKeys]),
    addedKeys: diff.added,
    removedKeys: diff.removed,
    sharedKeys: diff.shared,
    metadata: EMPTY_NUTRITION_METADATA,
    createdAt: input.at,
  });
}
`,
);

write(
  "comparison/MealComparator.ts",
  `import { diffKeys, type KeyDiff } from "./diffHelpers";

export function compareMeals(
  before: readonly string[],
  after: readonly string[],
): KeyDiff {
  return diffKeys(before, after);
}
`,
);

write(
  "comparison/MacroComparator.ts",
  `import { diffKeys, type KeyDiff } from "./diffHelpers";

export function compareMacros(
  before: readonly string[],
  after: readonly string[],
): KeyDiff {
  return diffKeys(before, after);
}
`,
);

write(
  "comparison/ProgressComparator.ts",
  `import { diffKeys, type KeyDiff } from "./diffHelpers";

export function compareProgress(
  before: readonly string[],
  after: readonly string[],
): KeyDiff {
  return diffKeys(before, after);
}
`,
);

write(
  "comparison/HistoryComparator.ts",
  `import { diffKeys, type KeyDiff } from "./diffHelpers";

export function compareHistory(
  before: readonly string[],
  after: readonly string[],
): KeyDiff {
  return diffKeys(before, after);
}
`,
);

write(
  "comparison/index.ts",
  `export * from "./HistoryComparator";
export * from "./MacroComparator";
export * from "./MealComparator";
export * from "./PlanComparator";
export * from "./ProgressComparator";
export * from "./diffHelpers";
`,
);

// ─── BUILDERS ─────────────────────────────────────────────────────────────────

write(
  "builders/NutritionAdaptationBuilder.ts",
  `import type { CalorieAdjustment } from "../models/CalorieAdjustment";
import type { CarbohydrateAdjustment } from "../models/CarbohydrateAdjustment";
import type { DietBreakAdjustment } from "../models/DietBreakAdjustment";
import type { FatAdjustment } from "../models/FatAdjustment";
import type { FiberAdjustment } from "../models/FiberAdjustment";
import type { HydrationAdjustment } from "../models/HydrationAdjustment";
import type { MacroDistributionAdjustment } from "../models/MacroDistributionAdjustment";
import type { MealAdjustment } from "../models/MealAdjustment";
import type { MealInsertion } from "../models/MealInsertion";
import type { MealRemoval } from "../models/MealRemoval";
import type { MealReplacement } from "../models/MealReplacement";
import type { MealTimingAdjustment } from "../models/MealTimingAdjustment";
import type { NutritionAdaptation } from "../models/NutritionAdaptation";
import type { NutritionAdjustment } from "../models/NutritionAdjustment";
import { EMPTY_NUTRITION_METADATA } from "../models/NutritionMetadata";
import type { NutritionModification } from "../models/NutritionModification";
import { NutritionModificationKinds } from "../models/NutritionModification";
import type { NutritionReplacement } from "../models/NutritionReplacement";
import type { ProteinAdjustment } from "../models/ProteinAdjustment";
import type { RefeedAdjustment } from "../models/RefeedAdjustment";
import type { SupplementAdjustment } from "../models/SupplementAdjustment";
import type { WeeklyAdjustment } from "../models/WeeklyAdjustment";
import { freezeAdaptation, freezeModification } from "../utils/FreezeNutritionAdaptation";

export function buildNutritionAdaptation(input: {
  readonly id: string;
  readonly athleteId: string;
  readonly planId: string;
  readonly contextId: string;
  readonly decisionKeys: readonly string[];
  readonly signalKeys: readonly string[];
  readonly mealAdjustments?: readonly MealAdjustment[];
  readonly calorieAdjustments?: readonly CalorieAdjustment[];
  readonly proteinAdjustments?: readonly ProteinAdjustment[];
  readonly carbohydrateAdjustments?: readonly CarbohydrateAdjustment[];
  readonly fatAdjustments?: readonly FatAdjustment[];
  readonly fiberAdjustments?: readonly FiberAdjustment[];
  readonly hydrationAdjustments?: readonly HydrationAdjustment[];
  readonly mealTimingAdjustments?: readonly MealTimingAdjustment[];
  readonly supplementAdjustments?: readonly SupplementAdjustment[];
  readonly refeedAdjustments?: readonly RefeedAdjustment[];
  readonly dietBreakAdjustments?: readonly DietBreakAdjustment[];
  readonly macroDistributionAdjustments?: readonly MacroDistributionAdjustment[];
  readonly weeklyAdjustments?: readonly WeeklyAdjustment[];
  readonly mealReplacements?: readonly MealReplacement[];
  readonly mealRemovals?: readonly MealRemoval[];
  readonly mealInsertions?: readonly MealInsertion[];
  readonly at: string;
}): NutritionAdaptation {
  const mealAdjustments = Object.freeze([...(input.mealAdjustments ?? [])]);
  const calorieAdjustments = Object.freeze([...(input.calorieAdjustments ?? [])]);
  const hydrationAdjustments = Object.freeze([...(input.hydrationAdjustments ?? [])]);
  const mealTimingAdjustments = Object.freeze([...(input.mealTimingAdjustments ?? [])]);
  const supplementAdjustments = Object.freeze([...(input.supplementAdjustments ?? [])]);
  const refeedAdjustments = Object.freeze([...(input.refeedAdjustments ?? [])]);
  const dietBreakAdjustments = Object.freeze([...(input.dietBreakAdjustments ?? [])]);
  const macroDistributionAdjustments = Object.freeze([...(input.macroDistributionAdjustments ?? [])]);
  const weeklyAdjustments = Object.freeze([...(input.weeklyAdjustments ?? [])]);

  const modifications: NutritionModification[] = [];
  for (const adj of [
    ...mealAdjustments,
    ...calorieAdjustments,
    ...hydrationAdjustments,
    ...mealTimingAdjustments,
    ...supplementAdjustments,
    ...refeedAdjustments,
    ...dietBreakAdjustments,
    ...macroDistributionAdjustments,
    ...weeklyAdjustments,
  ]) {
    modifications.push(
      freezeModification({
        id: \`mod:\${adj.id}\`,
        kind: NutritionModificationKinds.ADJUSTMENT,
        targetKey: adj.targetKey,
        sourceDecisionKeys: adj.sourceDecisionKeys,
        planStepKeys: adj.planStepKeys,
        metadata: EMPTY_NUTRITION_METADATA,
        createdAt: input.at,
      }),
    );
  }

  const adjustments: readonly NutritionAdjustment[] = Object.freeze(
    modifications.map((m) =>
      Object.freeze({
        id: \`na:\${m.id}\`,
        targetKey: m.targetKey,
        adjustmentKey: m.id,
        sourceDecisionKeys: m.sourceDecisionKeys,
        metadata: EMPTY_NUTRITION_METADATA,
        createdAt: input.at,
      }),
    ),
  );

  const replacements: readonly NutritionReplacement[] = Object.freeze([]);

  return freezeAdaptation({
    id: input.id,
    athleteId: input.athleteId,
    planId: input.planId,
    contextId: input.contextId,
    decisionKeys: Object.freeze([...input.decisionKeys]),
    signalKeys: Object.freeze([...input.signalKeys]),
    modifications: Object.freeze(modifications),
    adjustments,
    replacements,
    mealAdjustments,
    mealReplacements: Object.freeze([...(input.mealReplacements ?? [])]),
    mealRemovals: Object.freeze([...(input.mealRemovals ?? [])]),
    mealInsertions: Object.freeze([...(input.mealInsertions ?? [])]),
    calorieAdjustments,
    proteinAdjustments: Object.freeze([...(input.proteinAdjustments ?? [])]),
    carbohydrateAdjustments: Object.freeze([...(input.carbohydrateAdjustments ?? [])]),
    fatAdjustments: Object.freeze([...(input.fatAdjustments ?? [])]),
    fiberAdjustments: Object.freeze([...(input.fiberAdjustments ?? [])]),
    hydrationAdjustments,
    mealTimingAdjustments,
    supplementAdjustments,
    refeedAdjustments,
    dietBreakAdjustments,
    macroDistributionAdjustments,
    weeklyAdjustments,
    metadata: EMPTY_NUTRITION_METADATA,
    createdAt: input.at,
  });
}
`,
);

write(
  "builders/NutritionPackageBuilder.ts",
  `import type { NutritionAdaptation } from "../models/NutritionAdaptation";
import type { NutritionComparison } from "../models/NutritionComparison";
import type { NutritionDiagnostics } from "../models/NutritionDiagnostics";
import type { NutritionHistory } from "../models/NutritionHistory";
import { EMPTY_NUTRITION_METADATA } from "../models/NutritionMetadata";
import type { NutritionPackage } from "../models/NutritionPackage";
import type { NutritionRuntimeInput } from "../models/NutritionRuntimeInput";
import type { NutritionSnapshot } from "../models/NutritionSnapshot";
import type { NutritionStatistics } from "../models/NutritionStatistics";
import type { NutritionSummary } from "../models/NutritionSummary";
import type { NutritionTimeline } from "../models/NutritionTimeline";
import type { UpdatedNutritionPlan } from "../models/UpdatedNutritionPlan";
import { freezeDiagnostics, freezePackage } from "../utils/FreezeNutritionAdaptation";

export function buildNutritionPackage(input: {
  readonly id: string;
  readonly athleteId: string;
  readonly planId: string;
  readonly contextId: string;
  readonly adaptation: NutritionAdaptation | null;
  readonly updatedPlan: UpdatedNutritionPlan | null;
  readonly runtimeInput: NutritionRuntimeInput | null;
  readonly summary: NutritionSummary | null;
  readonly snapshot: NutritionSnapshot | null;
  readonly comparison: NutritionComparison | null;
  readonly timeline: NutritionTimeline | null;
  readonly history: NutritionHistory | null;
  readonly statistics: NutritionStatistics;
  readonly processingSteps: readonly string[];
  readonly at: string;
}): NutritionPackage {
  const diagnostics: NutritionDiagnostics = freezeDiagnostics({
    notes: Object.freeze(["nutrition_adaptation_pipeline"]),
    warnings: Object.freeze([] as string[]),
    processingSteps: Object.freeze([...input.processingSteps]),
  });
  return freezePackage({
    id: input.id,
    athleteId: input.athleteId,
    planId: input.planId,
    contextId: input.contextId,
    adaptation: input.adaptation,
    updatedPlan: input.updatedPlan,
    runtimeInput: input.runtimeInput,
    summary: input.summary,
    snapshot: input.snapshot,
    comparison: input.comparison,
    timeline: input.timeline,
    history: input.history,
    statistics: input.statistics,
    diagnostics,
    metadata: EMPTY_NUTRITION_METADATA,
    createdAt: input.at,
  });
}
`,
);

write(
  "builders/NutritionSummaryBuilder.ts",
  `import type { NutritionAdaptation } from "../models/NutritionAdaptation";
import { EMPTY_NUTRITION_METADATA } from "../models/NutritionMetadata";
import type { NutritionSummary } from "../models/NutritionSummary";
import { freezeSummary } from "../utils/FreezeNutritionAdaptation";

export function buildNutritionSummary(input: {
  readonly id: string;
  readonly athleteId: string;
  readonly planId: string;
  readonly contextId: string;
  readonly adaptation: NutritionAdaptation | null;
  readonly at: string;
}): NutritionSummary {
  return freezeSummary({
    id: input.id,
    athleteId: input.athleteId,
    planId: input.planId,
    contextId: input.contextId,
    adaptationId: input.adaptation?.id ?? null,
    modificationCount: input.adaptation?.modifications.length ?? 0,
    adjustmentCount: input.adaptation?.adjustments.length ?? 0,
    decisionKeys: Object.freeze([...(input.adaptation?.decisionKeys ?? [])]),
    metadata: EMPTY_NUTRITION_METADATA,
    createdAt: input.at,
  });
}
`,
);

write(
  "builders/NutritionSnapshotBuilder.ts",
  `import type { NutritionAdaptation } from "../models/NutritionAdaptation";
import { EMPTY_NUTRITION_METADATA } from "../models/NutritionMetadata";
import type { NutritionSnapshot } from "../models/NutritionSnapshot";
import type { UpdatedNutritionPlan } from "../models/UpdatedNutritionPlan";
import { freezeSnapshot } from "../utils/FreezeNutritionAdaptation";

export function buildNutritionSnapshot(input: {
  readonly id: string;
  readonly athleteId: string;
  readonly planId: string;
  readonly contextId: string;
  readonly adaptation: NutritionAdaptation | null;
  readonly updatedPlan: UpdatedNutritionPlan | null;
  readonly planKeys: readonly string[];
  readonly at: string;
}): NutritionSnapshot {
  const plan = input.updatedPlan;
  return freezeSnapshot({
    id: input.id,
    athleteId: input.athleteId,
    planId: input.planId,
    contextId: input.contextId,
    adaptationId: input.adaptation?.id ?? null,
    planKeys: Object.freeze([...(plan ? [plan.id, ...input.planKeys] : input.planKeys)]),
    dayKeys: Object.freeze([...(plan?.dayKeys ?? [])]),
    mealKeys: Object.freeze([...(plan?.mealKeys ?? [])]),
    macroKeys: Object.freeze([...(plan?.macroKeys ?? [])]),
    timingKeys: Object.freeze([...(plan?.timingKeys ?? [])]),
    weekKeys: Object.freeze([...(plan?.weekKeys ?? [])]),
    modificationIds: Object.freeze([
      ...(plan?.modificationIds ?? input.adaptation?.modifications.map((m) => m.id) ?? []),
    ]),
    metadata: EMPTY_NUTRITION_METADATA,
    createdAt: input.at,
  });
}
`,
);

write(
  "builders/DescriptorBuilder.ts",
  `import type { NutritionDescriptor } from "../models/NutritionDescriptor";
import { freezeDescriptor } from "../utils/FreezeNutritionAdaptation";

export function buildNutritionDescriptor(input: {
  readonly id: string;
  readonly createdAt: string;
}): NutritionDescriptor {
  return freezeDescriptor({
    id: input.id,
    name: "Nutrition Adaptation Engine",
    version: "24.2.0",
    capabilities: Object.freeze([
      "adaptNutrition",
      "compareNutrition",
      "describeNutritionAdaptation",
      "createNutritionSnapshot",
      "validateNutritionAdaptation",
    ]),
    boundaries: Object.freeze([
      "adapts_existing_plan_only",
      "no_ai",
      "no_networking",
      "no_persistence",
      "no_ui",
      "no_nutrition_generation_from_scratch",
      "no_athlete_goal_changes",
    ]),
    createdAt: input.createdAt,
  });
}
`,
);

write(
  "builders/ResultBuilder.ts",
  `import type { NutritionAdaptation } from "../models/NutritionAdaptation";
import type { NutritionComparison } from "../models/NutritionComparison";
import type { NutritionDescriptor } from "../models/NutritionDescriptor";
import type { NutritionError } from "../models/NutritionError";
import type { NutritionPackage } from "../models/NutritionPackage";
import type {
  NutritionOperationKind,
  NutritionResult,
} from "../models/NutritionResult";
import type { NutritionRuntimeInput } from "../models/NutritionRuntimeInput";
import type { NutritionSnapshot } from "../models/NutritionSnapshot";
import type { NutritionSummary } from "../models/NutritionSummary";
import type { NutritionValidation } from "../models/NutritionValidation";
import type { UpdatedNutritionPlan } from "../models/UpdatedNutritionPlan";
import { freezeResult } from "../utils/FreezeNutritionAdaptation";

export function buildNutritionResult(input: {
  readonly id: string;
  readonly operation: NutritionOperationKind;
  readonly success: boolean;
  readonly adaptation?: NutritionAdaptation | null;
  readonly updatedPlan?: UpdatedNutritionPlan | null;
  readonly runtimeInput?: NutritionRuntimeInput | null;
  readonly package?: NutritionPackage | null;
  readonly summary?: NutritionSummary | null;
  readonly snapshot?: NutritionSnapshot | null;
  readonly comparison?: NutritionComparison | null;
  readonly validation?: NutritionValidation | null;
  readonly descriptor?: NutritionDescriptor | null;
  readonly errors?: readonly NutritionError[];
  readonly createdAt: string;
}): NutritionResult {
  return freezeResult({
    id: input.id,
    operation: input.operation,
    success: input.success,
    adaptation: input.adaptation ?? null,
    updatedPlan: input.updatedPlan ?? null,
    runtimeInput: input.runtimeInput ?? null,
    package: input.package ?? null,
    summary: input.summary ?? null,
    snapshot: input.snapshot ?? null,
    comparison: input.comparison ?? null,
    validation: input.validation ?? null,
    descriptor: input.descriptor ?? null,
    errors: Object.freeze([...(input.errors ?? [])]),
    createdAt: input.createdAt,
  });
}
`,
);

write(
  "builders/index.ts",
  `export * from "./DescriptorBuilder";
export * from "./NutritionAdaptationBuilder";
export * from "./NutritionPackageBuilder";
export * from "./NutritionSnapshotBuilder";
export * from "./NutritionSummaryBuilder";
export * from "./ResultBuilder";
`,
);

console.log(`Wrote ${fileCount} files to ${ROOT}`);
