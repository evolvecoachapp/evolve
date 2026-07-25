/**
 * Sprint 24.2 — Nutrition Adaptation Engine generator (part 3: validators, policies, selectors, adaptation, services).
 * Run: node scripts/generate-nutrition-adaptation-part3.mjs
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

// ─── VALIDATORS ───────────────────────────────────────────────────────────────

write(
  "validators/validatePlanIntegrity.ts",
  `import { createNutritionError, NutritionErrorCodes } from "../models/NutritionError";
import type { NutritionError } from "../models/NutritionError";
import type { UpdatedNutritionPlan } from "../models/UpdatedNutritionPlan";

export function validatePlanIntegrity(
  plan: UpdatedNutritionPlan | null,
): readonly NutritionError[] {
  const errors: NutritionError[] = [];
  if (!plan) {
    errors.push(
      createNutritionError(NutritionErrorCodes.MISSING_PLAN, "Updated plan required"),
    );
    return Object.freeze(errors);
  }
  if (!plan.planId) {
    errors.push(
      createNutritionError(
        NutritionErrorCodes.MISSING_PLAN,
        "Plan id required",
        plan.id,
      ),
    );
  }
  if (
    plan.mealKeys.length === 0 &&
    plan.macroKeys.length === 0 &&
    plan.dayKeys.length === 0
  ) {
    errors.push(
      createNutritionError(
        NutritionErrorCodes.EMPTY_PLAN,
        "Updated plan has no structure keys",
        plan.id,
      ),
    );
  }
  return Object.freeze(errors);
}
`,
);

write(
  "validators/validateAdaptationIntegrity.ts",
  `import { createNutritionError, NutritionErrorCodes } from "../models/NutritionError";
import type { NutritionError } from "../models/NutritionError";
import type { NutritionAdaptation } from "../models/NutritionAdaptation";

export function validateAdaptationIntegrity(
  adaptation: NutritionAdaptation | null,
): readonly NutritionError[] {
  const errors: NutritionError[] = [];
  if (!adaptation) {
    errors.push(
      createNutritionError(NutritionErrorCodes.MISSING_INPUT, "Adaptation record required"),
    );
    return Object.freeze(errors);
  }
  if (!adaptation.athleteId) {
    errors.push(
      createNutritionError(NutritionErrorCodes.MISSING_ATHLETE, "Athlete id required", adaptation.id),
    );
  }
  if (!adaptation.planId) {
    errors.push(
      createNutritionError(
        NutritionErrorCodes.MISSING_PLAN,
        "Plan id required",
        adaptation.id,
      ),
    );
  }
  return Object.freeze(errors);
}
`,
);

write(
  "validators/validateMealConsistency.ts",
  `import { createNutritionError, NutritionErrorCodes } from "../models/NutritionError";
import type { NutritionError } from "../models/NutritionError";
import type { NutritionAdaptation } from "../models/NutritionAdaptation";

export function validateMealConsistency(
  adaptation: NutritionAdaptation | null,
): readonly NutritionError[] {
  const errors: NutritionError[] = [];
  if (!adaptation) return Object.freeze(errors);
  for (const adj of adaptation.mealAdjustments) {
    if (!adj.mealKey) {
      errors.push(
        createNutritionError(
          NutritionErrorCodes.INCONSISTENT_MEAL,
          "Meal adjustment missing mealKey",
          adj.id,
        ),
      );
    }
  }
  return Object.freeze(errors);
}
`,
);

write(
  "validators/validateMacroConsistency.ts",
  `import { createNutritionError, NutritionErrorCodes } from "../models/NutritionError";
import type { NutritionError } from "../models/NutritionError";
import type { NutritionAdaptation } from "../models/NutritionAdaptation";

export function validateMacroConsistency(
  adaptation: NutritionAdaptation | null,
): readonly NutritionError[] {
  const errors: NutritionError[] = [];
  if (!adaptation) return Object.freeze(errors);
  for (const adj of adaptation.macroDistributionAdjustments) {
    if (!adj.macroKey) {
      errors.push(
        createNutritionError(
          NutritionErrorCodes.INCONSISTENT_MACRO,
          "Macro adjustment missing macroKey",
          adj.id,
        ),
      );
    }
  }
  return Object.freeze(errors);
}
`,
);

write(
  "validators/validateWeeklyConsistency.ts",
  `import { createNutritionError, NutritionErrorCodes } from "../models/NutritionError";
import type { NutritionError } from "../models/NutritionError";
import type { NutritionAdaptation } from "../models/NutritionAdaptation";

export function validateWeeklyConsistency(
  adaptation: NutritionAdaptation | null,
): readonly NutritionError[] {
  const errors: NutritionError[] = [];
  if (!adaptation) return Object.freeze(errors);
  for (const adj of adaptation.weeklyAdjustments) {
    if (!adj.weekKey) {
      errors.push(
        createNutritionError(
          NutritionErrorCodes.INCONSISTENT_WEEK,
          "Weekly adjustment missing weekKey",
          adj.id,
        ),
      );
    }
  }
  return Object.freeze(errors);
}
`,
);

write(
  "validators/validateDependencies.ts",
  `import { createNutritionError, NutritionErrorCodes } from "../models/NutritionError";
import type { NutritionError } from "../models/NutritionError";
import type { NutritionAdaptation } from "../models/NutritionAdaptation";

export function validateDependencies(
  adaptation: NutritionAdaptation | null,
): readonly NutritionError[] {
  const errors: NutritionError[] = [];
  if (!adaptation) return Object.freeze(errors);
  for (const mod of adaptation.modifications) {
    if (mod.sourceDecisionKeys.length === 0) {
      errors.push(
        createNutritionError(
          NutritionErrorCodes.VALIDATION_FAILED,
          "Modification missing source decision keys",
          mod.id,
        ),
      );
    }
  }
  return Object.freeze(errors);
}
`,
);

write(
  "validators/validateHistory.ts",
  `import { createNutritionError, NutritionErrorCodes } from "../models/NutritionError";
import type { NutritionError } from "../models/NutritionError";
import type { NutritionHistory } from "../models/NutritionHistory";

export function validateHistory(history: NutritionHistory | null): readonly NutritionError[] {
  const errors: NutritionError[] = [];
  if (!history) return Object.freeze(errors);
  if (!history.athleteId) {
    errors.push(
      createNutritionError(NutritionErrorCodes.MISSING_ATHLETE, "History athlete id required", history.id),
    );
  }
  return Object.freeze(errors);
}
`,
);

write(
  "validators/validateSnapshot.ts",
  `import { createNutritionError, NutritionErrorCodes } from "../models/NutritionError";
import type { NutritionError } from "../models/NutritionError";
import type { NutritionSnapshot } from "../models/NutritionSnapshot";

export function validateSnapshot(snapshot: NutritionSnapshot | null): readonly NutritionError[] {
  const errors: NutritionError[] = [];
  if (!snapshot) return Object.freeze(errors);
  if (!snapshot.planId) {
    errors.push(
      createNutritionError(
        NutritionErrorCodes.MISSING_PLAN,
        "Snapshot plan id required",
        snapshot.id,
      ),
    );
  }
  return Object.freeze(errors);
}
`,
);

write(
  "validators/validatePackage.ts",
  `import type { NutritionError } from "../models/NutritionError";
import { createNutritionError, NutritionErrorCodes } from "../models/NutritionError";
import type { NutritionPackage } from "../models/NutritionPackage";
import type { NutritionValidation } from "../models/NutritionValidation";
import { validateAdaptationIntegrity } from "./validateAdaptationIntegrity";
import { validateDependencies } from "./validateDependencies";
import { validateHistory } from "./validateHistory";
import { validateMacroConsistency } from "./validateMacroConsistency";
import { validateMealConsistency } from "./validateMealConsistency";
import { validatePlanIntegrity } from "./validatePlanIntegrity";
import { validateSnapshot } from "./validateSnapshot";
import { validateWeeklyConsistency } from "./validateWeeklyConsistency";

export function validateNutritionPackage(pkg: NutritionPackage): NutritionValidation {
  const issues: NutritionError[] = [
    ...validateAdaptationIntegrity(pkg.adaptation),
    ...validatePlanIntegrity(pkg.updatedPlan),
    ...validateMealConsistency(pkg.adaptation),
    ...validateMacroConsistency(pkg.adaptation),
    ...validateWeeklyConsistency(pkg.adaptation),
    ...validateDependencies(pkg.adaptation),
    ...validateHistory(pkg.history),
    ...validateSnapshot(pkg.snapshot),
  ];
  if (!pkg.athleteId) {
    issues.push(
      createNutritionError(NutritionErrorCodes.MISSING_ATHLETE, "Package athlete id required", pkg.id),
    );
  }
  if (!pkg.planId) {
    issues.push(
      createNutritionError(
        NutritionErrorCodes.MISSING_PLAN,
        "Package plan id required",
        pkg.id,
      ),
    );
  }
  return Object.freeze({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}
`,
);

write(
  "validators/index.ts",
  `export * from "./validateAdaptationIntegrity";
export * from "./validateDependencies";
export * from "./validateHistory";
export * from "./validateMacroConsistency";
export * from "./validateMealConsistency";
export * from "./validatePackage";
export * from "./validatePlanIntegrity";
export * from "./validateSnapshot";
export * from "./validateWeeklyConsistency";

export { validateNutritionPackage } from "./validatePackage";
`,
);

// ─── POLICIES ─────────────────────────────────────────────────────────────────

write(
  "policies/NutritionAdaptationPolicy.ts",
  `import type { NutritionAdaptation } from "../models/NutritionAdaptation";
import { createNutritionError, NutritionErrorCodes } from "../models/NutritionError";
import type { NutritionError } from "../models/NutritionError";

export function applyNutritionAdaptationPolicy(
  adaptation: NutritionAdaptation | null,
): readonly NutritionError[] {
  const errors: NutritionError[] = [];
  if (!adaptation) {
    errors.push(
      createNutritionError(NutritionErrorCodes.POLICY_BLOCKED, "Adaptation required for policy"),
    );
    return Object.freeze(errors);
  }
  if (!adaptation.planId) {
    errors.push(
      createNutritionError(
        NutritionErrorCodes.POLICY_BLOCKED,
        "Adaptation must reference existing plan",
        adaptation.id,
      ),
    );
  }
  return Object.freeze(errors);
}
`,
);

write(
  "policies/SafetyPolicy.ts",
  `import type { NutritionPackage } from "../models/NutritionPackage";
import { createNutritionError, NutritionErrorCodes } from "../models/NutritionError";
import type { NutritionError } from "../models/NutritionError";

/** Safety: adaptations must originate from existing plan structure keys. */
export function applySafetyPolicy(pkg: NutritionPackage): readonly NutritionError[] {
  const errors: NutritionError[] = [];
  if (!pkg.updatedPlan) {
    errors.push(
      createNutritionError(NutritionErrorCodes.POLICY_BLOCKED, "Updated plan required", pkg.id),
    );
  } else if (!pkg.updatedPlan.planId) {
    errors.push(
      createNutritionError(
        NutritionErrorCodes.POLICY_BLOCKED,
        "Cannot adapt without existing plan id",
        pkg.updatedPlan.id,
      ),
    );
  }
  return Object.freeze(errors);
}
`,
);

write(
  "policies/RecoveryPolicy.ts",
  `import type { NutritionAdaptation } from "../models/NutritionAdaptation";
