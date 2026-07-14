import type { Food } from "../models/Food";
import type { Meal } from "../models/Meal";
import type { MealEntry } from "../models/MealEntry";
import type { NutritionDashboard } from "../models/NutritionDashboard";
import type { NutritionHistory } from "../models/NutritionHistory";

/** Returns a deep clone of nutrition dashboard data for provider isolation. */
export function cloneNutritionDashboard(dashboard: NutritionDashboard): NutritionDashboard {
  return structuredClone(dashboard);
}

/** Returns a deep clone of a meal. */
export function cloneMeal(meal: Meal): Meal {
  return structuredClone(meal);
}

/** Returns a deep clone of nutrition history. */
export function cloneNutritionHistory(history: NutritionHistory): NutritionHistory {
  return structuredClone(history);
}

/** Returns a deep clone of a food item. */
export function cloneFood(food: Food): Food {
  return structuredClone(food);
}

/** Returns a deep clone of a meal entry. */
export function cloneMealEntry(entry: MealEntry): MealEntry {
  return structuredClone(entry);
}
