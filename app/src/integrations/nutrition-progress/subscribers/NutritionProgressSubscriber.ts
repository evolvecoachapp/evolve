import type { ProgressAnalyticsService } from "../../../features/progress-analytics/services/ProgressAnalyticsService";
import { mapPayloadToProgressAnalyticsDto } from "../mappers";
import {
  createNutritionProgressSubscriberResult,
  type NutritionProgressEvent,
} from "../models";
import type { NutritionProgressEventSubscriber } from "../publishers/NutritionProgressPublisher";

/** Consumes nutrition progress events through the Progress Analytics service contract. */
export class NutritionProgressSubscriber implements NutritionProgressEventSubscriber {
  readonly id = "nutrition-progress-subscriber";

  constructor(
    private readonly progressAnalyticsService: ProgressAnalyticsService,
  ) {}

  async onEvent(event: NutritionProgressEvent) {
    const dto = mapPayloadToProgressAnalyticsDto(event);
    const result = await this.progressAnalyticsService.applyNutritionProgressEvent(dto);

    return createNutritionProgressSubscriberResult({
      subscriberId: this.id,
      accepted: result.accepted,
      appliedAt: result.appliedAt,
    });
  }
}
