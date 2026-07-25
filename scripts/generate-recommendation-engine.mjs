/**
 * Sprint 22.4 — Recommendation Engine Foundation generator (part 1: models).
 * Run: node scripts/generate-recommendation-engine.mjs && node scripts/generate-recommendation-engine-part2.mjs && node scripts/generate-recommendation-engine-part3.mjs && node scripts/generate-recommendation-engine-part4.mjs
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
  "models/RecommendationMetadata.ts",
  `/**
 * Immutable metadata bag for recommendation-engine entities.
 */
export interface RecommendationMetadata {
  readonly tags: readonly string[];
  readonly attributes: Readonly<Record<string, string>>;
}

export const EMPTY_RECOMMENDATION_METADATA: RecommendationMetadata = Object.freeze({
  tags: Object.freeze([] as string[]),
  attributes: Object.freeze({} as Record<string, string>),
});
`,
);

write(
  "models/RecommendationCategory.ts",
  `export const RecommendationCategories = {
  TRAINING: "training",
  NUTRITION: "nutrition",
  RECOVERY: "recovery",
  GOAL: "goal",
  LIFESTYLE: "lifestyle",
  SAFETY: "safety",
  ORCHESTRATION: "orchestration",
} as const;

export type RecommendationCategory =
  (typeof RecommendationCategories)[keyof typeof RecommendationCategories];
`,
);

write(
  "models/RecommendationIntent.ts",
  `export const RecommendationIntents = {
  ACT: "act",
  DEFER: "defer",
  MONITOR: "monitor",
  ESCALATE: "escalate",
  INFORM: "inform",
  SEQUENCE: "sequence",
  GROUP: "group",
} as const;

export type RecommendationIntent =
  (typeof RecommendationIntents)[keyof typeof RecommendationIntents];
`,
);

write(
  "models/RecommendationType.ts",
  `export const RecommendationTypes = {
  ACTION: "action",
  GUIDANCE: "guidance",
  CONSTRAINT: "constraint",
  SEQUENCE: "sequence",
  GROUP: "group",
  HANDOFF: "handoff",
} as const;

export type RecommendationType =
  (typeof RecommendationTypes)[keyof typeof RecommendationTypes];
`,
);

write(
  "models/RecommendationPriority.ts",
  `import type { RecommendationCategory } from "./RecommendationCategory";

/**
 * Immutable priority stamp — fixed ordinal tables only (no heuristics).
 */
export interface RecommendationPriority {
  readonly category: RecommendationCategory;
  readonly ordinal: number;
  readonly urgency: number;
  readonly label: string;
}

/** Fixed category priority: lower ordinal = higher priority. */
export const DEFAULT_RECOMMENDATION_PRIORITIES: readonly RecommendationPriority[] =
  Object.freeze([
    Object.freeze({
      category: "safety" as const,
      ordinal: 0,
      urgency: 100,
      label: "safety",
    }),
    Object.freeze({
      category: "recovery" as const,
      ordinal: 1,
      urgency: 80,
      label: "recovery",
    }),
    Object.freeze({
      category: "training" as const,
      ordinal: 2,
      urgency: 70,
      label: "training",
    }),
    Object.freeze({
      category: "nutrition" as const,
      ordinal: 3,
      urgency: 60,
      label: "nutrition",
    }),
    Object.freeze({
      category: "goal" as const,
      ordinal: 4,
      urgency: 50,
      label: "goal",
    }),
    Object.freeze({
      category: "lifestyle" as const,
      ordinal: 5,
      urgency: 40,
      label: "lifestyle",
    }),
    Object.freeze({
      category: "orchestration" as const,
      ordinal: 6,
      urgency: 30,
      label: "orchestration",
    }),
  ]);

