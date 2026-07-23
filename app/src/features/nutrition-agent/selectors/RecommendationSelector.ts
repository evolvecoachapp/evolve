import type { NutritionRecommendation } from "../models/NutritionRecommendation";

export class RecommendationSelector {
  selectTop(
    recommendations: readonly NutritionRecommendation[],
    limit = 5,
  ): readonly NutritionRecommendation[] {
    return Object.freeze(
      [...recommendations]
        .sort((a, b) => b.priority - a.priority)
        .slice(0, limit),
    );
  }
}
