/**
 * Sprint 24.2 — Nutrition Adaptation Engine generator (part 1: models + utils + contracts).
 * Run: node scripts/generate-nutrition-adaptation-part1.mjs
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

write(
  "models/NutritionMetadata.ts",
  `export interface NutritionMetadata {
  readonly tags: readonly string[];
  readonly attributes: Readonly<Record<string, string>>;
}

export const EMPTY_NUTRITION_METADATA: NutritionMetadata = Object.freeze({
  tags: Object.freeze([] as string[]),
  attributes: Object.freeze({} as Record<string, string>),
});
`,
);

write(
  "models/PlanRef.ts",
  `export interface PlanRef {
  readonly id: string;
  readonly athleteId: string;
  readonly planId: string;
  readonly keys: readonly string[];
}
`,
);

write(
  "models/RuntimeRef.ts",
  `export interface RuntimeRef {
  readonly id: string;
  readonly athleteId: string;
  readonly runtimeId: string;
  readonly keys: readonly string[];
}
`,
);

write(
  "models/AthleteStateRef.ts",
  `export interface AthleteStateRef {
  readonly id: string;
  readonly athleteId: string;
  readonly stateKeys: readonly string[];
}
`,
);

write(
  "models/CoachContextRef.ts",
  `export interface CoachContextRef {
  readonly id: string;
  readonly athleteId: string;
  readonly contextId: string;
  readonly keys: readonly string[];
}
`,
);

write(
  "models/NutritionAdaptationDecisionRef.ts",
  `/** Structural reference to Continuous Adaptation decision ids/keys. */
export interface NutritionAdaptationDecisionRef {
  readonly id: string;
  readonly athleteId: string;
  readonly decisionIds: readonly string[];
  readonly decisionKeys: readonly string[];
}
`,
);

write(
  "models/NutritionAdaptationContext.ts",
  `import type { AthleteStateRef } from "./AthleteStateRef";
import type { CoachContextRef } from "./CoachContextRef";
import type { NutritionAdaptationDecisionRef } from "./NutritionAdaptationDecisionRef";
import type { NutritionMetadata } from "./NutritionMetadata";
import type { PlanRef } from "./PlanRef";
import type { RuntimeRef } from "./RuntimeRef";

export interface NutritionAdaptationContext {
  readonly id: string;
  readonly athleteId: string;
  readonly planId: string;
  readonly contextId: string;
  readonly planRef: PlanRef | null;
  readonly runtimeRef: RuntimeRef | null;
  readonly athleteStateRef: AthleteStateRef | null;
  readonly coachContextRef: CoachContextRef | null;
  readonly decisionRef: NutritionAdaptationDecisionRef | null;
  readonly signalKeys: readonly string[];
  readonly metadata: NutritionMetadata;
  readonly createdAt: string;
}
`,
);

write(
  "models/NutritionSnapshot.ts",
  `import type { NutritionMetadata } from "./NutritionMetadata";

export interface NutritionSnapshot {
  readonly id: string;
  readonly athleteId: string;
  readonly planId: string;
  readonly contextId: string;
  readonly adaptationId: string | null;
  readonly planKeys: readonly string[];
  readonly dayKeys: readonly string[];
  readonly mealKeys: readonly string[];
  readonly macroKeys: readonly string[];
  readonly timingKeys: readonly string[];
  readonly weekKeys: readonly string[];
  readonly modificationIds: readonly string[];
  readonly metadata: NutritionMetadata;
  readonly createdAt: string;
}
`,
);

write(
  "models/NutritionAdaptationInput.ts",
  `import type { AthleteStateRef } from "./AthleteStateRef";
import type { CoachContextRef } from "./CoachContextRef";
import type { NutritionAdaptationDecisionRef } from "./NutritionAdaptationDecisionRef";
import type { NutritionMetadata } from "./NutritionMetadata";
import type { NutritionSnapshot } from "./NutritionSnapshot";
import type { PlanRef } from "./PlanRef";
import type { RuntimeRef } from "./RuntimeRef";

export const NutritionAdaptationInputKinds = {
  ADAPT: "adapt",
  COMPARE: "compare",
  DESCRIBE: "describe",
  SNAPSHOT: "snapshot",
  VALIDATE: "validate",
} as const;

export type NutritionAdaptationInputKind =
  (typeof NutritionAdaptationInputKinds)[keyof typeof NutritionAdaptationInputKinds];

export interface NutritionAdaptationInput {
  readonly id: string;
  readonly kind: NutritionAdaptationInputKind;
  readonly athleteId: string;
  readonly planId: string;
  readonly sessionId: string | null;
  readonly contextId: string;
  readonly planKeys: readonly string[];
  readonly dayKeys: readonly string[];
  readonly mealKeys: readonly string[];
  readonly macroKeys: readonly string[];
  readonly timingKeys: readonly string[];
  readonly weekKeys: readonly string[];
  readonly decisionKeys: readonly string[];
  readonly signalKeys: readonly string[];
  readonly signalFlags: Readonly<Record<string, boolean>>;
  readonly priorSnapshot: NutritionSnapshot | null;
  readonly decisionRef: NutritionAdaptationDecisionRef | null;
  readonly planRef: PlanRef | null;
  readonly runtimeRef: RuntimeRef | null;
  readonly athleteStateRef: AthleteStateRef | null;
  readonly coachContextRef: CoachContextRef | null;
  readonly reason: string;
  readonly metadata: NutritionMetadata;
  readonly createdAt: string;
}
`,
);

write(
  "models/NutritionModification.ts",
  `import type { NutritionMetadata } from "./NutritionMetadata";

export const NutritionModificationKinds = {
  ADJUSTMENT: "adjustment",
  REPLACEMENT: "replacement",
  INSERTION: "insertion",
  REMOVAL: "removal",
} as const;

export type NutritionModificationKind =
  (typeof NutritionModificationKinds)[keyof typeof NutritionModificationKinds];

export interface NutritionModification {
  readonly id: string;
  readonly kind: NutritionModificationKind;
  readonly targetKey: string;
  readonly sourceDecisionKeys: readonly string[];
  readonly planStepKeys: readonly string[];
  readonly metadata: NutritionMetadata;
  readonly createdAt: string;
}
`,
);

write(
  "models/NutritionAdjustment.ts",
  `import type { NutritionMetadata } from "./NutritionMetadata";

