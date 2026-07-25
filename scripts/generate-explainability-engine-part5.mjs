/**
 * Sprint 22.5 — Explainability Engine generator (part 5: contracts, explanation, services, tests).
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve("app/src/features/explainability-engine");
let fileCount = 0;

function write(rel, contents) {
  const full = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, contents.replace(/\r?\n/g, "\n"), "utf8");
  fileCount++;
}

// ─── CONTRACTS ────────────────────────────────────────────────────────────────

write(
  "contracts/DecisionEnginePort.ts",
  `import type { CoachingDecision } from "../../decision-engine/models/CoachingDecision";
import { DecisionIntents } from "../../decision-engine/models/DecisionIntent";
import { EMPTY_DECISION_METADATA } from "../../decision-engine/models/DecisionMetadata";
import { DecisionOutcomes } from "../../decision-engine/models/DecisionOutcome";

export interface DecisionEnginePort {
  loadDecisions(input: {
    readonly athleteId: string;
    readonly sessionId: string | null;
    readonly conversationId: string | null;
    readonly contextId: string;
    readonly at: string;
  }): readonly CoachingDecision[];
}

function createMockDecision(input: {
  readonly athleteId: string;
  readonly sessionId: string | null;
  readonly conversationId: string | null;
  readonly contextId: string;
  readonly at: string;
  readonly category: "training" | "recovery" | "safety";
  readonly ordinal: number;
  readonly intent: (typeof DecisionIntents)[keyof typeof DecisionIntents];
}): CoachingDecision {
  const id = \`decision:\${input.category}:mock\`;
  return Object.freeze({
    id,
    athleteId: input.athleteId,
    sessionId: input.sessionId,
    conversationId: input.conversationId,
    contextId: input.contextId,
    category: input.category,
    intent: input.intent,
    outcome: DecisionOutcomes.ACCEPTED,
    title: \`\${input.category} decision\`,
    priority: Object.freeze({ category: input.category, ordinal: input.ordinal, label: input.category }),
    confidence: Object.freeze({ level: "high" as const, score: 90, evidenceCount: 1, notes: Object.freeze([] as string[]) }),
    score: Object.freeze({ total: 90, priorityComponent: 90, confidenceComponent: 90, consistencyComponent: 90, riskComponent: 70, impactComponent: 80 }),
    reasons: Object.freeze([Object.freeze({ code: "mock_reason", category: input.category, statement: "mock", evidenceKeys: Object.freeze([\`source:\${input.category}\`]), metadata: EMPTY_DECISION_METADATA })]),
    constraints: Object.freeze([]),
    dependencies: Object.freeze([]),
    recommendationRefs: Object.freeze([]),
    sourceKeys: Object.freeze([\`source:\${input.category}\`]),
    metadata: EMPTY_DECISION_METADATA,
    createdAt: input.at,
  });
}

export function createMockDecisionEnginePort(): DecisionEnginePort {
  return {
    loadDecisions(input) {
      return Object.freeze([
        createMockDecision({ ...input, category: "safety", ordinal: 0, intent: DecisionIntents.BLOCK }),
        createMockDecision({ ...input, category: "recovery", ordinal: 1, intent: DecisionIntents.RECOMMEND }),
        createMockDecision({ ...input, category: "training", ordinal: 2, intent: DecisionIntents.CONTINUE }),
      ]);
    },
  };
}
`,
);

write(
  "contracts/RecommendationEnginePort.ts",
  `import type { CoachingRecommendation } from "../../recommendation-engine/models/CoachingRecommendation";
import type { ExplainabilityInput } from "../../recommendation-engine/models/ExplainabilityInput";
import { RecommendationIntents } from "../../recommendation-engine/models/RecommendationIntent";
import { EMPTY_RECOMMENDATION_METADATA } from "../../recommendation-engine/models/RecommendationMetadata";
import { priorityForCategory } from "../../recommendation-engine/models/RecommendationPriority";
import { RecommendationTypes } from "../../recommendation-engine/models/RecommendationType";

export interface RecommendationEnginePort {
  loadRecommendations(input: {
    readonly athleteId: string;
    readonly sessionId: string | null;
    readonly conversationId: string | null;
    readonly contextId: string;
    readonly at: string;
  }): readonly CoachingRecommendation[];

  loadExplainabilityHandoff(input: {
    readonly athleteId: string;
    readonly sessionId: string | null;
    readonly conversationId: string | null;
    readonly contextId: string;
    readonly at: string;
  }): ExplainabilityInput | null;
}

function createMockRecommendation(input: {
  readonly athleteId: string;
  readonly sessionId: string | null;
  readonly conversationId: string | null;
  readonly contextId: string;
  readonly at: string;
  readonly category: "training" | "recovery" | "safety";
  readonly decisionId: string;
}): CoachingRecommendation {
  const id = \`rec:\${input.decisionId}\`;
  const category = input.category;
  return Object.freeze({
    id,
    athleteId: input.athleteId,
    sessionId: input.sessionId,
    conversationId: input.conversationId,
    contextId: input.contextId,
    decisionId: input.decisionId,
    category,
    intent: category === "safety" ? RecommendationIntents.ESCALATE : RecommendationIntents.ACT,
    type: category === "safety" ? RecommendationTypes.CONSTRAINT : RecommendationTypes.ACTION,
    title: \`\${category} recommendation\`,
    priority: priorityForCategory(category),
    confidence: Object.freeze({ level: "high" as const, score: 90, evidenceCount: 1, notes: Object.freeze([] as string[]) }),
    actions: Object.freeze([Object.freeze({ id: \`action:\${id}\`, type: RecommendationTypes.ACTION, key: \`\${category}.act\`, targetKey: category, parameters: Object.freeze({ decisionId: input.decisionId }), metadata: EMPTY_RECOMMENDATION_METADATA })]),
    sequence: null,
    constraints: Object.freeze([]),
    dependencies: Object.freeze([]),
    targets: Object.freeze([]),
    sourceKeys: Object.freeze([\`source:\${category}\`]),
    metadata: EMPTY_RECOMMENDATION_METADATA,
    createdAt: input.at,
  });
}

export function createMockRecommendationEnginePort(): RecommendationEnginePort {
  return {
    loadRecommendations(input) {
      const decisions = ["decision:safety:mock", "decision:recovery:mock", "decision:training:mock"];
      const categories = ["safety", "recovery", "training"] as const;
      return Object.freeze(
        decisions.map((decisionId, i) =>
          createMockRecommendation({ ...input, category: categories[i]!, decisionId }),
        ),
      );
    },
    loadExplainabilityHandoff(input) {
      const recs = this.loadRecommendations(input);
      return Object.freeze({
        id: \`explainability-handoff:mock:\${input.contextId}\`,
        athleteId: input.athleteId,
        contextId: input.contextId,
        recommendationIds: Object.freeze(recs.map((r) => r.id)),
        decisionIds: Object.freeze(recs.map((r) => r.decisionId)),
        summary: null,
        metadata: EMPTY_RECOMMENDATION_METADATA,
        createdAt: input.at,
      });
    },
  };
}
`,
);

write(
  "contracts/ContextFusionPort.ts",
  `export interface ContextFusionPort {
  loadFocusAreas(input: {
    readonly athleteId: string;
    readonly contextId: string;
    readonly at: string;
  }): readonly string[];
}

export function createMockContextFusionPort(
  focusAreas: readonly string[] = ["recovery", "training"],
): ContextFusionPort {
  return {
    loadFocusAreas() {
      return Object.freeze([...focusAreas]);
    },
  };
}
`,
);

write(
  "contracts/AthleteStatePort.ts",
  `export interface AthleteStatePort {
  isAthletePresent(input: { readonly athleteId: string; readonly at: string }): boolean;
}

export function createMockAthleteStatePort(present = true): AthleteStatePort {
  return { isAthletePresent: () => present };
}
`,
);

write(
  "contracts/CoachSupervisorPort.ts",
  `export interface CoachSupervisorPort {
  loadSupervisorFocusAreas(input: {
    readonly athleteId: string;
    readonly contextId: string;
    readonly at: string;
  }): readonly string[];
}

export function createMockCoachSupervisorPort(
  focusAreas: readonly string[] = ["safety"],
): CoachSupervisorPort {
  return {
    loadSupervisorFocusAreas() {
      return Object.freeze([...focusAreas]);
    },
  };
}
`,
);

write(
  "contracts/index.ts",
  `export * from "./AthleteStatePort";
export * from "./CoachSupervisorPort";
export * from "./ContextFusionPort";
export * from "./DecisionEnginePort";
export * from "./RecommendationEnginePort";
`,
);

// ─── EXPLANATION SESSION ──────────────────────────────────────────────────────

write(
  "explanation/ExplainabilitySession.ts",
  `import type { ExplanationPackage } from "../models/ExplanationPackage";
import { ExplanationSessionStatuses, type ExplanationSessionStatus } from "../models/ExplanationState";
import { freezePackage } from "../utils/FreezeExplanationState";

export class ExplainabilitySession {
  private package: ExplanationPackage | null = null;
  private status: ExplanationSessionStatus = ExplanationSessionStatuses.IDLE;
  private readonly startedAt: string;

  constructor(startedAt: string) {
    this.startedAt = startedAt;
  }

  put(pkg: ExplanationPackage, status: ExplanationSessionStatus = ExplanationSessionStatuses.READY): void {
    this.package = freezePackage(pkg);
    this.status = status;
  }

  getPackage(): ExplanationPackage | null {
    return this.package;
  }

  getStatus(): ExplanationSessionStatus {
    return this.status;
  }

  getStartedAt(): string {
    return this.startedAt;
  }
}

export function createExplainabilitySession(startedAt: string): ExplainabilitySession {
  return new ExplainabilitySession(startedAt);
}
`,
);

// ─── COORDINATOR ──────────────────────────────────────────────────────────────

write(
  "explanation/ExplainabilityCoordinator.ts",
  `import { buildExplanationDescriptor } from "../builders/DescriptorBuilder";
import { buildExplanationsFromPairs } from "../builders/ExplanationBuilder";
import { buildLLMFormatterInput } from "../builders/LLMFormatterInputBuilder";
import { buildExplanationPackage } from "../builders/PackageBuilder";
import { buildExplanationResult } from "../builders/ResultBuilder";
import { buildExplanationSnapshot } from "../builders/SnapshotBuilder";
import { buildExplanationSummary } from "../builders/SummaryBuilder";
import type { AthleteStatePort } from "../contracts/AthleteStatePort";
import type { CoachSupervisorPort } from "../contracts/CoachSupervisorPort";
import type { ContextFusionPort } from "../contracts/ContextFusionPort";
import type { DecisionEnginePort } from "../contracts/DecisionEnginePort";
import type { RecommendationEnginePort } from "../contracts/RecommendationEnginePort";
import { buildStateEvidence } from "../evidence/StateEvidence";
import {
  createExplanationError,
  ExplanationErrorCodes,
} from "../models/ExplanationError";
import type { ExplanationInput } from "../models/ExplanationInput";
import { ExplanationOperationKinds } from "../models/ExplanationResult";
import type { ExplanationResult } from "../models/ExplanationResult";
import { ExplanationSessionStatuses } from "../models/ExplanationState";
import { applyConsistencyPolicy } from "../policies/ConsistencyPolicy";
import { applyExplainabilityPolicy } from "../policies/ExplainabilityPolicy";
import { applySafetyPolicy } from "../policies/SafetyPolicy";
import { buildRecommendationTrace } from "../trace/RecommendationTraceBuilder";
import { buildExplanationGraph } from "../trace/GraphTraceBuilder";
import { buildExplanationTimeline } from "../trace/TimelineTraceBuilder";
import { validateExplanationPackage } from "../validators";
import { createExplainabilitySession, type ExplainabilitySession } from "./ExplainabilitySession";

export interface ExplainabilityCoordinatorDeps {
  readonly decisionEnginePort?: DecisionEnginePort;
  readonly recommendationEnginePort?: RecommendationEnginePort;
  readonly contextFusionPort?: ContextFusionPort;
  readonly athleteStatePort?: AthleteStatePort;
  readonly supervisorPort?: CoachSupervisorPort;
  readonly clock?: () => string;
  readonly runtimeId?: string;
}

export class ExplainabilityCoordinator {
  private readonly decisionEnginePort: DecisionEnginePort | undefined;
  private readonly recommendationEnginePort: RecommendationEnginePort | undefined;
  private readonly contextFusionPort: ContextFusionPort | undefined;
  private readonly athleteStatePort: AthleteStatePort | undefined;
  private readonly supervisorPort: CoachSupervisorPort | undefined;
  private readonly clock: () => string;
  private readonly runtimeId: string;
  private readonly session: ExplainabilitySession;

  constructor(deps: ExplainabilityCoordinatorDeps = {}) {
    this.decisionEnginePort = deps.decisionEnginePort;
    this.recommendationEnginePort = deps.recommendationEnginePort;
    this.contextFusionPort = deps.contextFusionPort;
    this.athleteStatePort = deps.athleteStatePort;
    this.supervisorPort = deps.supervisorPort;
    this.clock = deps.clock ?? (() => new Date().toISOString());
    this.runtimeId = deps.runtimeId ?? "runtime:explainability-engine";
    this.session = createExplainabilitySession(this.clock());
  }

  describe(): ExplanationResult {
    const at = this.clock();
    return buildExplanationResult({
      id: \`result:describe:\${this.runtimeId}\`,
      operation: ExplanationOperationKinds.DESCRIBE,
      success: true,
      descriptor: buildExplanationDescriptor({ id: this.runtimeId, createdAt: at }),
      createdAt: at,
    });
  }

  build(input: ExplanationInput): ExplanationResult {
    const at = this.clock();
    const resolved = this.resolveInputs(input, at);
    if (resolved.decisions.length === 0 || resolved.recommendations.length === 0) {
      return buildExplanationResult({
        id: \`result:build:error:\${input.id}\`,
        operation: ExplanationOperationKinds.BUILD,
        success: false,
        errors: [
          createExplanationError(
            ExplanationErrorCodes.MISSING_INPUT,
            "Decisions and recommendations are required",
          ),
        ],
        createdAt: at,
      });
    }

    const pkg = this.runPipeline({
      inputId: input.id,
      athleteId: input.athleteId,
      contextId: input.contextId,
      decisions: resolved.decisions,
      recommendations: resolved.recommendations,
      focusAreaKeys: resolved.focusAreaKeys,
      at,
    });
    this.session.put(pkg, ExplanationSessionStatuses.READY);

    return buildExplanationResult({
      id: \`result:build:\${input.id}\`,
      operation: ExplanationOperationKinds.BUILD,
      success: true,
      explanations: pkg.explanations,
      package: pkg,
      summary: pkg.summary,
      snapshot: pkg.snapshot,
      llmFormatterInput: pkg.llmFormatterInput,
      createdAt: at,
    });
  }

  validate(input: ExplanationInput): ExplanationResult {
    const at = this.clock();
    const pkg = this.session.getPackage() ?? this.build(input).package;
    if (!pkg) {
      return buildExplanationResult({
        id: \`result:validate:error:\${input.id}\`,
        operation: ExplanationOperationKinds.VALIDATE,
        success: false,
        errors: [createExplanationError(ExplanationErrorCodes.MISSING_INPUT, "No package to validate")],
        createdAt: at,
      });
    }
    const validation = validateExplanationPackage(pkg);
    return buildExplanationResult({
      id: \`result:validate:\${input.id}\`,
      operation: ExplanationOperationKinds.VALIDATE,
      success: validation.valid,
      explanations: pkg.explanations,
      package: pkg,
      validation,
      errors: validation.valid ? Object.freeze([]) : validation.issues,
      createdAt: at,
    });
  }

  snapshot(input: ExplanationInput): ExplanationResult {
    const at = this.clock();
    const built = this.build(input);
    if (!built.success || !built.snapshot) return built;
    return buildExplanationResult({
      id: \`result:snapshot:\${input.id}\`,
      operation: ExplanationOperationKinds.SNAPSHOT,
      success: true,
      explanations: built.explanations,
      snapshot: built.snapshot,
      createdAt: at,
    });
  }

  package(input: ExplanationInput): ExplanationResult {
    const at = this.clock();
    const pkg = this.session.getPackage() ?? this.build(input).package;
    if (!pkg) {
      return buildExplanationResult({
        id: \`result:package:error:\${input.id}\`,
        operation: ExplanationOperationKinds.PACKAGE,
        success: false,
        errors: [createExplanationError(ExplanationErrorCodes.MISSING_INPUT, "No package available")],
        createdAt: at,
      });
    }
    return buildExplanationResult({
      id: \`result:package:\${input.id}\`,
      operation: ExplanationOperationKinds.PACKAGE,
      success: true,
      explanations: pkg.explanations,
      package: pkg,
      summary: pkg.summary,
      llmFormatterInput: pkg.llmFormatterInput,
      createdAt: at,
    });
  }

  private resolveInputs(input: ExplanationInput, at: string) {
    const portInput = {
      athleteId: input.athleteId,
      sessionId: input.sessionId,
      conversationId: input.conversationId,
      contextId: input.contextId,
      at,
    };

    let decisions = input.decisions;
    if (decisions.length === 0 && this.decisionEnginePort) {
      decisions = this.decisionEnginePort.loadDecisions(portInput);
    }

    let recommendations = input.recommendations;
    if (recommendations.length === 0 && this.recommendationEnginePort) {
      recommendations = this.recommendationEnginePort.loadRecommendations(portInput);
    }

    const contextFocus = this.contextFusionPort?.loadFocusAreas({
      athleteId: input.athleteId,
      contextId: input.contextId,
      at,
    }) ?? Object.freeze([]);
    const supervisorFocus = this.supervisorPort?.loadSupervisorFocusAreas({
      athleteId: input.athleteId,
      contextId: input.contextId,
      at,
    }) ?? Object.freeze([]);
    const focusAreaKeys = Object.freeze([...new Set([...contextFocus, ...supervisorFocus])]);

    if (this.athleteStatePort) {
      buildStateEvidence({
        athleteId: input.athleteId,
        present: this.athleteStatePort.isAthletePresent({ athleteId: input.athleteId, at }),
      });
    }

    return { decisions, recommendations, focusAreaKeys };
  }

  private runPipeline(input: {
    readonly inputId: string;
    readonly athleteId: string;
    readonly contextId: string;
    readonly decisions: ExplainabilityCoordinatorDeps extends never ? never : import("../../decision-engine/models/CoachingDecision").CoachingDecision[];
    readonly recommendations: import("../../recommendation-engine/models/CoachingRecommendation").CoachingRecommendation[];
    readonly focusAreaKeys: readonly string[];
    readonly at: string;
  }) {
    let explanations = buildExplanationsFromPairs({
      decisions: input.decisions,
      recommendations: input.recommendations,
      focusAreaKeys: input.focusAreaKeys,
      at: input.at,
    });
    explanations = applyExplainabilityPolicy(explanations);
    explanations = applySafetyPolicy(explanations);
    explanations = applyConsistencyPolicy(explanations);

    const summary = buildExplanationSummary({
      id: \`summary:\${input.inputId}\`,
      athleteId: input.athleteId,
      contextId: input.contextId,
      explanations,
      focusAreaKeys: input.focusAreaKeys,
      at: input.at,
    });

    const snapshot = buildExplanationSnapshot({
      id: \`snapshot:\${input.inputId}\`,
      athleteId: input.athleteId,
      contextId: input.contextId,
      explanations,
      summary,
      at: input.at,
    });

    const graph = buildExplanationGraph({
      id: \`graph:\${input.inputId}\`,
      explanations,
      at: input.at,
    });

    const trace = buildRecommendationTrace({
      recommendation: input.recommendations[0]!,
      at: input.at,
    });

    const timeline = buildExplanationTimeline({
      id: \`timeline:\${input.inputId}\`,
      subjectIds: Object.freeze(explanations.map((e) => e.id)),
      at: input.at,
    });

    const llmFormatterInput = buildLLMFormatterInput({
      id: \`llm-formatter:\${input.inputId}\`,
      athleteId: input.athleteId,
      contextId: input.contextId,
      explanations,
      summary,
      at: input.at,
    });

    return buildExplanationPackage({
      id: \`package:\${input.inputId}\`,
      athleteId: input.athleteId,
      contextId: input.contextId,
      explanations,
      summary,
      snapshot,
      graph,
      trace,
      timeline,
      llmFormatterInput,
      at: input.at,
    });
  }

  getSession(): ExplainabilitySession {
    return this.session;
  }
}

export function createExplainabilityCoordinator(
  deps: ExplainabilityCoordinatorDeps = {},
): ExplainabilityCoordinator {
  return new ExplainabilityCoordinator(deps);
}
`,
);

write(
  "explanation/ExplainabilityEngine.ts",
  `import { buildExplanationDescriptor } from "../builders/DescriptorBuilder";
import type { ExplanationDescriptor } from "../models/ExplanationDescriptor";
import type { ExplanationInput } from "../models/ExplanationInput";
import type { ExplanationResult } from "../models/ExplanationResult";
import {
  createExplainabilityCoordinator,
  type ExplainabilityCoordinator,
  type ExplainabilityCoordinatorDeps,
} from "./ExplainabilityCoordinator";

export type ExplainabilityEngineDeps = ExplainabilityCoordinatorDeps;

/**
 * Explainability Engine — deterministic explanation orchestration only.
 *
 * CoachingDecision + CoachingRecommendation → CoachingExplanation
 *
 * No AI. No NL. No domain calculations. Never changes decisions.
 */
