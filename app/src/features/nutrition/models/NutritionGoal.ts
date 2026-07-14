import type { MacroTargets } from "./MacroTargets";

export type NutritionGoalType = "cut" | "maintain" | "bulk" | "custom";

/** The user's active nutrition goal and prescribed macro targets. */
export interface NutritionGoal {
  id: string;
  type: NutritionGoalType;
  calorieTarget: number;
  macroTargets: MacroTargets;
}
