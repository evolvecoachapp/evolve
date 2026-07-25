import type { NutritionAdaptation } from "../models/NutritionAdaptation";
import { createNutritionError, NutritionErrorCodes } from "../models/NutritionError";
import type { NutritionError } from "../models/NutritionError";

export function applyConsistencyPolicy(
  adaptation: NutritionAdaptation | null,
): readonly NutritionError[] {
  const errors: NutritionError[] = [];
  if (!adaptation) return Object.freeze(errors);
  const ids = new Set<string>();
  for (const mod of adaptation.modifications) {
    if (ids.has(mod.id)) {
      errors.push(
        createNutritionError(
          NutritionErrorCodes.POLICY_BLOCKED,
          "Duplicate modification id",
          mod.id,
        ),
      );
    }
    ids.add(mod.id);
  }
  return Object.freeze(errors);
}
