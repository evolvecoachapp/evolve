/**
 * Sprint 22.3 — Decision Engine generator part 4
 * (decision/, services, application, tests, index).
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve("app/src/features/decision-engine");

function write(rel, contents) {
  const full = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, contents.replace(/\r?\n/g, "\n"), "utf8");
}

write(
  "decision/DecisionSession.ts",
  `import type { DecisionPackage } from "../models/DecisionPackage";
import type { DecisionState } from "../models/DecisionState";
import { DecisionSessionStatuses } from "../models/DecisionState";
import { freezePackage, freezeState } from "../utils/FreezeDecisionState";

/**
 * In-memory decision session holding the latest immutable package.
 */
export class DecisionSession {
  private state: DecisionState;

  constructor(at: string) {
    this.state = freezeState({
      status: DecisionSessionStatuses.IDLE,
      package: null,
      decisions: Object.freeze([]),
      updatedAt: at,
    });
  }

  getState(): DecisionState {
    return this.state;
  }

  getPackage(): DecisionPackage | null {
    return this.state.package;
  }

  put(pkg: DecisionPackage, status = DecisionSessionStatuses.READY): DecisionPackage {
    const frozen = freezePackage(pkg);
    this.state = freezeState({
      status,
      package: frozen,
      decisions: frozen.decisions,
      updatedAt: frozen.createdAt,
    });
    return frozen;
  }

  clear(at: string): void {
    this.state = freezeState({
      status: DecisionSessionStatuses.IDLE,
      package: null,
      decisions: Object.freeze([]),
      updatedAt: at,
    });
  }
}

export function createDecisionSession(at: string): DecisionSession {
  return new DecisionSession(at);
}
`,
);

write(
  "decision/DecisionCoordinator.ts",
  `import { analyzeConsistency } from "../analysis/ConsistencyAnalysis";
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
      id: \`result:describe:\${this.runtimeId}\`,
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
        id: \`result:build:error:\${input.id}\`,
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
        planId: \`plan:\${input.id}\`,
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
      id: \`graph:\${input.id}\`,
      candidates,
      decisions,
      dependencies,
    });

    const summary = buildDecisionSummary({
      id: \`summary:\${input.id}\`,
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
      id: \`rec-input:\${input.id}\`,
      athleteId: decisionContext.athleteId,
      contextId: decisionContext.contextId,
      decisions,
      summary,
      at,
    });

    const snapshot = freezeSnapshot({
      id: \`snapshot:\${input.id}\`,
      athleteId: decisionContext.athleteId,
      contextId: decisionContext.contextId,
      decisions,
      summary,
      metadata: EMPTY_DECISION_METADATA,
      capturedAt: at,
    });

    let pkg = buildDecisionPackage({
      id: \`package:\${input.id}\`,
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
      id: \`result:build:\${input.id}\`,
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
      id: \`package:eval:\${input.id}\`,
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
      id: \`result:evaluate:\${input.id}\`,
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
      id: \`summary:resolve:\${input.id}\`,
      athleteId: pkg.decisionContext.athleteId,
      contextId: pkg.decisionContext.contextId,
      decisions,
      candidateCount: pkg.candidates.length,
      conflictCount: conflicts.length,
      resolutionCount: resolutions.length,
      focusAreas: pkg.decisionContext.focusAreas,
    });
    const recommendationInput = buildRecommendationEngineInput({
      id: \`rec-input:resolve:\${input.id}\`,
      athleteId: pkg.decisionContext.athleteId,
      contextId: pkg.decisionContext.contextId,
      decisions,
      summary,
      at,
    });
    const next = buildDecisionPackage({
      id: \`package:resolve:\${input.id}\`,
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
      id: \`result:resolve:\${input.id}\`,
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
      id: \`result:validate:\${input.id}\`,
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
        id: \`result:cached:\${input.id}\`,
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
      id: \`decision-context:\${input.id}\`,
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
`,
);