import type { NutritionError } from "../models/NutritionError";

/** Recovery nutrition policy: allow recovery-linked adjustments with source keys. */
export function applyRecoveryPolicy(
  adaptation: NutritionAdaptation | null,
): readonly NutritionError[] {
  const errors: NutritionError[] = [];
  if (!adaptation) return Object.freeze(errors);
  for (const adj of adaptation.refeedAdjustments) {
    void adj;
  }
  return Object.freeze(errors);
}
`,
);

write(
  "policies/ConsistencyPolicy.ts",
  `import type { NutritionAdaptation } from "../models/NutritionAdaptation";
import { createNutritionError, NutritionErrorCodes } from "../models/NutritionError";
import type { NutritionError } from "../models/NutritionError";

export function applyConsistencyPolicy(
  adaptation: NutritionAdaptation | null,
): readonly NutritionError[] {
  const errors: NutritionError[] = [];
  if (!adaptation) return Object.freeze(errors);
  const ids = new Set<string>();
  for (const mod of adaptation.modifications) {
    if (ids.has(mod.id)) {
      errors.push(
        createNutritionError(
          NutritionErrorCodes.POLICY_BLOCKED,
          "Duplicate modification id",
          mod.id,
        ),
      );
    }
    ids.add(mod.id);
  }
  return Object.freeze(errors);
}
`,
);

write(
  "policies/HydrationPolicy.ts",
  `import type { NutritionAdaptation } from "../models/NutritionAdaptation";
