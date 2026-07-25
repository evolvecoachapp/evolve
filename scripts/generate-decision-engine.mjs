/**
 * Sprint 22.3 — Decision Engine Foundation generator (part 1: models).
 * Run: node scripts/generate-decision-engine.mjs && node scripts/generate-decision-engine-part2.mjs && node scripts/generate-decision-engine-part3.mjs
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
  "models/DecisionMetadata.ts",
  `/**
 * Immutable metadata bag for decision-engine entities.
 */
export interface DecisionMetadata {
  readonly tags: readonly string[];
  readonly attributes: Readonly<Record<string, string>>;
}

export const EMPTY_DECISION_METADATA: DecisionMetadata = Object.freeze({
  tags: Object.freeze([] as string[]),
  attributes: Object.freeze({} as Record<string, string>),
});
`,
);

write(
  "models/DecisionCategory.ts",
  `export const DecisionCategories = {
  TRAINING: "training",
  NUTRITION: "nutrition",
  RECOVERY: "recovery",
  GOAL: "goal",
  LIFESTYLE: "lifestyle",
  SAFETY: "safety",
  ORCHESTRATION: "orchestration",
} as const;

export type DecisionCategory =
  (typeof DecisionCategories)[keyof typeof DecisionCategories];
`,
);

write(
  "models/DecisionIntent.ts",
  `export const DecisionIntents = {
  PRIORITIZE: "prioritize",
  DEFER: "defer",
  BLOCK: "block",
  CONTINUE: "continue",
  ESCALATE: "escalate",
  RECOMMEND: "recommend",
  RESOLVE: "resolve",
} as const;

export type DecisionIntent =
  (typeof DecisionIntents)[keyof typeof DecisionIntents];
`,
);

write(
  "models/DecisionOutcome.ts",
  `export const DecisionOutcomes = {
  ACCEPTED: "accepted",
  REJECTED: "rejected",
  DEFERRED: "deferred",
  SUPERSEDED: "superseded",
  PENDING: "pending",
} as const;

export type DecisionOutcome =
  (typeof DecisionOutcomes)[keyof typeof DecisionOutcomes];
`,
);

write(
  "models/DecisionPriority.ts",
  `import type { DecisionCategory } from "./DecisionCategory";

/**
 * Immutable priority stamp — fixed ordinal tables only (no heuristics).
 */
export interface DecisionPriority {
  readonly category: DecisionCategory;
  readonly ordinal: number;
  readonly label: string;
}

/** Fixed category priority: lower ordinal = higher priority. */
export const DEFAULT_DECISION_PRIORITIES: readonly DecisionPriority[] =
  Object.freeze([
    Object.freeze({
      category: "safety" as const,
      ordinal: 0,
      label: "safety",
    }),
    Object.freeze({
      category: "recovery" as const,
      ordinal: 1,
      label: "recovery",
    }),
    Object.freeze({
      category: "training" as const,
      ordinal: 2,
      label: "training",
    }),
    Object.freeze({
      category: "nutrition" as const,
      ordinal: 3,
      label: "nutrition",
    }),
    Object.freeze({
      category: "goal" as const,
      ordinal: 4,
      label: "goal",
    }),
    Object.freeze({
      category: "lifestyle" as const,
      ordinal: 5,
      label: "lifestyle",
    }),
    Object.freeze({
      category: "orchestration" as const,
      ordinal: 6,
      label: "orchestration",
    }),
  ]);
`,
);

write(
  "models/DecisionConfidence.ts",
  `export type DecisionConfidenceLevel =
  | "unknown"
  | "low"
  | "medium"
  | "high"
  | "complete";

/**
 * Immutable confidence stamp derived from structural completeness only.
 */
export interface DecisionConfidence {
  readonly level: DecisionConfidenceLevel;
  readonly score: number;
  readonly evidenceCount: number;
  readonly notes: readonly string[];
}
`,
);

write(
  "models/DecisionReason.ts",
  `import type { DecisionMetadata } from "./DecisionMetadata";

