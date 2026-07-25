import { buildGoalProgress, categoryFromSignals } from "../builders/GoalProgressBuilder";
import { buildGoalDescriptor } from "../builders/DescriptorBuilder";
import { buildContinuousAdaptationInput } from "../builders/HandoffBuilder";
import { buildGoalPackage } from "../builders/GoalPackageBuilder";
import { buildGoalResult } from "../builders/ResultBuilder";
import { buildGoalSnapshot } from "../builders/GoalSnapshotBuilder";
import { buildGoalSummary } from "../builders/GoalSummaryBuilder";
import { compareSnapshots } from "../comparison/SnapshotComparator";
import type { AthleteStatePort } from "../contracts/AthleteStatePort";
import type { DecisionEnginePort } from "../contracts/DecisionEnginePort";
import type { NutritionAdaptationPort } from "../contracts/NutritionAdaptationPort";
import type { RecommendationEnginePort } from "../contracts/RecommendationEnginePort";
import type { RecoveryAdaptationPort } from "../contracts/RecoveryAdaptationPort";
import type { WorkoutAdaptationPort } from "../contracts/WorkoutAdaptationPort";
import { evaluateAdherence } from "../evaluation/AdherenceEvaluator";
import { evaluateBodyCompositionRegression } from "../evaluation/BodyCompositionRegressionEvaluator";
import { evaluateConsistencySignal } from "../evaluation/ConsistencySignalEvaluator";
import { evaluateMilestone } from "../evaluation/MilestoneEvaluator";
import { evaluatePerformanceTrend } from "../evaluation/PerformanceTrendEvaluator";
import { evaluateRecoverySignal } from "../evaluation/RecoverySignalEvaluator";
import { evaluateStrengthPlateau } from "../evaluation/StrengthPlateauEvaluator";
import { evaluateGoalSignals } from "../evaluation/StrengthGoalEvaluator";
import type { CoachingDecision } from "../../decision-engine/models/CoachingDecision";
import type { CoachingRecommendation } from "../../recommendation-engine/models/CoachingRecommendation";
import { createGoalError, GoalErrorCodes } from "../models/GoalError";
import type { GoalAchievement } from "../models/GoalAchievement";
import type { GoalCheckpoint } from "../models/GoalCheckpoint";
import type { GoalMilestone } from "../models/GoalMilestone";
import type { GoalProgressInput } from "../models/GoalProgressInput";
import { GoalOperationKinds } from "../models/GoalResult";
import type { GoalResult } from "../models/GoalResult";
import { GoalSessionStatuses } from "../models/GoalProgressState";
import { applyConsistencyPolicy } from "../policies/ConsistencyPolicy";
import { applyGoalProgressPolicy } from "../policies/GoalProgressPolicy";
import { applyMilestonePolicy } from "../policies/MilestonePolicy";
import { applySafetyPolicy } from "../policies/SafetyPolicy";
import { applyTrackingPolicy } from "../policies/TrackingPolicy";
import { trackAchievement } from "../tracking/AchievementTracker";
import { trackAdherence } from "../tracking/AdherenceTracker";
import { trackConsistency } from "../tracking/ConsistencyTracker";
import { trackGoal } from "../tracking/GoalTracker";
import { trackHistory } from "../tracking/HistoryTracker";
import { trackMilestone } from "../tracking/MilestoneTracker";
import { trackNutritionAdherence } from "../tracking/NutritionAdherenceTracker";
import { trackTimelineHistory } from "../tracking/TimelineHistoryTracker";
import { buildGoalHistory } from "../timeline/HistoryTimelineBuilder";
import { buildGoalTimeline } from "../timeline/GoalTimelineBuilder";
import { buildGoalTrend } from "../timeline/WindowBuilder";
import { collectPresentSignalKeys, uniqueSorted } from "../utils/GoalHelpers";
import { buildStatistics } from "../utils/StatisticsHelpers";
import { validateGoalPackage } from "../validators";
import { createGoalProgressSession, type GoalProgressSession } from "./GoalProgressSession";

export interface GoalProgressCoordinatorDeps {
  readonly decisionEnginePort?: DecisionEnginePort;
  readonly recommendationEnginePort?: RecommendationEnginePort;
  readonly workoutAdaptationPort?: WorkoutAdaptationPort;
  readonly nutritionAdaptationPort?: NutritionAdaptationPort;
  readonly recoveryAdaptationPort?: RecoveryAdaptationPort;
  readonly athleteStatePort?: AthleteStatePort;
  readonly clock?: () => string;
  readonly runtimeId?: string;
}