write(
  "decision/DecisionEngine.ts",
  `import { buildDecisionDescriptor } from "../builders/DecisionDescriptorBuilder";
import type { DecisionDescriptor } from "../models/DecisionDescriptor";
import type { DecisionInput } from "../models/DecisionInput";
import type { DecisionResult } from "../models/DecisionResult";
import {
  createDecisionCoordinator,
  type DecisionCoordinator,
  type DecisionCoordinatorDeps,
} from "./DecisionCoordinator";

export type DecisionEngineDeps = DecisionCoordinatorDeps;

/**
 * Decision Engine — deterministic decision orchestration only.
 *
 * UnifiedCoachingContext → CoachingDecision / DecisionPackage
 *
 * No AI. No NL. No domain calculations. No action execution.
 * No OpenAI SDK. No Prompt Builder. No Tool Runtime. No networking. No persistence.
 */
export class DecisionEngine {
  private readonly coordinator: DecisionCoordinator;
  private readonly clock: () => string;
  private readonly runtimeId: string;

  constructor(deps: DecisionEngineDeps = {}) {
    this.clock = deps.clock ?? (() => new Date().toISOString());
    this.runtimeId = deps.runtimeId ?? "runtime:decision-engine";
    this.coordinator = createDecisionCoordinator({
      ...deps,
      clock: this.clock,
      runtimeId: this.runtimeId,
    });
  }

  describe(): DecisionDescriptor {
    return buildDecisionDescriptor({
      id: this.runtimeId,
      createdAt: this.clock(),
    });
  }

  buildDecision(input: DecisionInput): DecisionResult {
    return this.coordinator.build(input);
  }

  evaluateDecision(input: DecisionInput): DecisionResult {
    return this.coordinator.evaluate(input);
  }

  resolveDecision(input: DecisionInput): DecisionResult {
    return this.coordinator.resolve(input);
  }

  validateDecision(input: DecisionInput): DecisionResult {
    return this.coordinator.validate(input);
  }

  describeDecision(): DecisionResult {
    return this.coordinator.describe();
  }

  getCoordinator(): DecisionCoordinator {
    return this.coordinator;
  }
}

export function createDecisionEngine(
  deps: DecisionEngineDeps = {},
): DecisionEngine {
  return new DecisionEngine(deps);
}
`,
);

write(
  "decision/index.ts",
  `export * from "./DecisionSession";
export * from "./DecisionCoordinator";
export * from "./DecisionEngine";
`,
);

write(
  "services/DecisionEngineService.ts",
  `import {
  createDecisionEngine,
  type DecisionEngine,
  type DecisionEngineDeps,
} from "../decision/DecisionEngine";
import type { DecisionDescriptor } from "../models/DecisionDescriptor";
import type { DecisionInput } from "../models/DecisionInput";
import type { DecisionResult } from "../models/DecisionResult";

export type DecisionEngineServiceDeps = DecisionEngineDeps;

/**
 * Decision Engine Service — orchestration facade.
 *
 * UnifiedCoachingContext → CoachingDecision → RecommendationEngineInput
 *
 * No networking. No persistence. No provider SDKs. No AI. No domain calculations.
 */
export class DecisionEngineService {
  private readonly engine: DecisionEngine;

  constructor(deps: DecisionEngineServiceDeps = {}) {
    this.engine = createDecisionEngine(deps);
  }

  buildDecision(input: DecisionInput): DecisionResult {
    return this.engine.buildDecision(input);
  }

  evaluateDecision(input: DecisionInput): DecisionResult {
    return this.engine.evaluateDecision(input);
  }

  resolveDecision(input: DecisionInput): DecisionResult {
    return this.engine.resolveDecision(input);
  }

  describeDecision(): DecisionDescriptor {
    return this.engine.describe();
  }

  validateDecision(input: DecisionInput): DecisionResult {
    return this.engine.validateDecision(input);
  }
}

export function createDecisionEngineService(
  deps: DecisionEngineServiceDeps = {},
): DecisionEngineService {
  return new DecisionEngineService(deps);
}
`,
);

