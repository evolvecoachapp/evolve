import type { GoalProgressPublisher } from "../publishers";
import type { GoalProgressEvent, GoalProgressResult } from "../models";

export interface PublishGoalProgressOptions {
  readonly publisher: GoalProgressPublisher;
  readonly event: GoalProgressEvent;
}

export async function publishGoalProgress(
  options: PublishGoalProgressOptions,
): Promise<GoalProgressResult> {
  return options.publisher.publish(options.event);
}
