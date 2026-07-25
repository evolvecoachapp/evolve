import type { NutritionDescriptor } from "../models/NutritionDescriptor";
import { freezeDescriptor } from "../utils/FreezeNutritionAdaptation";

export function buildNutritionDescriptor(input: {
  readonly id: string;
  readonly createdAt: string;
}): NutritionDescriptor {
  return freezeDescriptor({
    id: input.id,
    name: "Nutrition Adaptation Engine",
    version: "24.2.0",
    capabilities: Object.freeze([
      "adaptNutrition",
      "compareNutrition",
      "describeNutritionAdaptation",
      "createNutritionSnapshot",
      "validateNutritionAdaptation",
    ]),
    boundaries: Object.freeze([
      "adapts_existing_plan_only",
      "no_ai",
      "no_networking",
      "no_persistence",
      "no_ui",
      "no_nutrition_generation_from_scratch",
      "no_athlete_goal_changes",
    ]),
    createdAt: input.createdAt,
  });
}
