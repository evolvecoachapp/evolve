import { buildAdaptationDecision, categoryFromSignals } from "../builders/AdaptationBuilder";
import { buildAdaptationDescriptor } from "../builders/DescriptorBuilder";
import {
  buildGoalProgressInput,
  buildNutritionAdaptationInput,
  buildRecoveryAdaptationInput,
  buildWorkoutAdaptationInput,
} from "../builders/HandoffBuilder";
import { buildAdaptationPackage } from "../builders/PackageBuilder";
import { buildAdaptationResult } from "../builders/ResultBuilder";
import { buildAdaptationSnapshot } from "../builders/SnapshotBuilder";
import { buildAdaptationSummary } from "../builders/SummaryBuilder";
import { compareSnapshots } from "../comparison/SnapshotComparator";
import type { AthleteStatePort } from "../contracts/AthleteStatePort";
import type { ContextFusionPort } from "../contracts/ContextFusionPort";
import type { DecisionEnginePort } from "../contracts/DecisionEnginePort";
import type { ExplainabilityEnginePort } from "../contracts/ExplainabilityEnginePort";
import type { RecommendationEnginePort } from "../contracts/RecommendationEnginePort";
import { detectAdherence } from "../detection/AdherenceDetector";
import { detectConsistency } from "../detection/ConsistencyDetector";
import { detectPlateau } from "../detection/PlateauDetector";
import { detectProgress } from "../detection/ProgressDetector";
import { detectRecovery } from "../detection/RecoveryDetector";
import { detectRegression } from "../detection/RegressionDetector";
import { detectTrend } from "../detection/TrendDetector";
import { evaluateAdaptationSignals } from "../evaluation/AdaptationEvaluator";
import type { CoachingDecision } from "../../decision-engine/models/CoachingDecision";
import type { CoachingExplanation } from "../../explainability-engine/models/CoachingExplanation";
import type { CoachingRecommendation } from "../../recommendation-engine/models/CoachingRecommendation";
import {
  createAdaptationError,
  AdaptationErrorCodes,
} from "../models/AdaptationError";
import type { AdaptationInput } from "../models/AdaptationInput";
import { AdaptationOperationKinds } from "../models/AdaptationResult";
import type { AdaptationResult } from "../models/AdaptationResult";
import { AdaptationSessionStatuses } from "../models/AdaptationState";
import type { AdaptationCandidate } from "../models/AdaptationCandidate";
import type { AdaptationOpportunity } from "../models/AdaptationOpportunity";
import type { AdaptationTrigger } from "../models/AdaptationTrigger";
import { observeAdherence } from "../monitoring/AdherenceMonitor";
import { observeGoal } from "../monitoring/GoalMonitor";
import { observeHistory } from "../monitoring/HistoryMonitor";
import { observeNutrition } from "../monitoring/NutritionMonitor";
import { observePerformance } from "../monitoring/PerformanceMonitor";
import { observeRecovery } from "../monitoring/RecoveryMonitor";
import { observeState } from "../monitoring/StateMonitor";
import { observeTimeline } from "../monitoring/TimelineMonitor";
import { applyAdaptationPolicy } from "../policies/AdaptationPolicy";
import { applyConsistencyPolicy } from "../policies/ConsistencyPolicy";
import { applyDetectionPolicy } from "../policies/DetectionPolicy";
import { applyMonitoringPolicy } from "../policies/MonitoringPolicy";
import { applyPriorityPolicy } from "../policies/PriorityPolicy";
import { applySafetyPolicy } from "../policies/SafetyPolicy";
import { buildAdaptationHistory } from "../timeline/HistoryBuilder";
import { buildAdaptationTimeline } from "../timeline/TimelineBuilder";
import { buildAdaptationWindow } from "../timeline/WindowBuilder";
import { collectPresentSignalKeys, uniqueSorted } from "../utils/AdaptationHelpers";
import { buildStatistics } from "../utils/StatisticsHelpers";
import { validateAdaptationPackage } from "../validators";
import { createAdaptationSession, type AdaptationSession } from "./AdaptationSession";

