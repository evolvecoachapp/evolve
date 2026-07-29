export const DietaryApproachValues = {
  BALANCED: "balanced",
  HIGH_PROTEIN: "high_protein",
  LOW_CARB: "low_carb",
  KETO: "keto",
  VEGETARIAN: "vegetarian",
  VEGAN: "vegan",
  PALEO: "paleo",
  CUSTOM: "custom",
} as const;

export type DietaryApproach = (typeof DietaryApproachValues)[keyof typeof DietaryApproachValues];

export interface NutritionPreferences {
  readonly dietaryApproach: DietaryApproach;
  readonly calorieTarget: number;
  readonly mealsPerDay: number;
  readonly allergies: readonly string[];
  readonly supplements: readonly string[];
  readonly destination: string | null;
}

export function createNutritionPreferences(input: NutritionPreferences): NutritionPreferences {
  return Object.freeze({
    ...input,
    allergies: Object.freeze([...input.allergies]),
    supplements: Object.freeze([...input.supplements]),
  });
}
