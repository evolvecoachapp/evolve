import type { ExplanationMetadata } from "./ExplanationMetadata";
import type { ExplanationStep } from "./ExplanationStep";

export interface ExplanationTrace {
  readonly id: string;
  readonly steps: readonly ExplanationStep[];
  readonly subjectId: string;
  readonly metadata: ExplanationMetadata;
  readonly createdAt: string;
}
