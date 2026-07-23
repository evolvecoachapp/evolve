import type { NutritionValidation } from "../models/NutritionValidation";
import { NutritionValidationCodes } from "../models/NutritionValidation";
import { freezeValidation } from "../utils/FreezeNutritionState";

export function validateCalories(targetCalories: number): NutritionValidation {
  const issues = [];
  if (targetCalories < 800 || targetCalories > 6000) {
    issues.push(
      Object.freeze({
        code: NutritionValidationCodes.INVALID_CALORIES,
        message: `Calories out of range: ${targetCalories}`,
        path: "calorieTargets.targetCalories",
      }),
    );
  }
  return freezeValidation({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}
