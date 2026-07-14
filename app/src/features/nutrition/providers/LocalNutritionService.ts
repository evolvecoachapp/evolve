import type { Food } from "../models/Food";
import type { Meal } from "../models/Meal";
import type { NutritionDashboard } from "../models/NutritionDashboard";
import type { NutritionHistory } from "../models/NutritionHistory";
import {
  NutritionServiceError,
  type AddFoodRequest,
  type NutritionService,
  type RemoveFoodRequest,
  type UpdateMealRequest,
} from "../services/nutritionService";

function notConfigured(): never {
  throw new NutritionServiceError(
    "local provider is not configured. Integrate on-device storage before enabling this provider.",
    "local",
  );
}

/** Placeholder for on-device cached nutrition data. */
export const localNutritionService: NutritionService = {
  providerId: "local",

  async getTodayNutrition(): Promise<NutritionDashboard> {
    return notConfigured();
  },

  async getMeal(_id: string): Promise<Meal | null> {
    return notConfigured();
  },

  async searchFood(_query: string): Promise<Food[]> {
    return notConfigured();
  },

  async addFood(_request: AddFoodRequest): Promise<Meal> {
    return notConfigured();
  },

  async removeFood(_request: RemoveFoodRequest): Promise<Meal> {
    return notConfigured();
  },

  async updateMeal(_request: UpdateMealRequest): Promise<Meal> {
    return notConfigured();
  },

  async getHistory(): Promise<NutritionHistory> {
    return notConfigured();
  },
};
