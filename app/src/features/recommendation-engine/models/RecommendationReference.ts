import type { RecommendationCategory } from "./RecommendationCategory";
import type { RecommendationMetadata } from "./RecommendationMetadata";

/**
 * Opaque reference to an upstream decision — no NL, no execution.
 */
export interface RecommendationReference {
  readonly id: string;
  readonly decisionId: string;
  readonly category: RecommendationCategory;
  readonly priorityOrdinal: number;
  readonly intent: string;
  readonly metadata: RecommendationMetadata;
}