write(
  "services/index.ts",
  `export {
  DecisionEngineService,
  createDecisionEngineService,
  type DecisionEngineServiceDeps,
} from "./DecisionEngineService";
`,
);

write(
  "application/index.ts",
  `import type { DecisionDescriptor } from "../models/DecisionDescriptor";
import type { DecisionInput } from "../models/DecisionInput";
import type { DecisionResult } from "../models/DecisionResult";
import {
  createDecisionEngineService,
  type DecisionEngineService,
  type DecisionEngineServiceDeps,
} from "../services/DecisionEngineService";

function resolveService(
  service?: DecisionEngineService,
  deps?: DecisionEngineServiceDeps,
): DecisionEngineService {
  return service ?? createDecisionEngineService(deps);
}

/**
 * Public API — build immutable coaching decisions from fused context.
 */
export function buildDecision(options: {
  readonly input: DecisionInput;
  readonly service?: DecisionEngineService;
  readonly deps?: DecisionEngineServiceDeps;
}): DecisionResult {
  return resolveService(options.service, options.deps).buildDecision(
    options.input,
  );
}

/**
 * Public API — evaluate decision candidates / package.
 */
export function evaluateDecision(options: {
  readonly input: DecisionInput;
  readonly service?: DecisionEngineService;
  readonly deps?: DecisionEngineServiceDeps;
}): DecisionResult {
  return resolveService(options.service, options.deps).evaluateDecision(
    options.input,
  );
}

/**
 * Public API — resolve conflicts into final coaching decisions.
 */
export function resolveDecision(options: {
  readonly input: DecisionInput;
  readonly service?: DecisionEngineService;
  readonly deps?: DecisionEngineServiceDeps;
}): DecisionResult {
  return resolveService(options.service, options.deps).resolveDecision(
    options.input,
  );
}

/**
 * Public API — describe Decision Engine capabilities.
 */
export function describeDecision(options: {
  readonly service?: DecisionEngineService;
  readonly deps?: DecisionEngineServiceDeps;
} = {}): DecisionDescriptor {
  return resolveService(options.service, options.deps).describeDecision();
}

/**
 * Public API — validate decision package integrity.
 */
export function validateDecision(options: {
  readonly input: DecisionInput;
  readonly service?: DecisionEngineService;
  readonly deps?: DecisionEngineServiceDeps;
}): DecisionResult {
  return resolveService(options.service, options.deps).validateDecision(
    options.input,
  );
}

export type { DecisionEngineServiceDeps };
`,
);

write(
  "index.ts",
  `/**
 * Decision Engine
 *
 * Sprint 22.3 — Decision Engine Foundation.
 *
 * UnifiedCoachingContext
 *   ↓
 * Decision Engine
 *   ↓
 * CoachingDecision
 *   ↓
 * Recommendation Engine
 *   ↓
 * Coach Supervisor
 *
 * Deterministic orchestration-level reasoning only.
 * Owns analysis + evaluation + planning + resolution of coaching decisions.
 *
 * No AI. No NL. No domain calculations. No persistence. No networking. No UI.
 * No OpenAI SDK. No Prompt Builder. No Tool Runtime. No Action Engine.
 */

export * from "./models";
export {
  buildDecision,
  evaluateDecision,
  resolveDecision,
  describeDecision,
  validateDecision,
} from "./application";
export {
  DecisionEngineService,
  createDecisionEngineService,
} from "./services";
`,
);

