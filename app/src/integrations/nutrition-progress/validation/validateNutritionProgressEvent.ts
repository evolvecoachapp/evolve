import { isNutritionProgressEventType } from "../events";
import type { NutritionProgressEvent } from "../models";
import {
  NutritionProgressValidationError,
  type NutritionProgressValidationCode,
} from "./NutritionProgressValidationError";

export interface ValidateNutritionProgressEventOptions {
  readonly event: NutritionProgressEvent | null | undefined;
  readonly publishedEventIds?: readonly string[];
}

function fail(
  code: NutritionProgressValidationCode,
  message: string,
): never {
  throw new NutritionProgressValidationError(message, code);
}

export function validateNutritionProgressEvent(
  options: ValidateNutritionProgressEventOptions,
): void {
  const { event, publishedEventIds = [] } = options;

  if (!event) {
    fail("missing_event", "Nutrition progress event is required.");
  }

  if (!event.id?.trim()) {
    fail("invalid_payload", "Nutrition progress event id is required.");
  }

  if (publishedEventIds.includes(event.id)) {
    fail("duplicate_event_id", `Duplicate nutrition progress event id: ${event.id}.`);
  }

  if (!isNutritionProgressEventType(event.type)) {
    fail("unsupported_event_type", `Unsupported nutrition progress event type: ${event.type}.`);
  }

  if (!event.metadata) {
    fail("missing_metadata", "Nutrition progress metadata is required.");
  }

  if (event.metadata.source !== "nutrition") {
    fail("missing_metadata", "Nutrition progress metadata source must be nutrition.");
  }

  if (!event.metadata.dayId?.trim()) {
    fail("missing_metadata", "Nutrition progress metadata dayId is required.");
  }

  if (!event.metadata.correlationId?.trim()) {
    fail("missing_metadata", "Nutrition progress metadata correlationId is required.");
  }

  if (!event.metadata.publishedAt?.trim()) {
    fail("missing_metadata", "Nutrition progress metadata publishedAt is required.");
  }

  if (!event.payload) {
    fail("invalid_payload", "Nutrition progress payload is required.");
  }

  if (!event.payload.dayId?.trim()) {
    fail("invalid_payload", "Nutrition progress payload dayId is required.");
  }

  if (event.payload.dayId !== event.metadata.dayId) {
    fail(
      "invalid_payload",
      "Nutrition progress payload dayId must match metadata dayId.",
    );
  }

  if (!event.occurredAt?.trim()) {
    fail("invalid_payload", "Nutrition progress occurredAt is required.");
  }
}
