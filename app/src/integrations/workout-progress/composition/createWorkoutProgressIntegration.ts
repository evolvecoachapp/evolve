import type { ProgressAnalyticsService } from "../../../features/progress-analytics/services/ProgressAnalyticsService";
import type { WorkoutProgressPublisher } from "../publishers/WorkoutProgressPublisher";
import { WorkoutProgressPublisherImpl } from "../publishers";
import { ProgressAnalyticsSubscriber } from "../subscribers";

export interface WorkoutProgressIntegration {
  readonly publisher: WorkoutProgressPublisher;
  readonly subscriber: ProgressAnalyticsSubscriber;
}

export interface CreateWorkoutProgressIntegrationOptions {
  readonly progressAnalyticsService: ProgressAnalyticsService;
}

export function createWorkoutProgressIntegration(
  options: CreateWorkoutProgressIntegrationOptions,
): WorkoutProgressIntegration {
  const subscriber = new ProgressAnalyticsSubscriber(
    options.progressAnalyticsService,
  );
  const publisher = new WorkoutProgressPublisherImpl([subscriber]);

  return Object.freeze({
    publisher,
    subscriber,
  });
}
