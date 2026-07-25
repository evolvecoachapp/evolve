import { createNutritionError, NutritionErrorCodes } from "../models/NutritionError";
import type { NutritionError } from "../models/NutritionError";
import type { NutritionAdaptation } from "../models/NutritionAdaptation";

export function validateMacroConsistency(
  adaptation: NutritionAdaptation | null,
): readonly NutritionError[] {
  const errors: NutritionError[] = [];
  if (!adaptation) return Object.freeze(errors);
  for (const adj of adaptation.macroDistributionAdjustments) {
    if (!adj.macroKey) {
      errors.push(
        createNutritionError(
          NutritionErrorCodes.INCONSISTENT_MACRO,
          "Macro adjustment missing macroKey",
          adj.id,
        ),
      );
    }
  }
  return Object.freeze(errors);
}
