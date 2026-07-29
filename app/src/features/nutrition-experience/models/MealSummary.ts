export interface MealSummary {
  readonly totalMeals: number;
  readonly completedMeals: number;
  readonly completionPercent: number;
  readonly nextMealLabel: string;
}

export function createMealSummary(input: MealSummary): MealSummary {
  return Object.freeze({ ...input });
}