export class ExplainabilityEngine {
  private readonly coordinator: ExplainabilityCoordinator;
  private readonly clock: () => string;
  private readonly runtimeId: string;

  constructor(deps: ExplainabilityEngineDeps = {}) {
    this.clock = deps.clock ?? (() => new Date().toISOString());
    this.runtimeId = deps.runtimeId ?? "runtime:explainability-engine";
    this.coordinator = createExplainabilityCoordinator({
      ...deps,
      clock: this.clock,
      runtimeId: this.runtimeId,
    });
  }

  describe(): ExplanationDescriptor {
    return buildExplanationDescriptor({ id: this.runtimeId, createdAt: this.clock() });
  }

  buildExplanation(input: ExplanationInput): ExplanationResult {
    return this.coordinator.build(input);
  }

  validateExplanation(input: ExplanationInput): ExplanationResult {
    return this.coordinator.validate(input);
  }

  createExplanationSnapshot(input: ExplanationInput): ExplanationResult {
    return this.coordinator.snapshot(input);
  }

  packageExplanation(input: ExplanationInput): ExplanationResult {
    return this.coordinator.package(input);
  }

  describeExplanation(): ExplanationResult {
    return this.coordinator.describe();
  }

  getCoordinator(): ExplainabilityCoordinator {
    return this.coordinator;
  }
}

