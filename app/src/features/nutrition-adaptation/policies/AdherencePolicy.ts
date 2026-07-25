import type { NutritionAdaptation } from "../models/NutritionAdaptation";
import type { NutritionError } from "../models/NutritionError";

export function applyAdherencePolicy(
  adaptation: NutritionAdaptation | null,
): readonly NutritionError[] {
  void adaptation;
  return Object.freeze([] as NutritionError[]);
}
