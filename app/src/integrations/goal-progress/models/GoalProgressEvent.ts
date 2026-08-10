import type { GoalProgressEventType } from "../events";
import type { GoalAnalyticsPayload } from "./GoalAnalyticsPayload";
import type { GoalProgressMetadata } from "./GoalProgressMetadata";

/** Immutable goal progress integration event. */
export interface GoalProgressEvent {
  readonly id: string;
  readonly type: GoalProgressEventType;
  readonly occurredAt: string;
  readonly metadata: GoalProgressMetadata;
  readonly payload: GoalAnalyticsPayload;
}

export function createGoalProgressEvent(
  input: GoalProgressEvent,
): GoalProgressEvent {
  return Object.freeze({
    ...input,
    metadata: Object.freeze({ ...input.metadata }),
    payload: Object.freeze({
      ...input.payload,
      metrics: Object.freeze([...input.payload.metrics]),
    }),
  });
}
