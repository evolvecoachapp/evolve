/**
 * Sprint 22.4 — Recommendation Engine generator part 4
 * (recommendation/, services, application, tests, index).
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve("app/src/features/recommendation-engine");

function write(rel, contents) {
  const full = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, contents.replace(/\r?\n/g, "\n"), "utf8");
}

write(
  "recommendation/RecommendationSession.ts",
  `import type { RecommendationPackage } from "../models/RecommendationPackage";
import type { RecommendationState } from "../models/RecommendationState";
import { RecommendationSessionStatuses } from "../models/RecommendationState";
import { freezePackage, freezeState } from "../utils/FreezeRecommendationState";

/**
 * In-memory recommendation session holding the latest immutable package.
 */
export class RecommendationSession {
  private state: RecommendationState;

  constructor(at: string) {
    this.state = freezeState({
      status: RecommendationSessionStatuses.IDLE,
      package: null,
      recommendations: Object.freeze([]),
      updatedAt: at,
    });
  }

  getState(): RecommendationState {
    return this.state;
  }

  getPackage(): RecommendationPackage | null {
    return this.state.package;
  }

  put(
    pkg: RecommendationPackage,
    status = RecommendationSessionStatuses.READY,
  ): RecommendationPackage {
    const frozen = freezePackage(pkg);
    this.state = freezeState({
      status,
      package: frozen,
      recommendations: frozen.recommendations,
      updatedAt: frozen.createdAt,
    });
    return frozen;
  }

  clear(at: string): void {
    this.state = freezeState({
      status: RecommendationSessionStatuses.IDLE,
      package: null,
      recommendations: Object.freeze([]),
      updatedAt: at,
    });
  }
}

export function createRecommendationSession(at: string): RecommendationSession {
  return new RecommendationSession(at);
}
`,
);

write(
  "recommendation/RecommendationCoordinator.ts",
  `import { buildExplainabilityInput } from "../builders/ExplainabilityInputBuilder";
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
      id: \`result:describe:\${this.runtimeId}\`,
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
        id: \`result:build:error:\${input.id}\`,
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
      id: \`result:build:\${input.id}\`,
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
        id: \`result:prioritize:error:\${input.id}\`,
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
    const dependencies = applyDependencyPolicy(base.dependencies);
    recommendations = resolveDependencies({ recommendations, dependencies });
    recommendations = resolveOrdering({ recommendations, dependencies });

    const conflicts = applyConflictPolicy(recommendations);
    const resolved = resolveConflicts({ recommendations, conflicts });

    const groups = planGroups(resolved.recommendations);
    const plan = planRecommendations({
      planId: \`plan:prio:\${input.id}\`,
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
      id: \`summary:prio:\${input.id}\`,
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
      id: \`snapshot:prio:\${input.id}\`,
      athleteId: base.athleteId,
      contextId: base.contextId,
      recommendations: resolved.recommendations,
      summary,
      at,
    });
    const view = formatRecommendationView({
      id: \`view:prio:\${input.id}\`,
      athleteId: base.athleteId,
      contextId: base.contextId,
      recommendations: resolved.recommendations,
      groups,
      at,
    });
    const explainabilityInput = buildExplainabilityInput({
      id: \`explain:prio:\${input.id}\`,
      athleteId: base.athleteId,
      contextId: base.contextId,
      recommendations: resolved.recommendations,
      decisionIds: base.recommendationContext.decisionIds,
      summary,
      at,
    });
    const timeline = buildRecommendationTimeline({
      id: \`timeline:prio:\${input.id}\`,
      steps: Object.freeze(["prioritize", "resolve", "order"]),
      subjectId: input.id,
      at,
    });

    const pkg = packageRecommendations({
      id: \`package:prio:\${input.id}\`,
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
      id: \`result:prioritize:\${input.id}\`,
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
        id: \`result:package:\${input.id}\`,
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
        id: \`result:validate:error:\${input.id}\`,
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
      id: \`result:validate:\${input.id}\`,
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
      id: \`rec-ctx:\${input.id}\`,
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

    const groups = planGroups(recommendations);
    const sequences = planSequences(recommendations);
    const plan = planRecommendations({
      planId: \`plan:\${input.inputId}\`,
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
      id: \`summary:\${input.inputId}\`,
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
      id: \`snapshot:\${input.inputId}\`,
      athleteId: input.context.athleteId,
      contextId: input.context.contextId,
      recommendations,
      summary,
      at: input.at,
    });
    const view = formatRecommendationView({
      id: \`view:\${input.inputId}\`,
      athleteId: input.context.athleteId,
      contextId: input.context.contextId,
      recommendations,
      groups,
      at: input.at,
    });
    const explainabilityInput = buildExplainabilityInput({
      id: \`explain:\${input.inputId}\`,
      athleteId: input.context.athleteId,
      contextId: input.context.contextId,
      recommendations,
      decisionIds: input.context.decisionIds,
      summary,
      at: input.at,
    });
    const timeline = buildRecommendationTimeline({
      id: \`timeline:\${input.inputId}\`,
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
      id: \`package:\${input.inputId}\`,
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
`,
);

