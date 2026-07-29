import type { NutritionExperienceService } from "../services";
import { NutritionExperienceError } from "../services";

export const backendNutritionExperienceService: NutritionExperienceService = {
  providerId: "backend",
  async getDashboard() {
    throw new NutritionExperienceError("Backend nutrition experience provider is not configured.", "backend");
  },
  async getMeals() {
    throw new NutritionExperienceError("Backend nutrition meals provider is not configured.", "backend");
  },
  async getMacros() {
    throw new NutritionExperienceError("Backend nutrition macros provider is not configured.", "backend");
  },
  async getHydration() {
    throw new NutritionExperienceError("Backend nutrition hydration provider is not configured.", "backend");
  },
  async getCoachSuggestions() {
    throw new NutritionExperienceError("Backend nutrition coach suggestions provider is not configured.", "backend");
  },
  async toggleMealCompletion() {
    throw new NutritionExperienceError("Backend nutrition meal completion provider is not configured.", "backend");
  },
};
