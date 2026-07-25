/**
 * Sprint 23.1 — Continuous Adaptation Engine generator (part 4: policies, selectors, contracts, core).
 * Run after part 3: node scripts/generate-continuous-adaptation-part4.mjs
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve("app/src/features/continuous-adaptation");
let fileCount = 0;

function write(rel, contents) {
  const full = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, contents.replace(/\r?\n/g, "\n"), "utf8");
  fileCount++;
}

// ─── POLICIES ─────────────────────────────────────────────────────────────────

write(
  "policies/AdaptationPolicy.ts",
  `import type { AdaptationDecision } from "../models/AdaptationDecision";
import { createAdaptationError, AdaptationErrorCodes } from "../models/AdaptationError";
import type { AdaptationError } from "../models/AdaptationError";

/** Structural adaptation policy — no AI. */
export function applyAdaptationPolicy(
  decisions: readonly AdaptationDecision[],
): readonly AdaptationError[] {
  const errors: AdaptationError[] = [];
  for (const d of decisions) {
    if (d.triggers.some((t) => t.present) && d.reasons.length === 0) {
      errors.push(
        createAdaptationError(
          AdaptationErrorCodes.POLICY_BLOCKED,
          "Present triggers require reasons",
          d.id,
        ),
      );
    }
  }
  return Object.freeze(errors);
}
`,
);

write(
  "policies/MonitoringPolicy.ts",
  `import type { AdaptationInput } from "../models/AdaptationInput";
import { createAdaptationError, AdaptationErrorCodes } from "../models/AdaptationError";
import type { AdaptationError } from "../models/AdaptationError";

/** Observation policy — require athlete id for monitoring. */
export function applyMonitoringPolicy(input: AdaptationInput): readonly AdaptationError[] {
  if (!input.athleteId) {
    return Object.freeze([
      createAdaptationError(AdaptationErrorCodes.MISSING_ATHLETE, "Athlete id required for monitoring"),
    ]);
  }
  return Object.freeze([]);
}
`,
);

write(
  "policies/DetectionPolicy.ts",
  `import type { AdaptationTrigger } from "../models/AdaptationTrigger";
import { createAdaptationError, AdaptationErrorCodes } from "../models/AdaptationError";
import type { AdaptationError } from "../models/AdaptationError";

/** Detection policy — present triggers must have signal keys. */
export function applyDetectionPolicy(
  triggers: readonly AdaptationTrigger[],
): readonly AdaptationError[] {
  const errors: AdaptationError[] = [];
  for (const t of triggers) {
    if (t.present && !t.signalKey) {
      errors.push(
        createAdaptationError(
          AdaptationErrorCodes.INCONSISTENT_TRIGGER,
          "Present trigger missing signalKey",
          t.id,
        ),
      );
    }
  }
  return Object.freeze(errors);
}
`,
);

write(
  "policies/ConsistencyPolicy.ts",
  `import type { AdaptationDecision } from "../models/AdaptationDecision";
import { createAdaptationError, AdaptationErrorCodes } from "../models/AdaptationError";
import type { AdaptationError } from "../models/AdaptationError";

export function applyConsistencyPolicy(
  decisions: readonly AdaptationDecision[],
): readonly AdaptationError[] {
  const errors: AdaptationError[] = [];
  for (const d of decisions) {
    if (d.evaluation.subjectId !== d.id && d.evaluation.subjectId !== d.athleteId) {
      // allow athlete-level evaluation subject; flag only empty
    }
    if (d.priority.ordinal !== d.evaluation.priority.ordinal) {
      errors.push(
        createAdaptationError(
          AdaptationErrorCodes.VALIDATION_FAILED,
          "Decision priority must match evaluation priority",
          d.id,
        ),
      );
    }
  }
  return Object.freeze(errors);
}
`,
);

write(
  "policies/PriorityPolicy.ts",
  `import type { AdaptationDecision } from "../models/AdaptationDecision";
import { createAdaptationError, AdaptationErrorCodes } from "../models/AdaptationError";
import type { AdaptationError } from "../models/AdaptationError";

export function applyPriorityPolicy(
  decisions: readonly AdaptationDecision[],
): readonly AdaptationError[] {
  const errors: AdaptationError[] = [];
  for (const d of decisions) {
    if (d.priority.ordinal < 0 || d.priority.ordinal > 3) {
      errors.push(
        createAdaptationError(
          AdaptationErrorCodes.POLICY_BLOCKED,
          "Priority ordinal out of fixed table range",
          d.id,
        ),
      );
    }
  }
  return Object.freeze(errors);
}
`,
);

write(
  "policies/SafetyPolicy.ts",
  `import type { AdaptationPackage } from "../models/AdaptationPackage";
