import type { RecommendationCategory } from "./RecommendationCategory";
import type { RecommendationMetadata } from "./RecommendationMetadata";

export interface RecommendationGroup {
  readonly id: string;
  readonly category: RecommendationCategory;
  readonly recommendationIds: readonly string[];
  readonly label: string;
  readonly metadata: RecommendationMetadata;
}
