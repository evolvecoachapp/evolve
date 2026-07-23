import type { NutritionContext } from "../models/NutritionContext";
import type { NutritionPlan } from "../models/NutritionPlan";

export interface RecoveryNutritionPolicy {
  readonly id: string;
  evaluate(
    context: NutritionContext,
    plan: NutritionPlan | null,
  ): readonly string[];
}

export class DefaultRecoveryNutritionPolicy implements RecoveryNutritionPolicy {
  readonly id = "policy:nutrition:recovery";

  evaluate(
    context: NutritionContext,
    plan: NutritionPlan | null,
  ): readonly string[] {
    const flags: string[] = [];
    if (
      plan &&
      context.activityLevel === "very_active" &&
      plan.calorieTargets.deficitOrSurplus < -600
    ) {
      flags.push("aggressive_deficit_while_very_active");
    }
    return Object.freeze(flags);
  }
}
