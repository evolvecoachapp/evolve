import type { GoalSnapshot } from "../../../features/goal-progress/models/GoalSnapshot";
import {
  createGoalProgressEvent,
  createGoalProgressMetadata,
  type GoalProgressResult,
} from "../models";
import { mapGoalSnapshotToCompletedPayload } from "../mappers";
import type { GoalProgressPublisher } from "../publishers";
import { publishGoalProgress } from "./PublishGoalProgress";

export interface PublishGoalCompletedOptions {
  readonly publisher: GoalProgressPublisher;
  readonly snapshot: GoalSnapshot;
  readonly goalId: string;
  readonly correlationId: string;
  readonly eventId: string;
  readonly publishedAt: string;
  readonly athleteId?: string | null;
}

export async function publishGoalCompleted(
  options: PublishGoalCompletedOptions,
): Promise<GoalProgressResult> {
  const payload = mapGoalSnapshotToCompletedPayload(
    options.snapshot,
    options.goalId,
  );

  const event = createGoalProgressEvent({
    id: options.eventId,
    type: "GoalCompleted",
    occurredAt: options.snapshot.createdAt,
    metadata: createGoalProgressMetadata({
      source: "goal",
      correlationId: options.correlationId,
      goalId: options.goalId,
      snapshotId: options.snapshot.id,
      athleteId: options.athleteId ?? options.snapshot.athleteId ?? null,
      publishedAt: options.publishedAt,
    }),
    payload,
  });

  return publishGoalProgress({ publisher: options.publisher, event });
}