write(
  "recommendation/RecommendationEngine.ts",
  `import { buildRecommendationDescriptor } from "../builders/RecommendationDescriptorBuilder";
import type { RecommendationDescriptor } from "../models/RecommendationDescriptor";
import type { RecommendationInput } from "../models/RecommendationInput";
import type { RecommendationResult } from "../models/RecommendationResult";
import {
  createRecommendationCoordinator,
  type RecommendationCoordinator,
  type RecommendationCoordinatorDeps,
} from "./RecommendationCoordinator";

export type RecommendationEngineDeps = RecommendationCoordinatorDeps;

/**
 * Recommendation Engine — deterministic recommendation orchestration only.
 *
 * CoachingDecision → CoachingRecommendation / RecommendationPackage
 *
 * No AI. No NL. No domain calculations. No action execution.
 * No OpenAI SDK. No Prompt Builder. No Tool Runtime. No networking. No persistence.
 */
export class RecommendationEngine {
  private readonly coordinator: RecommendationCoordinator;
  private readonly clock: () => string;
  private readonly runtimeId: string;

  constructor(deps: RecommendationEngineDeps = {}) {
    this.clock = deps.clock ?? (() => new Date().toISOString());
    this.runtimeId = deps.runtimeId ?? "runtime:recommendation-engine";
    this.coordinator = createRecommendationCoordinator({
      ...deps,
      clock: this.clock,
      runtimeId: this.runtimeId,
    });
  }

  describe(): RecommendationDescriptor {
    return buildRecommendationDescriptor({
      id: this.runtimeId,
      createdAt: this.clock(),
    });
  }

  buildRecommendations(input: RecommendationInput): RecommendationResult {
    return this.coordinator.build(input);
  }

  prioritizeRecommendations(input: RecommendationInput): RecommendationResult {
    return this.coordinator.prioritize(input);
  }

  packageRecommendations(input: RecommendationInput): RecommendationResult {
    return this.coordinator.package(input);
  }

  validateRecommendations(input: RecommendationInput): RecommendationResult {
    return this.coordinator.validate(input);
  }

  describeRecommendations(): RecommendationResult {
    return this.coordinator.describe();
  }

  getCoordinator(): RecommendationCoordinator {
    return this.coordinator;
  }
}

export function createRecommendationEngine(
  deps: RecommendationEngineDeps = {},
): RecommendationEngine {
  return new RecommendationEngine(deps);
}
`,
);

write(
  "recommendation/index.ts",
  `export * from "./RecommendationEngine";
export * from "./RecommendationCoordinator";
export * from "./RecommendationSession";
`,
);

