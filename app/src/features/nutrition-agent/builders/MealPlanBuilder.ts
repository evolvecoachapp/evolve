import type { NutritionContext } from "../models/NutritionContext";
import type { MealDistribution } from "../models/MealDistribution";
import { MealSelector } from "../selectors/MealSelector";

export class MealPlanBuilder {
  constructor(private readonly mealSelector = new MealSelector()) {}

  build(context: NutritionContext): MealDistribution {
    return this.mealSelector.select(context);
  }
}
