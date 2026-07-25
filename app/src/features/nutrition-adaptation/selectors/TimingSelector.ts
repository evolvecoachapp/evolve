import type { NutritionAdaptation } from "../models/NutritionAdaptation";
import { uniqueSorted } from "../utils/NutritionAdaptationHelpers";

export function selectTimingKeys(adaptation: NutritionAdaptation | null): readonly string[] {
  if (!adaptation) return Object.freeze([]);
  return uniqueSorted(adaptation.mealTimingAdjustments.map((a) => a.timingKey));
}
