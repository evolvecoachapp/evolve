import type { ExplanationMetadata } from "./ExplanationMetadata";

export interface ExplanationReference {
  readonly id: string;
  readonly explanationId: string;
  readonly key: string;
  readonly metadata: ExplanationMetadata;
}
