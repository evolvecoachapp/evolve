import type { ProgressAnalyticsService } from "../../../features/progress-analytics/services/ProgressAnalyticsService";
import type { GoalProgressPublisher } from "../publishers/GoalProgressPublisher";
import { GoalProgressPublisherImpl } from "../publishers";
import { GoalProgressSubscriber } from "../subscribers";

export interface GoalProgressIntegration {
  readonly publisher: GoalProgressPublisher;
  readonly subscriber: GoalProgressSubscriber;
}

export interface CreateGoalProgressIntegrationOptions {
  readonly progressAnalyticsService: ProgressAnalyticsService;
}

export function createGoalProgressIntegration(
  options: CreateGoalProgressIntegrationOptions,
): GoalProgressIntegration {
  const subscriber = new GoalProgressSubscriber(
    options.progressAnalyticsService,
  );
  const publisher = new GoalProgressPublisherImpl([subscriber]);

  return Object.freeze({
    publisher,
    subscriber,
  });
}
