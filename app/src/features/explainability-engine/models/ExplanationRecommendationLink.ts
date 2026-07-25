import type { ExplanationMetadata } from "./ExplanationMetadata";

export interface ExplanationRecommendationLink {
  readonly id: string;
  readonly recommendationId: string;
  readonly explanationId: string;
  readonly category: string;
  readonly intent: string;
  readonly type: string;
  readonly metadata: ExplanationMetadata;
}
