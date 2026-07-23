import type { NutritionPlan } from "../models/NutritionPlan";
import { macroCalories } from "../utils/MacroHelpers";

export interface MacroPolicy {
  readonly id: string;
  evaluate(plan: NutritionPlan | null): readonly string[];
}

export class DefaultMacroPolicy implements MacroPolicy {
  readonly id = "policy:nutrition:macro";

  evaluate(plan: NutritionPlan | null): readonly string[] {
    const flags: string[] = [];
    if (!plan) return Object.freeze(flags);
    const summed = macroCalories(plan.macroTargets);
    if (Math.abs(summed - plan.macroTargets.calories) > 120) {
      flags.push("macro_calorie_mismatch");
    }
    if (plan.macroTargets.proteinG < 40) {
      flags.push("protein_too_low");
    }
    return Object.freeze(flags);
  }
}
