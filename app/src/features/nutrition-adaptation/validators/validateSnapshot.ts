import { createNutritionError, NutritionErrorCodes } from "../models/NutritionError";
import type { NutritionError } from "../models/NutritionError";
import type { NutritionSnapshot } from "../models/NutritionSnapshot";

export function validateSnapshot(snapshot: NutritionSnapshot | null): readonly NutritionError[] {
  const errors: NutritionError[] = [];
  if (!snapshot) return Object.freeze(errors);
  if (!snapshot.planId) {
    errors.push(
      createNutritionError(
        NutritionErrorCodes.MISSING_PLAN,
        "Snapshot plan id required",
        snapshot.id,
      ),
    );
  }
  return Object.freeze(errors);
}