export interface AdaptationCoordinatorDeps {
  readonly decisionEnginePort?: DecisionEnginePort;
  readonly recommendationEnginePort?: RecommendationEnginePort;
  readonly explainabilityEnginePort?: ExplainabilityEnginePort;
  readonly contextFusionPort?: ContextFusionPort;
  readonly athleteStatePort?: AthleteStatePort;
  readonly clock?: () => string;
  readonly runtimeId?: string;
}

export class AdaptationCoordinator {
  private readonly decisionEnginePort: DecisionEnginePort | undefined;
  private readonly recommendationEnginePort: RecommendationEnginePort | undefined;
  private readonly explainabilityEnginePort: ExplainabilityEnginePort | undefined;
  private readonly contextFusionPort: ContextFusionPort | undefined;
  private readonly athleteStatePort: AthleteStatePort | undefined;
  private readonly clock: () => string;
  private readonly runtimeId: string;
  private readonly session: AdaptationSession;

  constructor(deps: AdaptationCoordinatorDeps = {}) {
    this.decisionEnginePort = deps.decisionEnginePort;
    this.recommendationEnginePort = deps.recommendationEnginePort;
    this.explainabilityEnginePort = deps.explainabilityEnginePort;
    this.contextFusionPort = deps.contextFusionPort;
    this.athleteStatePort = deps.athleteStatePort;
    this.clock = deps.clock ?? (() => new Date().toISOString());
    this.runtimeId = deps.runtimeId ?? "runtime:continuous-adaptation";
    this.session = createAdaptationSession(this.clock());
  }

  describe(): AdaptationResult {
    const at = this.clock();
    return buildAdaptationResult({
      id: `result:describe:${this.runtimeId}`,
      operation: AdaptationOperationKinds.DESCRIBE,
      success: true,
      descriptor: buildAdaptationDescriptor({ id: this.runtimeId, createdAt: at }),
      createdAt: at,
    });
  }

  evaluate(input: AdaptationInput): AdaptationResult {
    return this.run(input, AdaptationOperationKinds.EVALUATE);
  }

  detect(input: AdaptationInput): AdaptationResult {
    return this.run(input, AdaptationOperationKinds.DETECT);
  }

  snapshot(input: AdaptationInput): AdaptationResult {
    const at = this.clock();
    const built = this.run(input, AdaptationOperationKinds.EVALUATE);
    if (!built.success || !built.snapshot) return built;
    return buildAdaptationResult({
      id: `result:snapshot:${input.id}`,
      operation: AdaptationOperationKinds.SNAPSHOT,
      success: true,
      decisions: built.decisions,
      snapshot: built.snapshot,
      package: built.package,
      summary: built.summary,
      workoutAdaptationInput: built.workoutAdaptationInput,
      nutritionAdaptationInput: built.nutritionAdaptationInput,
      recoveryAdaptationInput: built.recoveryAdaptationInput,
      goalProgressInput: built.goalProgressInput,
      createdAt: at,
    });
  }

  validate(input: AdaptationInput): AdaptationResult {
    const at = this.clock();
    const pkg = this.session.getPackage() ?? this.run(input, AdaptationOperationKinds.EVALUATE).package;
    if (!pkg) {
      return buildAdaptationResult({
        id: `result:validate:error:${input.id}`,
        operation: AdaptationOperationKinds.VALIDATE,
        success: false,
        errors: [
          createAdaptationError(AdaptationErrorCodes.MISSING_INPUT, "No package to validate"),
        ],
        createdAt: at,
      });
    }
    const validation = validateAdaptationPackage(pkg);
    return buildAdaptationResult({
      id: `result:validate:${input.id}`,
      operation: AdaptationOperationKinds.VALIDATE,
      success: validation.valid,
      decisions: pkg.decisions,
      package: pkg,
      validation,
      errors: validation.valid ? Object.freeze([]) : validation.issues,
      createdAt: at,
    });
  }

