import type { Food } from "./Food";

/** A recently logged food item for quick re-entry. */
export interface RecentFood {
  id: string;
  foodId: string;
  food: Food;
  lastUsedAt: string;
}
