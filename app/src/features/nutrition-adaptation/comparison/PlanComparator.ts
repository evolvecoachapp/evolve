import { EMPTY_NUTRITION_METADATA } from "../models/NutritionMetadata";
import type { NutritionComparison } from "../models/NutritionComparison";
import { freezeComparison } from "../utils/FreezeNutritionAdaptation";
import { diffKeys } from "./diffHelpers";

export function comparePlans(input: {
  readonly id: string;
  readonly athleteId: string;
  readonly planId: string;
  readonly beforeKeys: readonly string[];
  readonly afterKeys: readonly string[];
  readonly at: string;
}): NutritionComparison {
  const diff = diffKeys(input.beforeKeys, input.afterKeys);
  return freezeComparison({
    id: `comparison:plan:${input.id}`,
    athleteId: input.athleteId,
    planId: input.planId,
    beforeKeys: Object.freeze([...input.beforeKeys]),
    afterKeys: Object.freeze([...input.afterKeys]),
    addedKeys: diff.added,
    removedKeys: diff.removed,
    sharedKeys: diff.shared,
    metadata: EMPTY_NUTRITION_METADATA,
    createdAt: input.at,
  });
}