export function createExplainabilityEngine(
  deps: ExplainabilityEngineDeps = {},
): ExplainabilityEngine {
  return new ExplainabilityEngine(deps);
}
`,
);

write(
  "explanation/index.ts",
  `export * from "./ExplainabilityCoordinator";
export * from "./ExplainabilityEngine";
export * from "./ExplainabilitySession";
`,
);

// ─── SERVICES ─────────────────────────────────────────────────────────────────

write(
  "services/ExplainabilityEngineService.ts",
  `import {
  createExplainabilityEngine,
  type ExplainabilityEngine,
  type ExplainabilityEngineDeps,
} from "../explanation/ExplainabilityEngine";
import type { ExplanationDescriptor } from "../models/ExplanationDescriptor";
import type { ExplanationInput } from "../models/ExplanationInput";
import type { ExplanationResult } from "../models/ExplanationResult";

export type ExplainabilityEngineServiceDeps = ExplainabilityEngineDeps;

/**
 * Explainability Engine Service — orchestration facade.
 *
 * CoachingDecision + CoachingRecommendation → CoachingExplanation → LLMFormatterInput
 */
export class ExplainabilityEngineService {
  private readonly engine: ExplainabilityEngine;

  constructor(deps: ExplainabilityEngineServiceDeps = {}) {
    this.engine = createExplainabilityEngine(deps);
  }

