import { createNutritionError, NutritionErrorCodes } from "../models/NutritionError";
import type { NutritionError } from "../models/NutritionError";
import type { NutritionAdaptation } from "../models/NutritionAdaptation";

export function validateMealConsistency(
  adaptation: NutritionAdaptation | null,
): readonly NutritionError[] {
  const errors: NutritionError[] = [];
  if (!adaptation) return Object.freeze(errors);
  for (const adj of adaptation.mealAdjustments) {
    if (!adj.mealKey) {
      errors.push(
        createNutritionError(
          NutritionErrorCodes.INCONSISTENT_MEAL,
          "Meal adjustment missing mealKey",
          adj.id,
        ),
      );
    }
  }
  return Object.freeze(errors);
}
