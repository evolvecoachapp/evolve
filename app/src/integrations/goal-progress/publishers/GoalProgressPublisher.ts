import type { GoalProgressEvent } from "../models";
import type { GoalProgressResult } from "../models/GoalProgressResult";

/** Contract for goal progress event subscribers. */
export interface GoalProgressEventSubscriber {
  readonly id: string;
  onEvent(event: GoalProgressEvent): Promise<GoalProgressResult["subscriberResults"][number]>;
}

export interface GoalProgressPublisher {
  readonly id: string;
  publish(event: GoalProgressEvent): Promise<GoalProgressResult>;
  getPublishedEventIds(): readonly string[];
}