export interface NutritionAdjustment {
  readonly id: string;
  readonly targetKey: string;
  readonly adjustmentKey: string;
  readonly sourceDecisionKeys: readonly string[];
  readonly metadata: NutritionMetadata;
  readonly createdAt: string;
}
`,
);

write(
  "models/NutritionReplacement.ts",
  `import type { NutritionMetadata } from "./NutritionMetadata";

export interface NutritionReplacement {
  readonly id: string;
  readonly fromKey: string;
  readonly toKey: string;
  readonly sourceDecisionKeys: readonly string[];
  readonly metadata: NutritionMetadata;
  readonly createdAt: string;
}
`,
);

const adjustmentModels = [
  ["MealAdjustment", "mealKey"],
  ["CalorieAdjustment", "calorieKey"],
  ["ProteinAdjustment", "proteinKey"],
  ["CarbohydrateAdjustment", "carbohydrateKey"],
  ["FatAdjustment", "fatKey"],
  ["FiberAdjustment", "fiberKey"],
  ["HydrationAdjustment", "hydrationKey"],
  ["MealTimingAdjustment", "timingKey"],
  ["SupplementAdjustment", "supplementKey"],
  ["RefeedAdjustment", "refeedKey"],
  ["DietBreakAdjustment", "dietBreakKey"],
  ["MacroDistributionAdjustment", "macroKey"],
  ["WeeklyAdjustment", "weekKey"],
];

for (const [name, keyField] of adjustmentModels) {
  write(
    `models/${name}.ts`,
    `import type { NutritionMetadata } from "./NutritionMetadata";

export interface ${name} {
  readonly id: string;
  readonly ${keyField}: string;
  readonly targetKey: string;
  readonly sourceDecisionKeys: readonly string[];
  readonly planStepKeys: readonly string[];
  readonly metadata: NutritionMetadata;
  readonly createdAt: string;
}
`,
  );
}

write(
  "models/MealReplacement.ts",
  `import type { NutritionMetadata } from "./NutritionMetadata";

export interface MealReplacement {
  readonly id: string;
  readonly fromMealKey: string;
  readonly toMealKey: string;
  readonly sourceDecisionKeys: readonly string[];
  readonly planStepKeys: readonly string[];
  readonly metadata: NutritionMetadata;
  readonly createdAt: string;
}
`,
);

write(
  "models/MealRemoval.ts",
  `import type { NutritionMetadata } from "./NutritionMetadata";

export interface MealRemoval {
  readonly id: string;
  readonly mealKey: string;
  readonly sourceDecisionKeys: readonly string[];
  readonly planStepKeys: readonly string[];
  readonly metadata: NutritionMetadata;
  readonly createdAt: string;
}
`,
);

write(
  "models/MealInsertion.ts",
  `import type { NutritionMetadata } from "./NutritionMetadata";

export interface MealInsertion {
  readonly id: string;
  readonly mealKey: string;
  readonly afterKey: string | null;
  readonly sourceDecisionKeys: readonly string[];
  readonly planStepKeys: readonly string[];
  readonly metadata: NutritionMetadata;
  readonly createdAt: string;
}
`,
);

write(
  "models/UpdatedNutritionPlan.ts",
  `import type { NutritionMetadata } from "./NutritionMetadata";

/** Structure keys only — NOT full nutrition generation. */
export interface UpdatedNutritionPlan {
  readonly id: string;
  readonly athleteId: string;
  readonly planId: string;
  readonly dayKeys: readonly string[];
  readonly mealKeys: readonly string[];
  readonly macroKeys: readonly string[];
  readonly timingKeys: readonly string[];
  readonly weekKeys: readonly string[];
  readonly modificationIds: readonly string[];
  readonly metadata: NutritionMetadata;
  readonly createdAt: string;
}
`,
);

write(
  "models/NutritionRuntimeInput.ts",
  `import type { NutritionMetadata } from "./NutritionMetadata";

/** Handoff to Nutrition Runtime — structural keys only. */
export interface NutritionRuntimeInput {
  readonly id: string;
  readonly athleteId: string;
  readonly planId: string;
  readonly updatedPlanId: string;
  readonly mealKeys: readonly string[];
  readonly macroKeys: readonly string[];
  readonly modificationIds: readonly string[];
  readonly metadata: NutritionMetadata;
  readonly createdAt: string;
}
`,
);

write(
  "models/NutritionAdaptation.ts",
  `import type { CalorieAdjustment } from "./CalorieAdjustment";
import type { CarbohydrateAdjustment } from "./CarbohydrateAdjustment";
import type { DietBreakAdjustment } from "./DietBreakAdjustment";
import type { FatAdjustment } from "./FatAdjustment";
import type { FiberAdjustment } from "./FiberAdjustment";
import type { HydrationAdjustment } from "./HydrationAdjustment";
import type { MacroDistributionAdjustment } from "./MacroDistributionAdjustment";
import type { MealAdjustment } from "./MealAdjustment";
import type { MealInsertion } from "./MealInsertion";
import type { MealRemoval } from "./MealRemoval";
import type { MealReplacement } from "./MealReplacement";
import type { MealTimingAdjustment } from "./MealTimingAdjustment";
import type { NutritionAdjustment } from "./NutritionAdjustment";
import type { NutritionMetadata } from "./NutritionMetadata";
import type { NutritionModification } from "./NutritionModification";
import type { NutritionReplacement } from "./NutritionReplacement";
import type { ProteinAdjustment } from "./ProteinAdjustment";
import type { RefeedAdjustment } from "./RefeedAdjustment";
import type { SupplementAdjustment } from "./SupplementAdjustment";
import type { WeeklyAdjustment } from "./WeeklyAdjustment";

export interface NutritionAdaptation {
  readonly id: string;
  readonly athleteId: string;
  readonly planId: string;
  readonly contextId: string;
  readonly decisionKeys: readonly string[];
  readonly signalKeys: readonly string[];
  readonly modifications: readonly NutritionModification[];
  readonly adjustments: readonly NutritionAdjustment[];
  readonly replacements: readonly NutritionReplacement[];
  readonly mealAdjustments: readonly MealAdjustment[];
  readonly mealReplacements: readonly MealReplacement[];
  readonly mealRemovals: readonly MealRemoval[];
  readonly mealInsertions: readonly MealInsertion[];
  readonly calorieAdjustments: readonly CalorieAdjustment[];
  readonly proteinAdjustments: readonly ProteinAdjustment[];
  readonly carbohydrateAdjustments: readonly CarbohydrateAdjustment[];
  readonly fatAdjustments: readonly FatAdjustment[];
  readonly fiberAdjustments: readonly FiberAdjustment[];
  readonly hydrationAdjustments: readonly HydrationAdjustment[];
  readonly mealTimingAdjustments: readonly MealTimingAdjustment[];
  readonly supplementAdjustments: readonly SupplementAdjustment[];
  readonly refeedAdjustments: readonly RefeedAdjustment[];
  readonly dietBreakAdjustments: readonly DietBreakAdjustment[];
  readonly macroDistributionAdjustments: readonly MacroDistributionAdjustment[];
  readonly weeklyAdjustments: readonly WeeklyAdjustment[];
  readonly metadata: NutritionMetadata;
  readonly createdAt: string;
}
`,
);

write(
  "models/NutritionComparison.ts",
  `import type { NutritionMetadata } from "./NutritionMetadata";