write(
  "services/RecommendationEngineService.ts",
  `import {
  createRecommendationEngine,
  type RecommendationEngine,
  type RecommendationEngineDeps,
} from "../recommendation/RecommendationEngine";
import type { RecommendationDescriptor } from "../models/RecommendationDescriptor";
import type { RecommendationInput } from "../models/RecommendationInput";
import type { RecommendationResult } from "../models/RecommendationResult";

export type RecommendationEngineServiceDeps = RecommendationEngineDeps;

/**
 * Recommendation Engine Service — orchestration facade.
 *
 * CoachingDecision → CoachingRecommendation → ExplainabilityInput
 *
 * No networking. No persistence. No provider SDKs. No AI. No domain calculations.
 */
export class RecommendationEngineService {
  private readonly engine: RecommendationEngine;

  constructor(deps: RecommendationEngineServiceDeps = {}) {
    this.engine = createRecommendationEngine(deps);
  }

  buildRecommendations(input: RecommendationInput): RecommendationResult {
    return this.engine.buildRecommendations(input);
  }

  prioritizeRecommendations(input: RecommendationInput): RecommendationResult {
    return this.engine.prioritizeRecommendations(input);
  }

  packageRecommendations(input: RecommendationInput): RecommendationResult {
    return this.engine.packageRecommendations(input);
  }

  describeRecommendations(): RecommendationDescriptor {
    return this.engine.describe();
  }

  validateRecommendations(input: RecommendationInput): RecommendationResult {
    return this.engine.validateRecommendations(input);
  }
}

export function createRecommendationEngineService(
  deps: RecommendationEngineServiceDeps = {},
): RecommendationEngineService {
  return new RecommendationEngineService(deps);
}
`,
);

write(
  "services/index.ts",
  `export * from "./RecommendationEngineService";
`,
);

write(
  "application/index.ts",
  `import type { RecommendationDescriptor } from "../models/RecommendationDescriptor";
import type { RecommendationInput } from "../models/RecommendationInput";
import type { RecommendationResult } from "../models/RecommendationResult";
import {
  createRecommendationEngineService,
  type RecommendationEngineService,
  type RecommendationEngineServiceDeps,
} from "../services/RecommendationEngineService";

function resolveService(
  service?: RecommendationEngineService,
  deps?: RecommendationEngineServiceDeps,
): RecommendationEngineService {
  return service ?? createRecommendationEngineService(deps);
}

/**
 * Public API — build immutable coaching recommendations from decisions.
 */
export function buildRecommendations(options: {
  readonly input: RecommendationInput;
  readonly service?: RecommendationEngineService;
  readonly deps?: RecommendationEngineServiceDeps;
}): RecommendationResult {
  return resolveService(options.service, options.deps).buildRecommendations(
    options.input,
  );
}

/**
 * Public API — prioritize recommendation package.
 */
export function prioritizeRecommendations(options: {
  readonly input: RecommendationInput;
  readonly service?: RecommendationEngineService;
  readonly deps?: RecommendationEngineServiceDeps;
}): RecommendationResult {
  return resolveService(
    options.service,
    options.deps,
  ).prioritizeRecommendations(options.input);
}

/**
 * Public API — package recommendations for downstream consumers.
 */
export function packageRecommendations(options: {
  readonly input: RecommendationInput;
  readonly service?: RecommendationEngineService;
  readonly deps?: RecommendationEngineServiceDeps;
}): RecommendationResult {
  return resolveService(options.service, options.deps).packageRecommendations(
    options.input,
  );
}

/**
 * Public API — describe Recommendation Engine capabilities.
 */
export function describeRecommendations(options: {
  readonly service?: RecommendationEngineService;
  readonly deps?: RecommendationEngineServiceDeps;
} = {}): RecommendationDescriptor {
  return resolveService(
    options.service,
    options.deps,
  ).describeRecommendations();
}

/**
 * Public API — validate recommendation package integrity.
 */
export function validateRecommendations(options: {
  readonly input: RecommendationInput;
  readonly service?: RecommendationEngineService;
  readonly deps?: RecommendationEngineServiceDeps;
}): RecommendationResult {
  return resolveService(options.service, options.deps).validateRecommendations(
    options.input,
  );
}

export type { RecommendationEngineServiceDeps };
`,
);