export function priorityForCategory(
  category: RecommendationCategory,
): RecommendationPriority {
  const found = DEFAULT_RECOMMENDATION_PRIORITIES.find(
    (p) => p.category === category,
  );
  return (
    found ??
    Object.freeze({
      category,
      ordinal: 99,
      urgency: 0,
      label: category,
    })
  );
}
`,
);

write(
  "models/RecommendationConfidence.ts",
  `export const RecommendationConfidenceLevels = {
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
  UNKNOWN: "unknown",
} as const;

export type RecommendationConfidenceLevel =
  (typeof RecommendationConfidenceLevels)[keyof typeof RecommendationConfidenceLevels];

export interface RecommendationConfidence {
  readonly level: RecommendationConfidenceLevel;
  readonly score: number;
  readonly notes: readonly string[];
}
`,
);

write(
  "models/RecommendationAction.ts",
  `import type { RecommendationMetadata } from "./RecommendationMetadata";
import type { RecommendationType } from "./RecommendationType";

/**
 * Structured action descriptor — not executed here.
 */
export interface RecommendationAction {
  readonly id: string;
  readonly type: RecommendationType;
  readonly key: string;
  readonly targetKey: string | null;
  readonly parameters: Readonly<Record<string, string>>;
  readonly metadata: RecommendationMetadata;
}
`,
);

write(
  "models/RecommendationStep.ts",
  `import type { RecommendationAction } from "./RecommendationAction";
import type { RecommendationMetadata } from "./RecommendationMetadata";

export interface RecommendationStep {
  readonly id: string;
  readonly order: number;
  readonly action: RecommendationAction;
  readonly label: string;
  readonly optional: boolean;
  readonly metadata: RecommendationMetadata;
}
`,
);

write(
  "models/RecommendationSequence.ts",
  `import type { RecommendationMetadata } from "./RecommendationMetadata";
import type { RecommendationStep } from "./RecommendationStep";

export interface RecommendationSequence {
  readonly id: string;
  readonly steps: readonly RecommendationStep[];
  readonly ordered: boolean;
  readonly metadata: RecommendationMetadata;
}
`,
);

write(
  "models/RecommendationConstraint.ts",
  `import type { RecommendationMetadata } from "./RecommendationMetadata";

export const RecommendationConstraintKinds = {
  BLOCKING: "blocking",
  MUTUAL_EXCLUSION: "mutual_exclusion",
  ORDERING: "ordering",
  CAPACITY: "capacity",
} as const;

export type RecommendationConstraintKind =
  (typeof RecommendationConstraintKinds)[keyof typeof RecommendationConstraintKinds];

export interface RecommendationConstraint {
  readonly id: string;
  readonly kind: RecommendationConstraintKind;
  readonly subjectKeys: readonly string[];
  readonly blocking: boolean;
  readonly description: string;
  readonly metadata: RecommendationMetadata;
}
`,
);

write(
  "models/RecommendationDependency.ts",
  `import type { RecommendationMetadata } from "./RecommendationMetadata";

export const RecommendationDependencyKinds = {
  REQUIRES: "requires",
  FOLLOWS: "follows",
  BLOCKS: "blocks",
  GROUPS_WITH: "groups_with",
} as const;

export type RecommendationDependencyKind =
  (typeof RecommendationDependencyKinds)[keyof typeof RecommendationDependencyKinds];

export interface RecommendationDependency {
  readonly id: string;
  readonly kind: RecommendationDependencyKind;
  readonly fromId: string;
  readonly toId: string;
  readonly required: boolean;
  readonly metadata: RecommendationMetadata;
}
`,
);

write(
  "models/RecommendationConflict.ts",
  `import type { RecommendationMetadata } from "./RecommendationMetadata";

export const RecommendationConflictKinds = {
  PRIORITY: "priority",
  MUTUAL_EXCLUSION: "mutual_exclusion",
  ORDERING: "ordering",
  DEPENDENCY: "dependency",
} as const;

export type RecommendationConflictKind =
  (typeof RecommendationConflictKinds)[keyof typeof RecommendationConflictKinds];

