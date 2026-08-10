/** Result returned by a goal progress subscriber. */
export interface GoalProgressSubscriberResult {
  readonly subscriberId: string;
  readonly accepted: boolean;
  readonly appliedAt: string;
}

export function createGoalProgressSubscriberResult(
  input: GoalProgressSubscriberResult,
): GoalProgressSubscriberResult {
  return Object.freeze({ ...input });
}

/** Result returned when a goal progress event is published. */
export interface GoalProgressResult {
  readonly eventId: string;
  readonly accepted: boolean;
  readonly publishedAt: string;
  readonly subscriberResults: readonly GoalProgressSubscriberResult[];
}

export function createGoalProgressResult(
  input: GoalProgressResult,
): GoalProgressResult {
  return Object.freeze({
    ...input,
    subscriberResults: Object.freeze([...input.subscriberResults]),
  });
}
