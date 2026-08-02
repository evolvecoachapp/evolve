import type { PersonalRecord } from "../../../features/workout/models/PersonalRecord";
import {
  createWorkoutProgressEvent,
  createWorkoutProgressMetadata,
  type WorkoutProgressResult,
} from "../models";
import { mapWorkoutPersonalRecordToPayload } from "../mappers";
import type { WorkoutProgressPublisher } from "../publishers";
import { publishWorkoutProgress } from "./PublishWorkoutProgress";

export interface PublishPersonalRecordOptions {
  readonly publisher: WorkoutProgressPublisher;
  readonly record: PersonalRecord;
  readonly correlationId: string;
  readonly eventId: string;
  readonly publishedAt: string;
  readonly athleteId?: string | null;
}

export async function publishPersonalRecord(
  options: PublishPersonalRecordOptions,
): Promise<WorkoutProgressResult> {
  const payload = mapWorkoutPersonalRecordToPayload(options.record);

  const event = createWorkoutProgressEvent({
    id: options.eventId,
    type: "PersonalRecordAchieved",
    occurredAt: options.record.achievedAt,
    metadata: createWorkoutProgressMetadata({
      source: "workout",
      correlationId: options.correlationId,
      sessionId: options.record.sessionId,
      workoutId: null,
      athleteId: options.athleteId ?? null,
      publishedAt: options.publishedAt,
    }),
    payload,
  });

  return publishWorkoutProgress({ publisher: options.publisher, event });
}
