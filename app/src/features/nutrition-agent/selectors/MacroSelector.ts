import type { NutritionContext } from "../models/NutritionContext";
import type { MacroTargets } from "../models/MacroTargets";
import { buildCalorieTargets } from "../utils/CalorieHelpers";
import { buildMacroTargets } from "../utils/MacroHelpers";

export class MacroSelector {
  select(context: NutritionContext): MacroTargets {
    const calories = buildCalorieTargets({
      bodyWeightKg: context.bodyWeightKg,
      activityLevel: context.activityLevel,
      goal: context.goal,
    });
    return buildMacroTargets({
      bodyWeightKg: context.bodyWeightKg,
      targetCalories: calories.targetCalories,
      goal: context.goal,
    });
  }
}
