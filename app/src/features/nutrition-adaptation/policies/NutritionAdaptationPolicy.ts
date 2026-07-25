import type { NutritionAdaptation } from "../models/NutritionAdaptation";
import { createNutritionError, NutritionErrorCodes } from "../models/NutritionError";
import type { NutritionError } from "../models/NutritionError";

export function applyNutritionAdaptationPolicy(
  adaptation: NutritionAdaptation | null,
): readonly NutritionError[] {
  const errors: NutritionError[] = [];
  if (!adaptation) {
    errors.push(
      createNutritionError(NutritionErrorCodes.POLICY_BLOCKED, "Adaptation required for policy"),
    );
    return Object.freeze(errors);
  }
  if (!adaptation.planId) {
    errors.push(
      createNutritionError(
        NutritionErrorCodes.POLICY_BLOCKED,
        "Adaptation must reference existing plan",
        adaptation.id,
      ),
    );
  }
  return Object.freeze(errors);
}