export class GoalProgressCoordinator {
  private readonly decisionEnginePort: DecisionEnginePort | undefined;
  private readonly recommendationEnginePort: RecommendationEnginePort | undefined;
  private readonly workoutAdaptationPort: WorkoutAdaptationPort | undefined;
  private readonly nutritionAdaptationPort: NutritionAdaptationPort | undefined;
  private readonly recoveryAdaptationPort: RecoveryAdaptationPort | undefined;
  private readonly athleteStatePort: AthleteStatePort | undefined;
  private readonly clock: () => string;
  private readonly runtimeId: string;
  private readonly session: GoalProgressSession;

  constructor(deps: GoalProgressCoordinatorDeps = {}) {
    this.decisionEnginePort = deps.decisionEnginePort;
    this.recommendationEnginePort = deps.recommendationEnginePort;
    this.workoutAdaptationPort = deps.workoutAdaptationPort;
    this.nutritionAdaptationPort = deps.nutritionAdaptationPort;
    this.recoveryAdaptationPort = deps.recoveryAdaptationPort;
    this.athleteStatePort = deps.athleteStatePort;
    this.clock = deps.clock ?? (() => new Date().toISOString());
    this.runtimeId = deps.runtimeId ?? "runtime:goal-progress";
    this.session = createGoalProgressSession(this.clock());
  }

  describe(): GoalResult {
    const at = this.clock();
    return buildGoalResult({
      id: `result:describe:${this.runtimeId}`,
      operation: GoalOperationKinds.DESCRIBE,
      success: true,
      descriptor: buildGoalDescriptor({ id: this.runtimeId, createdAt: at }),
      createdAt: at,
    });
  }

  evaluate(input: GoalProgressInput): GoalResult {
    return this.run(input, GoalOperationKinds.EVALUATE);
  }

  track(input: GoalProgressInput): GoalResult {
    return this.run(input, GoalOperationKinds.TRACK);
  }

  /** @deprecated Use track() */
  detect(input: GoalProgressInput): GoalResult {
    return this.track(input);
  }

  snapshot(input: GoalProgressInput): GoalResult {
    const at = this.clock();
    const built = this.run(input, GoalOperationKinds.EVALUATE);
    if (!built.success || !built.snapshot) return built;
    return buildGoalResult({
      id: `result:snapshot:${input.id}`,
      operation: GoalOperationKinds.SNAPSHOT,
      success: true,
      decisions: built.decisions,
      snapshot: built.snapshot,
      package: built.package,
      summary: built.summary,
      continuousAdaptationInput: built.continuousAdaptationInput,
      createdAt: at,
    });
  }

  validate(input: GoalProgressInput): GoalResult {
    const at = this.clock();
    const pkg = this.session.getPackage() ?? this.run(input, GoalOperationKinds.EVALUATE).package;
    if (!pkg) {
      return buildGoalResult({
        id: `result:validate:error:${input.id}`,
        operation: GoalOperationKinds.VALIDATE,
        success: false,
        errors: [
          createGoalError(GoalErrorCodes.MISSING_INPUT, "No package to validate"),
        ],
        createdAt: at,
      });
    }
    const validation = validateGoalPackage(pkg);
    return buildGoalResult({
      id: `result:validate:${input.id}`,
      operation: GoalOperationKinds.VALIDATE,
      success: validation.valid,
      decisions: pkg.decisions,
      package: pkg,
      validation,
      errors: validation.valid ? Object.freeze([]) : validation.issues,
      createdAt: at,
    });
  }

