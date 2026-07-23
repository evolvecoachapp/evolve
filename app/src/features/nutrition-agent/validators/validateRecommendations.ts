import type { NutritionRecommendation } from "../models/NutritionRecommendation";
import type { NutritionValidation } from "../models/NutritionValidation";
import { NutritionValidationCodes } from "../models/NutritionValidation";
import { freezeValidation } from "../utils/FreezeNutritionState";

export function validateRecommendations(
  recommendations: readonly NutritionRecommendation[],
): NutritionValidation {
  const issues = [];
  for (const rec of recommendations) {
    if (!rec.title.trim()) {
      issues.push(
        Object.freeze({
          code: NutritionValidationCodes.RECOMMENDATION_INVALID,
          message: "Empty recommendation title",
          path: `recommendations.${rec.id}`,
        }),
      );
    }
  }
  return freezeValidation({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}
