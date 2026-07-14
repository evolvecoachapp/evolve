import type { Food } from "./Food";

/** A food item saved to the user's favorites list. */
export interface FavoriteFood {
  id: string;
  foodId: string;
  food: Food;
  addedAt: string;
}
