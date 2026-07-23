import type { NutritionPlan } from "../models/NutritionPlan";

export interface HydrationPolicy {
  readonly id: string;
  evaluate(plan: NutritionPlan | null): readonly string[];
}

export class DefaultHydrationPolicy implements HydrationPolicy {
  readonly id = "policy:nutrition:hydration";

  evaluate(plan: NutritionPlan | null): readonly string[] {
    const flags: string[] = [];
    if (!plan) return Object.freeze(flags);
    if (plan.hydrationPlan.litersPerDay < 1.5) {
      flags.push("hydration_too_low");
    }
    if (plan.hydrationPlan.litersPerDay > 8) {
      flags.push("hydration_too_high");
    }
    return Object.freeze(flags);
  }
}
