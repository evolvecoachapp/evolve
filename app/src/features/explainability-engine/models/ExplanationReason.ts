import type { ExplanationMetadata } from "./ExplanationMetadata";

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