/**
 * Immutable structured reason — not natural language generation.
 */
export interface DecisionReason {
  readonly code: string;
  readonly category: string;
  readonly statement: string;
  readonly evidenceKeys: readonly string[];
  readonly metadata: DecisionMetadata;
}
`,
);

write(
  "models/DecisionConstraint.ts",
  `import type { DecisionMetadata } from "./DecisionMetadata";

export const DecisionConstraintKinds = {
  REQUIRED_SOURCE: "required_source",
  MUTUAL_EXCLUSION: "mutual_exclusion",
  SAFETY: "safety",
  DEPENDENCY: "dependency",
  PRIORITY_CEILING: "priority_ceiling",
} as const;

export type DecisionConstraintKind =
  (typeof DecisionConstraintKinds)[keyof typeof DecisionConstraintKinds];

/**
 * Immutable decision constraint — orchestration bounds only.
 */
export interface DecisionConstraint {
  readonly id: string;
  readonly kind: DecisionConstraintKind;
  readonly description: string;
  readonly subjectKeys: readonly string[];
  readonly blocking: boolean;
  readonly metadata: DecisionMetadata;
}
`,
);

write(
  "models/DecisionDependency.ts",
  `import type { DecisionMetadata } from "./DecisionMetadata";

export const DecisionDependencyKinds = {
  REQUIRES: "requires",
  BLOCKS: "blocks",
  FOLLOWS: "follows",
  RELATED: "related",
} as const;

export type DecisionDependencyKind =
  (typeof DecisionDependencyKinds)[keyof typeof DecisionDependencyKinds];

/**
 * Immutable dependency edge between decision candidates / steps.
 */
export interface DecisionDependency {
  readonly id: string;
  readonly kind: DecisionDependencyKind;
  readonly fromId: string;
  readonly toId: string;
  readonly required: boolean;
  readonly metadata: DecisionMetadata;
}
`,
);

write(
  "models/DecisionConflict.ts",
  `import type { DecisionMetadata } from "./DecisionMetadata";

export const DecisionConflictKinds = {
  PRIORITY: "priority",
  MUTUAL_EXCLUSION: "mutual_exclusion",
  DEPENDENCY: "dependency",
  CONSTRAINT: "constraint",
  OUTCOME: "outcome",
} as const;

export type DecisionConflictKind =
  (typeof DecisionConflictKinds)[keyof typeof DecisionConflictKinds];

/**
 * Immutable conflict between decision candidates.
 */
export interface DecisionConflict {
  readonly id: string;
  readonly kind: DecisionConflictKind;
  readonly leftId: string;
  readonly rightId: string;
  readonly description: string;
  readonly resolved: boolean;
  readonly metadata: DecisionMetadata;
}
`,
);

write(
  "models/DecisionResolution.ts",
  `import type { DecisionMetadata } from "./DecisionMetadata";

export const DecisionResolutionStrategies = {
  HIGHER_PRIORITY: "higher_priority",
  SAFETY_FIRST: "safety_first",
  DEPENDENCY_ORDER: "dependency_order",
  KEEP_BOTH: "keep_both",
  DROP_LEFT: "drop_left",
  DROP_RIGHT: "drop_right",
} as const;

export type DecisionResolutionStrategy =
  (typeof DecisionResolutionStrategies)[keyof typeof DecisionResolutionStrategies];

/**
 * Immutable conflict resolution record — deterministic strategies only.
 */
export interface DecisionResolution {
  readonly id: string;
  readonly conflictId: string;
  readonly strategy: DecisionResolutionStrategy;
  readonly winnerId: string | null;
  readonly loserIds: readonly string[];
  readonly notes: readonly string[];
  readonly metadata: DecisionMetadata;
  readonly resolvedAt: string;
}
`,
);

write(
  "models/DecisionScore.ts",
  `/**
 * Immutable structural score — fixed tables, no domain math.
 */