export interface NutritionComparison {
  readonly id: string;
  readonly athleteId: string;
  readonly planId: string;
  readonly beforeKeys: readonly string[];
  readonly afterKeys: readonly string[];
  readonly addedKeys: readonly string[];
  readonly removedKeys: readonly string[];
  readonly sharedKeys: readonly string[];
  readonly metadata: NutritionMetadata;
  readonly createdAt: string;
}
`,
);

write(
  "models/NutritionHistory.ts",
  `import type { NutritionMetadata } from "./NutritionMetadata";

export interface NutritionHistoryEntry {
  readonly id: string;
  readonly adaptationId: string;
  readonly planId: string;
  readonly keys: readonly string[];
  readonly createdAt: string;
}

export interface NutritionHistory {
  readonly id: string;
  readonly athleteId: string;
  readonly entries: readonly NutritionHistoryEntry[];
  readonly historyKeys: readonly string[];
  readonly metadata: NutritionMetadata;
  readonly createdAt: string;
}
`,
);

write(
  "models/NutritionTimeline.ts",
  `import type { NutritionMetadata } from "./NutritionMetadata";

export interface NutritionTimelineItem {
  readonly id: string;
  readonly adaptationId: string;
  readonly keys: readonly string[];
  readonly createdAt: string;
}

export interface NutritionTimeline {
  readonly id: string;
  readonly athleteId: string;
  readonly items: readonly NutritionTimelineItem[];
  readonly metadata: NutritionMetadata;
  readonly createdAt: string;
}
`,
);

write(
  "models/NutritionSummary.ts",
  `import type { NutritionMetadata } from "./NutritionMetadata";

export interface NutritionSummary {
  readonly id: string;
  readonly athleteId: string;
  readonly planId: string;
  readonly contextId: string;
  readonly adaptationId: string | null;
  readonly modificationCount: number;
  readonly adjustmentCount: number;
  readonly decisionKeys: readonly string[];
  readonly metadata: NutritionMetadata;
  readonly createdAt: string;
}
`,
);

write(
  "models/NutritionDiagnostics.ts",
  `export interface NutritionDiagnostics {
  readonly notes: readonly string[];
  readonly warnings: readonly string[];
  readonly processingSteps: readonly string[];
}
`,
);

write(
  "models/NutritionStatistics.ts",
  `export interface NutritionStatistics {
  readonly modificationCount: number;
  readonly adjustmentCount: number;
  readonly replacementCount: number;
  readonly decisionKeyCount: number;
  readonly mealKeyCount: number;
  readonly macroKeyCount: number;
}
`,
);

write(
  "models/NutritionPackage.ts",
  `import type { NutritionAdaptation } from "./NutritionAdaptation";
import type { NutritionComparison } from "./NutritionComparison";
import type { NutritionDiagnostics } from "./NutritionDiagnostics";
import type { NutritionHistory } from "./NutritionHistory";
import type { NutritionMetadata } from "./NutritionMetadata";
import type { NutritionRuntimeInput } from "./NutritionRuntimeInput";
import type { NutritionSnapshot } from "./NutritionSnapshot";
import type { NutritionStatistics } from "./NutritionStatistics";
import type { NutritionSummary } from "./NutritionSummary";
import type { NutritionTimeline } from "./NutritionTimeline";
import type { UpdatedNutritionPlan } from "./UpdatedNutritionPlan";

export interface NutritionPackage {
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
  readonly diagnostics: NutritionDiagnostics;
  readonly metadata: NutritionMetadata;
  readonly createdAt: string;
}
`,
);

write(
  "models/NutritionResult.ts",
  `import type { NutritionAdaptation } from "./NutritionAdaptation";
import type { NutritionComparison } from "./NutritionComparison";
import type { NutritionDescriptor } from "./NutritionDescriptor";
import type { NutritionError } from "./NutritionError";
import type { NutritionPackage } from "./NutritionPackage";
import type { NutritionRuntimeInput } from "./NutritionRuntimeInput";
import type { NutritionSnapshot } from "./NutritionSnapshot";
import type { NutritionSummary } from "./NutritionSummary";
import type { NutritionValidation } from "./NutritionValidation";
import type { UpdatedNutritionPlan } from "./UpdatedNutritionPlan";

export const NutritionOperationKinds = {
  ADAPT: "adapt",
  COMPARE: "compare",
  DESCRIBE: "describe",
  SNAPSHOT: "snapshot",
  VALIDATE: "validate",
} as const;

export type NutritionOperationKind =
  (typeof NutritionOperationKinds)[keyof typeof NutritionOperationKinds];

export interface NutritionResult {
  readonly id: string;
  readonly operation: NutritionOperationKind;
  readonly success: boolean;
  readonly adaptation: NutritionAdaptation | null;
  readonly updatedPlan: UpdatedNutritionPlan | null;
  readonly runtimeInput: NutritionRuntimeInput | null;
  readonly package: NutritionPackage | null;
  readonly summary: NutritionSummary | null;
  readonly snapshot: NutritionSnapshot | null;
  readonly comparison: NutritionComparison | null;
  readonly validation: NutritionValidation | null;
  readonly descriptor: NutritionDescriptor | null;
  readonly errors: readonly NutritionError[];
  readonly createdAt: string;
}
`,
);

write(
  "models/NutritionDescriptor.ts",
  `export interface NutritionDescriptor {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly capabilities: readonly string[];
  readonly boundaries: readonly string[];
  readonly createdAt: string;
}
`,
);

write(
  "models/NutritionValidation.ts",
  `import type { NutritionError } from "./NutritionError";

