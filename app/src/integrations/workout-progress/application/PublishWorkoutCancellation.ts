import type { WorkoutSession } from "../../../features/workout/models/WorkoutSession";
import {
  createWorkoutProgressEvent,
  createWorkoutProgressMetadata,
  type WorkoutProgressResult,
} from "../models";
import { mapWorkoutSessionToCancellationPayload } from "../mappers";
import type { WorkoutProgressPublisher } from "../publishers";
import { publishWorkoutProgress } from "./PublishWorkoutProgress";

export interface PublishWorkoutCancellationOptions {
  readonly publisher: WorkoutProgressPublisher;
  readonly session: WorkoutSession;
  readonly correlationId: string;
  readonly eventId: string;
  readonly cancelledAt: string;
  readonly publishedAt: string;
  readonly athleteId?: string | null;
}

export async function publishWorkoutCancellation(
  options: PublishWorkoutCancellationOptions,
): Promise<WorkoutProgressResult> {
  const payload = mapWorkoutSessionToCancellationPayload(
    options.session,
    options.cancelledAt,
  );

  const event = createWorkoutProgressEvent({
    id: options.eventId,
    type: "WorkoutCancelled",
    occurredAt: options.cancelledAt,
    metadata: createWorkoutProgressMetadata({
      source: "workout",
      correlationId: options.correlationId,
      sessionId: options.session.id,
      workoutId: options.session.workoutId,
      athleteId: options.athleteId ?? null,
      publishedAt: options.publishedAt,
    }),
    payload,
  });

  return publishWorkoutProgress({ publisher: options.publisher, event });
}
