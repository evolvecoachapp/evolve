import type { RecommendationAction } from "./RecommendationAction";
import type { RecommendationMetadata } from "./RecommendationMetadata";

export interface RecommendationStep {
  readonly id: string;
  readonly order: number;
  readonly action: RecommendationAction;
  readonly label: string;
  readonly optional: boolean;
  readonly metadata: RecommendationMetadata;
}
