import type { NutritionAdaptation } from "../models/NutritionAdaptation";
import { uniqueSorted } from "../utils/NutritionAdaptationHelpers";

export function selectWeekKeys(adaptation: NutritionAdaptation | null): readonly string[] {
  if (!adaptation) return Object.freeze([]);
  return uniqueSorted(adaptation.weeklyAdjustments.map((a) => a.weekKey));
}
