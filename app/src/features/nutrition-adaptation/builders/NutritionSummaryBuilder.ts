import type { NutritionAdaptation } from "../models/NutritionAdaptation";
import { EMPTY_NUTRITION_METADATA } from "../models/NutritionMetadata";
import type { NutritionSummary } from "../models/NutritionSummary";
import { freezeSummary } from "../utils/FreezeNutritionAdaptation";

export function buildNutritionSummary(input: {
  readonly id: string;
  readonly athleteId: string;
  readonly planId: string;
  readonly contextId: string;
  readonly adaptation: NutritionAdaptation | null;
  readonly at: string;
}): NutritionSummary {
  return freezeSummary({
    id: input.id,
    athleteId: input.athleteId,
    planId: input.planId,
    contextId: input.contextId,
    adaptationId: input.adaptation?.id ?? null,
    modificationCount: input.adaptation?.modifications.length ?? 0,
    adjustmentCount: input.adaptation?.adjustments.length ?? 0,
    decisionKeys: Object.freeze([...(input.adaptation?.decisionKeys ?? [])]),
    metadata: EMPTY_NUTRITION_METADATA,
    createdAt: input.at,
  });
}
