import type { NutritionPlan } from "../models/NutritionPlan";
import type { NutritionValidation } from "../models/NutritionValidation";
import { freezeValidation } from "../utils/FreezeNutritionState";
import { validateCalories } from "./validateCalories";
import { validateMacros } from "./validateMacros";
import { validateMealDistribution } from "./validateMealDistribution";
import {
  validateCarbohydrates,
  validateFat,
  validateFiber,
  validateProtein,
} from "./validateMacroNutrients";
import {
  validateHydration,
  validateSupplements,
} from "./validateHydrationAndSupplements";
import {
  validateDietConsistency,
  validateSafety,
} from "./validateDietAndSafety";

export function validateNutritionPlan(
  plan: NutritionPlan,
): NutritionValidation {
  const parts = [
    validateCalories(plan.calorieTargets.targetCalories),
    validateMacros(plan.macroTargets),
    validateMealDistribution(plan.mealDistribution),
    validateProtein(plan.macroTargets.proteinG),
    validateFat(plan.macroTargets.fatG),
    validateCarbohydrates(plan.macroTargets.carbsG),
    validateFiber(plan.macroTargets.fiberG),
    validateHydration(plan.hydrationPlan),
    validateSupplements(plan.supplementPlan),
    validateDietConsistency(plan),
    validateSafety(plan),
  ];
  const issues = parts.flatMap((p) => p.issues);
  return freezeValidation({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}
