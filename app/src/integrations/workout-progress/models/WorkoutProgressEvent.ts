import type { WorkoutProgressEventType } from "../events";
import type { WorkoutAnalyticsPayload } from "./WorkoutAnalyticsPayload";
import type { WorkoutProgressMetadata } from "./WorkoutProgressMetadata";

/** Immutable workout progress integration event. */
export interface WorkoutProgressEvent {
  readonly id: string;
  readonly type: WorkoutProgressEventType;
  readonly occurredAt: string;
  readonly metadata: WorkoutProgressMetadata;
  readonly payload: WorkoutAnalyticsPayload;
}

export function createWorkoutProgressEvent(
  input: WorkoutProgressEvent,
): WorkoutProgressEvent {
  return Object.freeze({
    ...input,
    metadata: Object.freeze({ ...input.metadata }),
    payload: Object.freeze({
      ...input.payload,
      metrics: Object.freeze([...input.payload.metrics]),
    }),
  });
}