import { createAdaptationError, AdaptationErrorCodes } from "../models/AdaptationError";
import type { AdaptationError } from "../models/AdaptationError";

/**
 * Safety: handoffs are inputs only — package must not claim plan mutation.
 * Enforced by absence of mutation fields (structural check on handoff ids).
 */
export function applySafetyPolicy(pkg: AdaptationPackage): readonly AdaptationError[] {
  const errors: AdaptationError[] = [];
  const handoffs = [
    pkg.workoutAdaptationInput,
    pkg.nutritionAdaptationInput,
    pkg.recoveryAdaptationInput,
    pkg.goalProgressInput,
  ];
  for (const h of handoffs) {
    if (h && !h.id.startsWith("handoff:")) {
      errors.push(
        createAdaptationError(
          AdaptationErrorCodes.POLICY_BLOCKED,
          "Handoff id must use handoff: prefix (inputs only)",
          h.id,
        ),
      );
    }
  }
  return Object.freeze(errors);
}
`,
);

write(
  "policies/index.ts",
  `export * from "./AdaptationPolicy";
export * from "./ConsistencyPolicy";
export * from "./DetectionPolicy";
export * from "./MonitoringPolicy";
export * from "./PriorityPolicy";
export * from "./SafetyPolicy";
`,
);

// ─── SELECTORS ────────────────────────────────────────────────────────────────

write(
  "selectors/AdaptationSelector.ts",
  `import type { AdaptationDecision } from "../models/AdaptationDecision";
import type { AdaptationCategory } from "../models/AdaptationCategory";

export function selectDecisionsByCategory(
  decisions: readonly AdaptationDecision[],
  category: AdaptationCategory,
): readonly AdaptationDecision[] {
  return Object.freeze(decisions.filter((d) => d.category === category));
}

export function selectDecisionById(
  decisions: readonly AdaptationDecision[],
  id: string,
): AdaptationDecision | null {
  return decisions.find((d) => d.id === id) ?? null;
}
`,
);

write(
  "selectors/TriggerSelector.ts",
  `import type { AdaptationTrigger } from "../models/AdaptationTrigger";
import type { AdaptationTriggerKind } from "../models/AdaptationTrigger";

export function selectPresentTriggers(
  triggers: readonly AdaptationTrigger[],
): readonly AdaptationTrigger[] {
  return Object.freeze(triggers.filter((t) => t.present));
}

export function selectTriggersByKind(
  triggers: readonly AdaptationTrigger[],
  kind: AdaptationTriggerKind,
): readonly AdaptationTrigger[] {
  return Object.freeze(triggers.filter((t) => t.kind === kind));
}
`,
);

write(
  "selectors/HistorySelector.ts",
  `import type { AdaptationHistory, AdaptationHistoryEntry } from "../models/AdaptationHistory";

export function selectHistoryEntriesByKind(
  history: AdaptationHistory | null,
  kind: string,
): readonly AdaptationHistoryEntry[] {
  if (!history) return Object.freeze([]);
  return Object.freeze(history.entries.filter((e) => e.kind === kind));
}
`,
);

write(
  "selectors/TimelineSelector.ts",
  `import type { AdaptationTimeline, AdaptationTimelineItem } from "../models/AdaptationTimeline";

export function selectTimelineItemsByOperation(
  timeline: AdaptationTimeline | null,
  operation: string,
): readonly AdaptationTimelineItem[] {
  if (!timeline) return Object.freeze([]);
  return Object.freeze(timeline.items.filter((i) => i.operation === operation));
}
`,
);

write(
  "selectors/PrioritySelector.ts",
  `import type { AdaptationDecision } from "../models/AdaptationDecision";

export function selectHighestPriorityDecisions(
  decisions: readonly AdaptationDecision[],
): readonly AdaptationDecision[] {
  if (decisions.length === 0) return Object.freeze([]);
  const min = Math.min(...decisions.map((d) => d.priority.ordinal));
  return Object.freeze(decisions.filter((d) => d.priority.ordinal === min));
}
`,
);

write(
  "selectors/index.ts",
  `export * from "./AdaptationSelector";
