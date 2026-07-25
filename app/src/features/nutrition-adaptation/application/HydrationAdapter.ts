import { EMPTY_NUTRITION_METADATA } from "../models/NutritionMetadata";
import type { HydrationAdjustment } from "../models/HydrationAdjustment";
import { freezeHydrationAdjustment } from "../utils/FreezeNutritionAdaptation";

/** Deterministic key → modification mapping. NO nutrition generation. */
export function adaptHydration(input: {
  readonly id: string;
  readonly decisionKeys: readonly string[];
  readonly planStepKeys: readonly string[];
  readonly targetKeys: readonly string[];
  readonly at: string;
}): readonly HydrationAdjustment[] {
  const out: HydrationAdjustment[] = [];
  for (const key of input.decisionKeys) {
    if (!key.includes("hydration")) continue;
    out.push(
      freezeHydrationAdjustment({
        id: `adj:hydration:${input.id}:${key}`,
        hydrationKey: `hydration:${key}`,
        targetKey: `target:hydration:${key}`,
        sourceDecisionKeys: Object.freeze([key]),
        planStepKeys: Object.freeze([...input.planStepKeys]),
        metadata: EMPTY_NUTRITION_METADATA,
        createdAt: input.at,
      }),
    );
  }
  return Object.freeze(out);

}
