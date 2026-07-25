import { createNutritionError, NutritionErrorCodes } from "../models/NutritionError";
import type { NutritionError } from "../models/NutritionError";
import type { NutritionAdaptation } from "../models/NutritionAdaptation";

export function validateAdaptationIntegrity(
  adaptation: NutritionAdaptation | null,
): readonly NutritionError[] {
  const errors: NutritionError[] = [];
  if (!adaptation) {
    errors.push(
      createNutritionError(NutritionErrorCodes.MISSING_INPUT, "Adaptation record required"),
    );
    return Object.freeze(errors);
  }
  if (!adaptation.athleteId) {
    errors.push(
      createNutritionError(NutritionErrorCodes.MISSING_ATHLETE, "Athlete id required", adaptation.id),
    );
  }
  if (!adaptation.planId) {
    errors.push(
      createNutritionError(
        NutritionErrorCodes.MISSING_PLAN,
        "Plan id required",
        adaptation.id,
      ),
    );
  }
  return Object.freeze(errors);
}
