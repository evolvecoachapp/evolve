import { adaptCalorie } from "../application/CalorieAdapter";
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
      id: `result:describe:${this.runtimeId}`,
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
        id: `result:compare:error:${input.id}`,
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
      id: `result:compare:${input.id}`,
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
      id: `result:snapshot:${input.id}`,
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
        id: `result:validate:error:${input.id}`,
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
      id: `result:validate:${input.id}`,
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
        id: `result:${operation}:error:${input.id}`,
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
        id: `result:${operation}:error:${input.id}`,
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
        id: `result:${operation}:error:${input.id}`,
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
      id: `nutrition-adaptation:${input.id}`,
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
      id: `updated-plan:${input.id}`,
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
      id: `runtime-input:${input.id}`,
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
      id: `summary:${input.id}`,
      athleteId: input.athleteId,
      planId: input.planId,
      contextId: input.contextId,
      adaptation,
      at,
    });

    const snapshot = buildNutritionSnapshot({
      id: `snapshot:${input.id}`,
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
      id: `timeline:${input.id}`,
      athleteId: input.athleteId,
      items: Object.freeze([
        Object.freeze({
          id: `timeline-item:${adaptation.id}`,
          adaptationId: adaptation.id,
          keys: adaptation.decisionKeys,
          createdAt: at,
        }),
      ]),
      metadata: EMPTY_NUTRITION_METADATA,
      createdAt: at,
    });

    const history: NutritionHistory = freezeHistory({
      id: `history:${input.id}`,
      athleteId: input.athleteId,
      entries: Object.freeze([
        Object.freeze({
          id: `history-entry:${adaptation.id}`,
          adaptationId: adaptation.id,
          planId: input.planId,
          keys: adaptation.signalKeys,
          createdAt: at,
        }),
      ]),
      historyKeys: Object.freeze([`history:${input.planId}`]),
      metadata: EMPTY_NUTRITION_METADATA,
      createdAt: at,
    });

    const pkg = buildNutritionPackage({
      id: `package:${input.id}`,
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
        id: `result:${operation}:error:${input.id}`,
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
        id: `result:${operation}:error:${input.id}`,
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
      id: `result:${operation}:${input.id}`,
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
      if (mergedFlags[`focus:${area}`] === undefined) mergedFlags[`focus:${area}`] = true;
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