  private run(
    input: GoalProgressInput,
    operation: (typeof GoalOperationKinds)[keyof typeof GoalOperationKinds],
  ): GoalResult {
    const at = this.clock();
    if (!input.athleteId) {
      return buildGoalResult({
        id: `result:${operation}:error:${input.id}`,
        operation,
        success: false,
        errors: [
          createGoalError(GoalErrorCodes.MISSING_ATHLETE, "Athlete id required"),
        ],
        createdAt: at,
      });
    }

    const trackingErrors = applyTrackingPolicy(input);
    if (trackingErrors.length > 0) {
      return buildGoalResult({
        id: `result:${operation}:error:${input.id}`,
        operation,
        success: false,
        errors: trackingErrors,
        createdAt: at,
      });
    }

    const resolved = this.resolveInputs(input, at);
    const steps: string[] = [
      "resolve_upstream",
      "track",
      "evaluate",
      "compare",
      "timeline",
      "build",
      "policy",
      "validate",
      "freeze",
    ];

    const observations = Object.freeze([
      trackConsistency(resolved.input, at),
      trackMilestone(resolved.input, at),
      trackAchievement(resolved.input, at),
      trackNutritionAdherence(resolved.input, at),
      trackGoal(resolved.input, at),
      trackAdherence(resolved.input, at),
      trackHistory(resolved.input, at),
      trackTimelineHistory(resolved.input, at),
    ]);

    const evaluations = [
      evaluateStrengthPlateau(resolved.input),
      evaluateBodyCompositionRegression(resolved.input),
      evaluateMilestone(resolved.input),
      evaluateRecoverySignal(resolved.input),
      evaluateConsistencySignal(resolved.input),
      evaluateAdherence(resolved.input),
      evaluatePerformanceTrend(resolved.input),
    ];
    const triggers: GoalAchievement[] = [];
    const candidates: GoalCheckpoint[] = [];
    const opportunities: GoalMilestone[] = [];
    for (const d of evaluations) {
      triggers.push(...d.triggers);
      candidates.push(...d.candidates);
      opportunities.push(...d.opportunities);
    }
    const frozenTriggers = Object.freeze(triggers);
    const frozenCandidates = Object.freeze(candidates);
    const frozenOpportunities = Object.freeze(opportunities);

    const milestoneErrors = applyMilestonePolicy(frozenTriggers);
    if (milestoneErrors.length > 0) {
      return buildGoalResult({
        id: `result:${operation}:error:${input.id}`,
        operation,
        success: false,
        errors: milestoneErrors,
        createdAt: at,
      });
    }

    const signalKeys = collectPresentSignalKeys(resolved.input);
    const category = categoryFromSignals(signalKeys);
    const evaluation = evaluateGoalSignals({
      subjectId: input.athleteId,
      triggers: frozenTriggers,
      candidates: frozenCandidates,
      opportunities: frozenOpportunities,
      dependencyFromIds: resolved.decisions.map((d) => d.id),
    });

    const decision = buildGoalProgress({
      id: `goal-progress:${input.id}`,
      athleteId: input.athleteId,
      sessionId: input.sessionId,
      conversationId: input.conversationId,
      contextId: input.contextId,
      category,
      triggers: frozenTriggers,
      candidates: frozenCandidates,
      opportunities: frozenOpportunities,
      evaluation: {
        ...evaluation,
        id: `eval:goal-progress:${input.id}`,
        subjectId: `goal-progress:${input.id}`,
      },
      sourceKeys: uniqueSorted([
        ...resolved.decisions.map((d) => d.id),
        ...resolved.recommendations.map((r) => r.id),
        ...resolved.workoutKeys,
        ...resolved.nutritionKeys,
        ...resolved.recoveryKeys,
        ...observations.map((o) => o.id),
      ]),
      at,
    });
    const decisions = Object.freeze([decision]);

    const summary = buildGoalSummary({
      id: `summary:${input.id}`,
      athleteId: input.athleteId,
      contextId: input.contextId,
      decisions,
      at,
    });
    const snapshot = buildGoalSnapshot({
      id: `snapshot:${input.id}`,
      athleteId: input.athleteId,
      contextId: input.contextId,
      decisions,
      summary,
      at,
    });
    void compareSnapshots(input.priorSnapshot, snapshot);

    const timeline = buildGoalTimeline({
      id: `timeline:${input.id}`,
      athleteId: input.athleteId,
      decisions,
      at,
    });
    const history = buildGoalHistory({
      id: `history:${input.id}`,
      athleteId: input.athleteId,
      decisions,
      historyKeys: resolved.input.historyKeys,
      at,
    });
    const window = buildGoalTrend({
      id: `window:${input.id}`,
      timeline,
      startAt: at,
      endAt: at,
    });

    const continuousAdaptationInput = buildContinuousAdaptationInput({
      athleteId: input.athleteId,
      contextId: input.contextId,
      decisions,
      at,
    });

    const pkg = buildGoalPackage({
      id: `package:${input.id}`,
      athleteId: input.athleteId,
      contextId: input.contextId,
      decisions,
      summary,
      snapshot,
      timeline,
      history,
      window,
      statistics: buildStatistics(decisions),
      processingSteps: steps,
      continuousAdaptationInput,
      at,
    });

    const policyErrors = Object.freeze([
      ...applyGoalProgressPolicy(decisions),
      ...applyConsistencyPolicy(decisions),
      ...applySafetyPolicy(pkg),
    ]);
    if (policyErrors.length > 0) {
      return buildGoalResult({
        id: `result:${operation}:error:${input.id}`,
        operation,
        success: false,
        decisions,
        package: pkg,
        errors: policyErrors,
        createdAt: at,
      });
    }

    const validation = validateGoalPackage(pkg);
    if (!validation.valid) {
      return buildGoalResult({
        id: `result:${operation}:error:${input.id}`,
        operation,
        success: false,
        decisions,
        package: pkg,
        validation,
        errors: validation.issues,
        createdAt: at,
      });
    }

    this.session.put(pkg, GoalSessionStatuses.READY);

    return buildGoalResult({
      id: `result:${operation}:${input.id}`,
      operation,
      success: true,
      decisions,
      package: pkg,
      summary,
      snapshot,
      continuousAdaptationInput,
      validation,
      createdAt: at,
    });
  }

