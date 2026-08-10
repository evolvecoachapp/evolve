import type { GoalProgress as GoalProgressDomain } from "../../../features/goal-progress/models/GoalProgress";
import {
  createGoalProgressEvent,
  createGoalProgressMetadata,
  type GoalProgressResult,
} from "../models";
import { mapGoalProgressToUpdatedPayload } from "../mappers";
import type { GoalProgressPublisher } from "../publishers";
import { publishGoalProgress } from "./PublishGoalProgress";

export interface PublishGoalProgressUpdatedOptions {
  readonly publisher: GoalProgressPublisher;
  readonly progress: GoalProgressDomain;
  readonly goalId: string;
  readonly correlationId: string;
  readonly eventId: string;
  readonly publishedAt: string;
  readonly snapshotId?: string | null;
  readonly athleteId?: string | null;
}

export async function publishGoalProgressUpdated(
  options: PublishGoalProgressUpdatedOptions,
): Promise<GoalProgressResult> {
  const snapshotId = options.snapshotId ?? null;
  const payload = mapGoalProgressToUpdatedPayload(
    options.progress,
    options.goalId,
    snapshotId,
  );

  const event = createGoalProgressEvent({
    id: options.eventId,
    type: "GoalProgressUpdated",
    occurredAt: options.progress.createdAt,
    metadata: createGoalProgressMetadata({
      source: "goal",
      correlationId: options.correlationId,
      goalId: options.goalId,
      snapshotId,
      athleteId: options.athleteId ?? options.progress.athleteId ?? null,
      publishedAt: options.publishedAt,
    }),
    payload,
  });

  return publishGoalProgress({ publisher: options.publisher, event });
}
