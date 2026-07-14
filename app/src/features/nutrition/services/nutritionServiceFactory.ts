import { backendNutritionService } from "../providers/BackendNutritionService";
import { localNutritionService } from "../providers/LocalNutritionService";
import { mockNutritionService } from "../providers/MockNutritionService";
import type { NutritionProviderId, NutritionService } from "./nutritionService";

const PROVIDERS: Record<NutritionProviderId, NutritionService> = {
  mock: mockNutritionService,
  backend: backendNutritionService,
  local: localNutritionService,
};

/** Resolves the active provider from env — defaults to mock when unset or unknown. */
export function resolveNutritionProviderId(): NutritionProviderId {
  const configured = process.env.EXPO_PUBLIC_NUTRITION_PROVIDER as NutritionProviderId | undefined;
  if (configured && configured in PROVIDERS) {
    return configured;
  }
  return "mock";
}

export function createNutritionService(
  providerId: NutritionProviderId = resolveNutritionProviderId(),
): NutritionService {
  return PROVIDERS[providerId];
}
