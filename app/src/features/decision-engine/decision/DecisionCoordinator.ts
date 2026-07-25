import { analyzeConsistency } from "../analysis/ConsistencyAnalysis";
import { analyzeContext } from "../analysis/ContextAnalysis";
import { analyzeDependencies } from "../analysis/DependencyAnalysis";
import { analyzeGoal } from "../analysis/GoalAnalysis";
import { analyzeLifestyle } from "../analysis/LifestyleAnalysis";
import { analyzeNutrition } from "../analysis/NutritionAnalysis";
import { analyzePriority } from "../analysis/PriorityAnalysis";
import { analyzeRecovery } from "../analysis/RecoveryAnalysis";
import { analyzeRisk } from "../analysis/RiskAnalysis";
import { analyzeTraining } from "../analysis/TrainingAnalysis";
import { buildDecisionContext } from "../builders/DecisionContextBuilder";
import { buildDecisionDescriptor } from "../builders/DecisionDescriptorBuilder";
import { buildDecisionGraph } from "../builders/DecisionGraphBuilder";
import { buildDecisionPackage } from "../builders/DecisionPackageBuilder";
import { buildDecisionResult } from "../builders/DecisionResultBuilder";
import { buildDecisionSummary } from "../builders/DecisionSummaryBuilder";
import { buildRecommendationEngineInput } from "../builders/RecommendationEngineInputBuilder";
import type { AthleteStatePort } from "../contracts/AthleteStatePort";
import type { CoachSupervisorPort } from "../contracts/CoachSupervisorPort";
import type { ContextFusionPort } from "../contracts/ContextFusionPort";
import { evaluateConflicts } from "../evaluation/ConflictEvaluator";
import { evaluateCandidate } from "../evaluation";
import type { DecisionInput } from "../models/DecisionInput";
import {
  createDecisionError,
  DecisionErrorCodes,
} from "../models/DecisionError";
import { DecisionOperationKinds } from "../models/DecisionResult";
import type { DecisionResult } from "../models/DecisionResult";
import { DecisionSessionStatuses } from "../models/DecisionState";
import { EMPTY_DECISION_METADATA } from "../models/DecisionMetadata";
import { applyConflictPolicy } from "../policies/ConflictPolicy";
import { applyConsistencyPolicy } from "../policies/ConsistencyPolicy";
import { applyDecisionPolicy } from "../policies/DecisionPolicy";
import { applyDependencyPolicy } from "../policies/DependencyPolicy";
import { applyPriorityPolicy } from "../policies/PriorityPolicy";
import { applySafetyPolicy } from "../policies/SafetyPolicy";
import { planDecisions } from "../planning/DecisionPlanner";
import { planExecution } from "../planning/ExecutionPlanner";
import { planResolutions } from "../planning/ResolutionPlanner";
import { resolveConflicts } from "../resolution/ConflictResolver";
import { resolveDecisions } from "../resolution/DecisionResolver";
import { resolveDependencies } from "../resolution/DependencyResolver";
import { resolveMerge } from "../resolution/MergeResolver";
import { resolvePriorities } from "../resolution/PriorityResolver";
import { sortCandidatesByPriority } from "../utils/DecisionHelpers";
import { freezeSnapshot } from "../utils/FreezeDecisionState";
import { validateDecisionPackage } from "../validators/validateDecisionPackage";
import {
  createDecisionSession,
  type DecisionSession,
} from "./DecisionSession";

export interface DecisionCoordinatorDeps {
  readonly contextFusionPort?: ContextFusionPort;
  readonly athleteStatePort?: AthleteStatePort;
  readonly supervisorPort?: CoachSupervisorPort;
  readonly clock?: () => string;
  readonly runtimeId?: string;
}

/**
 * Decision Coordinator — deterministic orchestration pipeline.
 */
export class DecisionCoordinator {
  private readonly contextFusionPort: ContextFusionPort | undefined;
  private readonly athleteStatePort: AthleteStatePort | undefined;
  private readonly supervisorPort: CoachSupervisorPort | undefined;
  private readonly clock: () => string;
  private readonly runtimeId: string;
  private readonly session: DecisionSession;