  private resolveInputs(input: GoalProgressInput, at: string) {
    const portInput = {
      athleteId: input.athleteId,
      sessionId: input.sessionId,
      conversationId: input.conversationId,
      contextId: input.contextId,
      at,
    };

    let decisions: readonly CoachingDecision[] = input.decisions;
    if (decisions.length === 0 && this.decisionEnginePort) {
      decisions = this.decisionEnginePort.loadDecisions(portInput);
    }

    let recommendations: readonly CoachingRecommendation[] = input.recommendations;
    if (recommendations.length === 0 && this.recommendationEnginePort) {
      recommendations = this.recommendationEnginePort.loadRecommendations(portInput);
    }

    let stateKeys = input.stateKeys;
    if (stateKeys.length === 0 && this.athleteStatePort) {
      stateKeys = this.athleteStatePort.loadStateKeys({
        athleteId: input.athleteId,
        at,
      });
    }

    const workoutKeys =
      this.workoutAdaptationPort?.loadWorkoutAdaptationKeys({
        athleteId: input.athleteId,
        contextId: input.contextId,
        at,
      }) ?? Object.freeze([] as string[]);

    const nutritionKeys =
      this.nutritionAdaptationPort?.loadNutritionAdaptationKeys({
        athleteId: input.athleteId,
        contextId: input.contextId,
        at,
      }) ?? Object.freeze([] as string[]);

    const recoveryKeys =
      this.recoveryAdaptationPort?.loadRecoveryAdaptationKeys({
        athleteId: input.athleteId,
        contextId: input.contextId,
        at,
      }) ?? Object.freeze([] as string[]);

    const mergedFlags: Record<string, boolean> = { ...input.signalFlags };
    for (const key of [...workoutKeys, ...nutritionKeys, ...recoveryKeys]) {
      if (mergedFlags[key] === undefined) mergedFlags[key] = true;
    }

    const resolvedInput: GoalProgressInput = Object.freeze({
      ...input,
      decisions: Object.freeze([...decisions]),
      recommendations: Object.freeze([...recommendations]),
      stateKeys: Object.freeze([...stateKeys]),
      nutritionKeys: Object.freeze(
        uniqueSorted([...input.nutritionKeys, ...nutritionKeys]),
      ),
      recoveryKeys: Object.freeze(
        uniqueSorted([...input.recoveryKeys, ...recoveryKeys]),
      ),
      signalFlags: Object.freeze(mergedFlags),
    });

    return {
      input: resolvedInput,
      decisions,
      recommendations,
      workoutKeys,
      nutritionKeys,
      recoveryKeys,
    };
  }
}

export function createGoalProgressCoordinator(
  deps: GoalProgressCoordinatorDeps = {},
): GoalProgressCoordinator {
  return new GoalProgressCoordinator(deps);
}
