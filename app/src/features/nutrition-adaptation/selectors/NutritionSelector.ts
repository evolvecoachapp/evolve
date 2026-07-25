import type { NutritionAdaptation } from "../models/NutritionAdaptation";
import { uniqueSorted } from "../utils/NutritionAdaptationHelpers";

export function selectModificationIds(adaptation: NutritionAdaptation | null): readonly string[] {
  if (!adaptation) return Object.freeze([]);
  return uniqueSorted(adaptation.modifications.map((m) => m.id));
}

export function selectDecisionKeys(adaptation: NutritionAdaptation | null): readonly string[] {
  if (!adaptation) return Object.freeze([]);
  return uniqueSorted(adaptation.decisionKeys);
}
