import type { NutritionPlan } from "../models/NutritionPlan";

export interface MealPolicy {
  readonly id: string;
  evaluate(plan: NutritionPlan | null): readonly string[];
}

export class DefaultMealPolicy implements MealPolicy {
  readonly id = "policy:nutrition:meal";

  evaluate(plan: NutritionPlan | null): readonly string[] {
    const flags: string[] = [];
    if (!plan) return Object.freeze(flags);
    if (plan.mealDistribution.mealsPerDay < 2) {
      flags.push("too_few_meals");
    }
    if (
      plan.mealDistribution.distribution.length !==
      plan.mealDistribution.mealsPerDay
    ) {
      flags.push("meal_distribution_length_mismatch");
    }
    return Object.freeze(flags);
  }
}
