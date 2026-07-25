import { adaptExercise } from "../application/ExerciseAdapter";
import { adaptFrequency } from "../application/FrequencyAdapter";
import { adaptLoad } from "../application/LoadAdapter";
import { adaptRep } from "../application/RepAdapter";
import { adaptRest } from "../application/RestAdapter";
import { adaptSet } from "../application/SetAdapter";
import { adaptTempo } from "../application/TempoAdapter";
import { adaptVolume } from "../application/VolumeAdapter";
import { adaptWeek } from "../application/WeekAdapter";
import { buildWorkoutDescriptor } from "../builders/DescriptorBuilder";
import { buildWorkoutResult } from "../builders/ResultBuilder";
import { buildWorkoutAdaptation } from "../builders/WorkoutAdaptationBuilder";
import { buildWorkoutPackage } from "../builders/WorkoutPackageBuilder";
import { buildWorkoutSnapshot } from "../builders/WorkoutSnapshotBuilder";
import { buildWorkoutSummary } from "../builders/WorkoutSummaryBuilder";
import { compareBlueprints } from "../comparison/BlueprintComparator";
import type { AthleteStatePort } from "../contracts/AthleteStatePort";
import type { CoachContextPort } from "../contracts/CoachContextPort";
import type { ContinuousAdaptationPort } from "../contracts/ContinuousAdaptationPort";
import type { WorkoutBlueprintPort } from "../contracts/WorkoutBlueprintPort";
import type { WorkoutRuntimePort } from "../contracts/WorkoutRuntimePort";
import { evaluateWorkoutSignals } from "../evaluation";
import { EMPTY_WORKOUT_METADATA } from "../models/WorkoutMetadata";
import type { WorkoutAdaptationInput } from "../models/WorkoutAdaptationInput";
import { createWorkoutError, WorkoutErrorCodes } from "../models/WorkoutError";
import { WorkoutOperationKinds } from "../models/WorkoutResult";
import type { WorkoutResult } from "../models/WorkoutResult";
import type { UpdatedWorkoutBlueprint } from "../models/UpdatedWorkoutBlueprint";
import type { WorkoutRuntimeInput } from "../models/WorkoutRuntimeInput";
import type { WorkoutHistory } from "../models/WorkoutHistory";
import type { WorkoutTimeline } from "../models/WorkoutTimeline";
import { WorkoutSessionStatuses } from "../models/WorkoutAdaptationState";
import { applyConsistencyPolicy } from "../policies/ConsistencyPolicy";
import { applyProgressionPolicy } from "../policies/ProgressionPolicy";
import { applyRecoveryPolicy } from "../policies/RecoveryPolicy";
import { applyRegressionPolicy } from "../policies/RegressionPolicy";
import { applySafetyPolicy } from "../policies/SafetyPolicy";
import { applyWorkoutAdaptationPolicy } from "../policies/WorkoutAdaptationPolicy";
import { planWorkoutAdaptation } from "../planning";
import {
  collectPresentSignalKeys,
  uniqueSorted,
} from "../utils/WorkoutAdaptationHelpers";
import { buildStatistics } from "../utils/StatisticsHelpers";
import {
  freezeHistory,
  freezeRuntimeInput,
  freezeTimeline,
  freezeUpdatedBlueprint,
} from "../utils/FreezeWorkoutAdaptation";
import { validateWorkoutPackage } from "../validators";
import {
  createWorkoutAdaptationSession,
  type WorkoutAdaptationSession,
} from "./WorkoutAdaptationSession";

export interface WorkoutAdaptationCoordinatorDeps {
  readonly workoutBlueprintPort?: WorkoutBlueprintPort;
  readonly workoutRuntimePort?: WorkoutRuntimePort;
  readonly athleteStatePort?: AthleteStatePort;
  readonly continuousAdaptationPort?: ContinuousAdaptationPort;
  readonly coachContextPort?: CoachContextPort;
  readonly clock?: () => string;
  readonly runtimeId?: string;
}