export interface NutritionValidation {
  readonly valid: boolean;
  readonly issues: readonly NutritionError[];
}
`,
);

write(
  "models/NutritionError.ts",
  `export const NutritionErrorCodes = {
  MISSING_INPUT: "missing_input",
  MISSING_ATHLETE: "missing_athlete",
  MISSING_PLAN: "missing_plan",
  INVALID_INPUT: "invalid_input",
  VALIDATION_FAILED: "validation_failed",
  POLICY_BLOCKED: "policy_blocked",
  EMPTY_PLAN: "empty_plan",
  INCONSISTENT_MEAL: "inconsistent_meal",
  INCONSISTENT_MACRO: "inconsistent_macro",
  INCONSISTENT_WEEK: "inconsistent_week",
} as const;

export type NutritionErrorCode =
  (typeof NutritionErrorCodes)[keyof typeof NutritionErrorCodes];

export interface NutritionError {
  readonly code: NutritionErrorCode;
  readonly message: string;
  readonly subjectId: string | null;
}

export function createNutritionError(
  code: NutritionErrorCode,
  message: string,
  subjectId: string | null = null,
): NutritionError {
  return Object.freeze({ code, message, subjectId });
}
`,
);

write(
  "models/NutritionAdaptationState.ts",
  `import type { NutritionAdaptation } from "./NutritionAdaptation";
import type { NutritionPackage } from "./NutritionPackage";

export const NutritionSessionStatuses = {
  IDLE: "idle",
  READY: "ready",
  ERROR: "error",
} as const;

export type NutritionSessionStatus =
  (typeof NutritionSessionStatuses)[keyof typeof NutritionSessionStatuses];

export interface NutritionAdaptationState {
  readonly status: NutritionSessionStatus;
  readonly package: NutritionPackage | null;
  readonly adaptation: NutritionAdaptation | null;
  readonly updatedAt: string;
}
`,
);

write(
  "models/NutritionAdaptationOutput.ts",
  `import type { NutritionAdaptation } from "./NutritionAdaptation";
import type { NutritionPackage } from "./NutritionPackage";
import type { NutritionRuntimeInput } from "./NutritionRuntimeInput";
import type { NutritionSnapshot } from "./NutritionSnapshot";
import type { NutritionSummary } from "./NutritionSummary";
import type { UpdatedNutritionPlan } from "./UpdatedNutritionPlan";

export interface NutritionAdaptationOutput {
  readonly id: string;
  readonly athleteId: string;
  readonly planId: string;
  readonly adaptation: NutritionAdaptation | null;
  readonly updatedPlan: UpdatedNutritionPlan | null;
  readonly runtimeInput: NutritionRuntimeInput | null;
  readonly package: NutritionPackage | null;
  readonly summary: NutritionSummary | null;
  readonly snapshot: NutritionSnapshot | null;
  readonly createdAt: string;
}
`,
);

write(
  "models/index.ts",
  `export * from "./AthleteStateRef";
export * from "./CalorieAdjustment";
export * from "./CarbohydrateAdjustment";
export * from "./CoachContextRef";
export * from "./DietBreakAdjustment";
export * from "./FatAdjustment";
export * from "./FiberAdjustment";
export * from "./HydrationAdjustment";
export * from "./MacroDistributionAdjustment";
export * from "./MealAdjustment";
export * from "./MealInsertion";
export * from "./MealRemoval";
export * from "./MealReplacement";
export * from "./MealTimingAdjustment";
export * from "./NutritionAdaptation";
export * from "./NutritionAdaptationContext";
export * from "./NutritionAdaptationDecisionRef";
export * from "./NutritionAdaptationInput";
export * from "./NutritionAdaptationOutput";
export * from "./NutritionAdaptationState";
export * from "./NutritionAdjustment";
export * from "./NutritionComparison";
export * from "./NutritionDescriptor";
export * from "./NutritionDiagnostics";
export * from "./NutritionError";
export * from "./NutritionHistory";
export * from "./NutritionMetadata";
export * from "./NutritionModification";
export * from "./NutritionPackage";
export * from "./NutritionReplacement";
export * from "./NutritionResult";
export * from "./NutritionRuntimeInput";
export * from "./NutritionSnapshot";
export * from "./NutritionStatistics";
export * from "./NutritionSummary";
export * from "./NutritionTimeline";
export * from "./NutritionValidation";
export * from "./PlanRef";
export * from "./ProteinAdjustment";
export * from "./RefeedAdjustment";
export * from "./RuntimeRef";
export * from "./SupplementAdjustment";
export * from "./UpdatedNutritionPlan";
export * from "./WeeklyAdjustment";
`,
);

// ─── CONTRACTS ────────────────────────────────────────────────────────────────

write(
  "contracts/NutritionPlanPort.ts",
  `export interface NutritionPlanPort {
  isPlanPresent(input: {
    readonly athleteId: string;
    readonly planId: string;
    readonly at: string;
  }): boolean;
  loadPlanKeys(input: {
    readonly athleteId: string;
    readonly planId: string;
    readonly at: string;
  }): readonly string[];
  loadMealKeys(input: {
    readonly athleteId: string;
    readonly planId: string;
    readonly at: string;
  }): readonly string[];
  loadMacroKeys(input: {
    readonly athleteId: string;
    readonly planId: string;
    readonly at: string;
  }): readonly string[];
  loadTimingKeys(input: {
    readonly athleteId: string;
    readonly planId: string;
    readonly at: string;
  }): readonly string[];
  loadWeekKeys(input: {
    readonly athleteId: string;
    readonly planId: string;
    readonly at: string;
  }): readonly string[];
  loadDayKeys(input: {
    readonly athleteId: string;
    readonly planId: string;
    readonly at: string;
  }): readonly string[];
}

