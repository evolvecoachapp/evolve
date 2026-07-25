/**
 * Sprint 22.5 — Explainability Engine generator.
 * Run: node scripts/generate-explainability-engine.mjs
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

// ─── MODELS ───────────────────────────────────────────────────────────────────

write(
  "models/ExplanationMetadata.ts",
  `export interface ExplanationMetadata {
  readonly tags: readonly string[];
  readonly attributes: Readonly<Record<string, string>>;
}

export const EMPTY_EXPLANATION_METADATA: ExplanationMetadata = Object.freeze({
  tags: Object.freeze([] as string[]),
  attributes: Object.freeze({} as Record<string, string>),
});
`,
);

write(
  "models/ExplanationConfidence.ts",
  `export const ExplanationConfidenceLevels = {
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
} as const;

export type ExplanationConfidenceLevel =
  (typeof ExplanationConfidenceLevels)[keyof typeof ExplanationConfidenceLevels];

export interface ExplanationConfidence {
  readonly level: ExplanationConfidenceLevel;
  readonly score: number;
  readonly evidenceCount: number;
  readonly notes: readonly string[];
}
`,
);

write(
  "models/ExplanationPriority.ts",
  `export interface ExplanationPriority {
  readonly ordinal: number;
  readonly urgency: number;
  readonly label: string;
}

export function priorityForOrdinal(ordinal: number): ExplanationPriority {
  return Object.freeze({
    ordinal,
    urgency: Math.max(0, 100 - ordinal * 10),
    label: ordinal === 0 ? "critical" : ordinal === 1 ? "high" : "normal",
  });
}
`,
);

write(
  "models/ExplanationReason.ts",
  `import type { ExplanationMetadata } from "./ExplanationMetadata";

export const ExplanationReasonCodes = {
  DECISION_OUTCOME: "decision_outcome",
  DECISION_INTENT: "decision_intent",
  RECOMMENDATION_INTENT: "recommendation_intent",
  RECOMMENDATION_CATEGORY: "recommendation_category",
  DEPENDENCY_REQUIRED: "dependency_required",
  CONSTRAINT_APPLIED: "constraint_applied",
  PRIORITY_ORDERING: "priority_ordering",
  CONFIDENCE_LEVEL: "confidence_level",
  CONSISTENCY_CHECK: "consistency_check",
  CONTEXT_REFERENCE: "context_reference",
} as const;

export type ExplanationReasonCode =
  (typeof ExplanationReasonCodes)[keyof typeof ExplanationReasonCodes];

export interface ExplanationReason {
  readonly id: string;
  readonly code: ExplanationReasonCode;
  readonly subjectId: string;
  readonly category: string;
  readonly statementKey: string;
  readonly evidenceKeys: readonly string[];
  readonly metadata: ExplanationMetadata;
}
`,
);

write(
  "models/ExplanationEvidence.ts",
  `import type { ExplanationMetadata } from "./ExplanationMetadata";

export const ExplanationEvidenceKinds = {
  DECISION: "decision",
  RECOMMENDATION: "recommendation",
  CONTEXT: "context",
  CONSTRAINT: "constraint",
  DEPENDENCY: "dependency",
  STATE: "state",
} as const;

export type ExplanationEvidenceKind =
  (typeof ExplanationEvidenceKinds)[keyof typeof ExplanationEvidenceKinds];

export interface ExplanationEvidence {
  readonly id: string;
  readonly kind: ExplanationEvidenceKind;
  readonly key: string;
  readonly subjectId: string;
  readonly sourceKey: string;
  readonly valueKeys: readonly string[];
  readonly metadata: ExplanationMetadata;
}
`,
);

write(
  "models/ExplanationSection.ts",
  `import type { ExplanationMetadata } from "./ExplanationMetadata";

export const ExplanationSectionKinds = {
  REASONS: "reasons",
  EVIDENCE: "evidence",
  DECISION_LINK: "decision_link",
  RECOMMENDATION_LINK: "recommendation_link",
  CONTEXT: "context",
  TRACE: "trace",
} as const;

export type ExplanationSectionKind =
  (typeof ExplanationSectionKinds)[keyof typeof ExplanationSectionKinds];

export interface ExplanationSection {
  readonly id: string;
  readonly kind: ExplanationSectionKind;
  readonly key: string;
  readonly subjectId: string;
  readonly itemKeys: readonly string[];
  readonly metadata: ExplanationMetadata;
}
`,
);

write(
  "models/ExplanationStep.ts",
  `import type { ExplanationMetadata } from "./ExplanationMetadata";

export interface ExplanationStep {
  readonly id: string;
  readonly operation: string;
  readonly subjectId: string;
  readonly inputKeys: readonly string[];
  readonly outputKeys: readonly string[];
  readonly metadata: ExplanationMetadata;
}
`,
);

write(
  "models/ExplanationTrace.ts",
  `import type { ExplanationMetadata } from "./ExplanationMetadata";
import type { ExplanationStep } from "./ExplanationStep";

export interface ExplanationTrace {
  readonly id: string;
  readonly steps: readonly ExplanationStep[];
  readonly subjectId: string;
  readonly metadata: ExplanationMetadata;
  readonly createdAt: string;
}
`,
);

write(
  "models/ExplanationDependency.ts",
  `import type { ExplanationMetadata } from "./ExplanationMetadata";

export interface ExplanationDependency {
  readonly id: string;
  readonly fromId: string;
  readonly toId: string;
  readonly kind: string;
  readonly metadata: ExplanationMetadata;
}
`,
);

write(
  "models/ExplanationConstraint.ts",
  `import type { ExplanationMetadata } from "./ExplanationMetadata";

export interface ExplanationConstraint {
  readonly id: string;
  readonly key: string;
  readonly subjectId: string;
  readonly subjectKeys: readonly string[];
  readonly metadata: ExplanationMetadata;
}
`,
);

write(
  "models/ExplanationConflict.ts",
  `import type { ExplanationMetadata } from "./ExplanationMetadata";

export interface ExplanationConflict {
  readonly id: string;
  readonly subjectIds: readonly string[];
  readonly kind: string;
  readonly metadata: ExplanationMetadata;
}
`,
);

write(
  "models/ExplanationResolution.ts",
  `import type { ExplanationMetadata } from "./ExplanationMetadata";

export interface ExplanationResolution {
  readonly id: string;
  readonly conflictId: string;
  readonly winnerId: string;
  readonly loserIds: readonly string[];
  readonly notes: readonly string[];
  readonly metadata: ExplanationMetadata;
}
`,
);

write(
  "models/ExplanationDecisionLink.ts",
  `import type { ExplanationMetadata } from "./ExplanationMetadata";

export interface ExplanationDecisionLink {
  readonly id: string;
  readonly decisionId: string;
  readonly explanationId: string;
  readonly category: string;
  readonly intent: string;
  readonly outcome: string;
  readonly metadata: ExplanationMetadata;
}
`,
);

write(
  "models/ExplanationRecommendationLink.ts",
  `import type { ExplanationMetadata } from "./ExplanationMetadata";

export interface ExplanationRecommendationLink {
  readonly id: string;
  readonly recommendationId: string;
  readonly explanationId: string;
  readonly category: string;
  readonly intent: string;
  readonly type: string;
  readonly metadata: ExplanationMetadata;
}
`,
);

write(
  "models/ExplanationContextReference.ts",
  `import type { ExplanationMetadata } from "./ExplanationMetadata";

export interface ExplanationContextReference {
  readonly id: string;
  readonly contextId: string;
  readonly athleteId: string;
  readonly focusAreaKeys: readonly string[];
  readonly metadata: ExplanationMetadata;
}
`,
);

write(
  "models/ExplanationReference.ts",
  `import type { ExplanationMetadata } from "./ExplanationMetadata";

export interface ExplanationReference {
  readonly id: string;
  readonly explanationId: string;
  readonly key: string;
  readonly metadata: ExplanationMetadata;
}
`,
);

write(
  "models/ExplanationNode.ts",
  `import type { ExplanationMetadata } from "./ExplanationMetadata";

export const ExplanationNodeKinds = {
  DECISION: "decision",
  RECOMMENDATION: "recommendation",
  REASON: "reason",
  EVIDENCE: "evidence",
  SECTION: "section",
} as const;

export type ExplanationNodeKind =
  (typeof ExplanationNodeKinds)[keyof typeof ExplanationNodeKinds];

export interface ExplanationNode {
  readonly id: string;
  readonly kind: ExplanationNodeKind;
  readonly subjectId: string;
  readonly labelKey: string;
  readonly metadata: ExplanationMetadata;
}
`,
);

write(
  "models/ExplanationEdge.ts",
  `import type { ExplanationMetadata } from "./ExplanationMetadata";

export const ExplanationEdgeKinds = {
  DERIVES_FROM: "derives_from",
  SUPPORTS: "supports",
  REFERENCES: "references",
  DEPENDS_ON: "depends_on",
} as const;

export type ExplanationEdgeKind =
  (typeof ExplanationEdgeKinds)[keyof typeof ExplanationEdgeKinds];

export interface ExplanationEdge {
  readonly id: string;
  readonly kind: ExplanationEdgeKind;
  readonly fromNodeId: string;
  readonly toNodeId: string;
  readonly metadata: ExplanationMetadata;
}
`,
);

write(
  "models/ExplanationGraph.ts",
  `import type { ExplanationEdge } from "./ExplanationEdge";
import type { ExplanationMetadata } from "./ExplanationMetadata";
import type { ExplanationNode } from "./ExplanationNode";

export interface ExplanationGraph {
  readonly id: string;
  readonly nodes: readonly ExplanationNode[];
  readonly edges: readonly ExplanationEdge[];
  readonly metadata: ExplanationMetadata;
  readonly createdAt: string;
}
`,
);

write(
  "models/ExplanationSummary.ts",
  `import type { ExplanationMetadata } from "./ExplanationMetadata";

export interface ExplanationSummary {
  readonly id: string;
  readonly athleteId: string;
  readonly contextId: string;
  readonly explanationCount: number;
  readonly reasonCodeKeys: readonly string[];
  readonly evidenceKeyCount: number;
  readonly focusAreaKeys: readonly string[];
  readonly metadata: ExplanationMetadata;
  readonly createdAt: string;
}
`,
);

write(
  "models/ExplanationSnapshot.ts",
  `import type { CoachingExplanation } from "./CoachingExplanation";
import type { ExplanationMetadata } from "./ExplanationMetadata";
import type { ExplanationSummary } from "./ExplanationSummary";

export interface ExplanationSnapshot {
  readonly id: string;
  readonly athleteId: string;
  readonly contextId: string;
  readonly explanations: readonly CoachingExplanation[];
  readonly summary: ExplanationSummary | null;
  readonly metadata: ExplanationMetadata;
  readonly createdAt: string;
}
`,
);

write(
  "models/ExplanationStatistics.ts",
  `export interface ExplanationStatistics {
  readonly totalExplanations: number;
  readonly byCategory: Readonly<Record<string, number>>;
  readonly byReasonCode: Readonly<Record<string, number>>;
  readonly evidenceCount: number;
}
`,
);

write(
  "models/ExplanationDiagnostics.ts",
  `export interface ExplanationDiagnostics {
  readonly notes: readonly string[];
  readonly warnings: readonly string[];
  readonly processingSteps: readonly string[];
}
`,
);

write(
  "models/ExplanationTimeline.ts",
  `import type { ExplanationMetadata } from "./ExplanationMetadata";

export interface ExplanationTimelineItem {
  readonly id: string;
  readonly subjectId: string;
  readonly operation: string;
  readonly at: string;
  readonly metadata: ExplanationMetadata;
}

export interface ExplanationTimeline {
  readonly id: string;
  readonly items: readonly ExplanationTimelineItem[];
  readonly createdAt: string;
}
`,
);

write(
  "models/CoachingExplanation.ts",
  `import type { ExplanationConfidence } from "./ExplanationConfidence";
import type { ExplanationContextReference } from "./ExplanationContextReference";
import type { ExplanationDecisionLink } from "./ExplanationDecisionLink";
import type { ExplanationEvidence } from "./ExplanationEvidence";
import type { ExplanationMetadata } from "./ExplanationMetadata";
import type { ExplanationPriority } from "./ExplanationPriority";
import type { ExplanationReason } from "./ExplanationReason";
import type { ExplanationRecommendationLink } from "./ExplanationRecommendationLink";
import type { ExplanationSection } from "./ExplanationSection";

/**
 * Immutable coaching explanation — structured WHY only.
 * No AI. No NL. No domain calculations. Never changes decisions.
 */
