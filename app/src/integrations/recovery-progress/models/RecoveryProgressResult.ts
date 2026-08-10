/** Result returned by a recovery progress subscriber. */
export interface RecoveryProgressSubscriberResult {
  readonly subscriberId: string;
  readonly accepted: boolean;
  readonly appliedAt: string;
}

export function createRecoveryProgressSubscriberResult(
  input: RecoveryProgressSubscriberResult,
): RecoveryProgressSubscriberResult {
  return Object.freeze({ ...input });
}

/** Result returned when a recovery progress event is published. */
export interface RecoveryProgressResult {
  readonly eventId: string;
  readonly accepted: boolean;
  readonly publishedAt: string;
  readonly subscriberResults: readonly RecoveryProgressSubscriberResult[];
}

export function createRecoveryProgressResult(
  input: RecoveryProgressResult,
): RecoveryProgressResult {
  return Object.freeze({
    ...input,
    subscriberResults: Object.freeze([...input.subscriberResults]),
  });
}
