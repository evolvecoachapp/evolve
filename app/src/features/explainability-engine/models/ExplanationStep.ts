import type { ExplanationMetadata } from "./ExplanationMetadata";

export interface ExplanationStep {
  readonly id: string;
  readonly operation: string;
  readonly subjectId: string;
  readonly inputKeys: readonly string[];
  readonly outputKeys: readonly string[];
  readonly metadata: ExplanationMetadata;
}
