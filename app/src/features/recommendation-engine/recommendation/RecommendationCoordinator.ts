import { buildExplainabilityInput } from "../builders/ExplainabilityInputBuilder";
import { buildRecommendationsFromDecisions } from "../builders/RecommendationBuilder";
import { buildRecommendationContext } from "../builders/RecommendationContextBuilder";
import { buildRecommendationDescriptor } from "../builders/RecommendationDescriptorBuilder";
import { buildRecommendationResult } from "../builders/RecommendationResultBuilder";
import { buildRecommendationSnapshot } from "../builders/SnapshotBuilder";
import { buildRecommendationSummary } from "../builders/SummaryBuilder";
import { buildRecommendationTimeline } from "../builders/TimelineBuilder";
import type { AthleteStatePort } from "../contracts/AthleteStatePort";
import type { CoachSupervisorPort } from "../contracts/CoachSupervisorPort";
import type { ContextFusionPort } from "../contracts/ContextFusionPort";
import type { DecisionEnginePort } from "../contracts/DecisionEnginePort";
import {
  createRecommendationError,
  RecommendationErrorCodes,
} from "../models/RecommendationError";
import type { RecommendationInput } from "../models/RecommendationInput";
import { RecommendationOperationKinds } from "../models/RecommendationResult";
import type { RecommendationResult } from "../models/RecommendationResult";
import { RecommendationSessionStatuses } from "../models/RecommendationState";
import { packageRecommendations } from "../packaging/RecommendationPackager";
import { formatRecommendationView } from "../packaging/RecommendationFormatter";
import { planDependencies } from "../planning/DependencyPlanner";
import { planGroups } from "../planning/GroupingPlanner";
import { planRecommendations } from "../planning/RecommendationPlanner";
import { planSequences } from "../planning/SequencePlanner";
import { applyConflictPolicy } from "../policies/ConflictPolicy";
import { applyConsistencyPolicy } from "../policies/ConsistencyPolicy";
import { applyDependencyPolicy } from "../policies/DependencyPolicy";
import { applyPriorityPolicy } from "../policies/PriorityPolicy";
import { applyRecommendationPolicy } from "../policies/RecommendationPolicy";
import { applySafetyPolicy } from "../policies/SafetyPolicy";
import { resolveConflicts } from "../prioritization/ConflictResolver";
import { resolveDependencies } from "../prioritization/DependencyResolver";
import { resolveOrdering } from "../prioritization/OrderingResolver";
import { resolvePriorities } from "../prioritization/PriorityResolver";
import { resolveUrgency } from "../prioritization/UrgencyResolver";
import { validateRecommendationPackage } from "../validators/validateRecommendationPackage";
import {
  createRecommendationSession,
  type RecommendationSession,
} from "./RecommendationSession";

export interface RecommendationCoordinatorDeps {
  readonly decisionEnginePort?: DecisionEnginePort;
  readonly contextFusionPort?: ContextFusionPort;
  readonly athleteStatePort?: AthleteStatePort;
  readonly supervisorPort?: CoachSupervisorPort;
  readonly clock?: () => string;
  readonly runtimeId?: string;
}

/**
 * Recommendation Coordinator — deterministic orchestration pipeline.
 */
export class RecommendationCoordinator {
  private readonly decisionEnginePort: DecisionEnginePort | undefined;
  private readonly contextFusionPort: ContextFusionPort | undefined;
  private readonly athleteStatePort: AthleteStatePort | undefined;
  private readonly supervisorPort: CoachSupervisorPort | undefined;
  private readonly clock: () => string;
  private readonly runtimeId: string;
  private readonly session: RecommendationSession;

  constructor(deps: RecommendationCoordinatorDeps = {}) {
    this.decisionEnginePort = deps.decisionEnginePort;
    this.contextFusionPort = deps.contextFusionPort;
    this.athleteStatePort = deps.athleteStatePort;
    this.supervisorPort = deps.supervisorPort;
    this.clock = deps.clock ?? (() => new Date().toISOString());
    this.runtimeId = deps.runtimeId ?? "runtime:recommendation-engine";
    this.session = createRecommendationSession(this.clock());
  }

