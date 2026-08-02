/** Result returned by a workout progress subscriber. */
export interface WorkoutProgressSubscriberResult {
  readonly subscriberId: string;
  readonly accepted: boolean;
  readonly appliedAt: string;
}

export function createWorkoutProgressSubscriberResult(
  input: WorkoutProgressSubscriberResult,
): WorkoutProgressSubscriberResult {
  return Object.freeze({ ...input });
}

/** Result returned when a workout progress event is published. */
export interface WorkoutProgressResult {
  readonly eventId: string;
  readonly accepted: boolean;
  readonly publishedAt: string;
  readonly subscriberResults: readonly WorkoutProgressSubscriberResult[];
}

export function createWorkoutProgressResult(
  input: WorkoutProgressResult,
): WorkoutProgressResult {
  return Object.freeze({
    ...input,
    subscriberResults: Object.freeze([...input.subscriberResults]),
  });
}