export * from "./HistorySelector";
export * from "./PrioritySelector";
export * from "./TimelineSelector";
export * from "./TriggerSelector";
`,
);

// ─── CONTRACTS ────────────────────────────────────────────────────────────────

write(
  "contracts/AthleteStatePort.ts",
  `export interface AthleteStatePort {
  isAthletePresent(input: { readonly athleteId: string; readonly at: string }): boolean;
  loadStateKeys(input: {
    readonly athleteId: string;
    readonly at: string;
  }): readonly string[];
}

export function createMockAthleteStatePort(present = true): AthleteStatePort {
  return {
    isAthletePresent: () => present,
    loadStateKeys(input) {
      return Object.freeze([
        \`state:athlete:\${input.athleteId}\`,
        "state:readiness",
        "state:load",
      ]);
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
    confidence: Object.freeze({
      level: "high" as const,
      score: 90,
      evidenceCount: 1,
      notes: Object.freeze([] as string[]),
    }),
    score: Object.freeze({
      total: 90,
      priorityComponent: 90,
      confidenceComponent: 90,
      consistencyComponent: 90,
      riskComponent: 70,
      impactComponent: 80,
    }),
    reasons: Object.freeze([
      Object.freeze({
        code: "mock_reason",
        category: input.category,
        statement: "mock",
        evidenceKeys: Object.freeze([\`source:\${input.category}\`]),
        metadata: EMPTY_DECISION_METADATA,
      }),
    ]),
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
        createMockDecision({
          ...input,
          category: "safety",
          ordinal: 0,
          intent: DecisionIntents.BLOCK,
        }),
        createMockDecision({
          ...input,
          category: "recovery",
          ordinal: 1,
          intent: DecisionIntents.RECOMMEND,
        }),
        createMockDecision({
          ...input,
          category: "training",
          ordinal: 2,
          intent: DecisionIntents.CONTINUE,
        }),
      ]);
    },
  };
}
`,
);

write(
  "contracts/RecommendationEnginePort.ts",
  `import type { CoachingRecommendation } from "../../recommendation-engine/models/CoachingRecommendation";
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
    confidence: Object.freeze({
      level: "high" as const,
      score: 90,
      evidenceCount: 1,
      notes: Object.freeze([] as string[]),
    }),
    actions: Object.freeze([
      Object.freeze({
        id: \`action:\${id}\`,
        type: RecommendationTypes.ACTION,
        key: \`\${category}.act\`,
        targetKey: category,
        parameters: Object.freeze({ decisionId: input.decisionId }),
        metadata: EMPTY_RECOMMENDATION_METADATA,
      }),
    ]),
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
      const decisions = [
        "decision:safety:mock",
        "decision:recovery:mock",
        "decision:training:mock",
      ];
      const categories = ["safety", "recovery", "training"] as const;
      return Object.freeze(
        decisions.map((decisionId, i) =>
          createMockRecommendation({ ...input, category: categories[i]!, decisionId }),
        ),
      );
    },
  };
}
`,
);

write(
  "contracts/ExplainabilityEnginePort.ts",
  `import type { CoachingExplanation } from "../../explainability-engine/models/CoachingExplanation";
import { EMPTY_EXPLANATION_METADATA } from "../../explainability-engine/models/ExplanationMetadata";
import { priorityForOrdinal } from "../../explainability-engine/models/ExplanationPriority";

export interface ExplainabilityEnginePort {
  loadExplanations(input: {
    readonly athleteId: string;
    readonly sessionId: string | null;
    readonly conversationId: string | null;
    readonly contextId: string;
    readonly at: string;
  }): readonly CoachingExplanation[];
}

function createMockExplanation(input: {
  readonly athleteId: string;
  readonly sessionId: string | null;
  readonly conversationId: string | null;
  readonly contextId: string;
  readonly at: string;
  readonly decisionId: string;
  readonly recommendationId: string;
}): CoachingExplanation {
  const id = \`explanation:\${input.recommendationId}\`;
  return Object.freeze({
    id,
    athleteId: input.athleteId,
    sessionId: input.sessionId,
    conversationId: input.conversationId,
    contextId: input.contextId,
    recommendationId: input.recommendationId,
    decisionId: input.decisionId,
    reasons: Object.freeze([]),
    evidence: Object.freeze([]),
    sections: Object.freeze([]),
    confidence: Object.freeze({
      level: "high" as const,
      score: 90,
      evidenceCount: 0,
      notes: Object.freeze([] as string[]),
    }),
    priority: priorityForOrdinal(1),
    decisionLink: Object.freeze({
      id: \`dlink:\${id}\`,
      decisionId: input.decisionId,
      explanationId: id,
      category: "recovery",
      intent: "recommend",
      outcome: "accepted",
      metadata: EMPTY_EXPLANATION_METADATA,
    }),
    recommendationLink: Object.freeze({
      id: \`rlink:\${id}\`,
      recommendationId: input.recommendationId,
      explanationId: id,
      category: "recovery",
      intent: "act",
      type: "action",
      metadata: EMPTY_EXPLANATION_METADATA,
    }),
    contextReference: Object.freeze({
      id: \`cref:\${id}\`,
      contextId: input.contextId,
      athleteId: input.athleteId,
      focusAreaKeys: Object.freeze(["recovery"]),
      metadata: EMPTY_EXPLANATION_METADATA,
    }),
    sourceKeys: Object.freeze(["source:recovery"]),
    metadata: EMPTY_EXPLANATION_METADATA,
    createdAt: input.at,
  });
}

export function createMockExplainabilityEnginePort(): ExplainabilityEnginePort {
  return {
    loadExplanations(input) {
      return Object.freeze([
        createMockExplanation({
          ...input,
          decisionId: "decision:recovery:mock",
          recommendationId: "rec:decision:recovery:mock",
        }),
      ]);
    },
  };
}
`,
);

write(
  "contracts/index.ts",
  `export * from "./AthleteStatePort";
export * from "./ContextFusionPort";
export * from "./DecisionEnginePort";
export * from "./ExplainabilityEnginePort";
export * from "./RecommendationEnginePort";
`,
);

// ─── CORE: session / coordinator / engine ─────────────────────────────────────

write(
  "adaptation/AdaptationSession.ts",
  `import type { AdaptationPackage } from "../models/AdaptationPackage";
import type { AdaptationState } from "../models/AdaptationState";
import { AdaptationSessionStatuses } from "../models/AdaptationState";
import { freezeState } from "../utils/FreezeAdaptationState";

export class AdaptationSession {
  private state: AdaptationState;

  constructor(updatedAt: string) {
    this.state = freezeState({
      status: AdaptationSessionStatuses.IDLE,
      package: null,
      decisions: Object.freeze([]),
      updatedAt,
    });
  }

  getState(): AdaptationState {
    return this.state;
  }

  getPackage(): AdaptationPackage | null {
    return this.state.package;
  }

  put(pkg: AdaptationPackage, status: (typeof AdaptationSessionStatuses)[keyof typeof AdaptationSessionStatuses]): void {
    this.state = freezeState({
      status,
      package: pkg,
      decisions: pkg.decisions,
      updatedAt: pkg.createdAt,
    });
  }
}

export function createAdaptationSession(updatedAt: string): AdaptationSession {
  return new AdaptationSession(updatedAt);
}
`,
);

write(
  "adaptation/AdaptationCoordinator.ts",
  `import { buildAdaptationDecision, categoryFromSignals } from "../builders/AdaptationBuilder";
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
      id: \`result:describe:\${this.runtimeId}\`,
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
      id: \`result:snapshot:\${input.id}\`,
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
        id: \`result:validate:error:\${input.id}\`,
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
      id: \`result:validate:\${input.id}\`,
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
        id: \`result:\${operation}:error:\${input.id}\`,
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
        id: \`result:\${operation}:error:\${input.id}\`,
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
        id: \`result:\${operation}:error:\${input.id}\`,
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
      id: \`adaptation:\${input.id}\`,
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
        id: \`eval:adaptation:\${input.id}\`,
        subjectId: \`adaptation:\${input.id}\`,
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
      id: \`summary:\${input.id}\`,
      athleteId: input.athleteId,
      contextId: input.contextId,
      decisions,
      at,
    });
    const snapshot = buildAdaptationSnapshot({
      id: \`snapshot:\${input.id}\`,
      athleteId: input.athleteId,
      contextId: input.contextId,
      decisions,
      summary,
      at,
    });
    void compareSnapshots(input.priorSnapshot, snapshot);

    // 6. Timeline / history / window
    const timeline = buildAdaptationTimeline({
      id: \`timeline:\${input.id}\`,
      athleteId: input.athleteId,
      decisions,
      at,
    });
    const history = buildAdaptationHistory({
      id: \`history:\${input.id}\`,
      athleteId: input.athleteId,
      decisions,
      historyKeys: resolved.input.historyKeys,
      at,
    });
    const window = buildAdaptationWindow({
      id: \`window:\${input.id}\`,
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
      id: \`package:\${input.id}\`,
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
        id: \`result:\${operation}:error:\${input.id}\`,
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
        id: \`result:\${operation}:error:\${input.id}\`,
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
      id: \`result:\${operation}:\${input.id}\`,
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
      if (mergedFlags[\`focus:\${area}\`] === undefined) mergedFlags[\`focus:\${area}\`] = true;
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
`,
);

write(
  "adaptation/ContinuousAdaptationEngine.ts",
  `import type { AdaptationDescriptor } from "../models/AdaptationDescriptor";
import type { AdaptationInput } from "../models/AdaptationInput";
import type { AdaptationResult } from "../models/AdaptationResult";
import { buildAdaptationDescriptor } from "../builders/DescriptorBuilder";
import {
  createAdaptationCoordinator,
  type AdaptationCoordinator,
  type AdaptationCoordinatorDeps,
} from "./AdaptationCoordinator";

export type ContinuousAdaptationEngineDeps = AdaptationCoordinatorDeps;

/**
 * Continuous Adaptation Engine — adaptation detection only.
 * Does NOT modify workout/nutrition/recovery plans.
 */
export class ContinuousAdaptationEngine {
  private readonly coordinator: AdaptationCoordinator;
  private readonly runtimeId: string;
  private readonly clock: () => string;

  constructor(deps: ContinuousAdaptationEngineDeps = {}) {
    this.coordinator = createAdaptationCoordinator(deps);
    this.runtimeId = deps.runtimeId ?? "runtime:continuous-adaptation";
    this.clock = deps.clock ?? (() => new Date().toISOString());
  }

  evaluateAdaptation(input: AdaptationInput): AdaptationResult {
    return this.coordinator.evaluate(input);
  }

  detectAdaptation(input: AdaptationInput): AdaptationResult {
    return this.coordinator.detect(input);
  }

  describeAdaptation(): AdaptationDescriptor {
    const result = this.coordinator.describe();
    return (
      result.descriptor ??
      buildAdaptationDescriptor({ id: this.runtimeId, createdAt: this.clock() })
    );
  }

  createAdaptationSnapshot(input: AdaptationInput): AdaptationResult {
    return this.coordinator.snapshot(input);
  }

  validateAdaptation(input: AdaptationInput): AdaptationResult {
    return this.coordinator.validate(input);
  }
}

export function createContinuousAdaptationEngine(
  deps: ContinuousAdaptationEngineDeps = {},
): ContinuousAdaptationEngine {
  return new ContinuousAdaptationEngine(deps);
}
`,
);

write(
  "adaptation/index.ts",
  `export * from "./AdaptationCoordinator";
export * from "./AdaptationSession";
export * from "./ContinuousAdaptationEngine";
`,
);

write(
  "services/ContinuousAdaptationEngineService.ts",
  `import {
  createContinuousAdaptationEngine,
  type ContinuousAdaptationEngine,
  type ContinuousAdaptationEngineDeps,
} from "../adaptation/ContinuousAdaptationEngine";
import type { AdaptationDescriptor } from "../models/AdaptationDescriptor";
import type { AdaptationInput } from "../models/AdaptationInput";
import type { AdaptationResult } from "../models/AdaptationResult";

export type ContinuousAdaptationEngineServiceDeps = ContinuousAdaptationEngineDeps;

/**
 * Continuous Adaptation Engine Service — orchestration facade.
 *
 * Athlete State + Context Fusion + Decision + Recommendation + Explainability
 *   → Continuous Adaptation Engine
 *   → AdaptationDecision
 *   → Workout/Nutrition/Recovery/GoalProgress handoff inputs
 */
export class ContinuousAdaptationEngineService {
  private readonly engine: ContinuousAdaptationEngine;

  constructor(deps: ContinuousAdaptationEngineServiceDeps = {}) {
    this.engine = createContinuousAdaptationEngine(deps);
  }

  evaluateAdaptation(input: AdaptationInput): AdaptationResult {
    return this.engine.evaluateAdaptation(input);
  }

  detectAdaptation(input: AdaptationInput): AdaptationResult {
    return this.engine.detectAdaptation(input);
  }

  describeAdaptation(): AdaptationDescriptor {
    return this.engine.describeAdaptation();
  }

  createAdaptationSnapshot(input: AdaptationInput): AdaptationResult {
    return this.engine.createAdaptationSnapshot(input);
  }

  validateAdaptation(input: AdaptationInput): AdaptationResult {
    return this.engine.validateAdaptation(input);
  }
}

export function createContinuousAdaptationEngineService(
  deps: ContinuousAdaptationEngineServiceDeps = {},
): ContinuousAdaptationEngineService {
  return new ContinuousAdaptationEngineService(deps);
}
`,
);

write(
  "services/index.ts",
  `export * from "./ContinuousAdaptationEngineService";
`,
);

write(
  "application/index.ts",
  `import type { AdaptationDescriptor } from "../models/AdaptationDescriptor";
import type { AdaptationInput } from "../models/AdaptationInput";
import type { AdaptationResult } from "../models/AdaptationResult";
import {
  createContinuousAdaptationEngineService,
  type ContinuousAdaptationEngineService,
  type ContinuousAdaptationEngineServiceDeps,
} from "../services/ContinuousAdaptationEngineService";

function resolveService(
  service?: ContinuousAdaptationEngineService,
  deps?: ContinuousAdaptationEngineServiceDeps,
): ContinuousAdaptationEngineService {
  return service ?? createContinuousAdaptationEngineService(deps);
}

/** Public API — evaluate adaptation signals into AdaptationDecision package. */
export function evaluateAdaptation(options: {
  readonly input: AdaptationInput;
  readonly service?: ContinuousAdaptationEngineService;
  readonly deps?: ContinuousAdaptationEngineServiceDeps;
}): AdaptationResult {
  return resolveService(options.service, options.deps).evaluateAdaptation(options.input);
}

/** Public API — detect adaptation signal presence only. */
export function detectAdaptation(options: {
  readonly input: AdaptationInput;
  readonly service?: ContinuousAdaptationEngineService;
  readonly deps?: ContinuousAdaptationEngineServiceDeps;
}): AdaptationResult {
  return resolveService(options.service, options.deps).detectAdaptation(options.input);
}

/** Public API — describe Continuous Adaptation Engine capabilities. */
export function describeAdaptation(options: {
  readonly service?: ContinuousAdaptationEngineService;
  readonly deps?: ContinuousAdaptationEngineServiceDeps;
} = {}): AdaptationDescriptor {
  return resolveService(options.service, options.deps).describeAdaptation();
}

/** Public API — create adaptation snapshot. */
export function createAdaptationSnapshot(options: {
  readonly input: AdaptationInput;
  readonly service?: ContinuousAdaptationEngineService;
  readonly deps?: ContinuousAdaptationEngineServiceDeps;
}): AdaptationResult {
  return resolveService(options.service, options.deps).createAdaptationSnapshot(options.input);
}

/** Public API — validate adaptation package integrity. */
export function validateAdaptation(options: {
  readonly input: AdaptationInput;
  readonly service?: ContinuousAdaptationEngineService;
  readonly deps?: ContinuousAdaptationEngineServiceDeps;
}): AdaptationResult {
  return resolveService(options.service, options.deps).validateAdaptation(options.input);
}

export type { ContinuousAdaptationEngineServiceDeps };
`,
);

write(
  "index.ts",
  `/**
 * Continuous Adaptation Engine
 *
 * Sprint 23.1 — Continuous Adaptation Engine Foundation.
 *
 * Athlete State + Context Fusion + Decision + Recommendation + Explainability
 *   ↓
 * Continuous Adaptation Engine
 *   ↓
 * AdaptationDecision
 *   ↓
 * WorkoutAdaptationInput / NutritionAdaptationInput /
 * RecoveryAdaptationInput / GoalProgressInput
 *
 * Adaptation detection only. Does NOT modify plans.
 *
 * No AI. No heuristics. No prediction. No persistence. No networking. No UI.
 * No OpenAI SDK. No Prompt Builder. No Tool Runtime. No Action Engine.
 * No recommendation generation. No business calculations.
 */

export * from "./models";
export {
  evaluateAdaptation,
  detectAdaptation,
  describeAdaptation,
  createAdaptationSnapshot,
  validateAdaptation,
} from "./application";
export {
  ContinuousAdaptationEngineService,
  createContinuousAdaptationEngineService,
} from "./services";
`,
);

console.log(`Generated ${fileCount} files under continuous-adaptation (part 4).`);