export interface DecisionScore {
  readonly total: number;
  readonly priorityComponent: number;
  readonly confidenceComponent: number;
  readonly riskComponent: number;
  readonly impactComponent: number;
  readonly consistencyComponent: number;
}
`,
);

write(
  "models/DecisionEvaluation.ts",
  `import type { DecisionConfidence } from "./DecisionConfidence";
  import type { DecisionMetadata } from "./DecisionMetadata";
  import type { DecisionScore } from "./DecisionScore";

/**
 * Immutable evaluation of a candidate / decision.
 */
export interface DecisionEvaluation {
  readonly id: string;
  readonly subjectId: string;
  readonly score: DecisionScore;
  readonly confidence: DecisionConfidence;
  readonly passed: boolean;
  readonly violations: readonly string[];
  readonly notes: readonly string[];
  readonly metadata: DecisionMetadata;
  readonly evaluatedAt: string;
}
`,
);

write(
  "models/DecisionCandidate.ts",
  `import type { DecisionCategory } from "./DecisionCategory";
  import type { DecisionConfidence } from "./DecisionConfidence";
  import type { DecisionIntent } from "./DecisionIntent";
  import type { DecisionMetadata } from "./DecisionMetadata";
  import type { DecisionPriority } from "./DecisionPriority";
  import type { DecisionReason } from "./DecisionReason";

/**
 * Immutable candidate before resolution into CoachingDecision.
 */
export interface DecisionCandidate {
  readonly id: string;
  readonly category: DecisionCategory;
  readonly intent: DecisionIntent;
  readonly title: string;
  readonly priority: DecisionPriority;
  readonly confidence: DecisionConfidence;
  readonly reasons: readonly DecisionReason[];
  readonly sourceKeys: readonly string[];
  readonly metadata: DecisionMetadata;
}
`,
);

write(
  "models/DecisionRecommendationReference.ts",
  `import type { DecisionCategory } from "./DecisionCategory";
  import type { DecisionMetadata } from "./DecisionMetadata";

/**
 * Opaque reference for Recommendation Engine handoff — no NL, no execution.
 */
export interface DecisionRecommendationReference {
  readonly id: string;
  readonly decisionId: string;
  readonly category: DecisionCategory;
  readonly priorityOrdinal: number;
  readonly intent: string;
  readonly metadata: DecisionMetadata;
}
`,
);

write(
  "models/CoachingDecision.ts",
  `import type { DecisionCategory } from "./DecisionCategory";
  import type { DecisionConfidence } from "./DecisionConfidence";
  import type { DecisionConstraint } from "./DecisionConstraint";
  import type { DecisionDependency } from "./DecisionDependency";
  import type { DecisionIntent } from "./DecisionIntent";
  import type { DecisionMetadata } from "./DecisionMetadata";
  import type { DecisionOutcome } from "./DecisionOutcome";
  import type { DecisionPriority } from "./DecisionPriority";
  import type { DecisionReason } from "./DecisionReason";
  import type { DecisionRecommendationReference } from "./DecisionRecommendationReference";
  import type { DecisionScore } from "./DecisionScore";

/**
 * Immutable coaching decision — orchestration output only.
 * No AI. No NL. No domain calculations. No action execution.
 */
export interface CoachingDecision {
  readonly id: string;
  readonly athleteId: string;
  readonly sessionId: string | null;
  readonly conversationId: string | null;
  readonly contextId: string;
  readonly category: DecisionCategory;
  readonly intent: DecisionIntent;
  readonly outcome: DecisionOutcome;
  readonly title: string;
  readonly priority: DecisionPriority;
  readonly confidence: DecisionConfidence;
  readonly score: DecisionScore;
  readonly reasons: readonly DecisionReason[];
  readonly constraints: readonly DecisionConstraint[];
  readonly dependencies: readonly DecisionDependency[];
  readonly recommendationRefs: readonly DecisionRecommendationReference[];
  readonly sourceKeys: readonly string[];
  readonly metadata: DecisionMetadata;
  readonly createdAt: string;
}
`,
);

write(
  "models/DecisionStep.ts",
  `import type { DecisionCategory } from "./DecisionCategory";
  import type { DecisionIntent } from "./DecisionIntent";
  import type { DecisionMetadata } from "./DecisionMetadata";