import type { NutritionError } from "../models/NutritionError";

export function applyHydrationPolicy(
  adaptation: NutritionAdaptation | null,
): readonly NutritionError[] {
  void adaptation;
  return Object.freeze([] as NutritionError[]);
}
`,
);

write(
  "policies/AdherencePolicy.ts",
  `import type { NutritionAdaptation } from "../models/NutritionAdaptation";
import type { NutritionError } from "../models/NutritionError";

export function applyAdherencePolicy(
  adaptation: NutritionAdaptation | null,
): readonly NutritionError[] {
  void adaptation;
  return Object.freeze([] as NutritionError[]);
}
`,
);

write(
  "policies/index.ts",
  `export * from "./AdherencePolicy";
export * from "./ConsistencyPolicy";
export * from "./HydrationPolicy";
export * from "./NutritionAdaptationPolicy";
export * from "./RecoveryPolicy";
export * from "./SafetyPolicy";
`,
);

// ─── SELECTORS ────────────────────────────────────────────────────────────────

write(
  "selectors/NutritionSelector.ts",
  `import type { NutritionAdaptation } from "../models/NutritionAdaptation";
import { uniqueSorted } from "../utils/NutritionAdaptationHelpers";

export function selectModificationIds(adaptation: NutritionAdaptation | null): readonly string[] {
  if (!adaptation) return Object.freeze([]);
  return uniqueSorted(adaptation.modifications.map((m) => m.id));
}

export function selectDecisionKeys(adaptation: NutritionAdaptation | null): readonly string[] {
  if (!adaptation) return Object.freeze([]);
  return uniqueSorted(adaptation.decisionKeys);
}
`,
);

write(
  "selectors/MealSelector.ts",
  `import type { NutritionAdaptation } from "../models/NutritionAdaptation";
import { uniqueSorted } from "../utils/NutritionAdaptationHelpers";

export function selectMealKeys(adaptation: NutritionAdaptation | null): readonly string[] {
  if (!adaptation) return Object.freeze([]);
  return uniqueSorted(adaptation.mealAdjustments.map((a) => a.mealKey));
}
`,
);

write(
  "selectors/MacroSelector.ts",
  `import type { NutritionAdaptation } from "../models/NutritionAdaptation";
import { uniqueSorted } from "../utils/NutritionAdaptationHelpers";

export function selectMacroKeys(adaptation: NutritionAdaptation | null): readonly string[] {
  if (!adaptation) return Object.freeze([]);
  return uniqueSorted(adaptation.macroDistributionAdjustments.map((a) => a.macroKey));
}
`,
);

write(
  "selectors/TimingSelector.ts",
  `import type { NutritionAdaptation } from "../models/NutritionAdaptation";
import { uniqueSorted } from "../utils/NutritionAdaptationHelpers";

export function selectTimingKeys(adaptation: NutritionAdaptation | null): readonly string[] {
  if (!adaptation) return Object.freeze([]);
  return uniqueSorted(adaptation.mealTimingAdjustments.map((a) => a.timingKey));
}
`,
);

write(
  "selectors/WeekSelector.ts",
  `import type { NutritionAdaptation } from "../models/NutritionAdaptation";
import { uniqueSorted } from "../utils/NutritionAdaptationHelpers";

export function selectWeekKeys(adaptation: NutritionAdaptation | null): readonly string[] {
  if (!adaptation) return Object.freeze([]);
  return uniqueSorted(adaptation.weeklyAdjustments.map((a) => a.weekKey));
}
`,
);

write(
  "selectors/index.ts",
  `export * from "./MacroSelector";
export * from "./MealSelector";
export * from "./NutritionSelector";
export * from "./TimingSelector";
export * from "./WeekSelector";
`,
);

// ─── ADAPTATION ───────────────────────────────────────────────────────────────

write(
  "adaptation/NutritionAdaptationSession.ts",
  `import type { NutritionAdaptation } from "../models/NutritionAdaptation";
import type { NutritionAdaptationState } from "../models/NutritionAdaptationState";
import { NutritionSessionStatuses } from "../models/NutritionAdaptationState";
import type { NutritionPackage } from "../models/NutritionPackage";
import { freezeState } from "../utils/FreezeNutritionAdaptation";

export class NutritionAdaptationSession {
  private state: NutritionAdaptationState;

  constructor(updatedAt: string) {
    this.state = freezeState({
      status: NutritionSessionStatuses.IDLE,
      package: null,
      adaptation: null,
      updatedAt,
    });
  }

  getState(): NutritionAdaptationState {
    return this.state;
  }

  getPackage(): NutritionPackage | null {
    return this.state.package;
  }

  getAdaptation(): NutritionAdaptation | null {
    return this.state.adaptation;
  }

  put(
    pkg: NutritionPackage,
    status: (typeof NutritionSessionStatuses)[keyof typeof NutritionSessionStatuses],
  ): void {
    this.state = freezeState({
      status,
      package: pkg,
      adaptation: pkg.adaptation,
      updatedAt: pkg.createdAt,
    });
  }
}

export function createNutritionAdaptationSession(updatedAt: string): NutritionAdaptationSession {
  return new NutritionAdaptationSession(updatedAt);
}
`,
);

write(
  "adaptation/NutritionAdaptationCoordinator.ts",
  `import { adaptCalorie } from "../application/CalorieAdapter";
