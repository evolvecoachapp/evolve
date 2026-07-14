import type { Micronutrients } from "./Micronutrients";

/** Macronutrient values for a single food serving. */
export interface FoodNutrients {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  micronutrients?: Micronutrients;
}
