import { EMPTY_NUTRITION_METADATA } from "../models/NutritionMetadata";
import type { MealTimingAdjustment } from "../models/MealTimingAdjustment";
import { freezeMealTimingAdjustment } from "../utils/FreezeNutritionAdaptation";

/** Deterministic key → modification mapping. NO nutrition generation. */
export function adaptTiming(input: {
  readonly id: string;
  readonly decisionKeys: readonly string[];
  readonly planStepKeys: readonly string[];
  readonly targetKeys: readonly string[];
  readonly at: string;
}): readonly MealTimingAdjustment[] {
  const out: MealTimingAdjustment[] = [];
  for (const target of input.targetKeys) {
    if (!target.includes("timing")) continue;
    out.push(
      freezeMealTimingAdjustment({
        id: `adj:timing:${input.id}:${target}`,
        timingKey: target.replace(/^target:/, ""),
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
