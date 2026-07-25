import { adaptSleep } from "../application/SleepAdapter";
import { adaptDeload } from "../application/DeloadAdapter";
import { adaptStress } from "../application/StressAdapter";
import { adaptReadiness } from "../application/ReadinessAdapter";
import { adaptRecoveryDay } from "../application/RecoveryDayAdapter";
import { adaptCardio } from "../application/CardioAdapter";
import { adaptStretching } from "../application/StretchingAdapter";
import { adaptMobility } from "../application/MobilityAdapter";
import { buildRecoveryDescriptor } from "../builders/DescriptorBuilder";
import { buildRecoveryAdaptation } from "../builders/RecoveryAdaptationBuilder";
import { buildRecoveryPackage } from "../builders/RecoveryPackageBuilder";
import { buildRecoverySnapshot } from "../builders/RecoverySnapshotBuilder";
import { buildRecoverySummary } from "../builders/RecoverySummaryBuilder";
import { buildRecoveryResult } from "../builders/ResultBuilder";
import { compareRecoveryPlans } from "../comparison/RecoveryPlanComparator";
import type { AthleteStatePort } from "../contracts/AthleteStatePort";
import type { CoachContextPort } from "../contracts/CoachContextPort";
import type { ContinuousAdaptationPort } from "../contracts/ContinuousAdaptationPort";
import type { RecoveryPlanPort } from "../contracts/RecoveryPlanPort";
import type { RecoveryRuntimePort } from "../contracts/RecoveryRuntimePort";
import { evaluateRecoverySignals } from "../evaluation";
import { EMPTY_RECOVERY_METADATA } from "../models/RecoveryMetadata";
import type { RecoveryAdaptationInput } from "../models/RecoveryAdaptationInput";
import { RecoverySessionStatuses } from "../models/RecoveryAdaptationState";
import { createRecoveryError, RecoveryErrorCodes } from "../models/RecoveryError";
import type { RecoveryHistory } from "../models/RecoveryHistory";
import { RecoveryOperationKinds } from "../models/RecoveryResult";
import type { RecoveryResult } from "../models/RecoveryResult";
import type { RecoveryRuntimeInput } from "../models/RecoveryRuntimeInput";
import type { RecoveryTimeline } from "../models/RecoveryTimeline";
import type { UpdatedRecoveryPlan } from "../models/UpdatedRecoveryPlan";
import { applySleepPolicy } from "../policies/SleepPolicy";
import { applyConsistencyPolicy } from "../policies/ConsistencyPolicy";
import { applyFatiguePolicy } from "../policies/FatiguePolicy";
import { applyRecoveryAdaptationPolicy } from "../policies/RecoveryAdaptationPolicy";
import { applyRecoveryPolicy } from "../policies/RecoveryPolicy";
import { applySafetyPolicy } from "../policies/SafetyPolicy";
import { planRecoveryAdaptation } from "../planning";
import {
  collectPresentSignalKeys,
  uniqueSorted,
} from "../utils/RecoveryAdaptationHelpers";
import { buildStatistics } from "../utils/StatisticsHelpers";
import {
  freezeHistory,
  freezeRuntimeInput,
  freezeTimeline,
  freezeUpdatedPlan,
} from "../utils/FreezeRecoveryAdaptation";
import { validateRecoveryPackage } from "../validators";
import {
  createRecoveryAdaptationSession,
  type RecoveryAdaptationSession,
} from "./RecoveryAdaptationSession";

export interface RecoveryAdaptationCoordinatorDeps {
  readonly recoveryPlanPort?: RecoveryPlanPort;
  readonly recoveryRuntimePort?: RecoveryRuntimePort;
  readonly athleteStatePort?: AthleteStatePort;
  readonly continuousAdaptationPort?: ContinuousAdaptationPort;
  readonly coachContextPort?: CoachContextPort;
  readonly clock?: () => string;
  readonly runtimeId?: string;
}

export class RecoveryAdaptationCoordinator {
  private readonly recoveryPlanPort: RecoveryPlanPort | undefined;
  private readonly recoveryRuntimePort: RecoveryRuntimePort | undefined;
  private readonly athleteStatePort: AthleteStatePort | undefined;
  private readonly continuousAdaptationPort: ContinuousAdaptationPort | undefined;
  private readonly coachContextPort: CoachContextPort | undefined;
  private readonly clock: () => string;
  private readonly runtimeId: string;
  private readonly session: RecoveryAdaptationSession;

