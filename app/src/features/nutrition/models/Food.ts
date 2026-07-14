import type { FoodNutrients } from "./FoodNutrients";
import type { FoodServing } from "./FoodServing";

/** A searchable food item returned by nutrition providers. */
export interface Food {
  id: string;
  name: string;
  brand?: string;
  barcode?: string;
  servings: FoodServing[];
  nutrients: FoodNutrients;
}
