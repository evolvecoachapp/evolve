import type { MealEntry } from "./MealEntry";

/** A named meal slot with optional logged entries. */
export interface Meal {
  id: string;
  name: string;
  time: string;
  calories: number;
  proteinGrams?: number;
  entries?: MealEntry[];
}
