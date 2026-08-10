import type { RecoveryProgressEventType } from "../events";
import type { RecoveryAnalyticsPayload } from "./RecoveryAnalyticsPayload";
import type { RecoveryProgressMetadata } from "./RecoveryProgressMetadata";

/** Immutable recovery progress integration event. */
export interface RecoveryProgressEvent {
  readonly id: string;
  readonly type: RecoveryProgressEventType;
  readonly occurredAt: string;
  readonly metadata: RecoveryProgressMetadata;
  readonly payload: RecoveryAnalyticsPayload;
}

export function createRecoveryProgressEvent(
  input: RecoveryProgressEvent,
): RecoveryProgressEvent {
  return Object.freeze({
    ...input,
    metadata: Object.freeze({ ...input.metadata }),
    payload: Object.freeze({
      ...input.payload,
      metrics: Object.freeze([...input.payload.metrics]),
    }),
  });
}
