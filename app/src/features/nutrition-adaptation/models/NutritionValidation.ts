import type { NutritionError } from "./NutritionError";

export interface NutritionValidation {
  readonly valid: boolean;
  readonly issues: readonly NutritionError[];
}
