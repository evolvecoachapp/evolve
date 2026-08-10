import type { ProgressAnalyticsService } from "../../../features/progress-analytics/services/ProgressAnalyticsService";
import type { RecoveryProgressPublisher } from "../publishers/RecoveryProgressPublisher";
import { RecoveryProgressPublisherImpl } from "../publishers";
import { RecoveryProgressSubscriber } from "../subscribers";

export interface RecoveryProgressIntegration {
  readonly publisher: RecoveryProgressPublisher;
  readonly subscriber: RecoveryProgressSubscriber;
}

export interface CreateRecoveryProgressIntegrationOptions {
  readonly progressAnalyticsService: ProgressAnalyticsService;
}

export function createRecoveryProgressIntegration(
  options: CreateRecoveryProgressIntegrationOptions,
): RecoveryProgressIntegration {
  const subscriber = new RecoveryProgressSubscriber(
    options.progressAnalyticsService,
  );
  const publisher = new RecoveryProgressPublisherImpl([subscriber]);

  return Object.freeze({
    publisher,
    subscriber,
  });
}
