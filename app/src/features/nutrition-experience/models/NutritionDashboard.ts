import type { HydrationProgress } from "./HydrationProgress";
import type { MacroProgress } from "./MacroProgress";
import type { Meal } from "./Meal";
import type { MealSummary } from "./MealSummary";
import type { NutritionCoachSuggestion } from "./NutritionCoachSuggestion";
import type { NutritionDay } from "./NutritionDay";

export interface NutritionDashboard {
  readonly day: NutritionDay;
  readonly availableDays: readonly NutritionDay[];
  readonly headline: string;
  readonly summary: string;
  readonly todaysGoal: string;
  readonly nutritionScore: number;
  readonly macros: MacroProgress;
  readonly hydration: HydrationProgress;
  readonly meals: readonly Meal[];
  readonly mealSummary: MealSummary;
  readonly coachSuggestions: readonly NutritionCoachSuggestion[];
  readonly mealDetailsDestination: string | null;
  readonly foodSearchDestination: string | null;
  readonly barcodeScannerDestination: string | null;
  readonly historyDestination: string | null;
}

export function createNutritionDashboard(input: NutritionDashboard): NutritionDashboard {
  return Object.freeze({
    ...input,
    availableDays: Object.freeze([...input.availableDays]),
    meals: Object.freeze([...input.meals]),
    coachSuggestions: Object.freeze([...input.coachSuggestions]),
  });
}
