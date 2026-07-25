import type { NutritionAdaptation } from "../models/NutritionAdaptation";
import type { NutritionError } from "../models/NutritionError";

/** Recovery nutrition policy: allow recovery-linked adjustments with source keys. */
export function applyRecoveryPolicy(
  adaptation: NutritionAdaptation | null,
): readonly NutritionError[] {
  const errors: NutritionError[] = [];
  if (!adaptation) return Object.freeze(errors);
  for (const adj of adaptation.refeedAdjustments) {
    void adj;
  }
  return Object.freeze(errors);
}