import { adaptDietBreak } from "../application/DietBreakAdapter";
import { adaptHydration } from "../application/HydrationAdapter";
import { adaptMacro } from "../application/MacroAdapter";
import { adaptMeal } from "../application/MealAdapter";
import { adaptRefeed } from "../application/RefeedAdapter";
import { adaptSupplement } from "../application/SupplementAdapter";
import { adaptTiming } from "../application/TimingAdapter";
import { buildNutritionDescriptor } from "../builders/DescriptorBuilder";
import { buildNutritionAdaptation } from "../builders/NutritionAdaptationBuilder";
import { buildNutritionPackage } from "../builders/NutritionPackageBuilder";
import { buildNutritionSnapshot } from "../builders/NutritionSnapshotBuilder";
import { buildNutritionSummary } from "../builders/NutritionSummaryBuilder";
import { buildNutritionResult } from "../builders/ResultBuilder";
import { comparePlans } from "../comparison/PlanComparator";
import type { AthleteStatePort } from "../contracts/AthleteStatePort";
import type { CoachContextPort } from "../contracts/CoachContextPort";
import type { ContinuousAdaptationPort } from "../contracts/ContinuousAdaptationPort";
import type { NutritionPlanPort } from "../contracts/NutritionPlanPort";
import type { NutritionRuntimePort } from "../contracts/NutritionRuntimePort";
import { evaluateNutritionSignals } from "../evaluation";
import { EMPTY_NUTRITION_METADATA } from "../models/NutritionMetadata";
import type { NutritionAdaptationInput } from "../models/NutritionAdaptationInput";
import { NutritionSessionStatuses } from "../models/NutritionAdaptationState";
import { createNutritionError, NutritionErrorCodes } from "../models/NutritionError";
import type { NutritionHistory } from "../models/NutritionHistory";
import { NutritionOperationKinds } from "../models/NutritionResult";
import type { NutritionResult } from "../models/NutritionResult";
import type { NutritionRuntimeInput } from "../models/NutritionRuntimeInput";
import type { NutritionTimeline } from "../models/NutritionTimeline";
import type { UpdatedNutritionPlan } from "../models/UpdatedNutritionPlan";
import { applyAdherencePolicy } from "../policies/AdherencePolicy";
import { applyConsistencyPolicy } from "../policies/ConsistencyPolicy";
import { applyHydrationPolicy } from "../policies/HydrationPolicy";
import { applyNutritionAdaptationPolicy } from "../policies/NutritionAdaptationPolicy";
import { applyRecoveryPolicy } from "../policies/RecoveryPolicy";
import { applySafetyPolicy } from "../policies/SafetyPolicy";
import { planNutritionAdaptation } from "../planning";
import {
  collectPresentSignalKeys,
  uniqueSorted,
} from "../utils/NutritionAdaptationHelpers";
import { buildStatistics } from "../utils/StatisticsHelpers";
import {
  freezeHistory,
  freezeRuntimeInput,
  freezeTimeline,
  freezeUpdatedPlan,
} from "../utils/FreezeNutritionAdaptation";
import { validateNutritionPackage } from "../validators";
import {
  createNutritionAdaptationSession,
  type NutritionAdaptationSession,
} from "./NutritionAdaptationSession";

export interface NutritionAdaptationCoordinatorDeps {
  readonly nutritionPlanPort?: NutritionPlanPort;
  readonly nutritionRuntimePort?: NutritionRuntimePort;
  readonly athleteStatePort?: AthleteStatePort;
  readonly continuousAdaptationPort?: ContinuousAdaptationPort;
  readonly coachContextPort?: CoachContextPort;
  readonly clock?: () => string;
  readonly runtimeId?: string;
}

export class NutritionAdaptationCoordinator {
  private readonly nutritionPlanPort: NutritionPlanPort | undefined;
  private readonly nutritionRuntimePort: NutritionRuntimePort | undefined;
  private readonly athleteStatePort: AthleteStatePort | undefined;
  private readonly continuousAdaptationPort: ContinuousAdaptationPort | undefined;
  private readonly coachContextPort: CoachContextPort | undefined;
  private readonly clock: () => string;
  private readonly runtimeId: string;
  private readonly session: NutritionAdaptationSession;

  constructor(deps: NutritionAdaptationCoordinatorDeps = {}) {
    this.nutritionPlanPort = deps.nutritionPlanPort;
    this.nutritionRuntimePort = deps.nutritionRuntimePort;
    this.athleteStatePort = deps.athleteStatePort;
    this.continuousAdaptationPort = deps.continuousAdaptationPort;
    this.coachContextPort = deps.coachContextPort;
    this.clock = deps.clock ?? (() => new Date().toISOString());
    this.runtimeId = deps.runtimeId ?? "runtime:nutrition-adaptation";
    this.session = createNutritionAdaptationSession(this.clock());
  }

