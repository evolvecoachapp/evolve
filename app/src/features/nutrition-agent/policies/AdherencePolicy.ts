import type { NutritionContext } from "../models/NutritionContext";
import type { NutritionPlan } from "../models/NutritionPlan";

export interface AdherencePolicy {
  readonly id: string;
  evaluate(
    context: NutritionContext,
    plan: NutritionPlan | null,
  ): readonly string[];
}

export class DefaultAdherencePolicy implements AdherencePolicy {
  readonly id = "policy:nutrition:adherence";

  evaluate(
    context: NutritionContext,
    plan: NutritionPlan | null,
  ): readonly string[] {
    const flags: string[] = [];
    if (
      plan &&
      plan.mealDistribution.mealsPerDay >= 6 &&
      context.preferences.mealsPerDayPreference != null &&
      context.preferences.mealsPerDayPreference <= 3
    ) {
      flags.push("meal_frequency_vs_preference");
    }
    return Object.freeze(flags);
  }
}
