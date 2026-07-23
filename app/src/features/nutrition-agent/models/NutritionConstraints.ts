/**
 * Immutable constraint bag for nutrition planning.
 */
export interface NutritionConstraints {
  readonly allergies: readonly string[];
  readonly medicalNotes: readonly string[];
  readonly minCalories: number | null;
  readonly maxCalories: number | null;
  readonly flags: readonly string[];
}
