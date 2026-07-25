import type { CoachingRecommendation } from "./CoachingRecommendation";
import type { RecommendationPackage } from "./RecommendationPackage";
import type { ExplainabilityInput } from "./ExplainabilityInput";

/**
 * Compact structured output handoff.
 */
export interface RecommendationOutput {
  readonly recommendations: readonly CoachingRecommendation[];
  readonly package: RecommendationPackage | null;
  readonly explainabilityInput: ExplainabilityInput | null;
}