export interface CoachingExplanation {
  readonly id: string;
  readonly athleteId: string;
  readonly sessionId: string | null;
  readonly conversationId: string | null;
  readonly contextId: string;
  readonly recommendationId: string;
  readonly decisionId: string;
  readonly reasons: readonly ExplanationReason[];
  readonly evidence: readonly ExplanationEvidence[];
  readonly sections: readonly ExplanationSection[];
  readonly confidence: ExplanationConfidence;
  readonly priority: ExplanationPriority;
  readonly decisionLink: ExplanationDecisionLink;
  readonly recommendationLink: ExplanationRecommendationLink;
  readonly contextReference: ExplanationContextReference;
  readonly sourceKeys: readonly string[];
  readonly metadata: ExplanationMetadata;
  readonly createdAt: string;
}
`,
);

write(
  "models/LLMFormatterInput.ts",
  `import type { ExplanationMetadata } from "./ExplanationMetadata";
import type { ExplanationSummary } from "./ExplanationSummary";

/**
 * Structure-only handoff for LLM Response Formatter — no NL prose.
 */
export interface LLMFormatterInput {
  readonly id: string;
  readonly athleteId: string;
  readonly contextId: string;
  readonly explanationIds: readonly string[];
  readonly sectionKeys: readonly string[];
  readonly reasonCodes: readonly string[];
  readonly evidenceKeys: readonly string[];
  readonly summary: ExplanationSummary | null;
  readonly metadata: ExplanationMetadata;
  readonly createdAt: string;
}
`,
);

write(
  "models/ExplanationPackage.ts",
  `import type { CoachingExplanation } from "./CoachingExplanation";
