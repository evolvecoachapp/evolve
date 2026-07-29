import type { MealFood } from "./MealFood";

export type MealKind =
  | "breakfast"
  | "morning_snack"
  | "lunch"
  | "pre_workout"
  | "post_workout"
  | "dinner"
  | "evening_snack"
  | "custom";

export interface Meal {
  readonly id: string;
  readonly kind: MealKind;
  readonly title: string;
  readonly scheduledTime: string;
  readonly completionPercent: number;
  readonly isCompleted: boolean;
  readonly calories: number;
  readonly proteinGrams: number;
  readonly carbohydratesGrams: number;
  readonly fatGrams: number;
  readonly foods: readonly MealFood[];
  readonly destination: string | null;
}

export function createMeal(input: Meal): Meal {
  return Object.freeze({
    ...input,
    foods: Object.freeze([...input.foods]),
  });
}
