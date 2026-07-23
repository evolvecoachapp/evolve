import type { NutritionGoal } from "./NutritionGoal";

/**
 * Nutrition strategy descriptor.
 */
export interface NutritionStrategy {
  readonly id: string;
  readonly name: string;
  readonly goal: NutritionGoal;
  readonly priority: number;
  readonly tags: readonly string[];
  readonly description: string;
}