export class WorkoutAdaptationCoordinator {
  private readonly workoutBlueprintPort: WorkoutBlueprintPort | undefined;
  private readonly workoutRuntimePort: WorkoutRuntimePort | undefined;
  private readonly athleteStatePort: AthleteStatePort | undefined;
  private readonly continuousAdaptationPort: ContinuousAdaptationPort | undefined;
  private readonly coachContextPort: CoachContextPort | undefined;
  private readonly clock: () => string;
  private readonly runtimeId: string;
  private readonly session: WorkoutAdaptationSession;

  constructor(deps: WorkoutAdaptationCoordinatorDeps = {}) {
    this.workoutBlueprintPort = deps.workoutBlueprintPort;
    this.workoutRuntimePort = deps.workoutRuntimePort;
    this.athleteStatePort = deps.athleteStatePort;
    this.continuousAdaptationPort = deps.continuousAdaptationPort;
    this.coachContextPort = deps.coachContextPort;
    this.clock = deps.clock ?? (() => new Date().toISOString());
    this.runtimeId = deps.runtimeId ?? "runtime:workout-adaptation";
    this.session = createWorkoutAdaptationSession(this.clock());
  }

  describe(): WorkoutResult {
    const at = this.clock();
    return buildWorkoutResult({
      id: `result:describe:${this.runtimeId}`,
      operation: WorkoutOperationKinds.DESCRIBE,
      success: true,
      descriptor: buildWorkoutDescriptor({ id: this.runtimeId, createdAt: at }),
      createdAt: at,
    });
  }

  adapt(input: WorkoutAdaptationInput): WorkoutResult {
    return this.run(input, WorkoutOperationKinds.ADAPT);
  }

  compare(input: WorkoutAdaptationInput): WorkoutResult {
    const at = this.clock();
    const built = this.run(input, WorkoutOperationKinds.ADAPT);
    if (!built.success || !built.package) {
      return buildWorkoutResult({
        id: `result:compare:error:${input.id}`,
        operation: WorkoutOperationKinds.COMPARE,
        success: false,
        errors: built.errors.length
          ? built.errors
          : [createWorkoutError(WorkoutErrorCodes.MISSING_INPUT, "Adapt path failed for compare")],
        createdAt: at,
      });
    }
    const beforeKeys = input.priorSnapshot?.blueprintKeys ?? input.blueprintKeys;
    const afterKeys = built.updatedBlueprint
      ? uniqueSorted([
          built.updatedBlueprint.id,
          ...built.updatedBlueprint.exerciseKeys,
          ...built.updatedBlueprint.sessionKeys,
          ...built.updatedBlueprint.weekKeys,
        ])
      : input.blueprintKeys;
    const comparison = compareBlueprints({
      id: input.id,
      athleteId: input.athleteId,
      blueprintId: input.blueprintId,
      beforeKeys,
      afterKeys,
      at,
    });
    return buildWorkoutResult({
      id: `result:compare:${input.id}`,
      operation: WorkoutOperationKinds.COMPARE,
      success: true,
      adaptation: built.adaptation,
      updatedBlueprint: built.updatedBlueprint,
      runtimeInput: built.runtimeInput,
      package: built.package,
      summary: built.summary,
      snapshot: built.snapshot,
      comparison,
      createdAt: at,
    });
  }

  snapshot(input: WorkoutAdaptationInput): WorkoutResult {
    const at = this.clock();
    const built = this.run(input, WorkoutOperationKinds.ADAPT);
    if (!built.success || !built.snapshot) return built;
    return buildWorkoutResult({
      id: `result:snapshot:${input.id}`,
      operation: WorkoutOperationKinds.SNAPSHOT,
      success: true,
      adaptation: built.adaptation,
      updatedBlueprint: built.updatedBlueprint,
      runtimeInput: built.runtimeInput,
      package: built.package,
      summary: built.summary,
      snapshot: built.snapshot,
      comparison: built.comparison,
      createdAt: at,
    });
  }