  constructor(deps: RecoveryAdaptationCoordinatorDeps = {}) {
    this.recoveryPlanPort = deps.recoveryPlanPort;
    this.recoveryRuntimePort = deps.recoveryRuntimePort;
    this.athleteStatePort = deps.athleteStatePort;
    this.continuousAdaptationPort = deps.continuousAdaptationPort;
    this.coachContextPort = deps.coachContextPort;
    this.clock = deps.clock ?? (() => new Date().toISOString());
    this.runtimeId = deps.runtimeId ?? "runtime:recovery-adaptation";
    this.session = createRecoveryAdaptationSession(this.clock());
  }

  describe(): RecoveryResult {
    const at = this.clock();
    return buildRecoveryResult({
      id: `result:describe:${this.runtimeId}`,
      operation: RecoveryOperationKinds.DESCRIBE,
      success: true,
      descriptor: buildRecoveryDescriptor({ id: this.runtimeId, createdAt: at }),
      createdAt: at,
    });
  }

  adapt(input: RecoveryAdaptationInput): RecoveryResult {
    return this.run(input, RecoveryOperationKinds.ADAPT);
  }

  compare(input: RecoveryAdaptationInput): RecoveryResult {
    const at = this.clock();
    const built = this.run(input, RecoveryOperationKinds.ADAPT);
    if (!built.success || !built.package) {
      return buildRecoveryResult({
        id: `result:compare:error:${input.id}`,
        operation: RecoveryOperationKinds.COMPARE,
        success: false,
        errors: built.errors.length
          ? built.errors
          : [createRecoveryError(RecoveryErrorCodes.MISSING_INPUT, "Adapt path failed for compare")],
        createdAt: at,
      });
    }
    const beforeKeys = input.priorSnapshot?.planKeys ?? input.planKeys;
    const afterKeys = built.updatedPlan
      ? uniqueSorted([
          built.updatedPlan.id,
          ...built.updatedPlan.sleepKeys,
          ...built.updatedPlan.protocolKeys,
          ...built.updatedPlan.weekKeys,
        ])
      : input.planKeys;
    const comparison = compareRecoveryPlans({
      id: input.id,
      athleteId: input.athleteId,
      planId: input.planId,
      beforeKeys,
      afterKeys,
      at,
    });
    return buildRecoveryResult({
      id: `result:compare:${input.id}`,
      operation: RecoveryOperationKinds.COMPARE,
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

  snapshot(input: RecoveryAdaptationInput): RecoveryResult {
    const at = this.clock();
    const built = this.run(input, RecoveryOperationKinds.ADAPT);
    if (!built.success || !built.snapshot) return built;
    return buildRecoveryResult({
      id: `result:snapshot:${input.id}`,
      operation: RecoveryOperationKinds.SNAPSHOT,
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

  validate(input: RecoveryAdaptationInput): RecoveryResult {
    const at = this.clock();
    const pkg = this.session.getPackage() ?? this.run(input, RecoveryOperationKinds.ADAPT).package;
    if (!pkg) {
      return buildRecoveryResult({
        id: `result:validate:error:${input.id}`,
        operation: RecoveryOperationKinds.VALIDATE,
        success: false,
        errors: [
          createRecoveryError(RecoveryErrorCodes.MISSING_INPUT, "No package to validate"),
        ],
        createdAt: at,
      });
    }
    const validation = validateRecoveryPackage(pkg);
    return buildRecoveryResult({
      id: `result:validate:${input.id}`,
      operation: RecoveryOperationKinds.VALIDATE,
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
    input: RecoveryAdaptationInput,
    operation: (typeof RecoveryOperationKinds)[keyof typeof RecoveryOperationKinds],
  ): RecoveryResult {
    const at = this.clock();
    if (!input.athleteId) {
      return buildRecoveryResult({
        id: `result:${operation}:error:${input.id}`,
        operation,
        success: false,
        errors: [
          createRecoveryError(RecoveryErrorCodes.MISSING_ATHLETE, "Athlete id required"),
        ],
        createdAt: at,
      });
    }
    if (!input.planId) {
      return buildRecoveryResult({
        id: `result:${operation}:error:${input.id}`,
        operation,
        success: false,
        errors: [
          createRecoveryError(
            RecoveryErrorCodes.MISSING_PLAN,
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

    if (resolved.planKeys.length === 0 && resolved.sleepKeys.length === 0) {
      return buildRecoveryResult({
        id: `result:${operation}:error:${input.id}`,
        operation,
        success: false,
        errors: [
          createRecoveryError(
            RecoveryErrorCodes.EMPTY_PLAN,
            "Adapt requires existing plan keys — no generation from empty plan",
            input.planId,
          ),
        ],
        createdAt: at,
      });
    }

    const signalKeys = collectPresentSignalKeys(resolved.input);
    const evaluation = evaluateRecoverySignals(signalKeys);
    void evaluation;

    const plans = planRecoveryAdaptation({
      id: input.id,
      decisionKeys: resolved.decisionKeys,
      signalKeys,
      planKeys: resolved.planKeys,
      sleepKeys: resolved.sleepKeys,
      protocolKeys: resolved.protocolKeys,
      mobilityKeys: resolved.mobilityKeys,
      weekKeys: resolved.weekKeys,
    });

    const adapterInput = {
      id: input.id,
      decisionKeys: resolved.decisionKeys,
      planStepKeys: uniqueSorted([
        ...plans.recovery.stepKeys,
        ...plans.day.stepKeys,
        ...plans.week.stepKeys,
      ]),
      targetKeys: uniqueSorted([
        ...plans.recovery.targetKeys,
        ...plans.day.targetKeys,
        ...plans.protocol.targetKeys,
        ...plans.timing.targetKeys,
        ...plans.week.targetKeys,
      ]),
      at,
    };

    const recoveryDayAdjustments = adaptRecoveryDay(adapterInput);
    const sleepAdjustments = adaptSleep(adapterInput);
    const readinessAdjustments = adaptReadiness(adapterInput);
    const mobilityAdjustments = adaptMobility(adapterInput);
    const stressAdjustments = adaptStress(adapterInput);
    const stretchingAdjustments = adaptStretching(adapterInput);
    const deloadAdjustments = adaptCardio(adapterInput);
    const recoveryProtocolAdjustments = adaptDeload(adapterInput);

    const adaptation = buildRecoveryAdaptation({
      id: `recovery-adaptation:${input.id}`,
      athleteId: input.athleteId,
      planId: input.planId,
      contextId: input.contextId,
      decisionKeys: resolved.decisionKeys,
      signalKeys,
      recoveryDayAdjustments,
      sleepAdjustments,
      readinessAdjustments,
      mobilityAdjustments,
      stressAdjustments,
      stretchingAdjustments,
      deloadAdjustments,
      recoveryProtocolAdjustments,
      at,
    });

    const modificationIds = uniqueSorted(adaptation.modifications.map((m) => m.id));
    const updatedPlan: UpdatedRecoveryPlan = freezeUpdatedPlan({
      id: `updated-plan:${input.id}`,
      athleteId: input.athleteId,
      planId: input.planId,
      dayKeys: uniqueSorted(resolved.dayKeys),
      sleepKeys: uniqueSorted(resolved.sleepKeys),
      protocolKeys: uniqueSorted(resolved.protocolKeys),
      mobilityKeys: uniqueSorted(resolved.mobilityKeys),
      weekKeys: uniqueSorted(resolved.weekKeys),
      modificationIds,
      metadata: EMPTY_RECOVERY_METADATA,
      createdAt: at,
    });

    const runtimeInput: RecoveryRuntimeInput = freezeRuntimeInput({
      id: `runtime-input:${input.id}`,
      athleteId: input.athleteId,
      planId: input.planId,
      updatedPlanId: updatedPlan.id,
      sleepKeys: updatedPlan.sleepKeys,
      protocolKeys: updatedPlan.protocolKeys,
      modificationIds,
      metadata: EMPTY_RECOVERY_METADATA,
      createdAt: at,
    });

    const summary = buildRecoverySummary({
      id: `summary:${input.id}`,
      athleteId: input.athleteId,
      planId: input.planId,
      contextId: input.contextId,
      adaptation,
      at,
    });

    const snapshot = buildRecoverySnapshot({
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
      ...updatedPlan.sleepKeys,
      ...updatedPlan.protocolKeys,
      ...updatedPlan.weekKeys,
    ]);
    const comparison = compareRecoveryPlans({
      id: input.id,
      athleteId: input.athleteId,
      planId: input.planId,
      beforeKeys,
      afterKeys,
      at,
    });

    const timeline: RecoveryTimeline = freezeTimeline({
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
      metadata: EMPTY_RECOVERY_METADATA,
      createdAt: at,
    });

    const history: RecoveryHistory = freezeHistory({
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
      metadata: EMPTY_RECOVERY_METADATA,
      createdAt: at,
    });

    const pkg = buildRecoveryPackage({
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
      ...applyRecoveryAdaptationPolicy(adaptation),
      ...applySafetyPolicy(pkg),
      ...applyRecoveryPolicy(adaptation),
      ...applyConsistencyPolicy(adaptation),
      ...applyFatiguePolicy(adaptation),
      ...applySleepPolicy(adaptation),
    ]);
    if (policyErrors.length > 0) {
      return buildRecoveryResult({
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

    const validation = validateRecoveryPackage(pkg);
    if (!validation.valid) {
      return buildRecoveryResult({
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

    this.session.put(pkg, RecoverySessionStatuses.READY);

    return buildRecoveryResult({
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

  private resolveInputs(input: RecoveryAdaptationInput, at: string) {
    let planKeys = input.planKeys;
    let sleepKeys = input.sleepKeys;
    let protocolKeys = input.protocolKeys;
    let mobilityKeys = input.mobilityKeys;
    let weekKeys = input.weekKeys;
    let dayKeys = input.dayKeys;
    let decisionKeys = input.decisionKeys;
    let signalKeys = input.signalKeys;

    if (this.recoveryPlanPort && input.planId) {
      if (planKeys.length === 0) {
        planKeys = this.recoveryPlanPort.loadPlanKeys({
          athleteId: input.athleteId,
          planId: input.planId,
          at,
        });
      }
      if (sleepKeys.length === 0) {
        sleepKeys = this.recoveryPlanPort.loadSleepKeys({
          athleteId: input.athleteId,
          planId: input.planId,
          at,
        });
      }
      if (protocolKeys.length === 0) {
        protocolKeys = this.recoveryPlanPort.loadProtocolKeys({
          athleteId: input.athleteId,
          planId: input.planId,
          at,
        });
      }
      if (mobilityKeys.length === 0) {
        mobilityKeys = this.recoveryPlanPort.loadMobilityKeys({
          athleteId: input.athleteId,
          planId: input.planId,
          at,
        });
      }
      if (weekKeys.length === 0) {
        weekKeys = this.recoveryPlanPort.loadWeekKeys({
          athleteId: input.athleteId,
          planId: input.planId,
          at,
        });
      }
      if (dayKeys.length === 0) {
        dayKeys = this.recoveryPlanPort.loadDayKeys({
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

    if (this.recoveryRuntimePort && input.runtimeRef) {
      void this.recoveryRuntimePort.loadRuntimeKeys({
        athleteId: input.athleteId,
        runtimeId: input.runtimeRef.runtimeId,
        at,
      });
    }

    const resolvedInput: RecoveryAdaptationInput = Object.freeze({
      ...input,
      planKeys: Object.freeze([...planKeys]),
      sleepKeys: Object.freeze([...sleepKeys]),
      protocolKeys: Object.freeze([...protocolKeys]),
      mobilityKeys: Object.freeze([...mobilityKeys]),
      weekKeys: Object.freeze([...weekKeys]),
      dayKeys: Object.freeze([...dayKeys]),
      decisionKeys: Object.freeze([...decisionKeys]),
      signalKeys: Object.freeze([...signalKeys]),
      signalFlags: Object.freeze(mergedFlags),
    });

    return {
      input: resolvedInput,
      planKeys,
      sleepKeys,
      protocolKeys,
      mobilityKeys,
      weekKeys,
      dayKeys,
      decisionKeys,
      signalKeys,
    };
  }
}

export function createRecoveryAdaptationCoordinator(
  deps: RecoveryAdaptationCoordinatorDeps = {},
): RecoveryAdaptationCoordinator {
  return new RecoveryAdaptationCoordinator(deps);
}