  private run(
    input: AdaptationInput,
    operation: (typeof AdaptationOperationKinds)[keyof typeof AdaptationOperationKinds],
  ): AdaptationResult {
    const at = this.clock();
    if (!input.athleteId) {
      return buildAdaptationResult({
        id: `result:${operation}:error:${input.id}`,
        operation,
        success: false,
        errors: [
          createAdaptationError(AdaptationErrorCodes.MISSING_ATHLETE, "Athlete id required"),
        ],
        createdAt: at,
      });
    }

    const monitoringErrors = applyMonitoringPolicy(input);
    if (monitoringErrors.length > 0) {
      return buildAdaptationResult({
        id: `result:${operation}:error:${input.id}`,
        operation,
        success: false,
        errors: monitoringErrors,
        createdAt: at,
      });
    }

    const resolved = this.resolveInputs(input, at);
    const steps: string[] = ["resolve_upstream", "monitor", "detect", "evaluate", "compare", "timeline", "build", "policy", "validate", "freeze"];

    // 2. Monitors → observations
    const observations = Object.freeze([
      observeState(resolved.input, at),
      observePerformance(resolved.input, at),
      observeRecovery(resolved.input, at),
      observeNutrition(resolved.input, at),
      observeGoal(resolved.input, at),
      observeAdherence(resolved.input, at),
      observeHistory(resolved.input, at),
      observeTimeline(resolved.input, at),
    ]);

    // 3. Detectors → opportunities/candidates/triggers
    const detections = [
      detectPlateau(resolved.input),
      detectRegression(resolved.input),
      detectProgress(resolved.input),
      detectRecovery(resolved.input),
      detectConsistency(resolved.input),
      detectAdherence(resolved.input),
      detectTrend(resolved.input),
    ];
    const triggers: AdaptationTrigger[] = [];
    const candidates: AdaptationCandidate[] = [];
    const opportunities: AdaptationOpportunity[] = [];
    for (const d of detections) {
      triggers.push(...d.triggers);
      candidates.push(...d.candidates);
      opportunities.push(...d.opportunities);
    }
    const frozenTriggers = Object.freeze(triggers);
    const frozenCandidates = Object.freeze(candidates);
    const frozenOpportunities = Object.freeze(opportunities);

    const detectionErrors = applyDetectionPolicy(frozenTriggers);
    if (detectionErrors.length > 0) {
      return buildAdaptationResult({
        id: `result:${operation}:error:${input.id}`,
        operation,
        success: false,
        errors: detectionErrors,
        createdAt: at,
      });
    }

    // 4. Evaluate
    const signalKeys = collectPresentSignalKeys(resolved.input);
    const category = categoryFromSignals(signalKeys);
    const evaluation = evaluateAdaptationSignals({
      subjectId: input.athleteId,
      triggers: frozenTriggers,
      candidates: frozenCandidates,
      opportunities: frozenOpportunities,
      dependencyFromIds: resolved.decisions.map((d) => d.id),
    });

    // 5. Compare snapshots (keys/ids only)
    const decision = buildAdaptationDecision({
      id: `adaptation:${input.id}`,
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
        id: `eval:adaptation:${input.id}`,
        subjectId: `adaptation:${input.id}`,
      },
      sourceKeys: uniqueSorted([
        ...resolved.decisions.map((d) => d.id),
        ...resolved.recommendations.map((r) => r.id),
        ...resolved.explanations.map((e) => e.id),
        ...observations.map((o) => o.id),
      ]),
      at,
    });
    const decisions = Object.freeze([decision]);

    const summary = buildAdaptationSummary({
      id: `summary:${input.id}`,
      athleteId: input.athleteId,
      contextId: input.contextId,
      decisions,
      at,
    });
    const snapshot = buildAdaptationSnapshot({
      id: `snapshot:${input.id}`,
      athleteId: input.athleteId,
      contextId: input.contextId,
      decisions,
      summary,
      at,
    });
    void compareSnapshots(input.priorSnapshot, snapshot);