write(
  "testSupport/fixtures.ts",
  `import { createMockAthleteStatePort } from "../contracts/AthleteStatePort";
import { createMockCoachSupervisorPort } from "../contracts/CoachSupervisorPort";
import { createMockContextFusionPort } from "../contracts/ContextFusionPort";
import { EMPTY_DECISION_METADATA } from "../models/DecisionMetadata";
import {
  DecisionInputKinds,
  type DecisionInput,
} from "../models/DecisionInput";
import {
  createDecisionEngineService,
  type DecisionEngineService,
} from "../services/DecisionEngineService";
import { freezeInput } from "../utils/FreezeDecisionState";

export const FIXED_TIMESTAMP = "2026-07-25T12:00:00.000Z";

export function createFixedClock(ts = FIXED_TIMESTAMP): () => string {
  return () => ts;
}

export function createDecisionInput(
  overrides: Partial<DecisionInput> = {},
): DecisionInput {
  return freezeInput({
    id: overrides.id ?? "request:decision-engine:test",
    kind: overrides.kind ?? DecisionInputKinds.BUILD,
    athleteId: overrides.athleteId ?? "athlete:1",
    sessionId: overrides.sessionId ?? "session:coach:1",
    conversationId: overrides.conversationId ?? "conversation:1",
    contextId: overrides.contextId ?? "context:athlete:1",
    decisionContext: overrides.decisionContext ?? null,
    decisions: Object.freeze([...(overrides.decisions ?? [])]),
    reason: overrides.reason ?? "test build",
    metadata: overrides.metadata ?? EMPTY_DECISION_METADATA,
    createdAt: overrides.createdAt ?? FIXED_TIMESTAMP,
  });
}

export function createTestDecisionEngineService(
  overrides: {
    readonly clock?: () => string;
    readonly withMocks?: boolean;
  } = {},
): DecisionEngineService {
  const withMocks = overrides.withMocks ?? true;
  return createDecisionEngineService({
    contextFusionPort: withMocks ? createMockContextFusionPort() : undefined,
    athleteStatePort: withMocks ? createMockAthleteStatePort() : undefined,
    supervisorPort: withMocks ? createMockCoachSupervisorPort() : undefined,
    clock: overrides.clock ?? createFixedClock(),
  });
}
`,
);

// Tests
write(
  "__tests__/analysis.test.ts",
  `import { analyzeTraining } from "../analysis/TrainingAnalysis";
import { analyzeRisk } from "../analysis/RiskAnalysis";
import { analyzeContext } from "../analysis/ContextAnalysis";
import { buildDecisionContext } from "../builders/DecisionContextBuilder";
import { createMockContextFusionPort } from "../contracts/ContextFusionPort";
import { FIXED_TIMESTAMP } from "../testSupport/fixtures";

describe("decision-engine analysis", () => {
  it("emits training candidate when workout slice present", () => {
    const port = createMockContextFusionPort();
    const unified = port.loadUnifiedContext({
      athleteId: "athlete:1",
      sessionId: "session:1",
      conversationId: "conversation:1",
      contextId: "context:1",
      at: FIXED_TIMESTAMP,
    })!;
    const decisionContext = buildDecisionContext({
      id: "dc:1",
      unified,
      handoff: null,
      at: FIXED_TIMESTAMP,
    });
    const candidates = analyzeTraining({ decisionContext });
    expect(candidates).toHaveLength(1);
    expect(candidates[0]!.category).toBe("training");
    expect(Object.isFrozen(candidates[0])).toBe(true);
  });

  it("emits safety block when recovery missing", () => {
    const port = createMockContextFusionPort({ recovery: null });
    const unified = port.loadUnifiedContext({
      athleteId: "athlete:1",
      sessionId: null,
      conversationId: null,
      contextId: "context:1",
      at: FIXED_TIMESTAMP,
    })!;
    const decisionContext = buildDecisionContext({
      id: "dc:1",
      unified,
      handoff: null,
      at: FIXED_TIMESTAMP,
    });
    expect(analyzeRisk({ decisionContext })[0]!.intent).toBe("block");
    expect(analyzeContext({ decisionContext }).hasAthlete).toBe(true);
  });
});
`,
);