  describe(): RecommendationResult {
    const at = this.clock();
    return buildRecommendationResult({
      id: `result:describe:${this.runtimeId}`,
      operation: RecommendationOperationKinds.DESCRIBE,
      success: true,
      descriptor: buildRecommendationDescriptor({
        id: this.runtimeId,
        createdAt: at,
      }),
      createdAt: at,
    });
  }

  build(input: RecommendationInput): RecommendationResult {
    const at = this.clock();
    const resolved = this.resolveInputs(input, at);
    if (resolved.decisions.length === 0 && !resolved.context) {
      return buildRecommendationResult({
        id: `result:build:error:${input.id}`,
        operation: RecommendationOperationKinds.BUILD,
        success: false,
        errors: [
          createRecommendationError(
            RecommendationErrorCodes.MISSING_DECISIONS,
            "Coaching decisions are required",
          ),
        ],
        createdAt: at,
      });
    }

    const pkg = this.runPipeline({
      inputId: input.id,
      context: resolved.context!,
      decisions: resolved.decisions,
      at,
    });
    this.session.put(pkg, RecommendationSessionStatuses.READY);

    return buildRecommendationResult({
      id: `result:build:${input.id}`,
      operation: RecommendationOperationKinds.BUILD,
      success: true,
      recommendations: pkg.recommendations,
      package: pkg,
      summary: pkg.summary,
      snapshot: pkg.snapshot,
      explainabilityInput: pkg.explainabilityInput,
      createdAt: at,
    });
  }

  prioritize(input: RecommendationInput): RecommendationResult {
    const at = this.clock();
    const base =
      this.session.getPackage() ??
      this.build(input).package;
    if (!base) {
      return buildRecommendationResult({
        id: `result:prioritize:error:${input.id}`,
        operation: RecommendationOperationKinds.PRIORITIZE,
        success: false,
        errors: [
          createRecommendationError(
            RecommendationErrorCodes.MISSING_CONTEXT,
            "No recommendation package available to prioritize",
          ),
        ],
        createdAt: at,
      });
    }

    let recommendations = resolveUrgency(base.recommendations);
    recommendations = resolvePriorities(recommendations);
    recommendations = applyPriorityPolicy(recommendations);
    let dependencies = applyDependencyPolicy(base.dependencies);
    recommendations = resolveDependencies({ recommendations, dependencies });
    recommendations = resolveOrdering({ recommendations, dependencies });

    const conflicts = applyConflictPolicy(recommendations);
    const resolved = resolveConflicts({ recommendations, conflicts });
    const recommendationIds = new Set(
      resolved.recommendations.map((r) => r.id),
    );
    dependencies = Object.freeze(
      dependencies.filter(
        (d) => recommendationIds.has(d.fromId) && recommendationIds.has(d.toId),
      ),
    );

    const groups = planGroups(resolved.recommendations);
    const plan = planRecommendations({
      planId: `plan:prio:${input.id}`,
      athleteId: base.athleteId,
      contextId: base.contextId,
      recommendations: resolved.recommendations,
      at,
    });
    const sequences = planSequences(resolved.recommendations);
    const enrichedPlan = Object.freeze({
      ...plan,
      steps: sequences[0]?.steps ?? plan.steps,
      sequences,
      groups,
    });

    const summary = buildRecommendationSummary({
      id: `summary:prio:${input.id}`,
      athleteId: base.athleteId,
      contextId: base.contextId,
      recommendations: resolved.recommendations,
      groupCount: groups.length,
      conflictCount: resolved.conflicts.length,
      resolutionCount: resolved.resolutions.length,
      focusAreas: base.recommendationContext.focusAreas,
      at,
    });
    const snapshot = buildRecommendationSnapshot({
      id: `snapshot:prio:${input.id}`,
      athleteId: base.athleteId,
      contextId: base.contextId,
      recommendations: resolved.recommendations,
      summary,
      at,
    });
    const view = formatRecommendationView({
      id: `view:prio:${input.id}`,
      athleteId: base.athleteId,
      contextId: base.contextId,
      recommendations: resolved.recommendations,
      groups,
      at,
    });
    const explainabilityInput = buildExplainabilityInput({
      id: `explain:prio:${input.id}`,
      athleteId: base.athleteId,
      contextId: base.contextId,
      recommendations: resolved.recommendations,
      decisionIds: base.recommendationContext.decisionIds,
      summary,
      at,
    });
    const timeline = buildRecommendationTimeline({
      id: `timeline:prio:${input.id}`,
      steps: Object.freeze(["prioritize", "resolve", "order"]),
      subjectId: input.id,
      at,
    });

    const pkg = packageRecommendations({
      id: `package:prio:${input.id}`,
      recommendationContext: base.recommendationContext,
      recommendations: resolved.recommendations,
      conflicts: resolved.conflicts,
      resolutions: resolved.resolutions,
      constraints: base.constraints,
      dependencies,
      groups,
      plan: enrichedPlan,
      view,
      summary,
      snapshot,
      timeline,
      explainabilityInput,
      diagnosticsNotes: Object.freeze(["prioritized"]),
      at,
    });
    this.session.put(pkg, RecommendationSessionStatuses.READY);

    return buildRecommendationResult({
      id: `result:prioritize:${input.id}`,
      operation: RecommendationOperationKinds.PRIORITIZE,
      success: true,
      recommendations: pkg.recommendations,
      package: pkg,
      summary: pkg.summary,
      snapshot: pkg.snapshot,
      explainabilityInput: pkg.explainabilityInput,
      createdAt: at,
    });
  }

