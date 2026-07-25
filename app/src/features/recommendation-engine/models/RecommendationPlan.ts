import type { RecommendationGroup } from "./RecommendationGroup";
import type { RecommendationMetadata } from "./RecommendationMetadata";
import type { RecommendationSequence } from "./RecommendationSequence";
import type { RecommendationStep } from "./RecommendationStep";

export interface RecommendationPlan {
  readonly id: string;
  readonly athleteId: string;
  readonly contextId: string;
  readonly orderedIds: readonly string[];
  readonly steps: readonly RecommendationStep[];
  readonly sequences: readonly RecommendationSequence[];
  readonly groups: readonly RecommendationGroup[];
  readonly metadata: RecommendationMetadata;
  readonly createdAt: string;
}
