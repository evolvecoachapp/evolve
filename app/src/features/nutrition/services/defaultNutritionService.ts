import { createNutritionService } from "./nutritionServiceFactory";

/** Singleton used by the Nutrition UI — swap providers via EXPO_PUBLIC_NUTRITION_PROVIDER. */
export const nutritionService = createNutritionService();
