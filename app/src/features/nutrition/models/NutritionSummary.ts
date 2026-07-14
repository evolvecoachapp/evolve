import type { MacroProgress } from "./MacroProgress";

/** Aggregated nutrition totals for a single day. */
export interface NutritionSummary {
  date: string;
  totalCalories: number;
  calories: MacroProgress;
  protein: MacroProgress;
  carbs: MacroProgress;
  fat: MacroProgress;
  mealsLogged: number;
}
