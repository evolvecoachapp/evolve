import type { Hydration } from "./Hydration";
import type { MacroProgress } from "./MacroProgress";
import type { Meal } from "./Meal";
import type { NutritionStatus } from "./NutritionStatus";

/** Today's logged nutrition data for the active day. */
export interface DailyNutrition {
  date: string;
  calories: MacroProgress;
  protein: MacroProgress;
  carbs: MacroProgress;
  fat: MacroProgress;
  meals: Meal[];
  hydration: Hydration;
  status: NutritionStatus;
}
