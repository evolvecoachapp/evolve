import type { DailyNutrition } from "../../../features/nutrition/models/DailyNutrition";
import type { Hydration } from "../../../features/nutrition/models/Hydration";
import type { Meal } from "../../../features/nutrition/models/Meal";
import type { MealEntry } from "../../../features/nutrition/models/MealEntry";
import type { NutritionSummary } from "../../../features/nutrition/models/NutritionSummary";
import {
  createEmptyNutritionAnalyticsPayload,
  createNutritionAnalyticsPayload,
  type NutritionAnalyticsPayload,
} from "../models";

export function mapDailyNutritionToStartedPayload(
  daily: DailyNutrition,
): NutritionAnalyticsPayload {
  return createNutritionAnalyticsPayload({
    ...createEmptyNutritionAnalyticsPayload(daily.date),
    mealPlanId: null,
    calories: daily.calories.current,
    proteinGrams: daily.protein.current,
    carbohydrateGrams: daily.carbs.current,
    fatGrams: daily.fat.current,
    hydrationMl: daily.hydration.currentMl,
    targetHydrationMl: daily.hydration.targetMl,
    mealsLogged: daily.meals.length,
    completedAt: daily.date,
  });
}

export function mapNutritionSummaryToCompletionPayload(
  summary: NutritionSummary,
): NutritionAnalyticsPayload {
  return createNutritionAnalyticsPayload({
    dayId: summary.date,
    mealPlanId: null,
    mealId: null,
    mealName: null,
    mealEntryId: null,
    foodId: null,
    foodName: null,
    servings: null,
    calories: summary.totalCalories,
    proteinGrams: summary.protein.current,
    carbohydrateGrams: summary.carbs.current,
    fatGrams: summary.fat.current,
    hydrationMl: null,
    targetHydrationMl: null,
    mealsLogged: summary.mealsLogged,
    completedAt: summary.date,
    metrics: [],
  });
}

export function mapMealEntryToLoggedPayload(
  entry: MealEntry,
  meal: Meal,
  dayId: string,
): NutritionAnalyticsPayload {
  const nutrients = entry.food.nutrients;
  const multiplier = entry.servings * entry.serving.multiplier;

  return createNutritionAnalyticsPayload({
    dayId,
    mealPlanId: null,
    mealId: meal.id,
    mealName: meal.name,
    mealEntryId: entry.id,
    foodId: entry.food.id,
    foodName: entry.food.name,
    servings: entry.servings,
    calories: nutrients.calories * multiplier,
    proteinGrams: nutrients.protein * multiplier,
    carbohydrateGrams: nutrients.carbs * multiplier,
    fatGrams: nutrients.fat * multiplier,
    hydrationMl: null,
    targetHydrationMl: null,
    mealsLogged: null,
    completedAt: meal.time,
    metrics: [],
  });
}

export function mapHydrationToLoggedPayload(
  hydration: Hydration,
  dayId: string,
  loggedAt: string,
): NutritionAnalyticsPayload {
  return createNutritionAnalyticsPayload({
    ...createEmptyNutritionAnalyticsPayload(dayId),
    hydrationMl: hydration.currentMl,
    targetHydrationMl: hydration.targetMl,
    completedAt: loggedAt,
  });
}
