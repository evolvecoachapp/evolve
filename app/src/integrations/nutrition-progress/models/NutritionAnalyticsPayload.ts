import type { NutritionMetric } from "./NutritionMetric";

/** Immutable analytics payload projected from nutrition domain state. */
export interface NutritionAnalyticsPayload {
  readonly dayId: string;
  readonly mealPlanId: string | null;
  readonly mealId: string | null;
  readonly mealName: string | null;
  readonly mealEntryId: string | null;
  readonly foodId: string | null;
  readonly foodName: string | null;
  readonly servings: number | null;
  readonly calories: number | null;
  readonly proteinGrams: number | null;
  readonly carbohydrateGrams: number | null;
  readonly fatGrams: number | null;
  readonly hydrationMl: number | null;
  readonly targetHydrationMl: number | null;
  readonly mealsLogged: number | null;
  readonly completedAt: string | null;
  readonly metrics: readonly NutritionMetric[];
}

export function createNutritionAnalyticsPayload(
  input: NutritionAnalyticsPayload,
): NutritionAnalyticsPayload {
  return Object.freeze({
    ...input,
    metrics: Object.freeze([...input.metrics]),
  });
}

export function createEmptyNutritionAnalyticsPayload(
  dayId: string,
): NutritionAnalyticsPayload {
  return createNutritionAnalyticsPayload({
    dayId,
    mealPlanId: null,
    mealId: null,
    mealName: null,
    mealEntryId: null,
    foodId: null,
    foodName: null,
    servings: null,
    calories: null,
    proteinGrams: null,
    carbohydrateGrams: null,
    fatGrams: null,
    hydrationMl: null,
    targetHydrationMl: null,
    mealsLogged: null,
    completedAt: null,
    metrics: [],
  });
}
