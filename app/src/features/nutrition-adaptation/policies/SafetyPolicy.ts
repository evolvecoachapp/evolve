import type { NutritionPackage } from "../models/NutritionPackage";
import { createNutritionError, NutritionErrorCodes } from "../models/NutritionError";
import type { NutritionError } from "../models/NutritionError";

/** Safety: adaptations must originate from existing plan structure keys. */
export function applySafetyPolicy(pkg: NutritionPackage): readonly NutritionError[] {
  const errors: NutritionError[] = [];
  if (!pkg.updatedPlan) {
    errors.push(
      createNutritionError(NutritionErrorCodes.POLICY_BLOCKED, "Updated plan required", pkg.id),
    );
  } else if (!pkg.updatedPlan.planId) {
    errors.push(
      createNutritionError(
        NutritionErrorCodes.POLICY_BLOCKED,
        "Cannot adapt without existing plan id",
        pkg.updatedPlan.id,
      ),
    );
  }
  return Object.freeze(errors);
}
