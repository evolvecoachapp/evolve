import type { RecoveryProgressEvent } from "../models";
import type { RecoveryProgressResult } from "../models/RecoveryProgressResult";

/** Contract for recovery progress event subscribers. */
export interface RecoveryProgressEventSubscriber {
  readonly id: string;
  onEvent(event: RecoveryProgressEvent): Promise<RecoveryProgressResult["subscriberResults"][number]>;
}

export interface RecoveryProgressPublisher {
  readonly id: string;
  publish(event: RecoveryProgressEvent): Promise<RecoveryProgressResult>;
  getPublishedEventIds(): readonly string[];
}