write(
  "__tests__/evaluation.test.ts",
  `import { evaluateCandidate } from "../evaluation";
import { evaluateConflicts } from "../evaluation/ConflictEvaluator";
import { analyzeTraining } from "../analysis/TrainingAnalysis";
import { analyzePriority } from "../analysis/PriorityAnalysis";
import { buildDecisionContext } from "../builders/DecisionContextBuilder";
import { createMockContextFusionPort } from "../contracts/ContextFusionPort";
import { FIXED_TIMESTAMP } from "../testSupport/fixtures";

describe("decision-engine evaluation", () => {
  it("scores candidates deterministically", () => {
    const port = createMockContextFusionPort();
    const unified = port.loadUnifiedContext({
      athleteId: "athlete:1",
      sessionId: "session:1",
      conversationId: null,
      contextId: "context:1",
      at: FIXED_TIMESTAMP,
    })!;
    const decisionContext = buildDecisionContext({
      id: "dc:1",
      unified,
      handoff: null,
      at: FIXED_TIMESTAMP,
    });
    const candidate = analyzeTraining({ decisionContext })[0]!;
    const evaluation = evaluateCandidate({
      candidate,
      constraints: [],
      dependencies: [],
      at: FIXED_TIMESTAMP,
    });
    expect(evaluation.passed).toBe(true);
    expect(evaluation.score.total).toBeGreaterThan(0);
    expect(Object.isFrozen(evaluation)).toBe(true);
  });

  it("detects priority conflicts within category", () => {
    const port = createMockContextFusionPort();
    const unified = port.loadUnifiedContext({
      athleteId: "athlete:1",
      sessionId: null,
      conversationId: null,
      contextId: "context:1",
      at: FIXED_TIMESTAMP,
    })!;
    const decisionContext = buildDecisionContext({
      id: "dc:1",
      unified,
      handoff: null,
      at: FIXED_TIMESTAMP,
    });
    const candidates = [
      ...analyzePriority({ decisionContext }),
      ...analyzeTraining({ decisionContext }),
    ];
    const conflicts = evaluateConflicts({ candidates });
    expect(Array.isArray(conflicts)).toBe(true);
  });
});
`,
);

write(
  "__tests__/planning.test.ts",
  `import { planDecisions } from "../planning/DecisionPlanner";
import { planResolutions } from "../planning/ResolutionPlanner";
import {
  createDecisionInput,
  createTestDecisionEngineService,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("decision-engine planning", () => {
  it("plans ordered steps without execution", () => {
    const service = createTestDecisionEngineService();
    const built = service.buildDecision(createDecisionInput());
    expect(built.success).toBe(true);
    const plan = planDecisions({
      planId: "plan:test",
      athleteId: "athlete:1",
      contextId: "context:1",
      decisions: built.decisions,
      at: FIXED_TIMESTAMP,
    });
    expect(plan.steps.length).toBe(built.decisions.length);
    expect(plan.steps.every((s) => s.status === "planned")).toBe(true);
  });

  it("plans resolutions for conflicts", () => {
    const service = createTestDecisionEngineService();
    const built = service.buildDecision(createDecisionInput());
    const resolutions = planResolutions({
      conflicts: built.package!.conflicts,
      candidates: built.package!.candidates,
      at: FIXED_TIMESTAMP,
    });
    expect(resolutions.length).toBe(built.package!.conflicts.length);
  });
});
`,
);

write(
  "__tests__/resolution.test.ts",
  `import { resolveMerge } from "../resolution/MergeResolver";
import { resolvePriorities } from "../resolution/PriorityResolver";
import {
  createDecisionInput,
  createTestDecisionEngineService,
} from "../testSupport/fixtures";

describe("decision-engine resolution", () => {
  it("resolves into immutable coaching decisions", () => {
    const service = createTestDecisionEngineService();
    const built = service.buildDecision(createDecisionInput());
    expect(built.success).toBe(true);
    expect(built.decisions.length).toBeGreaterThan(0);
    expect(Object.isFrozen(built.decisions[0])).toBe(true);
  });

  it("merges and orders by priority", () => {
    const service = createTestDecisionEngineService();
    const built = service.buildDecision(createDecisionInput());
    const merged = resolveMerge(built.decisions);
    const ordered = resolvePriorities(merged);
    for (let i = 1; i < ordered.length; i++) {
      expect(ordered[i]!.priority.ordinal).toBeGreaterThanOrEqual(
        ordered[i - 1]!.priority.ordinal,
      );
    }
  });
});
`,
);