export const DecisionStepStatuses = {
  PLANNED: "planned",
  READY: "ready",
  BLOCKED: "blocked",
  COMPLETE: "complete",
  SKIPPED: "skipped",
} as const;

export type DecisionStepStatus =
  (typeof DecisionStepStatuses)[keyof typeof DecisionStepStatuses];

/**
 * Immutable plan step — planning only, never executed here.
 */
export interface DecisionStep {
  readonly id: string;
  readonly decisionId: string;
  readonly order: number;
  readonly category: DecisionCategory;
  readonly intent: DecisionIntent;
  readonly status: DecisionStepStatus;
  readonly dependsOn: readonly string[];
  readonly metadata: DecisionMetadata;
}
`,
);

write(
  "models/DecisionPlan.ts",
  `import type { DecisionMetadata } from "./DecisionMetadata";
  import type { DecisionStep } from "./DecisionStep";

/**
 * Immutable decision plan — orchestration sequence only.
 */
export interface DecisionPlan {
  readonly id: string;
  readonly athleteId: string;
  readonly contextId: string;
  readonly steps: readonly DecisionStep[];
  readonly metadata: DecisionMetadata;
  readonly createdAt: string;
}
`,
);

write(
  "models/DecisionGraph.ts",
  `import type { DecisionMetadata } from "./DecisionMetadata";

export interface DecisionGraphNode {
  readonly id: string;
  readonly kind: "candidate" | "decision" | "step" | "constraint";
  readonly label: string;
  readonly category: string;
}

export interface DecisionGraphEdge {
  readonly id: string;
  readonly fromId: string;
  readonly toId: string;
  readonly kind: string;
}

/**
 * Immutable decision graph — structure only.
 */
export interface DecisionGraph {
  readonly id: string;
  readonly nodes: readonly DecisionGraphNode[];
  readonly edges: readonly DecisionGraphEdge[];
  readonly roots: readonly string[];
  readonly leaves: readonly string[];
  readonly metadata: DecisionMetadata;
}
`,
);

write(
  "models/DecisionSummary.ts",
  `import type { DecisionMetadata } from "./DecisionMetadata";

/**
 * Compact immutable decision summary.
 */
export interface DecisionSummary {
  readonly id: string;
  readonly athleteId: string;
  readonly contextId: string;
  readonly decisionCount: number;
  readonly candidateCount: number;
  readonly conflictCount: number;
  readonly resolutionCount: number;
  readonly primaryCategory: string | null;
  readonly headline: string;
  readonly focusAreas: readonly string[];
  readonly metadata: DecisionMetadata;
}
`,
);

write(
  "models/DecisionSnapshot.ts",
  `import type { CoachingDecision } from "./CoachingDecision";
  import type { DecisionMetadata } from "./DecisionMetadata";
  import type { DecisionSummary } from "./DecisionSummary";

/**
 * Point-in-time immutable capture of decisions.
 */
export interface DecisionSnapshot {
  readonly id: string;
  readonly athleteId: string;
  readonly contextId: string;
  readonly decisions: readonly CoachingDecision[];
  readonly summary: DecisionSummary | null;
  readonly metadata: DecisionMetadata;
  readonly capturedAt: string;
}
`,
);

write(
  "models/DecisionStatistics.ts",
  `/**
 * Immutable structural statistics for a decision package.
 */
export interface DecisionStatistics {
  readonly decisionCount: number;
  readonly candidateCount: number;
  readonly conflictCount: number;
  readonly resolutionCount: number;
  readonly constraintCount: number;
  readonly dependencyCount: number;
  readonly stepCount: number;
  readonly graphNodeCount: number;
  readonly graphEdgeCount: number;
}
`,
);

write(
  "models/DecisionDiagnostics.ts",
  `/**
 * Immutable diagnostics — warnings/notes only.
 */
