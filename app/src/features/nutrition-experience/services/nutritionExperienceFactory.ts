import { backendNutritionExperienceService } from "../providers/BackendNutritionExperienceService";
import { localNutritionExperienceService } from "../providers/LocalNutritionExperienceService";
import { mockNutritionExperienceService } from "../providers/MockNutritionExperienceService";
import type {
  NutritionExperienceProviderId,
  NutritionExperienceService,
} from "./NutritionExperienceService";

function resolveProviderId(): NutritionExperienceProviderId {
  const candidate = process.env.EXPO_PUBLIC_NUTRITION_EXPERIENCE_PROVIDER;
  if (candidate === "backend" || candidate === "local" || candidate === "mock") {
    return candidate;
  }
  return "mock";
}

export function createNutritionExperienceService(): NutritionExperienceService {
  const providerId = resolveProviderId();
  if (providerId === "backend") {
    return backendNutritionExperienceService;
  }
  if (providerId === "local") {
    return localNutritionExperienceService;
  }
  return mockNutritionExperienceService;
}
