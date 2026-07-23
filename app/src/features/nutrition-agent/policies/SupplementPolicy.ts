import type { NutritionPlan } from "../models/NutritionPlan";

export interface SupplementPolicy {
  readonly id: string;
  evaluate(plan: NutritionPlan | null): readonly string[];
}

export class DefaultSupplementPolicy implements SupplementPolicy {
  readonly id = "policy:nutrition:supplement";

  evaluate(plan: NutritionPlan | null): readonly string[] {
    const flags: string[] = [];
    if (!plan) return Object.freeze(flags);
    if (plan.supplementPlan.items.length > 8) {
      flags.push("too_many_supplements");
    }
    return Object.freeze(flags);
  }
}
