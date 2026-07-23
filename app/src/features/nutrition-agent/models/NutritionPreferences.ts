/**
 * Immutable preference bag for nutrition planning.
 */
export interface NutritionPreferences {
  readonly vegetarian: boolean;
  readonly vegan: boolean;
  readonly mealsPerDayPreference: number | null;
  readonly preferredFoods: readonly string[];
  readonly avoidedFoods: readonly string[];
}