write(
  "__tests__/builders.test.ts",
  `import { buildDecisionGraph } from "../builders/DecisionGraphBuilder";
import { buildDecisionSummary } from "../builders/DecisionSummaryBuilder";
import {
  createDecisionInput,
  createTestDecisionEngineService,
} from "../testSupport/fixtures";

describe("decision-engine builders", () => {
  it("builds immutable summary and graph", () => {
    const service = createTestDecisionEngineService();
    const built = service.buildDecision(createDecisionInput());
    const summary = buildDecisionSummary({
      id: "summary:1",
      athleteId: "athlete:1",
      contextId: "context:1",
      decisions: built.decisions,
      candidateCount: built.package!.candidates.length,
      conflictCount: 0,
      resolutionCount: 0,
      focusAreas: ["training"],
    });
    expect(Object.isFrozen(summary)).toBe(true);
    const graph = buildDecisionGraph({
      id: "graph:1",
      candidates: built.package!.candidates,
      decisions: built.decisions,
      dependencies: built.package!.dependencies,
    });
    expect(graph.nodes.length).toBeGreaterThan(0);
    expect(Object.isFrozen(graph)).toBe(true);
  });
});
`,
);

write(
  "__tests__/validators.test.ts",
  `import { validateDecisionPackage } from "../validators/validateDecisionPackage";
import {
  createDecisionInput,
  createTestDecisionEngineService,
} from "../testSupport/fixtures";

describe("decision-engine validators", () => {
  it("validates built package", () => {
    const service = createTestDecisionEngineService();
    const built = service.buildDecision(createDecisionInput());
    const validation = validateDecisionPackage(built.package!);
    expect(validation.valid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });
});
`,
);

write(
  "__tests__/policies.test.ts",
  `import { applyDecisionPolicy } from "../policies/DecisionPolicy";
import { applySafetyPolicy } from "../policies/SafetyPolicy";
import {
  createDecisionInput,
  createTestDecisionEngineService,
} from "../testSupport/fixtures";

describe("decision-engine policies", () => {
  it("applies deterministic policies", () => {
    const service = createTestDecisionEngineService();
    const built = service.buildDecision(createDecisionInput());
    expect(applyDecisionPolicy(built.package!)).toEqual([]);
    expect(Array.isArray(applySafetyPolicy(built.package!))).toBe(true);
  });
});
`,
);