write(
  "index.ts",
  `/**
 * Recommendation Engine
 *
 * Sprint 22.4 — Recommendation Engine Foundation.
 *
 * UnifiedCoachingContext
 *   ↓
 * Decision Engine
 *   ↓
 * CoachingDecision
 *   ↓
 * Recommendation Engine
 *   ↓
 * CoachingRecommendation
 *   ↓
 * Explainability Engine
 *   ↓
 * Coach Supervisor
 *
 * Deterministic recommendation orchestration only.
 * Owns planning + prioritization + packaging of coaching recommendations.
 *
 * No AI. No NL. No domain calculations. No persistence. No networking. No UI.
 * No OpenAI SDK. No Prompt Builder. No Tool Runtime. No Action Engine.
 */

export * from "./models";
export {
  buildRecommendations,
  prioritizeRecommendations,
  packageRecommendations,
  describeRecommendations,
  validateRecommendations,
} from "./application";
export {
  RecommendationEngineService,
  createRecommendationEngineService,
} from "./services";
`,
);

write(
  "testSupport/fixtures.ts",
  `import { createMockAthleteStatePort } from "../contracts/AthleteStatePort";
import { createMockCoachSupervisorPort } from "../contracts/CoachSupervisorPort";
import { createMockContextFusionPort } from "../contracts/ContextFusionPort";
import { createMockDecisionEnginePort } from "../contracts/DecisionEnginePort";
import { EMPTY_RECOMMENDATION_METADATA } from "../models/RecommendationMetadata";
import {
  RecommendationInputKinds,
  type RecommendationInput,
} from "../models/RecommendationInput";
import {
  createRecommendationEngineService,
  type RecommendationEngineService,
} from "../services/RecommendationEngineService";
import { freezeInput } from "../utils/FreezeRecommendationState";

export const FIXED_TIMESTAMP = "2026-07-25T12:00:00.000Z";

export function createFixedClock(ts = FIXED_TIMESTAMP): () => string {
  return () => ts;
}

export function createRecommendationInput(
  overrides: Partial<RecommendationInput> = {},
): RecommendationInput {
  return freezeInput({
    id: overrides.id ?? "request:recommendation-engine:test",
    kind: overrides.kind ?? RecommendationInputKinds.BUILD,
    athleteId: overrides.athleteId ?? "athlete:1",
    sessionId: overrides.sessionId ?? "session:coach:1",
    conversationId: overrides.conversationId ?? "conversation:1",
    contextId: overrides.contextId ?? "context:athlete:1",
    recommendationContext: overrides.recommendationContext ?? null,
    decisionHandoff: overrides.decisionHandoff ?? null,
    decisions: Object.freeze([...(overrides.decisions ?? [])]),
    recommendations: Object.freeze([...(overrides.recommendations ?? [])]),
    reason: overrides.reason ?? "test build",
    metadata: overrides.metadata ?? EMPTY_RECOMMENDATION_METADATA,
    createdAt: overrides.createdAt ?? FIXED_TIMESTAMP,
  });
}

export function createTestRecommendationEngineService(
  overrides: {
    readonly clock?: () => string;
    readonly withMocks?: boolean;
  } = {},
): RecommendationEngineService {
  const withMocks = overrides.withMocks ?? true;
  return createRecommendationEngineService({
    decisionEnginePort: withMocks ? createMockDecisionEnginePort() : undefined,
    contextFusionPort: withMocks ? createMockContextFusionPort() : undefined,
    athleteStatePort: withMocks ? createMockAthleteStatePort() : undefined,
    supervisorPort: withMocks ? createMockCoachSupervisorPort() : undefined,
    clock: overrides.clock ?? createFixedClock(),
  });
}
`,
);

