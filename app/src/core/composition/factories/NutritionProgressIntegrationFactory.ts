import type { ProgressAnalyticsService } from "../../../features/progress-analytics/services/ProgressAnalyticsService";
import { createProgressAnalyticsService } from "../../../features/progress-analytics/services/progressAnalyticsFactory";
import {
  createNutritionProgressIntegration,
  type NutritionProgressIntegration,
} from "../../../integrations/nutrition-progress/composition/createNutritionProgressIntegration";

export interface NutritionProgressIntegrationFactoryDeps {
  readonly progressAnalyticsService?: ProgressAnalyticsService;
}

/**
 * Composition Root factory for Nutrition → Progress Analytics integration wiring.
 */
export const NutritionProgressIntegrationFactory = {
  create(
    deps: NutritionProgressIntegrationFactoryDeps = {},
  ): NutritionProgressIntegration {
    const progressAnalyticsService =
      deps.progressAnalyticsService ?? createProgressAnalyticsService();
    return createNutritionProgressIntegration({ progressAnalyticsService });
  },
} as const;
