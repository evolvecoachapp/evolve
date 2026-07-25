import type { ExplanationMetadata } from "./ExplanationMetadata";

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
