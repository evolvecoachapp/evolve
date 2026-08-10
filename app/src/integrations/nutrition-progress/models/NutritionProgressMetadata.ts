/** Immutable metadata attached to every nutrition progress event. */
export interface NutritionProgressMetadata {
  readonly source: "nutrition";
  readonly correlationId: string;
  readonly dayId: string;
  readonly mealPlanId: string | null;
  readonly athleteId: string | null;
  readonly publishedAt: string;
}

export function createNutritionProgressMetadata(
  input: NutritionProgressMetadata,
): NutritionProgressMetadata {
  return Object.freeze({ ...input });
}