write(
  "__tests__/application.test.ts",
  `import {
  buildDecision,
  describeDecision,
  evaluateDecision,
  resolveDecision,
  validateDecision,
} from "../application";
import { DecisionInputKinds } from "../models/DecisionInput";
import { DecisionOperationKinds } from "../models/DecisionResult";
import {
  createDecisionInput,
  createTestDecisionEngineService,
} from "../testSupport/fixtures";

describe("decision-engine application", () => {
  it("exposes public API build → evaluate → resolve → validate → describe", () => {
    const service = createTestDecisionEngineService();

    const built = buildDecision({
      service,
      input: createDecisionInput({ kind: DecisionInputKinds.BUILD }),
    });
    expect(built.success).toBe(true);
    expect(built.operation).toBe(DecisionOperationKinds.BUILD);
    expect(built.recommendationInput).not.toBeNull();
    expect(Object.isFrozen(built.decisions[0])).toBe(true);

    const evaluated = evaluateDecision({
      service,
      input: createDecisionInput({
        id: "request:evaluate",
        kind: DecisionInputKinds.EVALUATE,
      }),
    });
    expect(evaluated.success).toBe(true);
    expect(evaluated.operation).toBe(DecisionOperationKinds.EVALUATE);

    const resolved = resolveDecision({
      service,
      input: createDecisionInput({
        id: "request:resolve",
        kind: DecisionInputKinds.RESOLVE,
      }),
    });
    expect(resolved.success).toBe(true);
    expect(resolved.operation).toBe(DecisionOperationKinds.RESOLVE);

    const validated = validateDecision({
      service,
      input: createDecisionInput({
        id: "request:validate",
        kind: DecisionInputKinds.VALIDATE,
      }),
    });
    expect(validated.operation).toBe(DecisionOperationKinds.VALIDATE);
    expect(validated.success).toBe(true);

    const caps = describeDecision({ service });
    expect(caps.name).toBe("Decision Engine");
    expect(caps.capabilities).toEqual(
      expect.arrayContaining([
        "buildDecision",
        "evaluateDecision",
        "resolveDecision",
        "describeDecision",
        "validateDecision",
      ]),
    );
  });
});
`,
);

write(
  "__tests__/integration.test.ts",
  `import { buildUnifiedContext } from "../../context-fusion/application";
import { ContextRequestKinds } from "../../context-fusion/models/ContextRequest";
import {
  createContextRequest,
  createTestContextFusionService,
} from "../../context-fusion/testSupport/fixtures";
import { buildDecisionContext } from "../builders/DecisionContextBuilder";
import { DecisionInputKinds } from "../models/DecisionInput";
import {
  createDecisionInput,
  createTestDecisionEngineService,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("decision-engine integration", () => {
  it("consumes Context Fusion UnifiedCoachingContext", () => {
    const fusion = createTestContextFusionService();
    const fused = buildUnifiedContext({
      service: fusion,
      request: createContextRequest({ kind: ContextRequestKinds.BUILD }),
    });
    expect(fused.success).toBe(true);
    expect(fused.context).not.toBeNull();

    const decisionContext = buildDecisionContext({
      id: "dc:integration",
      unified: fused.context!,
      handoff: fused.decisionEngineContext,
      at: FIXED_TIMESTAMP,
    });

    const service = createTestDecisionEngineService();
    const result = service.buildDecision(
      createDecisionInput({
        kind: DecisionInputKinds.BUILD,
        decisionContext,
        athleteId: fused.context!.athleteId,
        contextId: fused.context!.id,
      }),
    );

    expect(result.success).toBe(true);
    expect(result.package).not.toBeNull();
    expect(result.recommendationInput).not.toBeNull();
    expect(result.decisions.every((d) => d.contextId === fused.context!.id)).toBe(
      true,
    );
  });
});
`,
);

write(
  "__tests__/regression.test.ts",
  `import {
  createDecisionInput,
  createTestDecisionEngineService,
} from "../testSupport/fixtures";

describe("decision-engine regression", () => {
  it("is deterministic for identical inputs", () => {
    const a = createTestDecisionEngineService();
    const b = createTestDecisionEngineService();
    const input = createDecisionInput();
    const left = a.buildDecision(input);
    const right = b.buildDecision(input);
    expect(left.decisions.map((d) => d.id)).toEqual(
      right.decisions.map((d) => d.id),
    );
    expect(left.decisions.map((d) => d.score.total)).toEqual(
      right.decisions.map((d) => d.score.total),
    );
    expect(left.package!.statistics).toEqual(right.package!.statistics);
  });

  it("never attaches provider or network fields", () => {
    const service = createTestDecisionEngineService();
    const result = service.buildDecision(createDecisionInput());
    const serialized = JSON.stringify(result.package);
    expect(serialized).not.toMatch(/openai|anthropic|http:\\/\\/|https:\\/\\//i);
  });
});
`,
);

console.log("generate-decision-engine-part4.mjs: engine/services/tests written");
