import type { CoachRecommendation } from "../models/CoachRecommendation";
import { freezeRecommendation } from "../utils/freezeObjects";

/**
 * Normalize recommendation text and priority ordering.
 */
export class RecommendationNormalizer {
  normalize(
    recommendations: readonly CoachRecommendation[],
  ): readonly CoachRecommendation[] {
    return Object.freeze(
      recommendations.map((item, index) =>
        freezeRecommendation({
          ...item,
          text: item.text.trim(),
          priority: index + 1,
        }),
      ),
    );
  }
}

export const recommendationNormalizer = new RecommendationNormalizer();
