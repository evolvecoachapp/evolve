import type { NutritionExperienceService } from "../services";
import { NutritionExperienceError } from "../services";

export const localNutritionExperienceService: NutritionExperienceService = {
  providerId: "local",
  async getDashboard() {
    throw new NutritionExperienceError("Local nutrition experience provider is not configured.", "local");
  },
  async getMeals() {
    throw new NutritionExperienceError("Local nutrition meals provider is not configured.", "local");
  },
  async getMacros() {
    throw new NutritionExperienceError("Local nutrition macros provider is not configured.", "local");
  },
  async getHydration() {
    throw new NutritionExperienceError("Local nutrition hydration provider is not configured.", "local");
  },
  async getCoachSuggestions() {
    throw new NutritionExperienceError("Local nutrition coach suggestions provider is not configured.", "local");
  },
  async toggleMealCompletion() {
    throw new NutritionExperienceError("Local nutrition meal completion provider is not configured.", "local");
  },
};
