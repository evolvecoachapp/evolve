import { buildExplanationDescriptor } from "../builders/DescriptorBuilder";
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
import type { CoachingDecision } from "../../decision-engine/models/CoachingDecision";
import type { CoachingRecommendation } from "../../recommendation-engine/models/CoachingRecommendation";
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
      id: `result:describe:${this.runtimeId}`,
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
        id: `result:build:error:${input.id}`,
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
      id: `result:build:${input.id}`,
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
        id: `result:validate:error:${input.id}`,
        operation: ExplanationOperationKinds.VALIDATE,
        success: false,
        errors: [createExplanationError(ExplanationErrorCodes.MISSING_INPUT, "No package to validate")],
        createdAt: at,
      });
    }
    const validation = validateExplanationPackage(pkg);
    return buildExplanationResult({
      id: `result:validate:${input.id}`,
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
      id: `result:snapshot:${input.id}`,
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
        id: `result:package:error:${input.id}`,
        operation: ExplanationOperationKinds.PACKAGE,
        success: false,
        errors: [createExplanationError(ExplanationErrorCodes.MISSING_INPUT, "No package available")],
        createdAt: at,
      });
    }
    return buildExplanationResult({
      id: `result:package:${input.id}`,
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
    readonly decisions: readonly CoachingDecision[];
    readonly recommendations: readonly CoachingRecommendation[];
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
      id: `summary:${input.inputId}`,
      athleteId: input.athleteId,
      contextId: input.contextId,
      explanations,
      focusAreaKeys: input.focusAreaKeys,
      at: input.at,
    });

    const snapshot = buildExplanationSnapshot({
      id: `snapshot:${input.inputId}`,
      athleteId: input.athleteId,
      contextId: input.contextId,
      explanations,
      summary,
      at: input.at,
    });

    const graph = buildExplanationGraph({
      id: `graph:${input.inputId}`,
      explanations,
      at: input.at,
    });

    const trace = buildRecommendationTrace({
      recommendation: input.recommendations[0]!,
      at: input.at,
    });

    const timeline = buildExplanationTimeline({
      id: `timeline:${input.inputId}`,
      subjectIds: Object.freeze(explanations.map((e) => e.id)),
      at: input.at,
    });

    const llmFormatterInput = buildLLMFormatterInput({
      id: `llm-formatter:${input.inputId}`,
      athleteId: input.athleteId,
      contextId: input.contextId,
      explanations,
      summary,
      at: input.at,
    });

    return buildExplanationPackage({
      id: `package:${input.inputId}`,
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
