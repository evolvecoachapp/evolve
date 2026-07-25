import type { CoachingRecommendation } from "./CoachingRecommendation";
import type { RecommendationGroup } from "./RecommendationGroup";
import type { RecommendationMetadata } from "./RecommendationMetadata";

/**
 * Structured view for downstream consumers — not NL.
 */
export interface RecommendationView {
  readonly id: string;
  readonly athleteId: string;
  readonly contextId: string;
  readonly primary: CoachingRecommendation | null;
  readonly ordered: readonly CoachingRecommendation[];
  readonly groups: readonly RecommendationGroup[];
  readonly metadata: RecommendationMetadata;
  readonly createdAt: string;
}