export interface RecommendationConflict {
  readonly id: string;
  readonly kind: RecommendationConflictKind;
  readonly leftId: string;
  readonly rightId: string;
  readonly description: string;
  readonly resolved: boolean;
  readonly metadata: RecommendationMetadata;
}
`,
);

write(
  "models/RecommendationResolution.ts",
  `import type { RecommendationMetadata } from "./RecommendationMetadata";

export const RecommendationResolutionStrategies = {
  KEEP_LEFT: "keep_left",
  KEEP_RIGHT: "keep_right",
  KEEP_HIGHER_PRIORITY: "keep_higher_priority",
  ORDER_BOTH: "order_both",
  DEFER_BOTH: "defer_both",
} as const;

export type RecommendationResolutionStrategy =
  (typeof RecommendationResolutionStrategies)[keyof typeof RecommendationResolutionStrategies];

export interface RecommendationResolution {
  readonly id: string;
  readonly conflictId: string;
  readonly strategy: RecommendationResolutionStrategy;
  readonly winnerId: string | null;
  readonly loserIds: readonly string[];
  readonly notes: readonly string[];
  readonly metadata: RecommendationMetadata;
}
`,
);

write(
  "models/RecommendationReference.ts",
  `import type { RecommendationCategory } from "./RecommendationCategory";
import type { RecommendationMetadata } from "./RecommendationMetadata";

/**
 * Opaque reference to an upstream decision — no NL, no execution.
 */
export interface RecommendationReference {
  readonly id: string;
  readonly decisionId: string;
  readonly category: RecommendationCategory;
  readonly priorityOrdinal: number;
  readonly intent: string;
  readonly metadata: RecommendationMetadata;
}
`,
);

write(
  "models/RecommendationTarget.ts",
  `import type { RecommendationMetadata } from "./RecommendationMetadata";

export const RecommendationTargetKinds = {
  ATHLETE: "athlete",
  SESSION: "session",
  DOMAIN: "domain",
  SUPERVISOR: "supervisor",
  EXPLAINABILITY: "explainability",
} as const;

export type RecommendationTargetKind =
  (typeof RecommendationTargetKinds)[keyof typeof RecommendationTargetKinds];

export interface RecommendationTarget {
  readonly id: string;
  readonly kind: RecommendationTargetKind;
  readonly referenceId: string;
  readonly label: string;
  readonly metadata: RecommendationMetadata;
}
`,
);

write(
  "models/RecommendationContext.ts",
  `import type { RecommendationMetadata } from "./RecommendationMetadata";
import type { RecommendationReference } from "./RecommendationReference";

/**
 * Immutable recommendation context — derived from Decision Engine handoff.
 */
export interface RecommendationContext {
  readonly id: string;
  readonly athleteId: string;
  readonly sessionId: string | null;
  readonly conversationId: string | null;
  readonly contextId: string;
  readonly decisionIds: readonly string[];
  readonly references: readonly RecommendationReference[];
  readonly focusAreas: readonly string[];
  readonly athletePresent: boolean;
  readonly metadata: RecommendationMetadata;
  readonly createdAt: string;
}
`,
);

write(
  "models/CoachingRecommendation.ts",
  `import type { RecommendationAction } from "./RecommendationAction";
import type { RecommendationCategory } from "./RecommendationCategory";
import type { RecommendationConfidence } from "./RecommendationConfidence";
import type { RecommendationConstraint } from "./RecommendationConstraint";
import type { RecommendationDependency } from "./RecommendationDependency";
import type { RecommendationIntent } from "./RecommendationIntent";
import type { RecommendationMetadata } from "./RecommendationMetadata";
import type { RecommendationPriority } from "./RecommendationPriority";
import type { RecommendationSequence } from "./RecommendationSequence";
import type { RecommendationTarget } from "./RecommendationTarget";
import type { RecommendationType } from "./RecommendationType";

