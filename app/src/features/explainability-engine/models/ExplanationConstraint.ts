import type { ExplanationMetadata } from "./ExplanationMetadata";

export interface ExplanationConstraint {
  readonly id: string;
  readonly key: string;
  readonly subjectId: string;
  readonly subjectKeys: readonly string[];
  readonly metadata: ExplanationMetadata;
}
