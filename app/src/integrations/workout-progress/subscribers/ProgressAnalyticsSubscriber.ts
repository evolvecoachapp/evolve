import type { ProgressAnalyticsService } from "../../../features/progress-analytics/services/ProgressAnalyticsService";
import { mapPayloadToProgressAnalyticsDto } from "../mappers";
import {
  createWorkoutProgressSubscriberResult,
  type WorkoutProgressEvent,
} from "../models";
import type { WorkoutProgressEventSubscriber } from "../publishers/WorkoutProgressPublisher";

/** Consumes workout progress events through the Progress Analytics service contract. */
export class ProgressAnalyticsSubscriber implements WorkoutProgressEventSubscriber {
  readonly id = "progress-analytics-subscriber";

  constructor(
    private readonly progressAnalyticsService: ProgressAnalyticsService,
  ) {}

  async onEvent(event: WorkoutProgressEvent) {
    const dto = mapPayloadToProgressAnalyticsDto(event);
    const result = await this.progressAnalyticsService.applyWorkoutProgressEvent(dto);

    return createWorkoutProgressSubscriberResult({
      subscriberId: this.id,
      accepted: result.accepted,
      appliedAt: result.appliedAt,
    });
  }
}