/**
 * Immutable coaching recommendation — structured output only.
 * No AI. No NL. No domain calculations. No action execution.
 */
export interface CoachingRecommendation {
  readonly id: string;
  readonly athleteId: string;
  readonly sessionId: string | null;
  readonly conversationId: string | null;
  readonly contextId: string;
  readonly decisionId: string;
  readonly category: RecommendationCategory;
  readonly intent: RecommendationIntent;
  readonly type: RecommendationType;
  readonly title: string;
  readonly priority: RecommendationPriority;
  readonly confidence: RecommendationConfidence;
  readonly actions: readonly RecommendationAction[];
  readonly sequence: RecommendationSequence | null;
  readonly constraints: readonly RecommendationConstraint[];
  readonly dependencies: readonly RecommendationDependency[];
  readonly targets: readonly RecommendationTarget[];
  readonly sourceKeys: readonly string[];
  readonly metadata: RecommendationMetadata;
  readonly createdAt: string;
}
`,
);

write(
  "models/RecommendationGroup.ts",
  `import type { RecommendationCategory } from "./RecommendationCategory";
import type { RecommendationMetadata } from "./RecommendationMetadata";

export interface RecommendationGroup {
  readonly id: string;
  readonly category: RecommendationCategory;
  readonly recommendationIds: readonly string[];
  readonly label: string;
  readonly metadata: RecommendationMetadata;
}
`,
);

write(
  "models/RecommendationPlan.ts",
  `import type { RecommendationGroup } from "./RecommendationGroup";
import type { RecommendationMetadata } from "./RecommendationMetadata";
import type { RecommendationSequence } from "./RecommendationSequence";
import type { RecommendationStep } from "./RecommendationStep";

export interface RecommendationPlan {
  readonly id: string;
  readonly athleteId: string;
  readonly contextId: string;
  readonly orderedIds: readonly string[];
  readonly steps: readonly RecommendationStep[];
  readonly sequences: readonly RecommendationSequence[];
  readonly groups: readonly RecommendationGroup[];
  readonly metadata: RecommendationMetadata;
  readonly createdAt: string;
}
`,
);

write(
  "models/RecommendationCollection.ts",
  `import type { CoachingRecommendation } from "./CoachingRecommendation";
import type { RecommendationMetadata } from "./RecommendationMetadata";

export interface RecommendationCollection {
  readonly id: string;
  readonly athleteId: string;
  readonly contextId: string;
  readonly items: readonly CoachingRecommendation[];
  readonly metadata: RecommendationMetadata;
  readonly createdAt: string;
}
`,
);

write(
  "models/RecommendationView.ts",
  `import type { CoachingRecommendation } from "./CoachingRecommendation";
import type { RecommendationGroup } from "./RecommendationGroup";
import type { RecommendationMetadata } from "./RecommendationMetadata";

/**
 * Structured view for downstream consumers — not NL.
 */
export interface RecommendationView {
  readonly id: string;
  readonly athleteId: string;
  readonly contextId: string;
  readonly primary: CoachingRecommendation | null;
  readonly ordered: readonly CoachingRecommendation[];
  readonly groups: readonly RecommendationGroup[];
  readonly metadata: RecommendationMetadata;
  readonly createdAt: string;
}
`,
);

write(
  "models/RecommendationSummary.ts",
  `import type { RecommendationMetadata } from "./RecommendationMetadata";

export interface RecommendationSummary {
  readonly id: string;
  readonly athleteId: string;
  readonly contextId: string;
  readonly recommendationCount: number;
  readonly groupCount: number;
  readonly conflictCount: number;
  readonly resolutionCount: number;
  readonly topCategory: string | null;
  readonly focusAreas: readonly string[];
  readonly metadata: RecommendationMetadata;
  readonly createdAt: string;
}
`,
);

write(
  "models/RecommendationSnapshot.ts",
  `import type { CoachingRecommendation } from "./CoachingRecommendation";
