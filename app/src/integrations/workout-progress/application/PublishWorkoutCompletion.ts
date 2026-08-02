import type { WorkoutSessionSummary } from "../../../features/workout/types/workoutSessionSummary";
import {
  createWorkoutProgressEvent,
  createWorkoutProgressMetadata,
  type WorkoutProgressResult,
} from "../models";
import { mapWorkoutSessionSummaryToCompletionPayload } from "../mappers";
import type { WorkoutProgressPublisher } from "../publishers";
import { publishWorkoutProgress } from "./PublishWorkoutProgress";

export interface PublishWorkoutCompletionOptions {
  readonly publisher: WorkoutProgressPublisher;
  readonly summary: WorkoutSessionSummary;
  readonly correlationId: string;
  readonly eventId: string;
  readonly publishedAt: string;
  readonly athleteId?: string | null;
}

export async function publishWorkoutCompletion(
  options: PublishWorkoutCompletionOptions,
): Promise<WorkoutProgressResult> {
  const payload = mapWorkoutSessionSummaryToCompletionPayload(options.summary);

  const event = createWorkoutProgressEvent({
    id: options.eventId,
    type: "WorkoutCompleted",
    occurredAt: options.summary.completedAt,
    metadata: createWorkoutProgressMetadata({
      source: "workout",
      correlationId: options.correlationId,
      sessionId: options.summary.sessionId,
      workoutId: null,
      athleteId: options.athleteId ?? null,
      publishedAt: options.publishedAt,
    }),
    payload,
  });

  return publishWorkoutProgress({ publisher: options.publisher, event });
}
