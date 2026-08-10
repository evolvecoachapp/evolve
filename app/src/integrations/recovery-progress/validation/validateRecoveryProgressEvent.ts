import { isRecoveryProgressEventType } from "../events";
import type { RecoveryProgressEvent } from "../models";
import {
  RecoveryProgressValidationError,
  type RecoveryProgressValidationCode,
} from "./RecoveryProgressValidationError";

export interface ValidateRecoveryProgressEventOptions {
  readonly event: RecoveryProgressEvent | null | undefined;
  readonly publishedEventIds?: readonly string[];
}

function fail(
  code: RecoveryProgressValidationCode,
  message: string,
): never {
  throw new RecoveryProgressValidationError(message, code);
}

export function validateRecoveryProgressEvent(
  options: ValidateRecoveryProgressEventOptions,
): void {
  const { event, publishedEventIds = [] } = options;

  if (!event) {
    fail("missing_event", "Recovery progress event is required.");
  }

  if (!event.id?.trim()) {
    fail("invalid_payload", "Recovery progress event id is required.");
  }

  if (publishedEventIds.includes(event.id)) {
    fail("duplicate_event_id", `Duplicate recovery progress event id: ${event.id}.`);
  }

  if (!isRecoveryProgressEventType(event.type)) {
    fail("unsupported_event_type", `Unsupported recovery progress event type: ${event.type}.`);
  }

  if (!event.metadata) {
    fail("missing_metadata", "Recovery progress metadata is required.");
  }

  if (event.metadata.source !== "recovery") {
    fail("missing_metadata", "Recovery progress metadata source must be recovery.");
  }

  if (!event.metadata.dayId?.trim()) {
    fail("missing_metadata", "Recovery progress metadata dayId is required.");
  }

  if (!event.metadata.correlationId?.trim()) {
    fail("missing_metadata", "Recovery progress metadata correlationId is required.");
  }

  if (!event.metadata.publishedAt?.trim()) {
    fail("missing_metadata", "Recovery progress metadata publishedAt is required.");
  }

  if (!event.payload) {
    fail("invalid_payload", "Recovery progress payload is required.");
  }

  if (!event.payload.dayId?.trim()) {
    fail("invalid_payload", "Recovery progress payload dayId is required.");
  }

  if (event.payload.dayId !== event.metadata.dayId) {
    fail(
      "invalid_payload",
      "Recovery progress payload dayId must match metadata dayId.",
    );
  }

  if (!event.occurredAt?.trim()) {
    fail("invalid_payload", "Recovery progress occurredAt is required.");
  }
}
