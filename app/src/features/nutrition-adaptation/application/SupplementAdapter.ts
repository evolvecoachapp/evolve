import { EMPTY_NUTRITION_METADATA } from "../models/NutritionMetadata";
import type { SupplementAdjustment } from "../models/SupplementAdjustment";
import { freezeSupplementAdjustment } from "../utils/FreezeNutritionAdaptation";

/** Deterministic key → modification mapping. NO nutrition generation. */
export function adaptSupplement(input: {
  readonly id: string;
  readonly decisionKeys: readonly string[];
  readonly planStepKeys: readonly string[];
  readonly targetKeys: readonly string[];
  readonly at: string;
}): readonly SupplementAdjustment[] {
  const out: SupplementAdjustment[] = [];
  for (const key of input.decisionKeys) {
    if (!key.includes("supplement")) continue;
    out.push(
      freezeSupplementAdjustment({
        id: `adj:supplement:${input.id}:${key}`,
        supplementKey: `supplement:${key}`,
        targetKey: `target:supplement:${key}`,
        sourceDecisionKeys: Object.freeze([key]),
        planStepKeys: Object.freeze([...input.planStepKeys]),
        metadata: EMPTY_NUTRITION_METADATA,
        createdAt: input.at,
      }),
    );
  }
  return Object.freeze(out);

}
