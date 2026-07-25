import type { RecommendationMetadata } from "./RecommendationMetadata";
import type { RecommendationStep } from "./RecommendationStep";

export interface RecommendationSequence {
  readonly id: string;
  readonly steps: readonly RecommendationStep[];
  readonly ordered: boolean;
  readonly metadata: RecommendationMetadata;
}