import type { ExplanationConflict } from "./ExplanationConflict";
import type { ExplanationConstraint } from "./ExplanationConstraint";
import type { ExplanationDependency } from "./ExplanationDependency";
import type { ExplanationDiagnostics } from "./ExplanationDiagnostics";
import type { ExplanationGraph } from "./ExplanationGraph";
import type { ExplanationMetadata } from "./ExplanationMetadata";
import type { ExplanationResolution } from "./ExplanationResolution";
import type { ExplanationSnapshot } from "./ExplanationSnapshot";
import type { ExplanationStatistics } from "./ExplanationStatistics";
import type { ExplanationSummary } from "./ExplanationSummary";
import type { ExplanationTimeline } from "./ExplanationTimeline";
import type { ExplanationTrace } from "./ExplanationTrace";
import type { LLMFormatterInput } from "./LLMFormatterInput";

export interface ExplanationPackage {
  readonly id: string;
  readonly athleteId: string;
  readonly contextId: string;
  readonly explanations: readonly CoachingExplanation[];
  readonly summary: ExplanationSummary | null;
  readonly snapshot: ExplanationSnapshot | null;
  readonly graph: ExplanationGraph | null;
  readonly trace: ExplanationTrace | null;
  readonly timeline: ExplanationTimeline | null;
  readonly statistics: ExplanationStatistics;
  readonly diagnostics: ExplanationDiagnostics;
  readonly llmFormatterInput: LLMFormatterInput | null;
  readonly dependencies: readonly ExplanationDependency[];
  readonly constraints: readonly ExplanationConstraint[];
  readonly conflicts: readonly ExplanationConflict[];
  readonly resolutions: readonly ExplanationResolution[];
  readonly metadata: ExplanationMetadata;
  readonly createdAt: string;
}
`,
);

write(
  "models/ExplanationInput.ts",
  `import type { CoachingDecision } from "../../decision-engine/models/CoachingDecision";
