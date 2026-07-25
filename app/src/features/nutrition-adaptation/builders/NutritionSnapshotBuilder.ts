import type { NutritionAdaptation } from "../models/NutritionAdaptation";
import { EMPTY_NUTRITION_METADATA } from "../models/NutritionMetadata";
import type { NutritionSnapshot } from "../models/NutritionSnapshot";
import type { UpdatedNutritionPlan } from "../models/UpdatedNutritionPlan";
import { freezeSnapshot } from "../utils/FreezeNutritionAdaptation";

export function buildNutritionSnapshot(input: {
  readonly id: string;
  readonly athleteId: string;
  readonly planId: string;
  readonly contextId: string;
  readonly adaptation: NutritionAdaptation | null;
  readonly updatedPlan: UpdatedNutritionPlan | null;
  readonly planKeys: readonly string[];
  readonly at: string;
}): NutritionSnapshot {
  const plan = input.updatedPlan;
  return freezeSnapshot({
    id: input.id,
    athleteId: input.athleteId,
    planId: input.planId,
    contextId: input.contextId,
    adaptationId: input.adaptation?.id ?? null,
    planKeys: Object.freeze([...(plan ? [plan.id, ...input.planKeys] : input.planKeys)]),
    dayKeys: Object.freeze([...(plan?.dayKeys ?? [])]),
    mealKeys: Object.freeze([...(plan?.mealKeys ?? [])]),
    macroKeys: Object.freeze([...(plan?.macroKeys ?? [])]),
    timingKeys: Object.freeze([...(plan?.timingKeys ?? [])]),
    weekKeys: Object.freeze([...(plan?.weekKeys ?? [])]),
    modificationIds: Object.freeze([
      ...(plan?.modificationIds ?? input.adaptation?.modifications.map((m) => m.id) ?? []),
    ]),
    metadata: EMPTY_NUTRITION_METADATA,
    createdAt: input.at,
  });
}
