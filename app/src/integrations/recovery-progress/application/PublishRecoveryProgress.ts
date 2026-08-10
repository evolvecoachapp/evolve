import type { RecoveryProgressPublisher } from "../publishers";
import type { RecoveryProgressEvent, RecoveryProgressResult } from "../models";

export interface PublishRecoveryProgressOptions {
  readonly publisher: RecoveryProgressPublisher;
  readonly event: RecoveryProgressEvent;
}

export async function publishRecoveryProgress(
  options: PublishRecoveryProgressOptions,
): Promise<RecoveryProgressResult> {
  return options.publisher.publish(options.event);
}
