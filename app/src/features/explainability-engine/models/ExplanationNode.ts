import type { ExplanationMetadata } from "./ExplanationMetadata";

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
