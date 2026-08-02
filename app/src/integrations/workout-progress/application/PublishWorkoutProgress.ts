import type { WorkoutProgressPublisher } from "../publishers";
import type { WorkoutProgressEvent, WorkoutProgressResult } from "../models";

export interface PublishWorkoutProgressOptions {
  readonly publisher: WorkoutProgressPublisher;
  readonly event: WorkoutProgressEvent;
}

export async function publishWorkoutProgress(
  options: PublishWorkoutProgressOptions,
): Promise<WorkoutProgressResult> {
  return options.publisher.publish(options.event);
}
