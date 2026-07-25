import type { ExplanationMetadata } from "./ExplanationMetadata";

export interface ExplanationDecisionLink {
  readonly id: string;
  readonly decisionId: string;
  readonly explanationId: string;
  readonly category: string;
  readonly intent: string;
  readonly outcome: string;
  readonly metadata: ExplanationMetadata;
}