  constructor(deps: DecisionCoordinatorDeps = {}) {
    this.contextFusionPort = deps.contextFusionPort;
    this.athleteStatePort = deps.athleteStatePort;
    this.supervisorPort = deps.supervisorPort;
    this.clock = deps.clock ?? (() => new Date().toISOString());
    this.runtimeId = deps.runtimeId ?? "runtime:decision-engine";
    this.session = createDecisionSession(this.clock());
  }

  describe(): DecisionResult {
    const at = this.clock();
    return buildDecisionResult({
      id: `result:describe:${this.runtimeId}`,
      operation: DecisionOperationKinds.DESCRIBE,
      success: true,
      descriptor: buildDecisionDescriptor({
        id: this.runtimeId,
        createdAt: at,
      }),
      createdAt: at,
    });
  }

  build(input: DecisionInput): DecisionResult {
    const at = this.clock();
    const decisionContext = this.resolveDecisionContext(input, at);
    if (!decisionContext) {
      return buildDecisionResult({
        id: `result:build:error:${input.id}`,
        operation: DecisionOperationKinds.BUILD,
        success: false,
        errors: [
          createDecisionError(
            DecisionErrorCodes.MISSING_CONTEXT,
            "Unified coaching context is required",
          ),
        ],
        createdAt: at,
      });
    }

    const contextReport = analyzeContext({ decisionContext });
    const candidates = sortCandidatesByPriority(
      Object.freeze([
        ...analyzeRisk({ decisionContext }),
        ...analyzePriority({ decisionContext }),
        ...analyzeTraining({ decisionContext }),
        ...analyzeNutrition({ decisionContext }),
        ...analyzeRecovery({ decisionContext }),
        ...analyzeGoal({ decisionContext }),
        ...analyzeLifestyle({ decisionContext }),
        ...analyzeConsistency({ decisionContext }),
      ]),
    );

    const dependencies = analyzeDependencies({ candidates });
    const constraints = Object.freeze([]);
    const conflicts = evaluateConflicts({ candidates });
    const resolutions = planResolutions({ conflicts, candidates, at });
    const resolvedConflicts = resolveConflicts({ conflicts, resolutions });

    const evaluations = Object.freeze(
      candidates.map((candidate) =>
        evaluateCandidate({ candidate, constraints, dependencies, at }),
      ),
    );

    let decisions = resolveDecisions({
      athleteId: decisionContext.athleteId,
      sessionId: decisionContext.sessionId,
      conversationId: decisionContext.conversationId,
      contextId: decisionContext.contextId,
      candidates,
      evaluations,
      resolutions,
      at,
    });
    decisions = resolveMerge(decisions);
    decisions = resolveDependencies({ decisions, dependencies });
    decisions = resolvePriorities(decisions);

    const plan = planExecution({
      plan: planDecisions({
        planId: `plan:${input.id}`,
        athleteId: decisionContext.athleteId,
        contextId: decisionContext.contextId,
        decisions,
        at,
      }),
      blockedDecisionIds: Object.freeze(
        decisions
          .filter((d) => d.intent === "block")
          .map((d) => d.id),
      ),
    });

    const graph = buildDecisionGraph({
      id: `graph:${input.id}`,
      candidates,
      decisions,
      dependencies,
    });

    const summary = buildDecisionSummary({
      id: `summary:${input.id}`,
      athleteId: decisionContext.athleteId,
      contextId: decisionContext.contextId,
      decisions,
      candidateCount: candidates.length,
      conflictCount: resolvedConflicts.length,
      resolutionCount: resolutions.length,
      focusAreas: [
        ...decisionContext.focusAreas,
        ...(this.supervisorPort?.describeSupervisorFocus({
          athleteId: decisionContext.athleteId,
          sessionId: decisionContext.sessionId,
        }) ?? []),
      ],
    });

    const recommendationInput = buildRecommendationEngineInput({
      id: `rec-input:${input.id}`,
      athleteId: decisionContext.athleteId,
      contextId: decisionContext.contextId,
      decisions,
      summary,
      at,
    });

    const snapshot = freezeSnapshot({
      id: `snapshot:${input.id}`,
      athleteId: decisionContext.athleteId,
      contextId: decisionContext.contextId,
      decisions,
      summary,
      metadata: EMPTY_DECISION_METADATA,
      capturedAt: at,
    });

    let pkg = buildDecisionPackage({
      id: `package:${input.id}`,
      decisionContext,
      candidates,
      decisions,
      evaluations,
      conflicts: resolvedConflicts,
      resolutions,
      constraints,
      dependencies,
      plan,
      graph,
      summary,
      snapshot,
      recommendationInput,
      missingSources: contextReport.sourceKeys.length === 0
        ? Object.freeze(["all"])
        : Object.freeze([]),
      at,
    });

    const policyWarnings = Object.freeze([
      ...applyDecisionPolicy(pkg),
      ...applyPriorityPolicy(pkg.decisions),
      ...applyConsistencyPolicy(pkg),
      ...applyConflictPolicy(pkg),
      ...applyDependencyPolicy(pkg),
      ...applySafetyPolicy(pkg),
      ...(this.athleteStatePort &&
      !this.athleteStatePort.hasAthleteState({
        athleteId: decisionContext.athleteId,
      })
        ? ["athlete_state_absent"]
        : []),
    ]);

    if (policyWarnings.length > 0) {
      pkg = buildDecisionPackage({
        id: pkg.id,
        decisionContext: pkg.decisionContext,
        candidates: pkg.candidates,
        decisions: pkg.decisions,
        evaluations: pkg.evaluations,
        conflicts: pkg.conflicts,
        resolutions: pkg.resolutions,
        constraints: pkg.constraints,
        dependencies: pkg.dependencies,
        plan: pkg.plan,
        graph: pkg.graph,
        summary: pkg.summary,
        snapshot: pkg.snapshot,
        recommendationInput: pkg.recommendationInput,
        warnings: policyWarnings,
        missingSources: pkg.diagnostics.missingSources,
        blockedCandidates: pkg.diagnostics.blockedCandidates,
        at,
      });
    }

    this.session.put(pkg, DecisionSessionStatuses.READY);

    return buildDecisionResult({
      id: `result:build:${input.id}`,
      operation: DecisionOperationKinds.BUILD,
      success: true,
      decisions: pkg.decisions,
      package: pkg,
      summary: pkg.summary,
      snapshot: pkg.snapshot,
      recommendationInput: pkg.recommendationInput,
      createdAt: at,
    });
  }