export function createMockNutritionPlanPort(present = true): NutritionPlanPort {
  return {
    isPlanPresent: () => present,
    loadPlanKeys(input) {
      return Object.freeze([
        \`plan:\${input.planId}\`,
        "plan:structure",
        "plan:meal:breakfast",
      ]);
    },
    loadMealKeys(input) {
      return Object.freeze([
        \`meal:\${input.planId}:breakfast\`,
        \`meal:\${input.planId}:lunch\`,
        \`meal:\${input.planId}:dinner\`,
      ]);
    },
    loadMacroKeys(input) {
      return Object.freeze([
        \`macro:\${input.planId}:protein\`,
        \`macro:\${input.planId}:carbohydrate\`,
        \`macro:\${input.planId}:fat\`,
      ]);
    },
    loadTimingKeys(input) {
      return Object.freeze([
        \`timing:\${input.planId}:pre\`,
        \`timing:\${input.planId}:post\`,
      ]);
    },
    loadWeekKeys(input) {
      return Object.freeze([\`week:\${input.planId}:1\`, \`week:\${input.planId}:2\`]);
    },
    loadDayKeys(input) {
      return Object.freeze([\`day:\${input.planId}:1\`, \`day:\${input.planId}:2\`]);
    },
  };
}
`,
);

write(
  "contracts/NutritionRuntimePort.ts",
  `export interface NutritionRuntimePort {
  isRuntimePresent(input: {
    readonly athleteId: string;
    readonly runtimeId: string;
    readonly at: string;
  }): boolean;
  loadRuntimeKeys(input: {
    readonly athleteId: string;
    readonly runtimeId: string;
    readonly at: string;
  }): readonly string[];
}

export function createMockNutritionRuntimePort(present = true): NutritionRuntimePort {
  return {
    isRuntimePresent: () => present,
    loadRuntimeKeys(input) {
      return Object.freeze([
        \`runtime:\${input.runtimeId}\`,
        "runtime:meal",
        "runtime:state",
      ]);
    },
  };
}
`,
);

write(
  "contracts/AthleteStatePort.ts",
  `export interface AthleteStatePort {
  isAthletePresent(input: { readonly athleteId: string; readonly at: string }): boolean;
  loadStateKeys(input: {
    readonly athleteId: string;
    readonly at: string;
  }): readonly string[];
}

export function createMockAthleteStatePort(present = true): AthleteStatePort {
  return {
    isAthletePresent: () => present,
    loadStateKeys(input) {
      return Object.freeze([
        \`state:athlete:\${input.athleteId}\`,
        "state:adherence",
        "state:hydration",
        "state:recovery",
      ]);
    },
  };
}
`,
);

write(
  "contracts/ContinuousAdaptationPort.ts",
  `export interface ContinuousAdaptationPort {
  loadDecisionKeys(input: {
    readonly athleteId: string;
    readonly contextId: string;
    readonly at: string;
  }): readonly string[];
  loadDecisionIds(input: {
    readonly athleteId: string;
    readonly contextId: string;
    readonly at: string;
  }): readonly string[];
}

export function createMockContinuousAdaptationPort(): ContinuousAdaptationPort {
  return {
    loadDecisionKeys(input) {
      return Object.freeze([
        \`decision:key:\${input.athleteId}:calorie\`,
        \`decision:key:\${input.athleteId}:macro\`,
        "decision:key:hydration",
      ]);
    },
    loadDecisionIds(input) {
      return Object.freeze([
        \`adaptation:\${input.athleteId}:1\`,
        \`adaptation:\${input.athleteId}:2\`,
      ]);
    },
  };
}
`,
);

write(
  "contracts/CoachContextPort.ts",
  `export interface CoachContextPort {
  loadContextKeys(input: {
    readonly athleteId: string;
    readonly contextId: string;
    readonly at: string;
  }): readonly string[];
  loadFocusAreas(input: {
    readonly athleteId: string;
    readonly contextId: string;
    readonly at: string;
  }): readonly string[];
}

export function createMockCoachContextPort(): CoachContextPort {
  return {
    loadContextKeys(input) {
      return Object.freeze([
        \`context:\${input.contextId}\`,
        "context:focus:nutrition",
      ]);
    },
    loadFocusAreas() {
      return Object.freeze(["nutrition", "recovery"]);
    },
  };
}
`,
);

write(
  "contracts/index.ts",
  `export * from "./AthleteStatePort";
export * from "./CoachContextPort";
export * from "./ContinuousAdaptationPort";
export * from "./NutritionPlanPort";
export * from "./NutritionRuntimePort";
`,
);

// ─── UTILS ────────────────────────────────────────────────────────────────────

write(
  "utils/NutritionAdaptationHelpers.ts",
  `import type { NutritionAdaptationInput } from "../models/NutritionAdaptationInput";

export function uniqueSorted(keys: readonly string[]): readonly string[] {
  return Object.freeze([...new Set(keys)].sort());
}

export function collectKeys(...groups: readonly (readonly string[])[]): readonly string[] {
  const keys = new Set<string>();
  for (const group of groups) {
    for (const k of group) keys.add(k);
  }
  return Object.freeze([...keys].sort());
}

export function collectPresentSignalKeys(input: NutritionAdaptationInput): readonly string[] {
  const keys = new Set<string>();
  for (const k of input.signalKeys) keys.add(k);
  for (const k of input.decisionKeys) keys.add(k);
  for (const [flag, present] of Object.entries(input.signalFlags)) {
    if (present) keys.add(flag);
  }
  return Object.freeze([...keys].sort());
}

export function keysPresent(keys: readonly string[], prefix?: string): readonly string[] {
  if (!prefix) return uniqueSorted(keys);
  return uniqueSorted(keys.filter((k) => k.startsWith(prefix)));
}
`,
);

write(
  "utils/StatisticsHelpers.ts",
  `import type { NutritionAdaptation } from "../models/NutritionAdaptation";
import type { NutritionStatistics } from "../models/NutritionStatistics";

export function buildStatistics(adaptation: NutritionAdaptation | null): NutritionStatistics {
  if (!adaptation) {
    return Object.freeze({
      modificationCount: 0,
      adjustmentCount: 0,
      replacementCount: 0,
      decisionKeyCount: 0,
      mealKeyCount: 0,
      macroKeyCount: 0,
    });
  }
  return Object.freeze({
    modificationCount: adaptation.modifications.length,
    adjustmentCount:
      adaptation.adjustments.length +
      adaptation.mealAdjustments.length +
      adaptation.calorieAdjustments.length +
      adaptation.proteinAdjustments.length +
      adaptation.carbohydrateAdjustments.length +
      adaptation.fatAdjustments.length +
      adaptation.fiberAdjustments.length +
      adaptation.hydrationAdjustments.length +
      adaptation.mealTimingAdjustments.length +
      adaptation.supplementAdjustments.length +
      adaptation.refeedAdjustments.length +
      adaptation.dietBreakAdjustments.length +
      adaptation.macroDistributionAdjustments.length +
      adaptation.weeklyAdjustments.length,
    replacementCount:
      adaptation.replacements.length + adaptation.mealReplacements.length,
    decisionKeyCount: adaptation.decisionKeys.length,
    mealKeyCount: adaptation.mealAdjustments.length,
    macroKeyCount: adaptation.macroDistributionAdjustments.length,
  });
}
`,
);

write(
  "utils/FormattingHelpers.ts",
  `export function formatKeyList(keys: readonly string[]): string {
  return keys.join(",");
}

export function formatOperationLabel(operation: string): string {
  return operation.toUpperCase();
}
`,
);

write(
  "utils/ComparisonHelpers.ts",
  `export function sameKeySet(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length) return false;
  const sa = [...a].sort();
  const sb = [...b].sort();
  for (let i = 0; i < sa.length; i += 1) {
    if (sa[i] !== sb[i]) return false;
  }
  return true;
}
`,
);

write(
  "utils/FreezeNutritionAdaptation.ts",
  `import type { AthleteStateRef } from "../models/AthleteStateRef";
import type { CalorieAdjustment } from "../models/CalorieAdjustment";
import type { CarbohydrateAdjustment } from "../models/CarbohydrateAdjustment";
import type { CoachContextRef } from "../models/CoachContextRef";
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
import type { NutritionAdaptationContext } from "../models/NutritionAdaptationContext";
import type { NutritionAdaptationDecisionRef } from "../models/NutritionAdaptationDecisionRef";
import type { NutritionAdaptationInput } from "../models/NutritionAdaptationInput";
import type { NutritionAdaptationOutput } from "../models/NutritionAdaptationOutput";
import type { NutritionAdaptationState } from "../models/NutritionAdaptationState";
import type { NutritionAdjustment } from "../models/NutritionAdjustment";
import type { NutritionComparison } from "../models/NutritionComparison";
import type { NutritionDescriptor } from "../models/NutritionDescriptor";
import type { NutritionDiagnostics } from "../models/NutritionDiagnostics";
import type { NutritionHistory, NutritionHistoryEntry } from "../models/NutritionHistory";
import type { NutritionMetadata } from "../models/NutritionMetadata";
import type { NutritionModification } from "../models/NutritionModification";
import type { NutritionPackage } from "../models/NutritionPackage";
import type { NutritionReplacement } from "../models/NutritionReplacement";
import type { NutritionResult } from "../models/NutritionResult";
import type { NutritionRuntimeInput } from "../models/NutritionRuntimeInput";
import type { NutritionSnapshot } from "../models/NutritionSnapshot";
import type { NutritionStatistics } from "../models/NutritionStatistics";
import type { NutritionSummary } from "../models/NutritionSummary";
import type { NutritionTimeline, NutritionTimelineItem } from "../models/NutritionTimeline";
import type { NutritionValidation } from "../models/NutritionValidation";
import type { PlanRef } from "../models/PlanRef";
import type { ProteinAdjustment } from "../models/ProteinAdjustment";
import type { RefeedAdjustment } from "../models/RefeedAdjustment";
import type { RuntimeRef } from "../models/RuntimeRef";
import type { SupplementAdjustment } from "../models/SupplementAdjustment";
import type { UpdatedNutritionPlan } from "../models/UpdatedNutritionPlan";
import type { WeeklyAdjustment } from "../models/WeeklyAdjustment";

export function freezeMetadata(m: NutritionMetadata): NutritionMetadata {
  return Object.freeze({
    tags: Object.freeze([...m.tags]),
    attributes: Object.freeze({ ...m.attributes }),
  });
}

export function freezePlanRef(r: PlanRef): PlanRef {
  return Object.freeze({ ...r, keys: Object.freeze([...r.keys]) });
}

export function freezeRuntimeRef(r: RuntimeRef): RuntimeRef {
  return Object.freeze({ ...r, keys: Object.freeze([...r.keys]) });
}

export function freezeAthleteStateRef(r: AthleteStateRef): AthleteStateRef {
  return Object.freeze({ ...r, stateKeys: Object.freeze([...r.stateKeys]) });
}

export function freezeCoachContextRef(r: CoachContextRef): CoachContextRef {
  return Object.freeze({ ...r, keys: Object.freeze([...r.keys]) });
}

export function freezeDecisionRef(r: NutritionAdaptationDecisionRef): NutritionAdaptationDecisionRef {
  return Object.freeze({
    ...r,
    decisionIds: Object.freeze([...r.decisionIds]),
    decisionKeys: Object.freeze([...r.decisionKeys]),
  });
}

export function freezeModification(m: NutritionModification): NutritionModification {
  return Object.freeze({
    ...m,
    sourceDecisionKeys: Object.freeze([...m.sourceDecisionKeys]),
    planStepKeys: Object.freeze([...m.planStepKeys]),
    metadata: freezeMetadata(m.metadata),
  });
}

export function freezeAdjustment(a: NutritionAdjustment): NutritionAdjustment {
  return Object.freeze({
    ...a,
    sourceDecisionKeys: Object.freeze([...a.sourceDecisionKeys]),
    metadata: freezeMetadata(a.metadata),
  });
}

export function freezeReplacement(r: NutritionReplacement): NutritionReplacement {
  return Object.freeze({
    ...r,
    sourceDecisionKeys: Object.freeze([...r.sourceDecisionKeys]),
    metadata: freezeMetadata(r.metadata),
  });
}

function freezeKeyedAdjustment<T extends {
  readonly sourceDecisionKeys: readonly string[];
  readonly planStepKeys: readonly string[];
  readonly metadata: NutritionMetadata;
}>(a: T): T {
  return Object.freeze({
    ...a,
    sourceDecisionKeys: Object.freeze([...a.sourceDecisionKeys]),
    planStepKeys: Object.freeze([...a.planStepKeys]),
    metadata: freezeMetadata(a.metadata),
  });
}

export function freezeMealAdjustment(a: MealAdjustment): MealAdjustment {
  return freezeKeyedAdjustment(a);
}
export function freezeMealReplacement(a: MealReplacement): MealReplacement {
  return Object.freeze({
    ...a,
    sourceDecisionKeys: Object.freeze([...a.sourceDecisionKeys]),
    planStepKeys: Object.freeze([...a.planStepKeys]),
    metadata: freezeMetadata(a.metadata),
  });
}
export function freezeMealRemoval(a: MealRemoval): MealRemoval {
  return freezeKeyedAdjustment(a);
}
export function freezeMealInsertion(a: MealInsertion): MealInsertion {
  return freezeKeyedAdjustment(a);
}
export function freezeCalorieAdjustment(a: CalorieAdjustment): CalorieAdjustment {
  return freezeKeyedAdjustment(a);
}
export function freezeProteinAdjustment(a: ProteinAdjustment): ProteinAdjustment {
  return freezeKeyedAdjustment(a);
}
export function freezeCarbohydrateAdjustment(a: CarbohydrateAdjustment): CarbohydrateAdjustment {
  return freezeKeyedAdjustment(a);
}
export function freezeFatAdjustment(a: FatAdjustment): FatAdjustment {
  return freezeKeyedAdjustment(a);
}
export function freezeFiberAdjustment(a: FiberAdjustment): FiberAdjustment {
  return freezeKeyedAdjustment(a);
}
export function freezeHydrationAdjustment(a: HydrationAdjustment): HydrationAdjustment {
  return freezeKeyedAdjustment(a);
}
export function freezeMealTimingAdjustment(a: MealTimingAdjustment): MealTimingAdjustment {
  return freezeKeyedAdjustment(a);
}
export function freezeSupplementAdjustment(a: SupplementAdjustment): SupplementAdjustment {
  return freezeKeyedAdjustment(a);
}
export function freezeRefeedAdjustment(a: RefeedAdjustment): RefeedAdjustment {
  return freezeKeyedAdjustment(a);
}
export function freezeDietBreakAdjustment(a: DietBreakAdjustment): DietBreakAdjustment {
  return freezeKeyedAdjustment(a);
}
export function freezeMacroDistributionAdjustment(a: MacroDistributionAdjustment): MacroDistributionAdjustment {
  return freezeKeyedAdjustment(a);
}
export function freezeWeeklyAdjustment(a: WeeklyAdjustment): WeeklyAdjustment {
  return freezeKeyedAdjustment(a);
}

export function freezeSnapshot(s: NutritionSnapshot): NutritionSnapshot {
  return Object.freeze({
    ...s,
    planKeys: Object.freeze([...s.planKeys]),
    dayKeys: Object.freeze([...s.dayKeys]),
    mealKeys: Object.freeze([...s.mealKeys]),
    macroKeys: Object.freeze([...s.macroKeys]),
    timingKeys: Object.freeze([...s.timingKeys]),
    weekKeys: Object.freeze([...s.weekKeys]),
    modificationIds: Object.freeze([...s.modificationIds]),
    metadata: freezeMetadata(s.metadata),
  });
}

export function freezeInput(i: NutritionAdaptationInput): NutritionAdaptationInput {
  return Object.freeze({
    ...i,
    planKeys: Object.freeze([...i.planKeys]),
    dayKeys: Object.freeze([...i.dayKeys]),
    mealKeys: Object.freeze([...i.mealKeys]),
    macroKeys: Object.freeze([...i.macroKeys]),
    timingKeys: Object.freeze([...i.timingKeys]),
    weekKeys: Object.freeze([...i.weekKeys]),
    decisionKeys: Object.freeze([...i.decisionKeys]),
    signalKeys: Object.freeze([...i.signalKeys]),
    signalFlags: Object.freeze({ ...i.signalFlags }),
    priorSnapshot: i.priorSnapshot ? freezeSnapshot(i.priorSnapshot) : null,
    decisionRef: i.decisionRef ? freezeDecisionRef(i.decisionRef) : null,
    planRef: i.planRef ? freezePlanRef(i.planRef) : null,
    runtimeRef: i.runtimeRef ? freezeRuntimeRef(i.runtimeRef) : null,
    athleteStateRef: i.athleteStateRef ? freezeAthleteStateRef(i.athleteStateRef) : null,
    coachContextRef: i.coachContextRef ? freezeCoachContextRef(i.coachContextRef) : null,
    metadata: freezeMetadata(i.metadata),
  });
}

export function freezeContext(c: NutritionAdaptationContext): NutritionAdaptationContext {
  return Object.freeze({
    ...c,
    signalKeys: Object.freeze([...c.signalKeys]),
    planRef: c.planRef ? freezePlanRef(c.planRef) : null,
    runtimeRef: c.runtimeRef ? freezeRuntimeRef(c.runtimeRef) : null,
    athleteStateRef: c.athleteStateRef ? freezeAthleteStateRef(c.athleteStateRef) : null,
    coachContextRef: c.coachContextRef ? freezeCoachContextRef(c.coachContextRef) : null,
    decisionRef: c.decisionRef ? freezeDecisionRef(c.decisionRef) : null,
    metadata: freezeMetadata(c.metadata),
  });
}

export function freezeAdaptation(a: NutritionAdaptation): NutritionAdaptation {
  return Object.freeze({
    ...a,
    decisionKeys: Object.freeze([...a.decisionKeys]),
    signalKeys: Object.freeze([...a.signalKeys]),
    modifications: Object.freeze(a.modifications.map(freezeModification)),
    adjustments: Object.freeze(a.adjustments.map(freezeAdjustment)),
    replacements: Object.freeze(a.replacements.map(freezeReplacement)),
    mealAdjustments: Object.freeze(a.mealAdjustments.map(freezeMealAdjustment)),
    mealReplacements: Object.freeze(a.mealReplacements.map(freezeMealReplacement)),
    mealRemovals: Object.freeze(a.mealRemovals.map(freezeMealRemoval)),
    mealInsertions: Object.freeze(a.mealInsertions.map(freezeMealInsertion)),
    calorieAdjustments: Object.freeze(a.calorieAdjustments.map(freezeCalorieAdjustment)),
    proteinAdjustments: Object.freeze(a.proteinAdjustments.map(freezeProteinAdjustment)),
    carbohydrateAdjustments: Object.freeze(a.carbohydrateAdjustments.map(freezeCarbohydrateAdjustment)),
    fatAdjustments: Object.freeze(a.fatAdjustments.map(freezeFatAdjustment)),
    fiberAdjustments: Object.freeze(a.fiberAdjustments.map(freezeFiberAdjustment)),
    hydrationAdjustments: Object.freeze(a.hydrationAdjustments.map(freezeHydrationAdjustment)),
    mealTimingAdjustments: Object.freeze(a.mealTimingAdjustments.map(freezeMealTimingAdjustment)),
    supplementAdjustments: Object.freeze(a.supplementAdjustments.map(freezeSupplementAdjustment)),
    refeedAdjustments: Object.freeze(a.refeedAdjustments.map(freezeRefeedAdjustment)),
    dietBreakAdjustments: Object.freeze(a.dietBreakAdjustments.map(freezeDietBreakAdjustment)),
    macroDistributionAdjustments: Object.freeze(a.macroDistributionAdjustments.map(freezeMacroDistributionAdjustment)),
    weeklyAdjustments: Object.freeze(a.weeklyAdjustments.map(freezeWeeklyAdjustment)),
    metadata: freezeMetadata(a.metadata),
  });
}

export function freezeUpdatedPlan(b: UpdatedNutritionPlan): UpdatedNutritionPlan {
  return Object.freeze({
    ...b,
    dayKeys: Object.freeze([...b.dayKeys]),
    mealKeys: Object.freeze([...b.mealKeys]),
    macroKeys: Object.freeze([...b.macroKeys]),
    timingKeys: Object.freeze([...b.timingKeys]),
    weekKeys: Object.freeze([...b.weekKeys]),
    modificationIds: Object.freeze([...b.modificationIds]),
    metadata: freezeMetadata(b.metadata),
  });
}

export function freezeRuntimeInput(r: NutritionRuntimeInput): NutritionRuntimeInput {
  return Object.freeze({
    ...r,
    mealKeys: Object.freeze([...r.mealKeys]),
    macroKeys: Object.freeze([...r.macroKeys]),
    modificationIds: Object.freeze([...r.modificationIds]),
    metadata: freezeMetadata(r.metadata),
  });
}

export function freezeComparison(c: NutritionComparison): NutritionComparison {
  return Object.freeze({
    ...c,
    beforeKeys: Object.freeze([...c.beforeKeys]),
    afterKeys: Object.freeze([...c.afterKeys]),
    addedKeys: Object.freeze([...c.addedKeys]),
    removedKeys: Object.freeze([...c.removedKeys]),
    sharedKeys: Object.freeze([...c.sharedKeys]),
    metadata: freezeMetadata(c.metadata),
  });
}

export function freezeHistoryEntry(e: NutritionHistoryEntry): NutritionHistoryEntry {
  return Object.freeze({ ...e, keys: Object.freeze([...e.keys]) });
}

export function freezeHistory(h: NutritionHistory): NutritionHistory {
  return Object.freeze({
    ...h,
    entries: Object.freeze(h.entries.map(freezeHistoryEntry)),
    historyKeys: Object.freeze([...h.historyKeys]),
    metadata: freezeMetadata(h.metadata),
  });
}

export function freezeTimelineItem(i: NutritionTimelineItem): NutritionTimelineItem {
  return Object.freeze({ ...i, keys: Object.freeze([...i.keys]) });
}

export function freezeTimeline(t: NutritionTimeline): NutritionTimeline {
  return Object.freeze({
    ...t,
    items: Object.freeze(t.items.map(freezeTimelineItem)),
    metadata: freezeMetadata(t.metadata),
  });
}

export function freezeSummary(s: NutritionSummary): NutritionSummary {
  return Object.freeze({
    ...s,
    decisionKeys: Object.freeze([...s.decisionKeys]),
    metadata: freezeMetadata(s.metadata),
  });
}

export function freezeDiagnostics(d: NutritionDiagnostics): NutritionDiagnostics {
  return Object.freeze({
    notes: Object.freeze([...d.notes]),
    warnings: Object.freeze([...d.warnings]),
    processingSteps: Object.freeze([...d.processingSteps]),
  });
}

export function freezeStatistics(s: NutritionStatistics): NutritionStatistics {
  return Object.freeze({ ...s });
}

export function freezeDescriptor(d: NutritionDescriptor): NutritionDescriptor {
  return Object.freeze({
    ...d,
    capabilities: Object.freeze([...d.capabilities]),
    boundaries: Object.freeze([...d.boundaries]),
  });
}

export function freezeValidation(v: NutritionValidation): NutritionValidation {
  return Object.freeze({
    valid: v.valid,
    issues: Object.freeze([...v.issues]),
  });
}

export function freezePackage(p: NutritionPackage): NutritionPackage {
  return Object.freeze({
    ...p,
    adaptation: p.adaptation ? freezeAdaptation(p.adaptation) : null,
    updatedPlan: p.updatedPlan ? freezeUpdatedPlan(p.updatedPlan) : null,
    runtimeInput: p.runtimeInput ? freezeRuntimeInput(p.runtimeInput) : null,
    summary: p.summary ? freezeSummary(p.summary) : null,
    snapshot: p.snapshot ? freezeSnapshot(p.snapshot) : null,
    comparison: p.comparison ? freezeComparison(p.comparison) : null,
    timeline: p.timeline ? freezeTimeline(p.timeline) : null,
    history: p.history ? freezeHistory(p.history) : null,
    statistics: freezeStatistics(p.statistics),
    diagnostics: freezeDiagnostics(p.diagnostics),
    metadata: freezeMetadata(p.metadata),
  });
}

export function freezeOutput(o: NutritionAdaptationOutput): NutritionAdaptationOutput {
  return Object.freeze({
    ...o,
    adaptation: o.adaptation ? freezeAdaptation(o.adaptation) : null,
    updatedPlan: o.updatedPlan ? freezeUpdatedPlan(o.updatedPlan) : null,
    runtimeInput: o.runtimeInput ? freezeRuntimeInput(o.runtimeInput) : null,
    package: o.package ? freezePackage(o.package) : null,
    summary: o.summary ? freezeSummary(o.summary) : null,
    snapshot: o.snapshot ? freezeSnapshot(o.snapshot) : null,
  });
}

export function freezeState(s: NutritionAdaptationState): NutritionAdaptationState {
  return Object.freeze({
    ...s,
    package: s.package ? freezePackage(s.package) : null,
    adaptation: s.adaptation ? freezeAdaptation(s.adaptation) : null,
  });
}

export function freezeResult(r: NutritionResult): NutritionResult {
  return Object.freeze({
    ...r,
    adaptation: r.adaptation ? freezeAdaptation(r.adaptation) : null,
    updatedPlan: r.updatedPlan ? freezeUpdatedPlan(r.updatedPlan) : null,
    runtimeInput: r.runtimeInput ? freezeRuntimeInput(r.runtimeInput) : null,
    package: r.package ? freezePackage(r.package) : null,
    summary: r.summary ? freezeSummary(r.summary) : null,
    snapshot: r.snapshot ? freezeSnapshot(r.snapshot) : null,
    comparison: r.comparison ? freezeComparison(r.comparison) : null,
    validation: r.validation ? freezeValidation(r.validation) : null,
    descriptor: r.descriptor ? freezeDescriptor(r.descriptor) : null,
    errors: Object.freeze([...r.errors]),
  });
}
`,
);

write(
  "utils/index.ts",
  `export * from "./ComparisonHelpers";
export * from "./FormattingHelpers";
export * from "./FreezeNutritionAdaptation";
export * from "./NutritionAdaptationHelpers";
export * from "./StatisticsHelpers";
`,
);

console.log(`Wrote ${fileCount} files to ${ROOT}`);
