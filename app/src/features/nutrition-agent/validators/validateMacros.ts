import type { MacroTargets } from "../models/MacroTargets";
import type { NutritionValidation } from "../models/NutritionValidation";
import { NutritionValidationCodes } from "../models/NutritionValidation";
import { freezeValidation } from "../utils/FreezeNutritionState";
import { macroCalories } from "../utils/MacroHelpers";

export function validateMacros(macros: MacroTargets): NutritionValidation {
  const issues = [];
  if (macros.proteinG < 0 || macros.carbsG < 0 || macros.fatG < 0) {
    issues.push(
      Object.freeze({
        code: NutritionValidationCodes.INVALID_MACROS,
        message: "Negative macro values",
        path: "macroTargets",
      }),
    );
  }
  const summed = macroCalories(macros);
  if (Math.abs(summed - macros.calories) > 150) {
    issues.push(
      Object.freeze({
        code: NutritionValidationCodes.INVALID_MACROS,
        message: "Macro calories do not align with calorie target",
        path: "macroTargets.calories",
      }),
    );
  }
  return freezeValidation({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}