  evaluate(input: DecisionInput): DecisionResult {
    const built = this.ensurePackage(input);
    if (!built.success || !built.package) return built;
    const at = this.clock();
    const pkg = built.package;
    const evaluations = Object.freeze(
      pkg.candidates.map((candidate) =>
        evaluateCandidate({
          candidate,
          constraints: pkg.constraints,
          dependencies: pkg.dependencies,
          at,
        }),
      ),
    );
    const next = buildDecisionPackage({
      id: `package:eval:${input.id}`,
      decisionContext: pkg.decisionContext,
      candidates: pkg.candidates,
      decisions: pkg.decisions,
      evaluations,
      conflicts: pkg.conflicts,
      resolutions: pkg.resolutions,
      constraints: pkg.constraints,
      dependencies: pkg.dependencies,
      plan: pkg.plan,
      graph: pkg.graph,
      summary: pkg.summary,
      snapshot: pkg.snapshot,
      recommendationInput: pkg.recommendationInput,
      warnings: pkg.diagnostics.warnings,
      missingSources: pkg.diagnostics.missingSources,
      blockedCandidates: pkg.diagnostics.blockedCandidates,
      at,
    });
    this.session.put(next, DecisionSessionStatuses.READY);
    return buildDecisionResult({
      id: `result:evaluate:${input.id}`,
      operation: DecisionOperationKinds.EVALUATE,
      success: true,
      decisions: next.decisions,
      package: next,
      summary: next.summary,
      recommendationInput: next.recommendationInput,
      createdAt: at,
    });
  }