import type { RecommendationMetadata } from "./RecommendationMetadata";
import type { RecommendationSummary } from "./RecommendationSummary";

export interface RecommendationSnapshot {
  readonly id: string;
  readonly athleteId: string;
  readonly contextId: string;
  readonly recommendations: readonly CoachingRecommendation[];
  readonly summary: RecommendationSummary | null;
  readonly metadata: RecommendationMetadata;
  readonly createdAt: string;
}
`,
);

write(
  "models/RecommendationStatistics.ts",
  `export interface RecommendationStatistics {
  readonly total: number;
  readonly byCategory: Readonly<Record<string, number>>;
  readonly byIntent: Readonly<Record<string, number>>;
  readonly byType: Readonly<Record<string, number>>;
  readonly conflictCount: number;
  readonly dependencyCount: number;
  readonly groupCount: number;
  readonly averageUrgency: number;
}
`,
);

write(
  "models/RecommendationDiagnostics.ts",
  `export interface RecommendationDiagnostics {
  readonly notes: readonly string[];
  readonly warnings: readonly string[];
  readonly blockedIds: readonly string[];
  readonly deferredIds: readonly string[];
  readonly processingSteps: readonly string[];
}
`,
);

write(
  "models/RecommendationTimeline.ts",
  `import type { RecommendationMetadata } from "./RecommendationMetadata";

export interface RecommendationTimelineItem {
  readonly id: string;
  readonly at: string;
  readonly kind: string;
  readonly subjectId: string;
  readonly note: string;
  readonly metadata: RecommendationMetadata;
}

export interface RecommendationTimeline {
  readonly id: string;
  readonly items: readonly RecommendationTimelineItem[];
  readonly createdAt: string;
}
`,
);

write(
  "models/RecommendationInput.ts",
  `import type { CoachingDecision } from "../../decision-engine/models/CoachingDecision";
import type { RecommendationEngineInput } from "../../decision-engine/models/RecommendationEngineInput";
import type { RecommendationContext } from "./RecommendationContext";
import type { RecommendationMetadata } from "./RecommendationMetadata";
import type { CoachingRecommendation } from "./CoachingRecommendation";

export const RecommendationInputKinds = {
  BUILD: "build",
  PRIORITIZE: "prioritize",
  PACKAGE: "package",
  VALIDATE: "validate",
  DESCRIBE: "describe",
} as const;

export type RecommendationInputKind =
  (typeof RecommendationInputKinds)[keyof typeof RecommendationInputKinds];

/**
 * Immutable input for Recommendation Engine operations.
 */
export interface RecommendationInput {
  readonly id: string;
  readonly kind: RecommendationInputKind;
  readonly athleteId: string;
  readonly sessionId: string | null;
  readonly conversationId: string | null;
  readonly contextId: string;
  readonly recommendationContext: RecommendationContext | null;
  readonly decisionHandoff: RecommendationEngineInput | null;
  readonly decisions: readonly CoachingDecision[];
  readonly recommendations: readonly CoachingRecommendation[];
  readonly reason: string;
  readonly metadata: RecommendationMetadata;
  readonly createdAt: string;
}
`,
);

write(
  "models/RecommendationOutput.ts",
  `import type { CoachingRecommendation } from "./CoachingRecommendation";
import type { RecommendationPackage } from "./RecommendationPackage";
import type { ExplainabilityInput } from "./ExplainabilityInput";

/**
 * Compact structured output handoff.
 */
export interface RecommendationOutput {
  readonly recommendations: readonly CoachingRecommendation[];
  readonly package: RecommendationPackage | null;
  readonly explainabilityInput: ExplainabilityInput | null;
}
`,
);

write(
  "models/ExplainabilityInput.ts",
  `import type { RecommendationMetadata } from "./RecommendationMetadata";
import type { RecommendationSummary } from "./RecommendationSummary";