export interface DecisionDiagnostics {
  readonly warnings: readonly string[];
  readonly notes: readonly string[];
  readonly missingSources: readonly string[];
  readonly blockedCandidates: readonly string[];
}
`,
);

write(
  "models/DecisionTimeline.ts",
  `import type { DecisionMetadata } from "./DecisionMetadata";

export const DecisionTimelineEventKinds = {
  BUILD: "build",
  ANALYZE: "analyze",
  EVALUATE: "evaluate",
  PLAN: "plan",
  RESOLVE: "resolve",
  VALIDATE: "validate",
  DESCRIBE: "describe",
} as const;

export type DecisionTimelineEventKind =
  (typeof DecisionTimelineEventKinds)[keyof typeof DecisionTimelineEventKinds];

export interface DecisionTimelineItem {
  readonly id: string;
  readonly kind: DecisionTimelineEventKind;
  readonly label: string;
  readonly at: string;
  readonly metadata: DecisionMetadata;
}

export interface DecisionTimeline {
  readonly items: readonly DecisionTimelineItem[];
  readonly metadata: DecisionMetadata;
}
`,
);

write(
  "models/DecisionContext.ts",
  `import type { UnifiedCoachingContext } from "../../context-fusion/models/UnifiedCoachingContext";
  import type { DecisionEngineContext } from "../../context-fusion/models/DecisionEngineContext";
  import type { DecisionMetadata } from "./DecisionMetadata";

/**
 * Immutable input view for Decision Engine orchestration.
 */
export interface DecisionContext {
  readonly id: string;
  readonly athleteId: string;
  readonly sessionId: string | null;
  readonly conversationId: string | null;
  readonly contextId: string;
  readonly unified: UnifiedCoachingContext;
  readonly handoff: DecisionEngineContext | null;
  readonly focusAreas: readonly string[];
  readonly metadata: DecisionMetadata;
  readonly createdAt: string;
}
`,
);

write(
  "models/DecisionInput.ts",
  `import type { DecisionContext } from "./DecisionContext";
  import type { DecisionMetadata } from "./DecisionMetadata";
  import type { CoachingDecision } from "./CoachingDecision";

export const DecisionInputKinds = {
  BUILD: "build",
  EVALUATE: "evaluate",
  RESOLVE: "resolve",
  VALIDATE: "validate",
  DESCRIBE: "describe",
} as const;

export type DecisionInputKind =
  (typeof DecisionInputKinds)[keyof typeof DecisionInputKinds];

/**
 * Immutable request into Decision Engine operations.
 */
export interface DecisionInput {
  readonly id: string;
  readonly kind: DecisionInputKind;
  readonly athleteId: string;
  readonly sessionId: string | null;
  readonly conversationId: string | null;
  readonly contextId: string;
  readonly decisionContext: DecisionContext | null;
  readonly decisions: readonly CoachingDecision[];
  readonly reason: string;
  readonly metadata: DecisionMetadata;
  readonly createdAt: string;
}
`,
);

write(
  "models/DecisionOutput.ts",
  `import type { CoachingDecision } from "./CoachingDecision";
  import type { DecisionPackage } from "./DecisionPackage";
  import type { DecisionSummary } from "./DecisionSummary";
  import type { RecommendationEngineInput } from "./RecommendationEngineInput";

/**
 * Immutable output envelope for a Decision Engine operation.
 */
export interface DecisionOutput {
  readonly decisions: readonly CoachingDecision[];
  readonly package: DecisionPackage | null;
  readonly summary: DecisionSummary | null;
  readonly recommendationInput: RecommendationEngineInput | null;
}
`,
);

write(
  "models/RecommendationEngineInput.ts",
  `import type { DecisionRecommendationReference } from "./DecisionRecommendationReference";
  import type { DecisionMetadata } from "./DecisionMetadata";
  import type { DecisionSummary } from "./DecisionSummary";

