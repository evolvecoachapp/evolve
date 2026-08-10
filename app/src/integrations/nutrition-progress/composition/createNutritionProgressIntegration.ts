import type { ProgressAnalyticsService } from "../../../features/progress-analytics/services/ProgressAnalyticsService";
import type { NutritionProgressPublisher } from "../publishers/NutritionProgressPublisher";
import { NutritionProgressPublisherImpl } from "../publishers";
import { NutritionProgressSubscriber } from "../subscribers";

export interface NutritionProgressIntegration {
  readonly publisher: NutritionProgressPublisher;
  readonly subscriber: NutritionProgressSubscriber;
}

export interface CreateNutritionProgressIntegrationOptions {
  readonly progressAnalyticsService: ProgressAnalyticsService;
}

export function createNutritionProgressIntegration(
  options: CreateNutritionProgressIntegrationOptions,
): NutritionProgressIntegration {
  const subscriber = new NutritionProgressSubscriber(
    options.progressAnalyticsService,
  );
  const publisher = new NutritionProgressPublisherImpl([subscriber]);

  return Object.freeze({
    publisher,
    subscriber,
  });
}