write(
  "__tests__/application.test.ts",
  `import {
  buildRecommendations,
  describeRecommendations,
  packageRecommendations,
  prioritizeRecommendations,
  validateRecommendations,
} from "../application";
import { RecommendationInputKinds } from "../models/RecommendationInput";
import { RecommendationOperationKinds } from "../models/RecommendationResult";
import {
  createRecommendationInput,
  createTestRecommendationEngineService,
} from "../testSupport/fixtures";

describe("recommendation-engine application", () => {
  it("exposes public API build → prioritize → package → validate → describe", () => {
    const service = createTestRecommendationEngineService();

    const built = buildRecommendations({
      service,
      input: createRecommendationInput({ kind: RecommendationInputKinds.BUILD }),
    });
    expect(built.success).toBe(true);
    expect(built.operation).toBe(RecommendationOperationKinds.BUILD);
    expect(built.explainabilityInput).not.toBeNull();
    expect(Object.isFrozen(built.recommendations[0])).toBe(true);

    const prioritized = prioritizeRecommendations({
      service,
      input: createRecommendationInput({
        id: "request:prioritize",
        kind: RecommendationInputKinds.PRIORITIZE,
      }),
    });
    expect(prioritized.success).toBe(true);
    expect(prioritized.operation).toBe(RecommendationOperationKinds.PRIORITIZE);

    const packaged = packageRecommendations({
      service,
      input: createRecommendationInput({
        id: "request:package",
        kind: RecommendationInputKinds.PACKAGE,
      }),
    });
    expect(packaged.success).toBe(true);
    expect(packaged.operation).toBe(RecommendationOperationKinds.PACKAGE);

    const validated = validateRecommendations({
      service,
      input: createRecommendationInput({
        id: "request:validate",
        kind: RecommendationInputKinds.VALIDATE,
      }),
    });
    expect(validated.operation).toBe(RecommendationOperationKinds.VALIDATE);
    expect(validated.success).toBe(true);

    const caps = describeRecommendations({ service });
    expect(caps.name).toBe("Recommendation Engine");
    expect(caps.capabilities).toEqual(
      expect.arrayContaining([
        "buildRecommendations",
        "prioritizeRecommendations",
        "packageRecommendations",
        "describeRecommendations",
        "validateRecommendations",
      ]),
    );
  });
});
`,
);

write(
  "__tests__/planning.test.ts",
  `import { planActions } from "../planning/ActionPlanner";
import { planDependencies } from "../planning/DependencyPlanner";
import { planGroups } from "../planning/GroupingPlanner";
import { planRecommendations } from "../planning/RecommendationPlanner";
import { planSequences } from "../planning/SequencePlanner";
import {
  createRecommendationInput,
  createTestRecommendationEngineService,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("recommendation-engine planning", () => {
  it("plans groups, dependencies, sequences, and ordered ids", () => {
    const service = createTestRecommendationEngineService();
    const built = service.buildRecommendations(createRecommendationInput());
    const recommendations = built.recommendations;

    const plan = planRecommendations({
      planId: "plan:test",
      athleteId: "athlete:1",
      contextId: "context:athlete:1",
      recommendations,
      at: FIXED_TIMESTAMP,
    });
    expect(plan.orderedIds.length).toBe(recommendations.length);

    const groups = planGroups(recommendations);
    expect(groups.length).toBeGreaterThan(0);

    const deps = planDependencies(recommendations);
    expect(deps.some((d) => d.kind === "blocks")).toBe(true);

    const steps = planActions(recommendations);
    expect(steps.length).toBeGreaterThan(0);

    const sequences = planSequences(recommendations);
    expect(sequences[0]?.ordered).toBe(true);
  });
});
`,
);

write(
  "__tests__/prioritization.test.ts",
  `import { applyConflictPolicy } from "../policies/ConflictPolicy";
import { resolveConflicts } from "../prioritization/ConflictResolver";
import { resolveOrdering } from "../prioritization/OrderingResolver";
import { resolvePriorities } from "../prioritization/PriorityResolver";
import { resolveUrgency } from "../prioritization/UrgencyResolver";
import { planDependencies } from "../planning/DependencyPlanner";
import {
  createRecommendationInput,
  createTestRecommendationEngineService,
} from "../testSupport/fixtures";

describe("recommendation-engine prioritization", () => {
  it("orders safety first and resolves conflicts deterministically", () => {
    const service = createTestRecommendationEngineService();
    const built = service.buildRecommendations(createRecommendationInput());
    let recommendations = resolveUrgency(built.recommendations);
    recommendations = resolvePriorities(recommendations);
    expect(recommendations[0]?.category).toBe("safety");

    const dependencies = planDependencies(recommendations);
    const ordered = resolveOrdering({ recommendations, dependencies });
    expect(ordered.map((r) => r.id).sort()).toEqual(
      recommendations.map((r) => r.id).sort(),
    );

    const conflicts = applyConflictPolicy(recommendations);
    const resolved = resolveConflicts({ recommendations, conflicts });
    expect(resolved.conflicts.every((c) => c.resolved)).toBe(true);
    expect(resolved.resolutions.length).toBe(conflicts.length);
  });
});
`,
);

