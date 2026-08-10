import type { ProgressAnalyticsService } from "../../../features/progress-analytics/services/ProgressAnalyticsService";
import { mapPayloadToProgressAnalyticsDto } from "../mappers";
import {
  createRecoveryProgressSubscriberResult,
  type RecoveryProgressEvent,
} from "../models";
import type { RecoveryProgressEventSubscriber } from "../publishers/RecoveryProgressPublisher";

/** Consumes recovery progress events through the Progress Analytics service contract. */
export class RecoveryProgressSubscriber implements RecoveryProgressEventSubscriber {
  readonly id = "recovery-progress-subscriber";

  constructor(
    private readonly progressAnalyticsService: ProgressAnalyticsService,
  ) {}

  async onEvent(event: RecoveryProgressEvent) {
    const dto = mapPayloadToProgressAnalyticsDto(event);
    const result = await this.progressAnalyticsService.applyRecoveryProgressEvent(dto);

    return createRecoveryProgressSubscriberResult({
      subscriberId: this.id,
      accepted: result.accepted,
      appliedAt: result.appliedAt,
    });
  }
}