  buildExplanation(input: ExplanationInput): ExplanationResult {
    return this.engine.buildExplanation(input);
  }

  validateExplanation(input: ExplanationInput): ExplanationResult {
    return this.engine.validateExplanation(input);
  }

  createExplanationSnapshot(input: ExplanationInput): ExplanationResult {
    return this.engine.createExplanationSnapshot(input);
  }

  packageExplanation(input: ExplanationInput): ExplanationResult {
    return this.engine.packageExplanation(input);
  }

  describeExplanation(): ExplanationDescriptor {
    return this.engine.describe();
  }
}

export function createExplainabilityEngineService(
  deps: ExplainabilityEngineServiceDeps = {},
): ExplainabilityEngineService {
  return new ExplainabilityEngineService(deps);
}
`,
);

write(
  "services/index.ts",
  `export * from "./ExplainabilityEngineService";
`,
);

// ─── APPLICATION ────────────────────────────────────────────────────────────────

write(
  "application/index.ts",
  `import type { ExplanationDescriptor } from "../models/ExplanationDescriptor";
import type { ExplanationInput } from "../models/ExplanationInput";
import type { ExplanationResult } from "../models/ExplanationResult";
import {
  createExplainabilityEngineService,
  type ExplainabilityEngineService,
  type ExplainabilityEngineServiceDeps,
} from "../services/ExplainabilityEngineService";

