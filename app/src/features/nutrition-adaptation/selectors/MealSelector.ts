import type { NutritionAdaptation } from "../models/NutritionAdaptation";
import { uniqueSorted } from "../utils/NutritionAdaptationHelpers";

export function selectMealKeys(adaptation: NutritionAdaptation | null): readonly string[] {
  if (!adaptation) return Object.freeze([]);
  return uniqueSorted(adaptation.mealAdjustments.map((a) => a.mealKey));
}
