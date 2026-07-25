import { EMPTY_NUTRITION_METADATA } from "../models/NutritionMetadata";
import type { CalorieAdjustment } from "../models/CalorieAdjustment";
import { freezeCalorieAdjustment } from "../utils/FreezeNutritionAdaptation";

/** Deterministic key → modification mapping. NO nutrition generation. */
export function adaptCalorie(input: {
  readonly id: string;
  readonly decisionKeys: readonly string[];
  readonly planStepKeys: readonly string[];
  readonly targetKeys: readonly string[];
  readonly at: string;
}): readonly CalorieAdjustment[] {
  const out: CalorieAdjustment[] = [];
  for (const key of input.decisionKeys) {
    if (!key.includes("calorie")) continue;
    out.push(
      freezeCalorieAdjustment({
        id: `adj:calorie:${input.id}:${key}`,
        calorieKey: `calorie:${key}`,
        targetKey: `target:calorie:${key}`,
        sourceDecisionKeys: Object.freeze([key]),
        planStepKeys: Object.freeze([...input.planStepKeys]),
        metadata: EMPTY_NUTRITION_METADATA,
        createdAt: input.at,
      }),
    );
  }
  return Object.freeze(out);

}
