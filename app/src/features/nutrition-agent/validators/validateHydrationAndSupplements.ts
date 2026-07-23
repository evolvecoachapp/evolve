import type { HydrationPlan } from "../models/HydrationPlan";
import type { SupplementPlan } from "../models/SupplementPlan";
import type { NutritionValidation } from "../models/NutritionValidation";
import { NutritionValidationCodes } from "../models/NutritionValidation";
import { freezeValidation } from "../utils/FreezeNutritionState";

export function validateHydration(plan: HydrationPlan): NutritionValidation {
  const issues = [];
  if (plan.litersPerDay < 1 || plan.litersPerDay > 10) {
    issues.push(
      Object.freeze({
        code: NutritionValidationCodes.INVALID_HYDRATION,
        message: `Hydration out of range: ${plan.litersPerDay}L`,
        path: "hydrationPlan.litersPerDay",
      }),
    );
  }
  return freezeValidation({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}

export function validateSupplements(plan: SupplementPlan): NutritionValidation {
  const issues = [];
  if (plan.items.length > 10) {
    issues.push(
      Object.freeze({
        code: NutritionValidationCodes.INVALID_SUPPLEMENTS,
        message: "Too many supplement items",
        path: "supplementPlan.items",
      }),
    );
  }
  return freezeValidation({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}