write(
  "__tests__/packaging.test.ts",
  `import { assembleRecommendations } from "../packaging/RecommendationAssembler";
  import { exportRecommendationOutput } from "../packaging/RecommendationExporter";
  import { formatRecommendationView } from "../packaging/RecommendationFormatter";
  import {
    createRecommendationInput,
    createTestRecommendationEngineService,
    FIXED_TIMESTAMP,
  } from "../testSupport/fixtures";

describe("recommendation-engine packaging", () => {
  it("packages view, collection, and explainability handoff", () => {
    const service = createTestRecommendationEngineService();
    const built = service.buildRecommendations(createRecommendationInput());
    expect(built.package).not.toBeNull();
    expect(built.explainabilityInput).not.toBeNull();

    const view = formatRecommendationView({
      id: "view:test",
      athleteId: "athlete:1",
      contextId: "context:athlete:1",
      recommendations: built.recommendations,
      groups: built.package!.groups,
      at: FIXED_TIMESTAMP,
    });
    expect(view.primary).not.toBeNull();
    expect(view.ordered.length).toBe(built.recommendations.length);

    const collection = assembleRecommendations({
      id: "collection:test",
      athleteId: "athlete:1",
      contextId: "context:athlete:1",
      recommendations: built.recommendations,
      at: FIXED_TIMESTAMP,
    });
    expect(collection.items.length).toBe(built.recommendations.length);

    const output = exportRecommendationOutput(built.package!);
    expect(output.explainabilityInput?.recommendationIds.length).toBe(
      built.recommendations.length,
    );
  });
});
`,
);

write(
  "__tests__/builders.test.ts",
  `import { buildRecommendationsFromDecisions } from "../builders/RecommendationBuilder";
import { buildRecommendationSummary } from "../builders/SummaryBuilder";
import { buildRecommendationSnapshot } from "../builders/SnapshotBuilder";
import { createMockDecisionEnginePort } from "../contracts/DecisionEnginePort";
import {
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("recommendation-engine builders", () => {
  it("builds immutable recommendations from decisions", () => {
    const port = createMockDecisionEnginePort();
    const decisions = port.loadDecisions({
      athleteId: "athlete:1",
      sessionId: "session:1",
      conversationId: "conversation:1",
      contextId: "context:1",
      at: FIXED_TIMESTAMP,
    });
    const recommendations = buildRecommendationsFromDecisions({
      decisions,
      at: FIXED_TIMESTAMP,
    });
    expect(recommendations.length).toBe(decisions.length);
    expect(Object.isFrozen(recommendations[0])).toBe(true);
    expect(recommendations[0]?.decisionId).toBe(decisions[0]?.id);

    const summary = buildRecommendationSummary({
      id: "summary:test",
      athleteId: "athlete:1",
      contextId: "context:1",
      recommendations,
      groupCount: 1,
      conflictCount: 0,
      resolutionCount: 0,
      focusAreas: Object.freeze(["training"]),
      at: FIXED_TIMESTAMP,
    });
    expect(summary.recommendationCount).toBe(recommendations.length);

    const snapshot = buildRecommendationSnapshot({
      id: "snapshot:test",
      athleteId: "athlete:1",
      contextId: "context:1",
      recommendations,
      summary,
      at: FIXED_TIMESTAMP,
    });
    expect(snapshot.recommendations.length).toBe(recommendations.length);
  });
});
`,
);

write(
  "__tests__/validators.test.ts",
  `import {
    createRecommendationInput,
    createTestRecommendationEngineService,
  } from "../testSupport/fixtures";
  import { validateRecommendationPackage } from "../validators/validateRecommendationPackage";
  import { validateRecommendationIntegrity } from "../validators/validateRecommendationIntegrity";

describe("recommendation-engine validators", () => {
  it("validates package integrity and context consistency", () => {
    const service = createTestRecommendationEngineService();
    const built = service.buildRecommendations(createRecommendationInput());
    const validation = validateRecommendationPackage(built.package!);
    expect(validation.valid).toBe(true);
    expect(validateRecommendationIntegrity(built.recommendations)).toEqual([]);
  });
});
`,
);

