import type { NutritionContext } from "../models/NutritionContext";
import type { NutritionPlan } from "../models/NutritionPlan";

export interface SafetyPolicy {
  readonly id: string;
  evaluate(
    context: NutritionContext,
    plan: NutritionPlan | null,
  ): readonly string[];
}

export class DefaultSafetyPolicy implements SafetyPolicy {
  readonly id = "policy:nutrition:safety";

  evaluate(
    context: NutritionContext,
    plan: NutritionPlan | null,
  ): readonly string[] {
    const flags: string[] = [];
    if (plan && plan.calorieTargets.targetCalories < 1200) {
      flags.push("calories_below_safety_floor");
    }
    if (plan && plan.macroTargets.fatG < context.bodyWeightKg * 0.4) {
      flags.push("fat_too_low");
    }
    if (context.constraints.medicalNotes.length > 0) {
      flags.push("medical_notes_present_review_required");
    }
    return Object.freeze(flags);
  }
}
