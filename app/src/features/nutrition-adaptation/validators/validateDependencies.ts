import { createNutritionError, NutritionErrorCodes } from "../models/NutritionError";
import type { NutritionError } from "../models/NutritionError";
import type { NutritionAdaptation } from "../models/NutritionAdaptation";

export function validateDependencies(
  adaptation: NutritionAdaptation | null,
): readonly NutritionError[] {
  const errors: NutritionError[] = [];
  if (!adaptation) return Object.freeze(errors);
  for (const mod of adaptation.modifications) {
    if (mod.sourceDecisionKeys.length === 0) {
      errors.push(
        createNutritionError(
          NutritionErrorCodes.VALIDATION_FAILED,
          "Modification missing source decision keys",
          mod.id,
        ),
      );
    }
  }
  return Object.freeze(errors);
}