import type { ExplainabilityInput } from "../../recommendation-engine/models/ExplainabilityInput";
import type { CoachingRecommendation } from "../../recommendation-engine/models/CoachingRecommendation";
import type { RecommendationPackage } from "../../recommendation-engine/models/RecommendationPackage";
import type { ExplanationMetadata } from "./ExplanationMetadata";

export const ExplanationInputKinds = {
  BUILD: "build",
  VALIDATE: "validate",
  SNAPSHOT: "snapshot",
  PACKAGE: "package",
  DESCRIBE: "describe",
} as const;

export type ExplanationInputKind =
  (typeof ExplanationInputKinds)[keyof typeof ExplanationInputKinds];

export interface ExplanationInput {
  readonly id: string;
  readonly kind: ExplanationInputKind;
  readonly athleteId: string;
  readonly sessionId: string | null;
  readonly conversationId: string | null;
  readonly contextId: string;
  readonly decisions: readonly CoachingDecision[];
  readonly recommendations: readonly CoachingRecommendation[];
  readonly recommendationPackage: RecommendationPackage | null;
  readonly explainabilityHandoff: ExplainabilityInput | null;
  readonly reason: string;
  readonly metadata: ExplanationMetadata;
  readonly createdAt: string;
}
`,
);

write(
  "models/ExplanationError.ts",
  `export const ExplanationErrorCodes = {
  MISSING_INPUT: "missing_input",
  MISSING_DECISIONS: "missing_decisions",
  MISSING_RECOMMENDATIONS: "missing_recommendations",
  INVALID_INPUT: "invalid_input",
  VALIDATION_FAILED: "validation_failed",
  POLICY_BLOCKED: "policy_blocked",
} as const;

