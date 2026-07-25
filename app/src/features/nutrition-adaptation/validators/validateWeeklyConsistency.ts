import { createNutritionError, NutritionErrorCodes } from "../models/NutritionError";
import type { NutritionError } from "../models/NutritionError";
import type { NutritionAdaptation } from "../models/NutritionAdaptation";

export function validateWeeklyConsistency(
  adaptation: NutritionAdaptation | null,
): readonly NutritionError[] {
  const errors: NutritionError[] = [];
  if (!adaptation) return Object.freeze(errors);
  for (const adj of adaptation.weeklyAdjustments) {
    if (!adj.weekKey) {
      errors.push(
        createNutritionError(
          NutritionErrorCodes.INCONSISTENT_WEEK,
          "Weekly adjustment missing weekKey",
          adj.id,
        ),
      );
    }
  }
  return Object.freeze(errors);
}
