export * from "./HydrationPlanner";
export * from "./MacroPlanner";
export * from "./MealPlanner";
export * from "./NutritionPlanner";
export * from "./TimingPlanner";
export * from "./WeeklyPlanner";

import { planHydration, type HydrationPlan } from "./HydrationPlanner";
import { planMacros, type MacroPlan } from "./MacroPlanner";
import { planMeals, type MealPlan } from "./MealPlanner";
import { planNutrition, type NutritionPlan } from "./NutritionPlanner";
import { planTiming, type TimingPlan } from "./TimingPlanner";
import { planWeeks, type WeekPlan } from "./WeeklyPlanner";

export interface NutritionPlanBundle {
  readonly nutrition: NutritionPlan;
  readonly meal: MealPlan;
  readonly macro: MacroPlan;
  readonly timing: TimingPlan;
  readonly hydration: HydrationPlan;
  readonly week: WeekPlan;
}

export function planNutritionAdaptation(input: {
  readonly id: string;
  readonly decisionKeys: readonly string[];
  readonly signalKeys: readonly string[];
  readonly planKeys: readonly string[];
  readonly mealKeys: readonly string[];
  readonly macroKeys: readonly string[];
  readonly timingKeys: readonly string[];
  readonly weekKeys: readonly string[];
}): NutritionPlanBundle {
  return Object.freeze({
    nutrition: planNutrition(input),
    meal: planMeals(input),
    macro: planMacros(input),
    timing: planTiming(input),
    hydration: planHydration(input),
    week: planWeeks(input),
  });
}
