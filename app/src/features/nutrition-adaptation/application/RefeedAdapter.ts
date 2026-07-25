import { EMPTY_NUTRITION_METADATA } from "../models/NutritionMetadata";
import type { RefeedAdjustment } from "../models/RefeedAdjustment";
import { freezeRefeedAdjustment } from "../utils/FreezeNutritionAdaptation";

/** Deterministic key → modification mapping. NO nutrition generation. */
export function adaptRefeed(input: {
  readonly id: string;
  readonly decisionKeys: readonly string[];
  readonly planStepKeys: readonly string[];
  readonly targetKeys: readonly string[];
  readonly at: string;
}): readonly RefeedAdjustment[] {
  const out: RefeedAdjustment[] = [];
  for (const key of input.decisionKeys) {
    if (!key.includes("refeed")) continue;
    out.push(
      freezeRefeedAdjustment({
        id: `adj:refeed:${input.id}:${key}`,
        refeedKey: `refeed:${key}`,
        targetKey: `target:refeed:${key}`,
        sourceDecisionKeys: Object.freeze([key]),
        planStepKeys: Object.freeze([...input.planStepKeys]),
        metadata: EMPTY_NUTRITION_METADATA,
        createdAt: input.at,
      }),
    );
  }
  return Object.freeze(out);

}
