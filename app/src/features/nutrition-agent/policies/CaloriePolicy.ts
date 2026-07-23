import type { NutritionPlan } from "../models/NutritionPlan";

export interface CaloriePolicy {
  readonly id: string;
  evaluate(plan: NutritionPlan | null): readonly string[];
}

export class DefaultCaloriePolicy implements CaloriePolicy {
  readonly id = "policy:nutrition:calorie";

  evaluate(plan: NutritionPlan | null): readonly string[] {
    const flags: string[] = [];
    if (!plan) return Object.freeze(flags);
    if (plan.calorieTargets.targetCalories > 6000) {
      flags.push("calories_unrealistically_high");
    }
    if (
      Math.abs(plan.calorieTargets.deficitOrSurplus) > 1000 &&
      plan.phaseHint !== "contest"
    ) {
      flags.push("aggressive_energy_delta");
    }
    return Object.freeze(flags);
  }
}
