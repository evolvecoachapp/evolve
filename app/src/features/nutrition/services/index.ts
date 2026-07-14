export { nutritionService } from "./defaultNutritionService";
export { createNutritionService, resolveNutritionProviderId } from "./nutritionServiceFactory";
export type {
  AddFoodRequest,
  NutritionProviderId,
  NutritionService,
  RemoveFoodRequest,
  UpdateMealRequest,
} from "./nutritionService";
export { NutritionServiceError } from "./nutritionService";
export { mockNutritionService } from "../providers/MockNutritionService";
export { backendNutritionService } from "../providers/BackendNutritionService";
export { localNutritionService } from "../providers/LocalNutritionService";