  validate(input: WorkoutAdaptationInput): WorkoutResult {
    const at = this.clock();
    const pkg = this.session.getPackage() ?? this.run(input, WorkoutOperationKinds.ADAPT).package;
    if (!pkg) {
      return buildWorkoutResult({
        id: `result:validate:error:${input.id}`,
        operation: WorkoutOperationKinds.VALIDATE,
        success: false,
        errors: [
          createWorkoutError(WorkoutErrorCodes.MISSING_INPUT, "No package to validate"),
        ],
        createdAt: at,
      });
    }
    const validation = validateWorkoutPackage(pkg);
    return buildWorkoutResult({
      id: `result:validate:${input.id}`,
      operation: WorkoutOperationKinds.VALIDATE,
      success: validation.valid,
      adaptation: pkg.adaptation,
      updatedBlueprint: pkg.updatedBlueprint,
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
    input: WorkoutAdaptationInput,
    operation: (typeof WorkoutOperationKinds)[keyof typeof WorkoutOperationKinds],
  ): WorkoutResult {
    const at = this.clock();
    if (!input.athleteId) {
      return buildWorkoutResult({
        id: `result:${operation}:error:${input.id}`,
        operation,
        success: false,
        errors: [
          createWorkoutError(WorkoutErrorCodes.MISSING_ATHLETE, "Athlete id required"),
        ],
        createdAt: at,
      });
    }
    if (!input.blueprintId) {
      return buildWorkoutResult({
        id: `result:${operation}:error:${input.id}`,
        operation,
        success: false,
        errors: [
          createWorkoutError(
            WorkoutErrorCodes.MISSING_BLUEPRINT,
            "Existing blueprint id required — no generation from scratch",
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

    if (resolved.blueprintKeys.length === 0 && resolved.exerciseKeys.length === 0) {
      return buildWorkoutResult({
        id: `result:${operation}:error:${input.id}`,
        operation,
        success: false,
        errors: [
          createWorkoutError(
            WorkoutErrorCodes.EMPTY_BLUEPRINT,
            "Adapt requires existing blueprint keys — no generation from empty blueprint",
            input.blueprintId,
          ),
        ],
        createdAt: at,
      });
    }

    const signalKeys = collectPresentSignalKeys(resolved.input);
    const evaluation = evaluateWorkoutSignals(signalKeys);
    void evaluation;

    const plans = planWorkoutAdaptation({
      id: input.id,
      decisionKeys: resolved.decisionKeys,
      signalKeys,
      blueprintKeys: resolved.blueprintKeys,
      exerciseKeys: resolved.exerciseKeys,
      sessionKeys: resolved.sessionKeys,
      weekKeys: resolved.weekKeys,
    });

    const adapterInput = {
      id: input.id,
      decisionKeys: resolved.decisionKeys,
      planStepKeys: uniqueSorted([
        ...plans.workout.stepKeys,
        ...plans.exercise.stepKeys,
        ...plans.week.stepKeys,
      ]),
      targetKeys: uniqueSorted([
        ...plans.workout.targetKeys,
        ...plans.exercise.targetKeys,
        ...plans.week.targetKeys,
        ...plans.session.targetKeys,
      ]),
      at,
    };

    const exerciseAdjustments = adaptExercise(adapterInput);
    const setAdjustments = adaptSet(adapterInput);
    const repAdjustments = adaptRep(adapterInput);
    const loadAdjustments = adaptLoad(adapterInput);
    const tempoAdjustments = adaptTempo(adapterInput);
    const restAdjustments = adaptRest(adapterInput);
    const frequencyAdjustments = adaptFrequency(adapterInput);
    const volumeAdjustments = adaptVolume(adapterInput);
    const weeklyAdjustments = adaptWeek(adapterInput);

    const adaptation = buildWorkoutAdaptation({
      id: `workout-adaptation:${input.id}`,
      athleteId: input.athleteId,
      blueprintId: input.blueprintId,
      contextId: input.contextId,
      decisionKeys: resolved.decisionKeys,
      signalKeys,
      exerciseAdjustments,
      setAdjustments,
      repAdjustments,
      loadAdjustments,
      volumeAdjustments,
      restAdjustments,
      tempoAdjustments,
      frequencyAdjustments,
      weeklyAdjustments,
      at,
    });

    const modificationIds = uniqueSorted(adaptation.modifications.map((m) => m.id));
    const updatedBlueprint: UpdatedWorkoutBlueprint = freezeUpdatedBlueprint({
      id: `updated-blueprint:${input.id}`,
      athleteId: input.athleteId,
      blueprintId: input.blueprintId,
      dayKeys: uniqueSorted(resolved.dayKeys),
      exerciseKeys: uniqueSorted(resolved.exerciseKeys),
      sessionKeys: uniqueSorted(resolved.sessionKeys),
      weekKeys: uniqueSorted(resolved.weekKeys),
      modificationIds,
      metadata: EMPTY_WORKOUT_METADATA,
      createdAt: at,
    });

    const runtimeInput: WorkoutRuntimeInput = freezeRuntimeInput({
      id: `runtime-input:${input.id}`,
      athleteId: input.athleteId,
      blueprintId: input.blueprintId,
      updatedBlueprintId: updatedBlueprint.id,
      sessionKeys: updatedBlueprint.sessionKeys,
      exerciseKeys: updatedBlueprint.exerciseKeys,
      modificationIds,
      metadata: EMPTY_WORKOUT_METADATA,
      createdAt: at,
    });

    const summary = buildWorkoutSummary({
      id: `summary:${input.id}`,
      athleteId: input.athleteId,
      blueprintId: input.blueprintId,
      contextId: input.contextId,
      adaptation,
      at,
    });

    const snapshot = buildWorkoutSnapshot({
      id: `snapshot:${input.id}`,
      athleteId: input.athleteId,
      blueprintId: input.blueprintId,
      contextId: input.contextId,
      adaptation,
      updatedBlueprint,
      blueprintKeys: resolved.blueprintKeys,
      at,
    });

    const beforeKeys = input.priorSnapshot?.blueprintKeys ?? resolved.blueprintKeys;
    const afterKeys = uniqueSorted([
      updatedBlueprint.id,
      ...updatedBlueprint.exerciseKeys,
      ...updatedBlueprint.sessionKeys,
      ...updatedBlueprint.weekKeys,
    ]);
    const comparison = compareBlueprints({
      id: input.id,
      athleteId: input.athleteId,
      blueprintId: input.blueprintId,
      beforeKeys,
      afterKeys,
      at,
    });

    const timeline: WorkoutTimeline = freezeTimeline({
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
      metadata: EMPTY_WORKOUT_METADATA,
      createdAt: at,
    });

    const history: WorkoutHistory = freezeHistory({
      id: `history:${input.id}`,
      athleteId: input.athleteId,
      entries: Object.freeze([
        Object.freeze({
          id: `history-entry:${adaptation.id}`,
          adaptationId: adaptation.id,
          blueprintId: input.blueprintId,
          keys: adaptation.signalKeys,
          createdAt: at,
        }),
      ]),
      historyKeys: Object.freeze([`history:${input.blueprintId}`]),
      metadata: EMPTY_WORKOUT_METADATA,
      createdAt: at,
    });

    const pkg = buildWorkoutPackage({
      id: `package:${input.id}`,
      athleteId: input.athleteId,
      blueprintId: input.blueprintId,
      contextId: input.contextId,
      adaptation,
      updatedBlueprint,
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
      ...applyWorkoutAdaptationPolicy(adaptation),
      ...applySafetyPolicy(pkg),
      ...applyRecoveryPolicy(adaptation),
      ...applyConsistencyPolicy(adaptation),
      ...applyProgressionPolicy(adaptation),
      ...applyRegressionPolicy(adaptation),
    ]);
    if (policyErrors.length > 0) {
      return buildWorkoutResult({
        id: `result:${operation}:error:${input.id}`,
        operation,
        success: false,
        adaptation,
        updatedBlueprint,
        runtimeInput,
        package: pkg,
        errors: policyErrors,
        createdAt: at,
      });
    }

    const validation = validateWorkoutPackage(pkg);
    if (!validation.valid) {
      return buildWorkoutResult({
        id: `result:${operation}:error:${input.id}`,
        operation,
        success: false,
        adaptation,
        updatedBlueprint,
        runtimeInput,
        package: pkg,
        validation,
        errors: validation.issues,
        createdAt: at,
      });
    }

    this.session.put(pkg, WorkoutSessionStatuses.READY);

    return buildWorkoutResult({
      id: `result:${operation}:${input.id}`,
      operation,
      success: true,
      adaptation,
      updatedBlueprint,
      runtimeInput,
      package: pkg,
      summary,
      snapshot,
      comparison,
      validation,
      createdAt: at,
    });
  }

  private resolveInputs(input: WorkoutAdaptationInput, at: string) {
    let blueprintKeys = input.blueprintKeys;
    let exerciseKeys = input.exerciseKeys;
    let sessionKeys = input.sessionKeys;
    let weekKeys = input.weekKeys;
    let dayKeys = input.dayKeys;
    let decisionKeys = input.decisionKeys;
    let signalKeys = input.signalKeys;

    if (this.workoutBlueprintPort && input.blueprintId) {
      if (blueprintKeys.length === 0) {
        blueprintKeys = this.workoutBlueprintPort.loadBlueprintKeys({
          athleteId: input.athleteId,
          blueprintId: input.blueprintId,
          at,
        });
      }
      if (exerciseKeys.length === 0) {
        exerciseKeys = this.workoutBlueprintPort.loadExerciseKeys({
          athleteId: input.athleteId,
          blueprintId: input.blueprintId,
          at,
        });
      }
      if (sessionKeys.length === 0) {
        sessionKeys = this.workoutBlueprintPort.loadSessionKeys({
          athleteId: input.athleteId,
          blueprintId: input.blueprintId,
          at,
        });
      }
      if (weekKeys.length === 0) {
        weekKeys = this.workoutBlueprintPort.loadWeekKeys({
          athleteId: input.athleteId,
          blueprintId: input.blueprintId,
          at,
        });
      }
      if (dayKeys.length === 0) {
        dayKeys = this.workoutBlueprintPort.loadDayKeys({
          athleteId: input.athleteId,
          blueprintId: input.blueprintId,
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

    if (this.workoutRuntimePort && input.runtimeRef) {
      void this.workoutRuntimePort.loadRuntimeKeys({
        athleteId: input.athleteId,
        runtimeId: input.runtimeRef.runtimeId,
        at,
      });
    }

    const resolvedInput: WorkoutAdaptationInput = Object.freeze({
      ...input,
      blueprintKeys: Object.freeze([...blueprintKeys]),
      exerciseKeys: Object.freeze([...exerciseKeys]),
      sessionKeys: Object.freeze([...sessionKeys]),
      weekKeys: Object.freeze([...weekKeys]),
      dayKeys: Object.freeze([...dayKeys]),
      decisionKeys: Object.freeze([...decisionKeys]),
      signalKeys: Object.freeze([...signalKeys]),
      signalFlags: Object.freeze(mergedFlags),
    });

    return {
      input: resolvedInput,
      blueprintKeys,
      exerciseKeys,
      sessionKeys,
      weekKeys,
      dayKeys,
      decisionKeys,
      signalKeys,
    };
  }
}

export function createWorkoutAdaptationCoordinator(
  deps: WorkoutAdaptationCoordinatorDeps = {},
): WorkoutAdaptationCoordinator {
  return new WorkoutAdaptationCoordinator(deps);
}