function resolveService(
  service?: ExplainabilityEngineService,
  deps?: ExplainabilityEngineServiceDeps,
): ExplainabilityEngineService {
  return service ?? createExplainabilityEngineService(deps);
}

/** Public API — build immutable coaching explanations from decisions + recommendations. */
export function buildExplanation(options: {
  readonly input: ExplanationInput;
  readonly service?: ExplainabilityEngineService;
  readonly deps?: ExplainabilityEngineServiceDeps;
}): ExplanationResult {
  return resolveService(options.service, options.deps).buildExplanation(options.input);
}

/** Public API — validate explanation package integrity. */
export function validateExplanation(options: {
  readonly input: ExplanationInput;
  readonly service?: ExplainabilityEngineService;
  readonly deps?: ExplainabilityEngineServiceDeps;
}): ExplanationResult {
  return resolveService(options.service, options.deps).validateExplanation(options.input);
}

/** Public API — describe Explainability Engine capabilities. */
export function describeExplanation(options: {
  readonly service?: ExplainabilityEngineService;
  readonly deps?: ExplainabilityEngineServiceDeps;
} = {}): ExplanationDescriptor {
  return resolveService(options.service, options.deps).describeExplanation();
}

/** Public API — create explanation snapshot. */
export function createExplanationSnapshot(options: {
  readonly input: ExplanationInput;
  readonly service?: ExplainabilityEngineService;
  readonly deps?: ExplainabilityEngineServiceDeps;
}): ExplanationResult {
  return resolveService(options.service, options.deps).createExplanationSnapshot(options.input);
}

