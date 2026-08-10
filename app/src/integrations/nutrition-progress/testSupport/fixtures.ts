import type { DailyNutrition } from "../../../features/nutrition/models/DailyNutrition";
import type { Food } from "../../../features/nutrition/models/Food";
import type { Hydration } from "../../../features/nutrition/models/Hydration";
import type { Meal } from "../../../features/nutrition/models/Meal";
import type { MealEntry } from "../../../features/nutrition/models/MealEntry";
import type { NutritionSummary } from "../../../features/nutrition/models/NutritionSummary";
import {
  createNutritionProgressEvent,
  createNutritionProgressMetadata,
} from "../models";

const FIXED_PUBLISHED_AT = "2026-08-02T20:00:00.000Z";

export function createTestFood(overrides: Partial<Food> = {}): Food {
  return {
    id: "food-001",
    name: "Chicken Breast",
    brand: "Generic",
    servings: [
      {
        id: "serving-001",
        label: "100g",
        grams: 100,
        multiplier: 1,
      },
    ],
    nutrients: {
      calories: 165,
      protein: 31,
      carbs: 0,
      fat: 3.6,
    },
    ...overrides,
  };
}

export function createTestMeal(overrides: Partial<Meal> = {}): Meal {
  return {
    id: "meal-001",
    name: "Lunch",
    time: "2026-08-02T12:30:00.000Z",
    calories: 650,
    proteinGrams: 45,
    entries: [],
    ...overrides,
  };
}

export function createTestMealEntry(overrides: Partial<MealEntry> = {}): MealEntry {
  const food = createTestFood();
  return {
    id: "entry-001",
    food,
    servings: 1,
    serving: food.servings[0]!,
    ...overrides,
  };
}

export function createTestDailyNutrition(
  overrides: Partial<DailyNutrition> = {},
): DailyNutrition {
  return {
    date: "2026-08-02",
    calories: { current: 1800, target: 2400 },
    protein: { current: 120, target: 165 },
    carbs: { current: 180, target: 280 },
    fat: { current: 55, target: 72 },
    meals: [createTestMeal()],
    hydration: { currentMl: 1800, targetMl: 2500 },
    status: { status: "on_track", completionPercent: 75 },
    ...overrides,
  };
}

export function createTestNutritionSummary(
  overrides: Partial<NutritionSummary> = {},
): NutritionSummary {
  return Object.freeze({
    date: "2026-08-02",
    totalCalories: 2450,
    calories: { current: 2450, target: 2400 },
    protein: { current: 165, target: 165 },
    carbs: { current: 280, target: 280 },
    fat: { current: 72, target: 72 },
    mealsLogged: 4,
    ...overrides,
  });
}

export function createTestHydration(overrides: Partial<Hydration> = {}): Hydration {
  return {
    currentMl: 2200,
    targetMl: 2500,
    ...overrides,
  };
}

export function createTestNutritionProgressEvent(
  overrides: Partial<ReturnType<typeof createNutritionProgressEvent>> = {},
) {
  return createNutritionProgressEvent({
    id: "evt-001",
    type: "NutritionDayStarted",
    occurredAt: FIXED_PUBLISHED_AT,
    metadata: createNutritionProgressMetadata({
      source: "nutrition",
      correlationId: "corr-001",
      dayId: "2026-08-02",
      mealPlanId: null,
      athleteId: null,
      publishedAt: FIXED_PUBLISHED_AT,
    }),
    payload: Object.freeze({
      dayId: "2026-08-02",
      mealPlanId: null,
      mealId: null,
      mealName: null,
      mealEntryId: null,
      foodId: null,
      foodName: null,
      servings: null,
      calories: 1800,
      proteinGrams: 120,
      carbohydrateGrams: 180,
      fatGrams: 55,
      hydrationMl: 1800,
      targetHydrationMl: 2500,
      mealsLogged: 1,
      completedAt: null,
      metrics: Object.freeze([]),
    }),
    ...overrides,
  });
}

export { FIXED_PUBLISHED_AT };
