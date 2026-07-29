export interface MealFood {
  readonly id: string;
  readonly name: string;
  readonly quantity: string;
  readonly calories: number;
  readonly proteinGrams: number;
  readonly carbohydratesGrams: number;
  readonly fatGrams: number;
}

export function createMealFood(input: MealFood): MealFood {
  return Object.freeze({ ...input });
}
