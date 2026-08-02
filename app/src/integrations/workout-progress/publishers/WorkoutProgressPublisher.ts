import type { WorkoutProgressEvent } from "../models";
import type { WorkoutProgressResult } from "../models/WorkoutProgressResult";

/** Contract for workout progress event subscribers. */
export interface WorkoutProgressEventSubscriber {
  readonly id: string;
  onEvent(event: WorkoutProgressEvent): Promise<WorkoutProgressResult["subscriberResults"][number]>;
}

export interface WorkoutProgressPublisher {
  readonly id: string;
  publish(event: WorkoutProgressEvent): Promise<WorkoutProgressResult>;
  getPublishedEventIds(): readonly string[];
}