/**
 * Immutable handoff for Explainability Engine — structure only.
 */
export interface ExplainabilityInput {
  readonly id: string;
  readonly athleteId: string;
  readonly contextId: string;
  readonly recommendationIds: readonly string[];
  readonly decisionIds: readonly string[];
  readonly summary: RecommendationSummary | null;
  readonly metadata: RecommendationMetadata;
  readonly createdAt: string;
}
`,
);

write(
  "models/RecommendationPackage.ts",
  `import type { CoachingRecommendation } from "./CoachingRecommendation";
import type { ExplainabilityInput } from "./ExplainabilityInput";
import type { RecommendationConflict } from "./RecommendationConflict";
import type { RecommendationConstraint } from "./RecommendationConstraint";
import type { RecommendationContext } from "./RecommendationContext";
import type { RecommendationDependency } from "./RecommendationDependency";
import type { RecommendationDiagnostics } from "./RecommendationDiagnostics";
import type { RecommendationGroup } from "./RecommendationGroup";
import type { RecommendationMetadata } from "./RecommendationMetadata";
import type { RecommendationPlan } from "./RecommendationPlan";
import type { RecommendationResolution } from "./RecommendationResolution";
import type { RecommendationSnapshot } from "./RecommendationSnapshot";
import type { RecommendationStatistics } from "./RecommendationStatistics";
import type { RecommendationSummary } from "./RecommendationSummary";
import type { RecommendationTimeline } from "./RecommendationTimeline";
import type { RecommendationView } from "./RecommendationView";

/**
 * Immutable recommendation package for downstream consumers.
 */
export interface RecommendationPackage {
  readonly id: string;
  readonly athleteId: string;
  readonly contextId: string;
  readonly recommendationContext: RecommendationContext;
  readonly recommendations: readonly CoachingRecommendation[];
  readonly conflicts: readonly RecommendationConflict[];
  readonly resolutions: readonly RecommendationResolution[];
  readonly constraints: readonly RecommendationConstraint[];
  readonly dependencies: readonly RecommendationDependency[];
  readonly groups: readonly RecommendationGroup[];
  readonly plan: RecommendationPlan | null;
  readonly view: RecommendationView | null;
  readonly summary: RecommendationSummary | null;
  readonly snapshot: RecommendationSnapshot | null;
  readonly statistics: RecommendationStatistics;
  readonly diagnostics: RecommendationDiagnostics;
  readonly timeline: RecommendationTimeline;
  readonly explainabilityInput: ExplainabilityInput | null;
  readonly metadata: RecommendationMetadata;
  readonly createdAt: string;
}
`,
);

write(
  "models/RecommendationDescriptor.ts",
  `export interface RecommendationDescriptor {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly capabilities: readonly string[];
  readonly boundaries: readonly string[];
  readonly createdAt: string;
}
`,
);

write(
  "models/RecommendationError.ts",
  `export const RecommendationErrorCodes = {
  MISSING_CONTEXT: "missing_context",
  MISSING_DECISIONS: "missing_decisions",
  VALIDATION_FAILED: "validation_failed",
  CONFLICT_UNRESOLVED: "conflict_unresolved",
  INVALID_INPUT: "invalid_input",
} as const;

export type RecommendationErrorCode =
  (typeof RecommendationErrorCodes)[keyof typeof RecommendationErrorCodes];

export interface RecommendationError {
  readonly code: RecommendationErrorCode;
  readonly message: string;
  readonly subjectId: string | null;
}

export function createRecommendationError(
  code: RecommendationErrorCode,
  message: string,
  subjectId: string | null = null,
): RecommendationError {
  return Object.freeze({ code, message, subjectId });
}
`,
);

write(
  "models/RecommendationValidation.ts",
  `import type { RecommendationError } from "./RecommendationError";

