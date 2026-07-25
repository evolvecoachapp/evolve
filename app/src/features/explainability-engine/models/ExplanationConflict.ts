import type { ExplanationMetadata } from "./ExplanationMetadata";

export interface ExplanationConflict {
  readonly id: string;
  readonly subjectIds: readonly string[];
  readonly kind: string;
  readonly metadata: ExplanationMetadata;
}