write(
  "__tests__/policies.test.ts",
  `import { applyConflictPolicy } from "../policies/ConflictPolicy";
import { applyPriorityPolicy } from "../policies/PriorityPolicy";
import { applySafetyPolicy } from "../policies/SafetyPolicy";
import {
  createRecommendationInput,
  createTestRecommendationEngineService,
} from "../testSupport/fixtures";

describe("recommendation-engine policies", () => {
  it("applies safety and priority policies deterministically", () => {
    const service = createTestRecommendationEngineService();
    const built = service.buildRecommendations(createRecommendationInput());
    const safe = applySafetyPolicy(built.recommendations);
    expect(safe.find((r) => r.category === "safety")?.intent).toBe("escalate");
    const prioritized = applyPriorityPolicy(safe);
    expect(prioritized[0]?.category).toBe("safety");
    const conflicts = applyConflictPolicy(prioritized);
    expect(conflicts.length).toBeGreaterThan(0);
  });
});
`,
);

write(
  "__tests__/integration.test.ts",
  `import { buildDecision } from "../../decision-engine/application";
import { DecisionInputKinds } from "../../decision-engine/models/DecisionInput";
import {
  createDecisionInput,
  createTestDecisionEngineService,
} from "../../decision-engine/testSupport/fixtures";
import { buildRecommendations } from "../application";
import { RecommendationInputKinds } from "../models/RecommendationInput";
import {
  createRecommendationInput,
  createTestRecommendationEngineService,
} from "../testSupport/fixtures";

describe("recommendation-engine integration", () => {
  it("consumes Decision Engine CoachingDecision / RecommendationEngineInput", () => {
    const decisionService = createTestDecisionEngineService();
    const decided = buildDecision({
      service: decisionService,
      input: createDecisionInput({ kind: DecisionInputKinds.BUILD }),
    });
    expect(decided.success).toBe(true);
    expect(decided.decisions.length).toBeGreaterThan(0);

    const recService = createTestRecommendationEngineService({
      withMocks: false,
    });
    const result = buildRecommendations({
      service: recService,
      input: createRecommendationInput({
        kind: RecommendationInputKinds.BUILD,
        decisions: decided.decisions,
        decisionHandoff: decided.recommendationInput,
        athleteId: decided.decisions[0]!.athleteId,
        contextId: decided.decisions[0]!.contextId,
      }),
    });

    expect(result.success).toBe(true);
    expect(result.package).not.toBeNull();
    expect(result.explainabilityInput).not.toBeNull();
    expect(
      result.recommendations.every(
        (r) => r.contextId === decided.decisions[0]!.contextId,
      ),
    ).toBe(true);
  });
});
`,
);

write(
  "__tests__/regression.test.ts",
  `import {
  createRecommendationInput,
  createTestRecommendationEngineService,
} from "../testSupport/fixtures";

describe("recommendation-engine regression", () => {
  it("is deterministic for identical inputs", () => {
    const a = createTestRecommendationEngineService();
    const b = createTestRecommendationEngineService();
    const input = createRecommendationInput();
    const left = a.buildRecommendations(input);
    const right = b.buildRecommendations(input);
    expect(left.recommendations.map((r) => r.id)).toEqual(
      right.recommendations.map((r) => r.id),
    );
    expect(left.recommendations.map((r) => r.priority.ordinal)).toEqual(
      right.recommendations.map((r) => r.priority.ordinal),
    );
    expect(left.package!.statistics).toEqual(right.package!.statistics);
  });

  it("never attaches provider or network fields", () => {
    const service = createTestRecommendationEngineService();
    const result = service.buildRecommendations(createRecommendationInput());
    const serialized = JSON.stringify(result.package);
    expect(serialized).not.toMatch(/openai|anthropic|http:\\/\\/|https:\\/\\//i);
  });
});
`,
);

console.log("recommendation-engine part 4 written");