  describe(): NutritionResult {
    const at = this.clock();
    return buildNutritionResult({
      id: \`result:describe:\${this.runtimeId}\`,
      operation: NutritionOperationKinds.DESCRIBE,
      success: true,
      descriptor: buildNutritionDescriptor({ id: this.runtimeId, createdAt: at }),
      createdAt: at,
    });
  }

  adapt(input: NutritionAdaptationInput): NutritionResult {
    return this.run(input, NutritionOperationKinds.ADAPT);
  }

  compare(input: NutritionAdaptationInput): NutritionResult {
    const at = this.clock();
    const built = this.run(input, NutritionOperationKinds.ADAPT);
    if (!built.success || !built.package) {
      return buildNutritionResult({
        id: \`result:compare:error:\${input.id}\`,
        operation: NutritionOperationKinds.COMPARE,
        success: false,
        errors: built.errors.length
          ? built.errors
          : [createNutritionError(NutritionErrorCodes.MISSING_INPUT, "Adapt path failed for compare")],
        createdAt: at,
      });
    }
    const beforeKeys = input.priorSnapshot?.planKeys ?? input.planKeys;
    const afterKeys = built.updatedPlan
      ? uniqueSorted([
          built.updatedPlan.id,
          ...built.updatedPlan.mealKeys,
          ...built.updatedPlan.macroKeys,
          ...built.updatedPlan.weekKeys,
        ])
      : input.planKeys;
    const comparison = comparePlans({
      id: input.id,
      athleteId: input.athleteId,
      planId: input.planId,
      beforeKeys,
      afterKeys,
      at,
    });
    return buildNutritionResult({
      id: \`result:compare:\${input.id}\`,
      operation: NutritionOperationKinds.COMPARE,
      success: true,
      adaptation: built.adaptation,
      updatedPlan: built.updatedPlan,
      runtimeInput: built.runtimeInput,
      package: built.package,
      summary: built.summary,
      snapshot: built.snapshot,
      comparison,
      createdAt: at,
    });
  }

  snapshot(input: NutritionAdaptationInput): NutritionResult {
    const at = this.clock();
    const built = this.run(input, NutritionOperationKinds.ADAPT);
    if (!built.success || !built.snapshot) return built;
    return buildNutritionResult({
      id: \`result:snapshot:\${input.id}\`,
      operation: NutritionOperationKinds.SNAPSHOT,
      success: true,
      adaptation: built.adaptation,
      updatedPlan: built.updatedPlan,
      runtimeInput: built.runtimeInput,
      package: built.package,
      summary: built.summary,
      snapshot: built.snapshot,
      comparison: built.comparison,
      createdAt: at,
    });
  }

  validate(input: NutritionAdaptationInput): NutritionResult {
    const at = this.clock();
    const pkg = this.session.getPackage() ?? this.run(input, NutritionOperationKinds.ADAPT).package;
    if (!pkg) {
      return buildNutritionResult({
        id: \`result:validate:error:\${input.id}\`,
        operation: NutritionOperationKinds.VALIDATE,
        success: false,
        errors: [
          createNutritionError(NutritionErrorCodes.MISSING_INPUT, "No package to validate"),
        ],
        createdAt: at,
      });
    }
    const validation = validateNutritionPackage(pkg);
    return buildNutritionResult({
      id: \`result:validate:\${input.id}\`,
      operation: NutritionOperationKinds.VALIDATE,
      success: validation.valid,
      adaptation: pkg.adaptation,
      updatedPlan: pkg.updatedPlan,
      runtimeInput: pkg.runtimeInput,
      package: pkg,
      summary: pkg.summary,
      snapshot: pkg.snapshot,
      validation,
      errors: validation.valid ? Object.freeze([]) : validation.issues,
      createdAt: at,
    });
  }

  private run(
    input: NutritionAdaptationInput,
    operation: (typeof NutritionOperationKinds)[keyof typeof NutritionOperationKinds],
  ): NutritionResult {
    const at = this.clock();
    if (!input.athleteId) {
      return buildNutritionResult({
        id: \`result:\${operation}:error:\${input.id}\`,
        operation,
        success: false,
        errors: [
          createNutritionError(NutritionErrorCodes.MISSING_ATHLETE, "Athlete id required"),
        ],
        createdAt: at,
      });
    }
    if (!input.planId) {
      return buildNutritionResult({
        id: \`result:\${operation}:error:\${input.id}\`,
        operation,
        success: false,
        errors: [
          createNutritionError(
            NutritionErrorCodes.MISSING_PLAN,
            "Existing plan id required — no generation from scratch",
          ),
        ],
        createdAt: at,
      });
    }

    const steps: string[] = [
      "resolve_upstream",
      "evaluate",
      "plan",
      "adapt",
      "compare",
      "build",
      "policy",
      "validate",
      "freeze",
    ];

    const resolved = this.resolveInputs(input, at);

    if (resolved.planKeys.length === 0 && resolved.mealKeys.length === 0) {
      return buildNutritionResult({
        id: \`result:\${operation}:error:\${input.id}\`,
        operation,
        success: false,
        errors: [
          createNutritionError(
            NutritionErrorCodes.EMPTY_PLAN,
            "Adapt requires existing plan keys — no generation from empty plan",
            input.planId,
          ),
        ],
        createdAt: at,
      });
    }

    const signalKeys = collectPresentSignalKeys(resolved.input);
    const evaluation = evaluateNutritionSignals(signalKeys);
    void evaluation;

    const plans = planNutritionAdaptation({
      id: input.id,
      decisionKeys: resolved.decisionKeys,
      signalKeys,
      planKeys: resolved.planKeys,
      mealKeys: resolved.mealKeys,
      macroKeys: resolved.macroKeys,
      timingKeys: resolved.timingKeys,
      weekKeys: resolved.weekKeys,
    });

    const adapterInput = {
      id: input.id,
      decisionKeys: resolved.decisionKeys,
      planStepKeys: uniqueSorted([
        ...plans.nutrition.stepKeys,
        ...plans.meal.stepKeys,
        ...plans.week.stepKeys,
      ]),
      targetKeys: uniqueSorted([
        ...plans.nutrition.targetKeys,
        ...plans.meal.targetKeys,
        ...plans.macro.targetKeys,
        ...plans.timing.targetKeys,
        ...plans.week.targetKeys,
      ]),
      at,
    };

    const mealAdjustments = adaptMeal(adapterInput);
    const calorieAdjustments = adaptCalorie(adapterInput);
    const macroDistributionAdjustments = adaptMacro(adapterInput);
    const mealTimingAdjustments = adaptTiming(adapterInput);
    const hydrationAdjustments = adaptHydration(adapterInput);
    const supplementAdjustments = adaptSupplement(adapterInput);
    const refeedAdjustments = adaptRefeed(adapterInput);
    const dietBreakAdjustments = adaptDietBreak(adapterInput);

    const adaptation = buildNutritionAdaptation({
      id: \`nutrition-adaptation:\${input.id}\`,
      athleteId: input.athleteId,
      planId: input.planId,
      contextId: input.contextId,
      decisionKeys: resolved.decisionKeys,
      signalKeys,
      mealAdjustments,
      calorieAdjustments,
      macroDistributionAdjustments,
      mealTimingAdjustments,
      hydrationAdjustments,
      supplementAdjustments,
      refeedAdjustments,
      dietBreakAdjustments,
      at,
    });

    const modificationIds = uniqueSorted(adaptation.modifications.map((m) => m.id));
    const updatedPlan: UpdatedNutritionPlan = freezeUpdatedPlan({
      id: \`updated-plan:\${input.id}\`,
      athleteId: input.athleteId,
      planId: input.planId,
      dayKeys: uniqueSorted(resolved.dayKeys),
      mealKeys: uniqueSorted(resolved.mealKeys),
      macroKeys: uniqueSorted(resolved.macroKeys),
      timingKeys: uniqueSorted(resolved.timingKeys),
      weekKeys: uniqueSorted(resolved.weekKeys),
      modificationIds,
      metadata: EMPTY_NUTRITION_METADATA,
      createdAt: at,
    });

    const runtimeInput: NutritionRuntimeInput = freezeRuntimeInput({
      id: \`runtime-input:\${input.id}\`,
      athleteId: input.athleteId,
      planId: input.planId,
      updatedPlanId: updatedPlan.id,
      mealKeys: updatedPlan.mealKeys,
      macroKeys: updatedPlan.macroKeys,
      modificationIds,
      metadata: EMPTY_NUTRITION_METADATA,
      createdAt: at,
    });

    const summary = buildNutritionSummary({
      id: \`summary:\${input.id}\`,
      athleteId: input.athleteId,
      planId: input.planId,
      contextId: input.contextId,
      adaptation,
      at,
    });

    const snapshot = buildNutritionSnapshot({
      id: \`snapshot:\${input.id}\`,
      athleteId: input.athleteId,
      planId: input.planId,
      contextId: input.contextId,
      adaptation,
      updatedPlan,
      planKeys: resolved.planKeys,
      at,
    });

    const beforeKeys = input.priorSnapshot?.planKeys ?? resolved.planKeys;
    const afterKeys = uniqueSorted([
      updatedPlan.id,
      ...updatedPlan.mealKeys,
      ...updatedPlan.macroKeys,
      ...updatedPlan.weekKeys,
    ]);
    const comparison = comparePlans({
      id: input.id,
      athleteId: input.athleteId,
      planId: input.planId,
      beforeKeys,
      afterKeys,
      at,
    });

    const timeline: NutritionTimeline = freezeTimeline({
      id: \`timeline:\${input.id}\`,
      athleteId: input.athleteId,
      items: Object.freeze([
        Object.freeze({
          id: \`timeline-item:\${adaptation.id}\`,
          adaptationId: adaptation.id,
          keys: adaptation.decisionKeys,
          createdAt: at,
        }),
      ]),
      metadata: EMPTY_NUTRITION_METADATA,
      createdAt: at,
    });

    const history: NutritionHistory = freezeHistory({
      id: \`history:\${input.id}\`,
      athleteId: input.athleteId,
      entries: Object.freeze([
        Object.freeze({
          id: \`history-entry:\${adaptation.id}\`,
          adaptationId: adaptation.id,
          planId: input.planId,
          keys: adaptation.signalKeys,
          createdAt: at,
        }),
      ]),
      historyKeys: Object.freeze([\`history:\${input.planId}\`]),
      metadata: EMPTY_NUTRITION_METADATA,
      createdAt: at,
    });

    const pkg = buildNutritionPackage({
      id: \`package:\${input.id}\`,
      athleteId: input.athleteId,
      planId: input.planId,
      contextId: input.contextId,
      adaptation,
      updatedPlan,
      runtimeInput,
      summary,
      snapshot,
      comparison,
      timeline,
      history,
      statistics: buildStatistics(adaptation),
      processingSteps: steps,
      at,
    });

    const policyErrors = Object.freeze([
      ...applyNutritionAdaptationPolicy(adaptation),
      ...applySafetyPolicy(pkg),
      ...applyRecoveryPolicy(adaptation),
      ...applyConsistencyPolicy(adaptation),
      ...applyHydrationPolicy(adaptation),
      ...applyAdherencePolicy(adaptation),
    ]);
    if (policyErrors.length > 0) {
      return buildNutritionResult({
        id: \`result:\${operation}:error:\${input.id}\`,
        operation,
        success: false,
        adaptation,
        updatedPlan,
        runtimeInput,
        package: pkg,
        errors: policyErrors,
        createdAt: at,
      });
    }

    const validation = validateNutritionPackage(pkg);
    if (!validation.valid) {
      return buildNutritionResult({
        id: \`result:\${operation}:error:\${input.id}\`,
        operation,
        success: false,
        adaptation,
        updatedPlan,
        runtimeInput,
        package: pkg,
        validation,
        errors: validation.issues,
        createdAt: at,
      });
    }

    this.session.put(pkg, NutritionSessionStatuses.READY);

    return buildNutritionResult({
      id: \`result:\${operation}:\${input.id}\`,
      operation,
      success: true,
      adaptation,
      updatedPlan,
      runtimeInput,
      package: pkg,
      summary,
      snapshot,
      comparison,
      validation,
      createdAt: at,
    });
  }

  private resolveInputs(input: NutritionAdaptationInput, at: string) {
    let planKeys = input.planKeys;
    let mealKeys = input.mealKeys;
    let macroKeys = input.macroKeys;
    let timingKeys = input.timingKeys;
    let weekKeys = input.weekKeys;
    let dayKeys = input.dayKeys;
    let decisionKeys = input.decisionKeys;
    let signalKeys = input.signalKeys;

    if (this.nutritionPlanPort && input.planId) {
      if (planKeys.length === 0) {
        planKeys = this.nutritionPlanPort.loadPlanKeys({
          athleteId: input.athleteId,
          planId: input.planId,
          at,
        });
      }
      if (mealKeys.length === 0) {
        mealKeys = this.nutritionPlanPort.loadMealKeys({
          athleteId: input.athleteId,
          planId: input.planId,
          at,
        });
      }
      if (macroKeys.length === 0) {
        macroKeys = this.nutritionPlanPort.loadMacroKeys({
          athleteId: input.athleteId,
          planId: input.planId,
          at,
        });
      }
      if (timingKeys.length === 0) {
        timingKeys = this.nutritionPlanPort.loadTimingKeys({
          athleteId: input.athleteId,
          planId: input.planId,
          at,
        });
      }
      if (weekKeys.length === 0) {
        weekKeys = this.nutritionPlanPort.loadWeekKeys({
          athleteId: input.athleteId,
          planId: input.planId,
          at,
        });
      }
      if (dayKeys.length === 0) {
        dayKeys = this.nutritionPlanPort.loadDayKeys({
          athleteId: input.athleteId,
          planId: input.planId,
          at,
        });
      }
    }

    if (decisionKeys.length === 0 && this.continuousAdaptationPort) {
      decisionKeys = this.continuousAdaptationPort.loadDecisionKeys({
        athleteId: input.athleteId,
        contextId: input.contextId,
        at,
      });
    }

    if (signalKeys.length === 0 && this.athleteStatePort) {
      signalKeys = this.athleteStatePort.loadStateKeys({
        athleteId: input.athleteId,
        at,
      });
    }

    const focusAreas =
      this.coachContextPort?.loadFocusAreas({
        athleteId: input.athleteId,
        contextId: input.contextId,
        at,
      }) ?? Object.freeze([] as string[]);

    const mergedFlags: Record<string, boolean> = { ...input.signalFlags };
    for (const area of focusAreas) {
      if (mergedFlags[\`focus:\${area}\`] === undefined) mergedFlags[\`focus:\${area}\`] = true;
    }

    if (this.nutritionRuntimePort && input.runtimeRef) {
      void this.nutritionRuntimePort.loadRuntimeKeys({
        athleteId: input.athleteId,
        runtimeId: input.runtimeRef.runtimeId,
        at,
      });
    }

    const resolvedInput: NutritionAdaptationInput = Object.freeze({
      ...input,
      planKeys: Object.freeze([...planKeys]),
      mealKeys: Object.freeze([...mealKeys]),
      macroKeys: Object.freeze([...macroKeys]),
      timingKeys: Object.freeze([...timingKeys]),
      weekKeys: Object.freeze([...weekKeys]),
      dayKeys: Object.freeze([...dayKeys]),
      decisionKeys: Object.freeze([...decisionKeys]),
      signalKeys: Object.freeze([...signalKeys]),
      signalFlags: Object.freeze(mergedFlags),
    });

    return {
      input: resolvedInput,
      planKeys,
      mealKeys,
      macroKeys,
      timingKeys,
      weekKeys,
      dayKeys,
      decisionKeys,
      signalKeys,
    };
  }
}

export function createNutritionAdaptationCoordinator(
  deps: NutritionAdaptationCoordinatorDeps = {},
): NutritionAdaptationCoordinator {
  return new NutritionAdaptationCoordinator(deps);
}
`,
);

write(
  "adaptation/NutritionAdaptationEngine.ts",
  `import { buildNutritionDescriptor } from "../builders/DescriptorBuilder";
import type { NutritionDescriptor } from "../models/NutritionDescriptor";
import type { NutritionAdaptationInput } from "../models/NutritionAdaptationInput";
import type { NutritionResult } from "../models/NutritionResult";
import {
  createNutritionAdaptationCoordinator,
  type NutritionAdaptationCoordinator,
  type NutritionAdaptationCoordinatorDeps,
} from "./NutritionAdaptationCoordinator";

export type NutritionAdaptationEngineDeps = NutritionAdaptationCoordinatorDeps;

/**
 * Nutrition Adaptation Engine — adapts existing nutrition plans only.
 * Does NOT generate nutrition from scratch. No AI. No networking. No persistence.
 */
export class NutritionAdaptationEngine {
  private readonly coordinator: NutritionAdaptationCoordinator;
  private readonly runtimeId: string;
  private readonly clock: () => string;

  constructor(deps: NutritionAdaptationEngineDeps = {}) {
    this.coordinator = createNutritionAdaptationCoordinator(deps);
    this.runtimeId = deps.runtimeId ?? "runtime:nutrition-adaptation";
    this.clock = deps.clock ?? (() => new Date().toISOString());
  }

  adaptNutrition(input: NutritionAdaptationInput): NutritionResult {
    return this.coordinator.adapt(input);
  }

  compareNutrition(input: NutritionAdaptationInput): NutritionResult {
    return this.coordinator.compare(input);
  }

  describeNutritionAdaptation(): NutritionDescriptor {
    const result = this.coordinator.describe();
    return (
      result.descriptor ??
      buildNutritionDescriptor({ id: this.runtimeId, createdAt: this.clock() })
    );
  }

  createNutritionSnapshot(input: NutritionAdaptationInput): NutritionResult {
    return this.coordinator.snapshot(input);
  }

  validateNutritionAdaptation(input: NutritionAdaptationInput): NutritionResult {
    return this.coordinator.validate(input);
  }
}

export function createNutritionAdaptationEngine(
  deps: NutritionAdaptationEngineDeps = {},
): NutritionAdaptationEngine {
  return new NutritionAdaptationEngine(deps);
}
`,
);

write(
  "adaptation/index.ts",
  `export * from "./NutritionAdaptationCoordinator";
export * from "./NutritionAdaptationEngine";
export * from "./NutritionAdaptationSession";
`,
);

write(
  "services/NutritionAdaptationEngineService.ts",
  `import {
  createNutritionAdaptationEngine,
  type NutritionAdaptationEngine,
  type NutritionAdaptationEngineDeps,
} from "../adaptation/NutritionAdaptationEngine";
import type { NutritionDescriptor } from "../models/NutritionDescriptor";
import type { NutritionAdaptationInput } from "../models/NutritionAdaptationInput";
import type { NutritionResult } from "../models/NutritionResult";

export type NutritionAdaptationEngineServiceDeps = NutritionAdaptationEngineDeps;

/**
 * Nutrition Adaptation Engine Service — orchestration facade.
 *
 * Nutrition Plan + Nutrition Runtime + Athlete State +
 * Continuous Adaptation Decision + Coach Context
 *   → Nutrition Adaptation Engine
 *   → Updated Nutrition Plan → Nutrition Runtime
 */
export class NutritionAdaptationEngineService {
  private readonly engine: NutritionAdaptationEngine;

  constructor(deps: NutritionAdaptationEngineServiceDeps = {}) {
    this.engine = createNutritionAdaptationEngine(deps);
  }

  adaptNutrition(input: NutritionAdaptationInput): NutritionResult {
    return this.engine.adaptNutrition(input);
  }

  compareNutrition(input: NutritionAdaptationInput): NutritionResult {
    return this.engine.compareNutrition(input);
  }

  describeNutritionAdaptation(): NutritionDescriptor {
    return this.engine.describeNutritionAdaptation();
  }

  createNutritionSnapshot(input: NutritionAdaptationInput): NutritionResult {
    return this.engine.createNutritionSnapshot(input);
  }

  validateNutritionAdaptation(input: NutritionAdaptationInput): NutritionResult {
    return this.engine.validateNutritionAdaptation(input);
  }
}

export function createNutritionAdaptationEngineService(
  deps: NutritionAdaptationEngineServiceDeps = {},
): NutritionAdaptationEngineService {
  return new NutritionAdaptationEngineService(deps);
}
`,
);

write(
  "services/index.ts",
  `export * from "./NutritionAdaptationEngineService";
`,
);

write(
  "testSupport/fixtures.ts",
  `import { createMockAthleteStatePort } from "../contracts/AthleteStatePort";
import { createMockCoachContextPort } from "../contracts/CoachContextPort";
import { createMockContinuousAdaptationPort } from "../contracts/ContinuousAdaptationPort";
import { createMockNutritionPlanPort } from "../contracts/NutritionPlanPort";
import { createMockNutritionRuntimePort } from "../contracts/NutritionRuntimePort";
import { NutritionAdaptationInputKinds } from "../models/NutritionAdaptationInput";
import type { NutritionAdaptationInput } from "../models/NutritionAdaptationInput";
import { EMPTY_NUTRITION_METADATA } from "../models/NutritionMetadata";
import {
  createNutritionAdaptationEngineService,
  type NutritionAdaptationEngineService,
} from "../services/NutritionAdaptationEngineService";
import { freezeInput } from "../utils/FreezeNutritionAdaptation";

export const FIXED_TIMESTAMP = "2026-07-26T12:00:00.000Z";

export function createFixedClock(ts = FIXED_TIMESTAMP): () => string {
  return () => ts;
}

export function createNutritionAdaptationInput(
  overrides: Partial<NutritionAdaptationInput> = {},
): NutritionAdaptationInput {
  return freezeInput({
    id: overrides.id ?? "request:nutrition-adaptation:test",
    kind: overrides.kind ?? NutritionAdaptationInputKinds.ADAPT,
    athleteId: overrides.athleteId ?? "athlete:1",
    planId: overrides.planId ?? "plan:1",
    sessionId: overrides.sessionId ?? "session:1",
    contextId: overrides.contextId ?? "context:1",
    planKeys:
      overrides.planKeys ??
      Object.freeze(["plan:1", "plan:structure", "plan:meal:breakfast"]),
    dayKeys: overrides.dayKeys ?? Object.freeze(["day:plan:1:1", "day:plan:1:2"]),
    mealKeys:
      overrides.mealKeys ??
      Object.freeze(["meal:plan:1:breakfast", "meal:plan:1:lunch", "meal:plan:1:dinner"]),
    macroKeys:
      overrides.macroKeys ??
      Object.freeze(["macro:plan:1:protein", "macro:plan:1:carbohydrate", "macro:plan:1:fat"]),
    timingKeys:
      overrides.timingKeys ??
      Object.freeze(["timing:plan:1:pre", "timing:plan:1:post"]),
    weekKeys:
      overrides.weekKeys ?? Object.freeze(["week:plan:1:1", "week:plan:1:2"]),
    decisionKeys:
      overrides.decisionKeys ??
      Object.freeze([
        "decision:key:athlete:1:calorie",
        "decision:key:athlete:1:macro",
        "decision:key:hydration",
      ]),
    signalKeys:
      overrides.signalKeys ??
      Object.freeze(["state:adherence", "state:hydration", "state:recovery"]),
    signalFlags:
      overrides.signalFlags ??
      Object.freeze({
        "calorie:flag": true,
        "macro:flag": true,
        "hydration:flag": true,
      }),
    priorSnapshot: overrides.priorSnapshot ?? null,
    decisionRef: overrides.decisionRef ?? null,
    planRef: overrides.planRef ?? null,
    runtimeRef: overrides.runtimeRef ?? null,
    athleteStateRef: overrides.athleteStateRef ?? null,
    coachContextRef: overrides.coachContextRef ?? null,
    reason: overrides.reason ?? "test",
    metadata: overrides.metadata ?? EMPTY_NUTRITION_METADATA,
    createdAt: overrides.createdAt ?? FIXED_TIMESTAMP,
  });
}

export function createTestNutritionAdaptationEngineService(
  overrides: {
    readonly clock?: () => string;
    readonly withMocks?: boolean;
  } = {},
): NutritionAdaptationEngineService {
  const withMocks = overrides.withMocks ?? true;
  return createNutritionAdaptationEngineService({
    nutritionPlanPort: withMocks ? createMockNutritionPlanPort() : undefined,
    nutritionRuntimePort: withMocks ? createMockNutritionRuntimePort() : undefined,
    athleteStatePort: withMocks ? createMockAthleteStatePort() : undefined,
    continuousAdaptationPort: withMocks ? createMockContinuousAdaptationPort() : undefined,
    coachContextPort: withMocks ? createMockCoachContextPort() : undefined,
    clock: overrides.clock ?? createFixedClock(),
  });
}
`,
);

write(
  "testSupport/index.ts",
  `export * from "./fixtures";
`,
);

write(
  "index.ts",
  `/**
 * Nutrition Adaptation Engine
 *
 * Sprint 24.2 — Nutrition Adaptation Engine Foundation.
 *
 * Nutrition Plan + Nutrition Runtime + Athlete State +
 * Continuous Adaptation Decision + Coach Context
 *   ↓
 * Nutrition Adaptation Engine
 *   ↓
 * Updated Nutrition Plan → Nutrition Runtime
 *
 * Adapts an existing nutrition plan according to adaptation decisions.
 * Does NOT generate nutrition from scratch. Does NOT change athlete goals.
 *
 * No AI. No heuristics. No prediction. No persistence. No networking. No UI.
 * No OpenAI SDK. No Prompt Builder. No Tool Runtime. No Action Engine.
 * No business calculations that invent prescriptions.
 *
 * Public surface: models + application API + NutritionAdaptationEngineService.
 * Internal layers (evaluation / planning / adapters / policies / etc.) are not exported.
 */

export * from "./models";
export {
  adaptNutrition,
  compareNutrition,
  describeNutritionAdaptation,
  createNutritionSnapshot,
  validateNutritionAdaptation,
} from "./application";
export {
  NutritionAdaptationEngineService,
  createNutritionAdaptationEngineService,
} from "./services";
`,
);

console.log(`Wrote ${fileCount} files to ${ROOT}`);