  resolve(input: DecisionInput): DecisionResult {
    const built = this.ensurePackage(input);
    if (!built.success || !built.package) return built;
    const at = this.clock();
    const pkg = built.package;
    const resolutions = planResolutions({
      conflicts: pkg.conflicts,
      candidates: pkg.candidates,
      at,
    });
    const conflicts = resolveConflicts({
      conflicts: pkg.conflicts,
      resolutions,
    });
    let decisions = resolveDecisions({
      athleteId: pkg.decisionContext.athleteId,
      sessionId: pkg.decisionContext.sessionId,
      conversationId: pkg.decisionContext.conversationId,
      contextId: pkg.decisionContext.contextId,
      candidates: pkg.candidates,
      evaluations: pkg.evaluations,
      resolutions,
      at,
    });
    decisions = resolveMerge(decisions);
    decisions = resolvePriorities(decisions);

    const summary = buildDecisionSummary({
      id: `summary:resolve:${input.id}`,
      athleteId: pkg.decisionContext.athleteId,
      contextId: pkg.decisionContext.contextId,
      decisions,
      candidateCount: pkg.candidates.length,
      conflictCount: conflicts.length,
      resolutionCount: resolutions.length,
      focusAreas: pkg.decisionContext.focusAreas,
    });
    const recommendationInput = buildRecommendationEngineInput({
      id: `rec-input:resolve:${input.id}`,
      athleteId: pkg.decisionContext.athleteId,
      contextId: pkg.decisionContext.contextId,
      decisions,
      summary,
      at,
    });
    const next = buildDecisionPackage({
      id: `package:resolve:${input.id}`,
      decisionContext: pkg.decisionContext,
      candidates: pkg.candidates,
      decisions,
      evaluations: pkg.evaluations,
      conflicts,
      resolutions,
      constraints: pkg.constraints,
      dependencies: pkg.dependencies,
      plan: pkg.plan,
      graph: pkg.graph,
      summary,
      snapshot: pkg.snapshot,
      recommendationInput,
      warnings: pkg.diagnostics.warnings,
      at,
    });
    this.session.put(next, DecisionSessionStatuses.READY);
    return buildDecisionResult({
      id: `result:resolve:${input.id}`,
      operation: DecisionOperationKinds.RESOLVE,
      success: true,
      decisions: next.decisions,
      package: next,
      summary: next.summary,
      recommendationInput: next.recommendationInput,
      createdAt: at,
    });
  }

  validate(input: DecisionInput): DecisionResult {
    const built = this.ensurePackage(input);
    if (!built.success || !built.package) return built;
    const at = this.clock();
    const validation = validateDecisionPackage(built.package);
    return buildDecisionResult({
      id: `result:validate:${input.id}`,
      operation: DecisionOperationKinds.VALIDATE,
      success: validation.valid,
      decisions: built.package.decisions,
      package: built.package,
      summary: built.package.summary,
      validation,
      errors: validation.errors,
      createdAt: at,
    });
  }

  getSession(): DecisionSession {
    return this.session;
  }

  private ensurePackage(input: DecisionInput): DecisionResult {
    const existing = this.session.getPackage();
    if (existing) {
      return buildDecisionResult({
        id: `result:cached:${input.id}`,
        operation: DecisionOperationKinds.BUILD,
        success: true,
        decisions: existing.decisions,
        package: existing,
        summary: existing.summary,
        recommendationInput: existing.recommendationInput,
        createdAt: this.clock(),
      });
    }
    return this.build(input);
  }

  private resolveDecisionContext(input: DecisionInput, at: string) {
    if (input.decisionContext) return input.decisionContext;
    if (!this.contextFusionPort) return null;
    const unified = this.contextFusionPort.loadUnifiedContext({
      athleteId: input.athleteId,
      sessionId: input.sessionId,
      conversationId: input.conversationId,
      contextId: input.contextId,
      at,
    });
    if (!unified) return null;
    const handoff = this.contextFusionPort.loadDecisionEngineContext({
      athleteId: input.athleteId,
      sessionId: input.sessionId,
      conversationId: input.conversationId,
      contextId: input.contextId,
      at,
    });
    return buildDecisionContext({
      id: `decision-context:${input.id}`,
      unified,
      handoff,
      at,
    });
  }
}

export function createDecisionCoordinator(
  deps: DecisionCoordinatorDeps = {},
): DecisionCoordinator {
  return new DecisionCoordinator(deps);
}