/**
 * Immutable handoff for Recommendation Engine — structure only.
 */
export interface RecommendationEngineInput {
  readonly id: string;
  readonly athleteId: string;
  readonly contextId: string;
  readonly decisionIds: readonly string[];
  readonly recommendations: readonly DecisionRecommendationReference[];
  readonly summary: DecisionSummary | null;
  readonly metadata: DecisionMetadata;
  readonly createdAt: string;
}
`,
);

write(
  "models/DecisionPackage.ts",
  `import type { CoachingDecision } from "./CoachingDecision";
  import type { DecisionCandidate } from "./DecisionCandidate";
  import type { DecisionConflict } from "./DecisionConflict";
  import type { DecisionConstraint } from "./DecisionConstraint";
  import type { DecisionContext } from "./DecisionContext";
  import type { DecisionDependency } from "./DecisionDependency";
  import type { DecisionDiagnostics } from "./DecisionDiagnostics";
  import type { DecisionEvaluation } from "./DecisionEvaluation";
  import type { DecisionGraph } from "./DecisionGraph";
  import type { DecisionMetadata } from "./DecisionMetadata";
  import type { DecisionPlan } from "./DecisionPlan";
  import type { DecisionResolution } from "./DecisionResolution";
  import type { DecisionSnapshot } from "./DecisionSnapshot";
  import type { DecisionStatistics } from "./DecisionStatistics";
  import type { DecisionSummary } from "./DecisionSummary";
  import type { DecisionTimeline } from "./DecisionTimeline";
  import type { RecommendationEngineInput } from "./RecommendationEngineInput";

/**
 * Immutable decision package for downstream consumers.
 */
export interface DecisionPackage {
  readonly id: string;
  readonly athleteId: string;
  readonly contextId: string;
  readonly decisionContext: DecisionContext;
  readonly candidates: readonly DecisionCandidate[];
  readonly decisions: readonly CoachingDecision[];
  readonly evaluations: readonly DecisionEvaluation[];
  readonly conflicts: readonly DecisionConflict[];
  readonly resolutions: readonly DecisionResolution[];
  readonly constraints: readonly DecisionConstraint[];
  readonly dependencies: readonly DecisionDependency[];
  readonly plan: DecisionPlan | null;
  readonly graph: DecisionGraph | null;
  readonly summary: DecisionSummary | null;
  readonly snapshot: DecisionSnapshot | null;
  readonly statistics: DecisionStatistics;
  readonly diagnostics: DecisionDiagnostics;
  readonly timeline: DecisionTimeline;
  readonly recommendationInput: RecommendationEngineInput | null;
  readonly metadata: DecisionMetadata;
  readonly createdAt: string;
}
`,
);

write(
  "models/DecisionDescriptor.ts",
  `import type { DecisionMetadata } from "./DecisionMetadata";

/**
 * Immutable capability descriptor for Decision Engine.
 */
export interface DecisionDescriptor {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly capabilities: readonly string[];
  readonly categories: readonly string[];
  readonly metadata: DecisionMetadata;
  readonly createdAt: string;
}
`,
);

write(
  "models/DecisionError.ts",
  `export const DecisionErrorCodes = {
  INVALID_INPUT: "invalid_input",
  MISSING_CONTEXT: "missing_context",
  VALIDATION_FAILED: "validation_failed",
  RESOLUTION_FAILED: "resolution_failed",
  INTERNAL: "internal",
} as const;

export type DecisionErrorCode =
  (typeof DecisionErrorCodes)[keyof typeof DecisionErrorCodes];

export interface DecisionError {
  readonly code: DecisionErrorCode;
  readonly message: string;
  readonly details: readonly string[];
}

export function createDecisionError(
  code: DecisionErrorCode,
  message: string,
  details: readonly string[] = [],
): DecisionError {
  return Object.freeze({
    code,
    message,
    details: Object.freeze([...details]),
  });
}
`,
);

write(
  "models/DecisionValidation.ts",
  `import type { DecisionError } from "./DecisionError";

