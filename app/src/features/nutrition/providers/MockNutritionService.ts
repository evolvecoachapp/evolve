import { mockFoodCatalog, mockNutritionDashboardData, mockNutritionHistoryData } from "../mocks";
import type { Food } from "../models/Food";
import type { Meal } from "../models/Meal";
import type { MealEntry } from "../models/MealEntry";
import type { NutritionDashboard } from "../models/NutritionDashboard";
import type { NutritionHistory } from "../models/NutritionHistory";
import type {
  AddFoodRequest,
  NutritionService,
  RemoveFoodRequest,
  UpdateMealRequest,
} from "../services/nutritionService";
import {
  cloneFood,
  cloneMeal,
  cloneNutritionDashboard,
  cloneNutritionHistory,
} from "../utils/nutritionAdapters";

let dashboardState = cloneNutritionDashboard(mockNutritionDashboardData);
let entryIdCounter = 0;

function createEntryId(): string {
  entryIdCounter += 1;
  return `entry-${entryIdCounter}`;
}

function findMeal(mealId: string): Meal | undefined {
  return dashboardState.daily.meals.find((meal) => meal.id === mealId);
}

function findFood(foodId: string): Food | undefined {
  return mockFoodCatalog.find((food) => food.id === foodId);
}

function getMealOrThrow(mealId: string): Meal {
  const meal = findMeal(mealId);
  if (!meal) {
    throw new Error(`Meal not found: ${mealId}`);
  }
  return meal;
}

function recalculateMealTotals(meal: Meal): void {
  const entries = meal.entries ?? [];
  meal.calories = entries.reduce(
    (total, entry) => total + entry.food.nutrients.calories * entry.servings * entry.serving.multiplier,
    0,
  );
  meal.proteinGrams = entries.reduce(
    (total, entry) => total + entry.food.nutrients.protein * entry.servings * entry.serving.multiplier,
    0,
  );
}

/** Default provider — returns seeded local nutrition data and in-memory meal state. */
export const mockNutritionService: NutritionService = {
  providerId: "mock",

  async getTodayNutrition(): Promise<NutritionDashboard> {
    return cloneNutritionDashboard(dashboardState);
  },

  async getMeal(id: string): Promise<Meal | null> {
    const meal = findMeal(id);
    return meal ? cloneMeal(meal) : null;
  },

  async searchFood(query: string): Promise<Food[]> {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return [];
    }

    return mockFoodCatalog
      .filter(
        (food) =>
          food.name.toLowerCase().includes(normalized) ||
          food.brand?.toLowerCase().includes(normalized),
      )
      .map(cloneFood);
  },

  async addFood(request: AddFoodRequest): Promise<Meal> {
    const meal = getMealOrThrow(request.mealId);
    const food = findFood(request.foodId);
    if (!food) {
      throw new Error(`Food not found: ${request.foodId}`);
    }

    const serving = food.servings.find((item) => item.id === request.servingId);
    if (!serving) {
      throw new Error(`Serving not found: ${request.servingId}`);
    }

    const entry: MealEntry = {
      id: createEntryId(),
      food: cloneFood(food),
      servings: request.servings,
      serving,
    };

    meal.entries = [...(meal.entries ?? []), entry];
    recalculateMealTotals(meal);
    return cloneMeal(meal);
  },

  async removeFood(request: RemoveFoodRequest): Promise<Meal> {
    const meal = getMealOrThrow(request.mealId);
    const nextEntries = (meal.entries ?? []).filter((entry) => entry.id !== request.entryId);

    if (nextEntries.length === (meal.entries ?? []).length) {
      throw new Error(`Meal entry not found: ${request.entryId}`);
    }

    meal.entries = nextEntries;
    recalculateMealTotals(meal);
    return cloneMeal(meal);
  },

  async updateMeal(request: UpdateMealRequest): Promise<Meal> {
    const meal = getMealOrThrow(request.mealId);

    if (request.name !== undefined) {
      meal.name = request.name;
    }
    if (request.time !== undefined) {
      meal.time = request.time;
    }

    return cloneMeal(meal);
  },

  async getHistory(): Promise<NutritionHistory> {
    return cloneNutritionHistory(mockNutritionHistoryData);
  },
};
