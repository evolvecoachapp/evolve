/**
 * Immutable meal timing / distribution plan.
 */
export interface MealDistribution {
  readonly mealsPerDay: number;
  readonly distribution: readonly string[];
}
