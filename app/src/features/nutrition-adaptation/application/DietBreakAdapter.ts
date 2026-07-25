import { EMPTY_NUTRITION_METADATA } from "../models/NutritionMetadata";
import type { DietBreakAdjustment } from "../models/DietBreakAdjustment";
import { freezeDietBreakAdjustment } from "../utils/FreezeNutritionAdaptation";

/** Deterministic key → modification mapping. NO nutrition generation. */
export function adaptDietBreak(input: {
  readonly id: string;
  readonly decisionKeys: readonly string[];
  readonly planStepKeys: readonly string[];
  readonly targetKeys: readonly string[];
  readonly at: string;
}): readonly DietBreakAdjustment[] {
  const out: DietBreakAdjustment[] = [];
  for (const key of input.decisionKeys) {
    if (!key.includes("diet-break") && !key.includes("dietbreak")) continue;
    out.push(
      freezeDietBreakAdjustment({
        id: `adj:diet-break:${input.id}:${key}`,
        dietBreakKey: `diet-break:${key}`,
        targetKey: `target:diet-break:${key}`,
        sourceDecisionKeys: Object.freeze([key]),
        planStepKeys: Object.freeze([...input.planStepKeys]),
        metadata: EMPTY_NUTRITION_METADATA,
        createdAt: input.at,
      }),
    );
  }
  return Object.freeze(out);

}
