import type { ProgressAnalyticsService } from "../../../features/progress-analytics/services/ProgressAnalyticsService";
import { mapPayloadToProgressAnalyticsDto } from "../mappers";
import {
  createGoalProgressSubscriberResult,
  type GoalProgressEvent,
} from "../models";
import type { GoalProgressEventSubscriber } from "../publishers/GoalProgressPublisher";

/** Consumes goal progress events through the Progress Analytics service contract. */
export class GoalProgressSubscriber implements GoalProgressEventSubscriber {
  readonly id = "goal-progress-subscriber";

  constructor(
    private readonly progressAnalyticsService: ProgressAnalyticsService,
  ) {}

  async onEvent(event: GoalProgressEvent) {
    const dto = mapPayloadToProgressAnalyticsDto(event);
    const result = await this.progressAnalyticsService.applyGoalProgressEvent(dto);

    return createGoalProgressSubscriberResult({
      subscriberId: this.id,
      accepted: result.accepted,
      appliedAt: result.appliedAt,
    });
  }
}