  package(input: RecommendationInput): RecommendationResult {
    const at = this.clock();
    const existing = this.session.getPackage();
    if (existing) {
      return buildRecommendationResult({
        id: `result:package:${input.id}`,
        operation: RecommendationOperationKinds.PACKAGE,
        success: true,
        recommendations: existing.recommendations,
        package: existing,
        summary: existing.summary,
        snapshot: existing.snapshot,
        explainabilityInput: existing.explainabilityInput,
        createdAt: at,
      });
    }
    return this.build(input);
  }

  validate(input: RecommendationInput): RecommendationResult {
    const at = this.clock();
    const built = this.session.getPackage() ?? this.build(input).package;
    if (!built) {
      return buildRecommendationResult({
        id: `result:validate:error:${input.id}`,
        operation: RecommendationOperationKinds.VALIDATE,
        success: false,
        errors: [
          createRecommendationError(
            RecommendationErrorCodes.MISSING_CONTEXT,
            "No recommendation package available to validate",
          ),
        ],
        createdAt: at,
      });
    }
    const validation = validateRecommendationPackage(built);
    return buildRecommendationResult({
      id: `result:validate:${input.id}`,
      operation: RecommendationOperationKinds.VALIDATE,
      success: validation.valid,
      recommendations: built.recommendations,
      package: built,
      summary: built.summary,
      snapshot: built.snapshot,
      explainabilityInput: built.explainabilityInput,
      validation,
      errors: validation.errors,
      createdAt: at,
    });
  }

  getSession(): RecommendationSession {
    return this.session;
  }

  private resolveInputs(
    input: RecommendationInput,
    at: string,
  ): {
    readonly decisions: ReturnType<DecisionEnginePort["loadDecisions"]>;
    readonly context: ReturnType<typeof buildRecommendationContext> | null;
  } {
    let decisions = input.decisions;
    let handoff = input.decisionHandoff;

    if (decisions.length === 0 && this.decisionEnginePort) {
      decisions = this.decisionEnginePort.loadDecisions({
        athleteId: input.athleteId,
        sessionId: input.sessionId,
        conversationId: input.conversationId,
        contextId: input.contextId,
        at,
      });
    }
    if (!handoff && this.decisionEnginePort) {
      handoff = this.decisionEnginePort.loadRecommendationHandoff({
        athleteId: input.athleteId,
        sessionId: input.sessionId,
        conversationId: input.conversationId,
        contextId: input.contextId,
        at,
      });
    }

    if (input.recommendationContext) {
      return Object.freeze({
        decisions: Object.freeze([...decisions]),
        context: input.recommendationContext,
      });
    }

    if (decisions.length === 0 && !handoff) {
      return Object.freeze({
        decisions: Object.freeze([]),
        context: null,
      });
    }

    const focusAreas = Object.freeze([
      ...(this.contextFusionPort?.describeFocusAreas({
        athleteId: input.athleteId,
        contextId: input.contextId,
        at,
      }) ?? []),
      ...(this.supervisorPort?.describeSupervisorFocus({
        athleteId: input.athleteId,
        sessionId: input.sessionId,
      }) ?? []),
    ]);

    const context = buildRecommendationContext({
      id: `rec-ctx:${input.id}`,
      athleteId: input.athleteId,
      sessionId: input.sessionId,
      conversationId: input.conversationId,
      contextId: input.contextId,
      decisions,
      handoff,
      focusAreas,
      athletePresent:
        this.athleteStatePort?.isAthletePresent({
          athleteId: input.athleteId,
          at,
        }) ?? true,
      at,
    });

    return Object.freeze({
      decisions: Object.freeze([...decisions]),
      context,
    });
  }

