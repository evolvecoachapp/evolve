import type { Food } from "./Food";
import type { FoodServing } from "./FoodServing";

/** A single logged food portion within a meal. */
export interface MealEntry {
  id: string;
  food: Food;
  servings: number;
  serving: FoodServing;
}