    // 6. Timeline / history / window
    const timeline = buildAdaptationTimeline({
      id: `timeline:${input.id}`,
      athleteId: input.athleteId,
      decisions,
      at,
    });
    const history = buildAdaptationHistory({
      id: `history:${input.id}`,
      athleteId: input.athleteId,
      decisions,
      historyKeys: resolved.input.historyKeys,
      at,
    });
    const window = buildAdaptationWindow({
      id: `window:${input.id}`,
      timeline,
      startAt: at,
      endAt: at,
    });

    // 7. Handoffs (inputs only)
    const workoutAdaptationInput = buildWorkoutAdaptationInput({
      athleteId: input.athleteId,
      contextId: input.contextId,
      decisions,
      at,
    });
    const nutritionAdaptationInput = buildNutritionAdaptationInput({
      athleteId: input.athleteId,
      contextId: input.contextId,
      decisions,
      at,
    });
    const recoveryAdaptationInput = buildRecoveryAdaptationInput({
      athleteId: input.athleteId,
      contextId: input.contextId,
      decisions,
      at,
    });
    const goalProgressInput = buildGoalProgressInput({
      athleteId: input.athleteId,
      contextId: input.contextId,
      decisions,
      at,
    });

    const pkg = buildAdaptationPackage({
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
      workoutAdaptationInput,
      nutritionAdaptationInput,
      recoveryAdaptationInput,
      goalProgressInput,
      at,
    });

    // 8. Policies + validate
    const policyErrors = Object.freeze([
      ...applyAdaptationPolicy(decisions),
      ...applyConsistencyPolicy(decisions),
      ...applyPriorityPolicy(decisions),
      ...applySafetyPolicy(pkg),
    ]);
    if (policyErrors.length > 0) {
      return buildAdaptationResult({
        id: `result:${operation}:error:${input.id}`,
        operation,
        success: false,
        decisions,
        package: pkg,
        errors: policyErrors,
        createdAt: at,
      });
    }

    const validation = validateAdaptationPackage(pkg);
    if (!validation.valid) {
      return buildAdaptationResult({
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

    // 9. Freeze (builders already freeze) + session
    this.session.put(pkg, AdaptationSessionStatuses.READY);

    return buildAdaptationResult({
      id: `result:${operation}:${input.id}`,
      operation,
      success: true,
      decisions,
      package: pkg,
      summary,
      snapshot,
      workoutAdaptationInput,
      nutritionAdaptationInput,
      recoveryAdaptationInput,
      goalProgressInput,
      validation,
      createdAt: at,
    });
  }

  private resolveInputs(input: AdaptationInput, at: string) {
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

    let explanations: readonly CoachingExplanation[] = input.explanations;
    if (explanations.length === 0 && this.explainabilityEnginePort) {
      explanations = this.explainabilityEnginePort.loadExplanations(portInput);
    }

    let stateKeys = input.stateKeys;
    if (stateKeys.length === 0 && this.athleteStatePort) {
      stateKeys = this.athleteStatePort.loadStateKeys({
        athleteId: input.athleteId,
        at,
      });
    }

    const focusAreas = this.contextFusionPort?.loadFocusAreas({
      athleteId: input.athleteId,
      contextId: input.contextId,
      at,
    }) ?? Object.freeze([] as string[]);

    const mergedFlags: Record<string, boolean> = { ...input.signalFlags };
    for (const area of focusAreas) {
      if (mergedFlags[`focus:${area}`] === undefined) mergedFlags[`focus:${area}`] = true;
    }

    const resolvedInput: AdaptationInput = Object.freeze({
      ...input,
      decisions: Object.freeze([...decisions]),
      recommendations: Object.freeze([...recommendations]),
      explanations: Object.freeze([...explanations]),
      stateKeys: Object.freeze([...stateKeys]),
      signalFlags: Object.freeze(mergedFlags),
    });

    return {
      input: resolvedInput,
      decisions,
      recommendations,
      explanations,
      focusAreas,
    };
  }
}

export function createAdaptationCoordinator(
  deps: AdaptationCoordinatorDeps = {},
): AdaptationCoordinator {
  return new AdaptationCoordinator(deps);
}
