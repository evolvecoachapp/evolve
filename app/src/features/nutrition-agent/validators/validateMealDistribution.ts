import type { MealDistribution } from "../models/MealDistribution";
import type { NutritionValidation } from "../models/NutritionValidation";
import { NutritionValidationCodes } from "../models/NutritionValidation";
import { freezeValidation } from "../utils/FreezeNutritionState";

export function validateMealDistribution(
  meals: MealDistribution,
): NutritionValidation {
  const issues = [];
  if (meals.mealsPerDay < 2 || meals.mealsPerDay > 6) {
    issues.push(
      Object.freeze({
        code: NutritionValidationCodes.INVALID_MEAL_DISTRIBUTION,
        message: `Invalid mealsPerDay: ${meals.mealsPerDay}`,
        path: "mealDistribution.mealsPerDay",
      }),
    );
  }
  if (meals.distribution.length !== meals.mealsPerDay) {
    issues.push(
      Object.freeze({
        code: NutritionValidationCodes.INVALID_MEAL_DISTRIBUTION,
        message: "Distribution length mismatch",
        path: "mealDistribution.distribution",
      }),
    );
  }
  return freezeValidation({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}
