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
    "backend provider is not configured. Wire the EVOLVE API before enabling this provider.",
    "backend",
  );
}

/** Placeholder for the EVOLVE backend — implement when API integration is available. */
export const backendNutritionService: NutritionService = {
  providerId: "backend",

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
