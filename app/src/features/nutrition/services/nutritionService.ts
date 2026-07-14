import type { Food } from "../models/Food";
import type { Meal } from "../models/Meal";
import type { NutritionDashboard } from "../models/NutritionDashboard";
import type { NutritionHistory } from "../models/NutritionHistory";

export type NutritionProviderId = "mock" | "backend" | "local";

export interface AddFoodRequest {
  mealId: string;
  foodId: string;
  servingId: string;
  servings: number;
}

export interface RemoveFoodRequest {
  mealId: string;
  entryId: string;
}

export interface UpdateMealRequest {
  mealId: string;
  name?: string;
  time?: string;
}

/** Contract for Nutrition backends — UI and hooks depend on this interface only. */
export interface NutritionService {
  readonly providerId: NutritionProviderId;

  getTodayNutrition(): Promise<NutritionDashboard>;
  getMeal(id: string): Promise<Meal | null>;
  searchFood(query: string): Promise<Food[]>;
  addFood(request: AddFoodRequest): Promise<Meal>;
  removeFood(request: RemoveFoodRequest): Promise<Meal>;
  updateMeal(request: UpdateMealRequest): Promise<Meal>;
  getHistory(): Promise<NutritionHistory>;
}

export class NutritionServiceError extends Error {
  constructor(
    message: string,
    readonly providerId?: NutritionProviderId,
  ) {
    super(message);
    this.name = "NutritionServiceError";
  }
}