export type ExplanationErrorCode =
  (typeof ExplanationErrorCodes)[keyof typeof ExplanationErrorCodes];

export interface ExplanationError {
  readonly code: ExplanationErrorCode;
  readonly message: string;
  readonly subjectId: string | null;
}

export function createExplanationError(
  code: ExplanationErrorCode,
  message: string,
  subjectId: string | null = null,
): ExplanationError {
  return Object.freeze({ code, message, subjectId });
}
`,
);

write(
  "models/ExplanationValidation.ts",
  `import type { ExplanationError } from "./ExplanationError";

export interface ExplanationValidation {
  readonly valid: boolean;
  readonly issues: readonly ExplanationError[];
}
`,
);

write(
  "models/ExplanationDescriptor.ts",
  `export interface ExplanationDescriptor {
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
  "models/ExplanationResult.ts",
  `import type { CoachingExplanation } from "./CoachingExplanation";
import type { ExplanationDescriptor } from "./ExplanationDescriptor";
import type { ExplanationError } from "./ExplanationError";
import type { ExplanationPackage } from "./ExplanationPackage";
import type { ExplanationSnapshot } from "./ExplanationSnapshot";
import type { ExplanationSummary } from "./ExplanationSummary";
import type { ExplanationValidation } from "./ExplanationValidation";
import type { LLMFormatterInput } from "./LLMFormatterInput";

export const ExplanationOperationKinds = {
  BUILD: "build",
  VALIDATE: "validate",
  SNAPSHOT: "snapshot",
  PACKAGE: "package",
  DESCRIBE: "describe",
} as const;

export type ExplanationOperationKind =
  (typeof ExplanationOperationKinds)[keyof typeof ExplanationOperationKinds];

export interface ExplanationResult {
  readonly id: string;
  readonly operation: ExplanationOperationKind;
  readonly success: boolean;
  readonly explanations: readonly CoachingExplanation[];
  readonly package: ExplanationPackage | null;
  readonly summary: ExplanationSummary | null;
  readonly snapshot: ExplanationSnapshot | null;
  readonly llmFormatterInput: LLMFormatterInput | null;
  readonly validation: ExplanationValidation | null;
  readonly descriptor: ExplanationDescriptor | null;
  readonly errors: readonly ExplanationError[];
  readonly createdAt: string;
}
`,
);

write(
  "models/ExplanationState.ts",
  `import type { ExplanationPackage } from "./ExplanationPackage";
import type { CoachingExplanation } from "./CoachingExplanation";

export const ExplanationSessionStatuses = {
  IDLE: "idle",
  READY: "ready",
  ERROR: "error",
} as const;

export type ExplanationSessionStatus =
  (typeof ExplanationSessionStatuses)[keyof typeof ExplanationSessionStatuses];

export interface ExplanationState {
  readonly status: ExplanationSessionStatus;
  readonly package: ExplanationPackage | null;
  readonly explanations: readonly CoachingExplanation[];
  readonly updatedAt: string;
}
`,
);

write(
  "models/index.ts",
  `export * from "./CoachingExplanation";
export * from "./ExplanationConfidence";
export * from "./ExplanationConflict";
export * from "./ExplanationConstraint";
export * from "./ExplanationContextReference";
export * from "./ExplanationDecisionLink";
export * from "./ExplanationDependency";
export * from "./ExplanationDescriptor";
export * from "./ExplanationDiagnostics";
export * from "./ExplanationEdge";
export * from "./ExplanationError";
export * from "./ExplanationEvidence";
export * from "./ExplanationGraph";
export * from "./ExplanationInput";
export * from "./ExplanationMetadata";
export * from "./ExplanationNode";
export * from "./ExplanationPackage";
export * from "./ExplanationPriority";
export * from "./ExplanationReason";
export * from "./ExplanationRecommendationLink";
export * from "./ExplanationReference";
export * from "./ExplanationResolution";
export * from "./ExplanationResult";
export * from "./ExplanationSection";
export * from "./ExplanationSnapshot";
export * from "./ExplanationState";
export * from "./ExplanationStatistics";
export * from "./ExplanationStep";
export * from "./ExplanationSummary";
export * from "./ExplanationTimeline";
export * from "./ExplanationTrace";
export * from "./ExplanationValidation";
export * from "./LLMFormatterInput";
`,
);

console.log(`Generated ${fileCount} model files...`);
