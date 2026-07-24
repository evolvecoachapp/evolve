import type { NutritionState } from "../models/NutritionState";
import type { SpecialistContribution } from "../models/SpecialistContribution";
import { freezeNutrition } from "../utils/FreezeAthleteState";
import { mergeUniqueStrings } from "../utils/StateHelpers";

export function aggregateNutrition(input: {
  readonly current: NutritionState;
  readonly contributions: readonly SpecialistContribution[];
}): NutritionState {
  let next = input.current;
  for (const c of input.contributions) {
    if (!c.nutrition) continue;
    next = freezeNutrition({
      planId: c.nutrition.planId ?? next.planId,
      dietaryPattern: c.nutrition.dietaryPattern ?? next.dietaryPattern,
      lastLoggedAt: c.nutrition.lastLoggedAt ?? next.lastLoggedAt,
      targetsPresent: c.nutrition.targetsPresent || next.targetsPresent,
      notes: mergeUniqueStrings(next.notes, c.nutrition.notes),
      sourceAgentIds: mergeUniqueStrings(
        next.sourceAgentIds,
        c.nutrition.sourceAgentIds,
        [c.agentId],
      ),
    });
  }
  return next;
}