/** Public API — package explanations for downstream consumers. */
export function packageExplanation(options: {
  readonly input: ExplanationInput;
  readonly service?: ExplainabilityEngineService;
  readonly deps?: ExplainabilityEngineServiceDeps;
}): ExplanationResult {
  return resolveService(options.service, options.deps).packageExplanation(options.input);
}

export type { ExplainabilityEngineServiceDeps };
`,
);

// ─── ROOT INDEX ─────────────────────────────────────────────────────────────────

write(
  "index.ts",
  `/**
 * Explainability Engine
 *
 * Sprint 22.5 — Explainability Engine.
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
 * CoachingExplanation
 *   ↓
 * Coach Supervisor
 *   ↓
 * LLM Response Formatter
 *
 * Deterministic explanation orchestration only.
 * Explains WHY a recommendation exists. NEVER changes decisions.
 *
 * No AI. No NL. No domain calculations. No persistence. No networking. No UI.
 * No OpenAI SDK. No Prompt Builder. No Tool Runtime. No Action Engine.
 */

export * from "./models";
export {
  buildExplanation,
  validateExplanation,
  describeExplanation,
  createExplanationSnapshot,
  packageExplanation,
} from "./application";
export {
  ExplainabilityEngineService,
  createExplainabilityEngineService,
} from "./services";
`,
);

console.log(`Generated ${fileCount} files (part 5a)...`);
