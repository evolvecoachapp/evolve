import type { GoalMilestone } from "../../../features/goal-progress/models/GoalMilestone";
import {
  createGoalProgressEvent,
  createGoalProgressMetadata,
  type GoalProgressResult,
} from "../models";
import { mapGoalMilestoneToReachedPayload } from "../mappers";
import type { GoalProgressPublisher } from "../publishers";
import { publishGoalProgress } from "./PublishGoalProgress";

export interface PublishGoalMilestoneReachedOptions {
  readonly publisher: GoalProgressPublisher;
  readonly milestone: GoalMilestone;
  readonly goalId: string;
  readonly correlationId: string;
  readonly eventId: string;
  readonly occurredAt: string;
  readonly publishedAt: string;
  readonly athleteId?: string | null;
}

export async function publishGoalMilestoneReached(
  options: PublishGoalMilestoneReachedOptions,
): Promise<GoalProgressResult> {
  const payload = mapGoalMilestoneToReachedPayload(
    options.milestone,
    options.goalId,
  );

  const event = createGoalProgressEvent({
    id: options.eventId,
    type: "GoalMilestoneReached",
    occurredAt: options.occurredAt,
    metadata: createGoalProgressMetadata({
      source: "goal",
      correlationId: options.correlationId,
      goalId: options.goalId,
      snapshotId: null,
      athleteId: options.athleteId ?? null,
      publishedAt: options.publishedAt,
    }),
    payload,
  });

  return publishGoalProgress({ publisher: options.publisher, event });
}