/**
 * Immutable validation report.
 */
export interface DecisionValidation {
  readonly valid: boolean;
  readonly errors: readonly DecisionError[];
  readonly warnings: readonly string[];
}
`,
);

write(
  "models/DecisionResult.ts",
  `import type { CoachingDecision } from "./CoachingDecision";
  import type { DecisionDescriptor } from "./DecisionDescriptor";
  import type { DecisionError } from "./DecisionError";
  import type { DecisionPackage } from "./DecisionPackage";
  import type { DecisionSnapshot } from "./DecisionSnapshot";
  import type { DecisionSummary } from "./DecisionSummary";
  import type { DecisionValidation } from "./DecisionValidation";
  import type { RecommendationEngineInput } from "./RecommendationEngineInput";

export const DecisionOperationKinds = {
  BUILD: "build",
  EVALUATE: "evaluate",
  RESOLVE: "resolve",
  VALIDATE: "validate",
  DESCRIBE: "describe",
} as const;

export type DecisionOperationKind =
  (typeof DecisionOperationKinds)[keyof typeof DecisionOperationKinds];

/**
 * Immutable result of a Decision Engine operation.
 */
export interface DecisionResult {
  readonly id: string;
  readonly operation: DecisionOperationKind;
  readonly success: boolean;
  readonly decisions: readonly CoachingDecision[];
  readonly package: DecisionPackage | null;
  readonly summary: DecisionSummary | null;
  readonly snapshot: DecisionSnapshot | null;
  readonly recommendationInput: RecommendationEngineInput | null;
  readonly validation: DecisionValidation | null;
  readonly descriptor: DecisionDescriptor | null;
  readonly errors: readonly DecisionError[];
  readonly createdAt: string;
}
`,
);

write(
  "models/DecisionState.ts",
  `import type { DecisionPackage } from "./DecisionPackage";
  import type { CoachingDecision } from "./CoachingDecision";

export const DecisionSessionStatuses = {
  IDLE: "idle",
  BUILDING: "building",
  EVALUATING: "evaluating",
  RESOLVING: "resolving",
  READY: "ready",
  FAILED: "failed",
} as const;

export type DecisionSessionStatus =
  (typeof DecisionSessionStatuses)[keyof typeof DecisionSessionStatuses];

/**
 * Immutable in-memory decision session state.
 */
export interface DecisionState {
  readonly status: DecisionSessionStatus;
  readonly package: DecisionPackage | null;
  readonly decisions: readonly CoachingDecision[];
  readonly updatedAt: string;
}
`,
);

write(
  "models/index.ts",
  `export * from "./DecisionMetadata";
export * from "./DecisionCategory";
export * from "./DecisionIntent";
export * from "./DecisionOutcome";
export * from "./DecisionPriority";
export * from "./DecisionConfidence";
export * from "./DecisionReason";
export * from "./DecisionConstraint";
export * from "./DecisionDependency";
export * from "./DecisionConflict";
export * from "./DecisionResolution";
export * from "./DecisionScore";
export * from "./DecisionEvaluation";
export * from "./DecisionCandidate";
export * from "./DecisionRecommendationReference";
export * from "./CoachingDecision";
export * from "./DecisionStep";
export * from "./DecisionPlan";
export * from "./DecisionGraph";
export * from "./DecisionSummary";
export * from "./DecisionSnapshot";
export * from "./DecisionStatistics";
export * from "./DecisionDiagnostics";
export * from "./DecisionTimeline";
export * from "./DecisionContext";
export * from "./DecisionInput";
export * from "./DecisionOutput";
export * from "./RecommendationEngineInput";
export * from "./DecisionPackage";
export * from "./DecisionDescriptor";
export * from "./DecisionError";
export * from "./DecisionValidation";
export * from "./DecisionResult";
export * from "./DecisionState";
`,
);

console.log("generate-decision-engine.mjs: models written");
