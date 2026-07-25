import { createNutritionError, NutritionErrorCodes } from "../models/NutritionError";
import type { NutritionError } from "../models/NutritionError";
import type { NutritionHistory } from "../models/NutritionHistory";

export function validateHistory(history: NutritionHistory | null): readonly NutritionError[] {
  const errors: NutritionError[] = [];
  if (!history) return Object.freeze(errors);
  if (!history.athleteId) {
    errors.push(
      createNutritionError(NutritionErrorCodes.MISSING_ATHLETE, "History athlete id required", history.id),
    );
  }
  return Object.freeze(errors);
}
