import type { ExplanationMetadata } from "./ExplanationMetadata";

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
