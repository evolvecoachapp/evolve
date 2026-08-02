import { isWorkoutProgressEventType } from "../events";
import type { WorkoutProgressEvent } from "../models";
import {
  WorkoutProgressValidationError,
  type WorkoutProgressValidationCode,
} from "./WorkoutProgressValidationError";

export interface ValidateWorkoutProgressEventOptions {
  readonly event: WorkoutProgressEvent | null | undefined;
  readonly publishedEventIds?: readonly string[];
}

function fail(
  code: WorkoutProgressValidationCode,
  message: string,
): never {
  throw new WorkoutProgressValidationError(message, code);
}

export function validateWorkoutProgressEvent(
  options: ValidateWorkoutProgressEventOptions,
): void {
  const { event, publishedEventIds = [] } = options;

  if (!event) {
    fail("missing_event", "Workout progress event is required.");
  }

  if (!event.id?.trim()) {
    fail("invalid_payload", "Workout progress event id is required.");
  }

  if (publishedEventIds.includes(event.id)) {
    fail("duplicate_event_id", `Duplicate workout progress event id: ${event.id}.`);
  }

  if (!isWorkoutProgressEventType(event.type)) {
    fail("unsupported_event_type", `Unsupported workout progress event type: ${event.type}.`);
  }

  if (!event.metadata) {
    fail("missing_metadata", "Workout progress metadata is required.");
  }

  if (event.metadata.source !== "workout") {
    fail("missing_metadata", "Workout progress metadata source must be workout.");
  }

  if (!event.metadata.sessionId?.trim()) {
    fail("missing_metadata", "Workout progress metadata sessionId is required.");
  }

  if (!event.metadata.correlationId?.trim()) {
    fail("missing_metadata", "Workout progress metadata correlationId is required.");
  }

  if (!event.metadata.publishedAt?.trim()) {
    fail("missing_metadata", "Workout progress metadata publishedAt is required.");
  }

  if (!event.payload) {
    fail("invalid_payload", "Workout progress payload is required.");
  }

  if (!event.payload.sessionId?.trim()) {
    fail("invalid_payload", "Workout progress payload sessionId is required.");
  }

  if (event.payload.sessionId !== event.metadata.sessionId) {
    fail(
      "invalid_payload",
      "Workout progress payload sessionId must match metadata sessionId.",
    );
  }

  if (!event.occurredAt?.trim()) {
    fail("invalid_payload", "Workout progress occurredAt is required.");
  }
}