export interface RecommendationValidation {
  readonly valid: boolean;
  readonly errors: readonly RecommendationError[];
  readonly warnings: readonly string[];
}
`,
);

write(
  "models/RecommendationResult.ts",
  `import type { CoachingRecommendation } from "./CoachingRecommendation";
import type { ExplainabilityInput } from "./ExplainabilityInput";
import type { RecommendationDescriptor } from "./RecommendationDescriptor";
import type { RecommendationError } from "./RecommendationError";
import type { RecommendationPackage } from "./RecommendationPackage";
import type { RecommendationSnapshot } from "./RecommendationSnapshot";
import type { RecommendationSummary } from "./RecommendationSummary";
import type { RecommendationValidation } from "./RecommendationValidation";

export const RecommendationOperationKinds = {
  BUILD: "build",
  PRIORITIZE: "prioritize",
  PACKAGE: "package",
  VALIDATE: "validate",
  DESCRIBE: "describe",
} as const;

export type RecommendationOperationKind =
  (typeof RecommendationOperationKinds)[keyof typeof RecommendationOperationKinds];

/**
 * Immutable result of a Recommendation Engine operation.
 */
export interface RecommendationResult {
  readonly id: string;
  readonly operation: RecommendationOperationKind;
  readonly success: boolean;
  readonly recommendations: readonly CoachingRecommendation[];
  readonly package: RecommendationPackage | null;
  readonly summary: RecommendationSummary | null;
  readonly snapshot: RecommendationSnapshot | null;
  readonly explainabilityInput: ExplainabilityInput | null;
  readonly validation: RecommendationValidation | null;
  readonly descriptor: RecommendationDescriptor | null;
  readonly errors: readonly RecommendationError[];
  readonly createdAt: string;
}
`,
);

write(
  "models/RecommendationState.ts",
  `import type { CoachingRecommendation } from "./CoachingRecommendation";
import type { RecommendationPackage } from "./RecommendationPackage";

export const RecommendationSessionStatuses = {
  IDLE: "idle",
  BUILDING: "building",
  PRIORITIZING: "prioritizing",
  PACKAGING: "packaging",
  READY: "ready",
  INVALID: "invalid",
} as const;

export type RecommendationSessionStatus =
  (typeof RecommendationSessionStatuses)[keyof typeof RecommendationSessionStatuses];

export interface RecommendationState {
  readonly status: RecommendationSessionStatus;
  readonly package: RecommendationPackage | null;
  readonly recommendations: readonly CoachingRecommendation[];
  readonly updatedAt: string;
}
`,
);

write(
  "models/index.ts",
  `export * from "./RecommendationMetadata";
export * from "./RecommendationCategory";
export * from "./RecommendationIntent";
export * from "./RecommendationType";
export * from "./RecommendationPriority";
export * from "./RecommendationConfidence";
export * from "./RecommendationAction";
export * from "./RecommendationStep";
export * from "./RecommendationSequence";
export * from "./RecommendationConstraint";
export * from "./RecommendationDependency";
export * from "./RecommendationConflict";
export * from "./RecommendationResolution";
export * from "./RecommendationReference";
export * from "./RecommendationTarget";
export * from "./RecommendationContext";
export * from "./CoachingRecommendation";
export * from "./RecommendationGroup";
export * from "./RecommendationPlan";
export * from "./RecommendationCollection";
export * from "./RecommendationView";
export * from "./RecommendationSummary";
export * from "./RecommendationSnapshot";
export * from "./RecommendationStatistics";
export * from "./RecommendationDiagnostics";
export * from "./RecommendationTimeline";
export * from "./RecommendationInput";
export * from "./RecommendationOutput";
export * from "./ExplainabilityInput";
export * from "./RecommendationPackage";
export * from "./RecommendationDescriptor";
export * from "./RecommendationError";
export * from "./RecommendationValidation";
export * from "./RecommendationResult";
export * from "./RecommendationState";
`,
);

console.log("recommendation-engine part 1 (models) written");
