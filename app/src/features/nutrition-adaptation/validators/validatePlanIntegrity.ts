import { createNutritionError, NutritionErrorCodes } from "../models/NutritionError";
import type { NutritionError } from "../models/NutritionError";
import type { UpdatedNutritionPlan } from "../models/UpdatedNutritionPlan";

export function validatePlanIntegrity(
  plan: UpdatedNutritionPlan | null,
): readonly NutritionError[] {
  const errors: NutritionError[] = [];
  if (!plan) {
    errors.push(
      createNutritionError(NutritionErrorCodes.MISSING_PLAN, "Updated plan required"),
    );
    return Object.freeze(errors);
  }
  if (!plan.planId) {
    errors.push(
      createNutritionError(
        NutritionErrorCodes.MISSING_PLAN,
        "Plan id required",
        plan.id,
      ),
    );
  }
  if (
    plan.mealKeys.length === 0 &&
    plan.macroKeys.length === 0 &&
    plan.dayKeys.length === 0
  ) {
    errors.push(
      createNutritionError(
        NutritionErrorCodes.EMPTY_PLAN,
        "Updated plan has no structure keys",
        plan.id,
      ),
    );
  }
  return Object.freeze(errors);
}
