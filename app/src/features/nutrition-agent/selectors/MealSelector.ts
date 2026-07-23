import type { NutritionContext } from "../models/NutritionContext";
import type { MealDistribution } from "../models/MealDistribution";
import { buildMealDistribution } from "../utils/MealHelpers";

export class MealSelector {
  select(context: NutritionContext): MealDistribution {
    const preferred = context.preferences.mealsPerDayPreference ?? 3;
    return buildMealDistribution(preferred);
  }
}
