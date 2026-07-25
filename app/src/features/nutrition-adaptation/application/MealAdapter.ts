import { EMPTY_NUTRITION_METADATA } from "../models/NutritionMetadata";
import type { MealAdjustment } from "../models/MealAdjustment";
import { freezeMealAdjustment } from "../utils/FreezeNutritionAdaptation";

/** Deterministic key → modification mapping. NO nutrition generation. */
export function adaptMeal(input: {
  readonly id: string;
  readonly decisionKeys: readonly string[];
  readonly planStepKeys: readonly string[];
  readonly targetKeys: readonly string[];
  readonly at: string;
}): readonly MealAdjustment[] {
  const out: MealAdjustment[] = [];
  for (const target of input.targetKeys) {
    if (!target.includes("meal")) continue;
    out.push(
      freezeMealAdjustment({
        id: `adj:meal:${input.id}:${target}`,
        mealKey: target.replace(/^target:/, ""),
        targetKey: target,
        sourceDecisionKeys: Object.freeze([...input.decisionKeys]),
        planStepKeys: Object.freeze([...input.planStepKeys]),
        metadata: EMPTY_NUTRITION_METADATA,
        createdAt: input.at,
      }),
    );
  }
  return Object.freeze(out);

}