  private runPipeline(input: {
    readonly inputId: string;
    readonly context: NonNullable<
      ReturnType<RecommendationCoordinator["resolveInputs"]>["context"]
    >;
    readonly decisions: ReturnType<DecisionEnginePort["loadDecisions"]>;
    readonly at: string;
  }) {
    let recommendations = buildRecommendationsFromDecisions({
      decisions: input.decisions,
      at: input.at,
    });
    recommendations = applyRecommendationPolicy(recommendations);
    recommendations = applySafetyPolicy(recommendations);
    recommendations = applyConsistencyPolicy(recommendations);
    recommendations = resolveUrgency(recommendations);
    recommendations = resolvePriorities(recommendations);
    recommendations = applyPriorityPolicy(recommendations);

    let dependencies = planDependencies(recommendations);
    dependencies = applyDependencyPolicy(dependencies);
    recommendations = resolveDependencies({ recommendations, dependencies });
    recommendations = resolveOrdering({ recommendations, dependencies });

    const conflicts = applyConflictPolicy(recommendations);
    const resolved = resolveConflicts({ recommendations, conflicts });
    recommendations = resolved.recommendations;
    const recommendationIds = new Set(recommendations.map((r) => r.id));
    dependencies = Object.freeze(
      dependencies.filter(
        (d) => recommendationIds.has(d.fromId) && recommendationIds.has(d.toId),
      ),
    );

    const groups = planGroups(recommendations);
    const sequences = planSequences(recommendations);
    const plan = planRecommendations({
      planId: `plan:${input.inputId}`,
      athleteId: input.context.athleteId,
      contextId: input.context.contextId,
      recommendations,
      at: input.at,
    });
    const enrichedPlan = Object.freeze({
      ...plan,
      steps: sequences[0]?.steps ?? plan.steps,
      sequences,
      groups,
    });

    const summary = buildRecommendationSummary({
      id: `summary:${input.inputId}`,
      athleteId: input.context.athleteId,
      contextId: input.context.contextId,
      recommendations,
      groupCount: groups.length,
      conflictCount: resolved.conflicts.length,
      resolutionCount: resolved.resolutions.length,
      focusAreas: input.context.focusAreas,
      at: input.at,
    });
    const snapshot = buildRecommendationSnapshot({
      id: `snapshot:${input.inputId}`,
      athleteId: input.context.athleteId,
      contextId: input.context.contextId,
      recommendations,
      summary,
      at: input.at,
    });
    const view = formatRecommendationView({
      id: `view:${input.inputId}`,
      athleteId: input.context.athleteId,
      contextId: input.context.contextId,
      recommendations,
      groups,
      at: input.at,
    });
    const explainabilityInput = buildExplainabilityInput({
      id: `explain:${input.inputId}`,
      athleteId: input.context.athleteId,
      contextId: input.context.contextId,
      recommendations,
      decisionIds: input.context.decisionIds,
      summary,
      at: input.at,
    });
    const timeline = buildRecommendationTimeline({
      id: `timeline:${input.inputId}`,
      steps: Object.freeze([
        "build",
        "plan",
        "prioritize",
        "resolve",
        "package",
      ]),
      subjectId: input.inputId,
      at: input.at,
    });

    return packageRecommendations({
      id: `package:${input.inputId}`,
      recommendationContext: input.context,
      recommendations,
      conflicts: resolved.conflicts,
      resolutions: resolved.resolutions,
      constraints: Object.freeze([]),
      dependencies,
      groups,
      plan: enrichedPlan,
      view,
      summary,
      snapshot,
      timeline,
      explainabilityInput,
      diagnosticsNotes: Object.freeze(["built_from_decisions"]),
      at: input.at,
    });
  }
}

export function createRecommendationCoordinator(
  deps: RecommendationCoordinatorDeps = {},
): RecommendationCoordinator {
  return new RecommendationCoordinator(deps);
}
