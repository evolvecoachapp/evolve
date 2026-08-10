import { isGoalProgressEventType } from "../events";
import type { GoalProgressEvent } from "../models";
import {
  GoalProgressValidationError,
  type GoalProgressValidationCode,
} from "./GoalProgressValidationError";

export interface ValidateGoalProgressEventOptions {
  readonly event: GoalProgressEvent | null | undefined;
  readonly publishedEventIds?: readonly string[];
}

function fail(
  code: GoalProgressValidationCode,
  message: string,
): never {
  throw new GoalProgressValidationError(message, code);
}

export function validateGoalProgressEvent(
  options: ValidateGoalProgressEventOptions,
): void {
  const { event, publishedEventIds = [] } = options;

  if (!event) {
    fail("missing_event", "Goal progress event is required.");
  }

  if (!event.id?.trim()) {
    fail("invalid_payload", "Goal progress event id is required.");
  }

  if (publishedEventIds.includes(event.id)) {
    fail("duplicate_event_id", `Duplicate goal progress event id: ${event.id}.`);
  }

  if (!isGoalProgressEventType(event.type)) {
    fail("unsupported_event_type", `Unsupported goal progress event type: ${event.type}.`);
  }

  if (!event.metadata) {
    fail("missing_metadata", "Goal progress metadata is required.");
  }

  if (event.metadata.source !== "goal") {
    fail("missing_metadata", "Goal progress metadata source must be goal.");
  }

  if (!event.metadata.goalId?.trim()) {
    fail("missing_metadata", "Goal progress metadata goalId is required.");
  }

  if (!event.metadata.correlationId?.trim()) {
    fail("missing_metadata", "Goal progress metadata correlationId is required.");
  }

  if (!event.metadata.publishedAt?.trim()) {
    fail("missing_metadata", "Goal progress metadata publishedAt is required.");
  }

  if (!event.payload) {
    fail("invalid_payload", "Goal progress payload is required.");
  }

  if (!event.payload.goalId?.trim()) {
    fail("invalid_payload", "Goal progress payload goalId is required.");
  }

  if (event.payload.goalId !== event.metadata.goalId) {
    fail(
      "invalid_payload",
      "Goal progress payload goalId must match metadata goalId.",
    );
  }

  if (!event.occurredAt?.trim()) {
    fail("invalid_payload", "Goal progress occurredAt is required.");
  }
}
