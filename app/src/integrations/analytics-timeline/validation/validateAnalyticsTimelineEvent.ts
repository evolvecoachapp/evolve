import {
  isGoalAnalyticsTimelineEventType,
  isNutritionAnalyticsTimelineEventType,
  isRecoveryAnalyticsTimelineEventType,
  isWorkoutAnalyticsTimelineEventType,
} from "../events";
import type { AnalyticsTimelineEvent } from "../models";
import {
  AnalyticsTimelineValidationError,
  type AnalyticsTimelineValidationCode,
} from "./AnalyticsTimelineValidationError";

export interface ValidateAnalyticsTimelineEventOptions {
  readonly event: AnalyticsTimelineEvent | null | undefined;
  readonly projectedEventIds?: readonly string[];
}

function fail(
  code: AnalyticsTimelineValidationCode,
  message: string,
): never {
  throw new AnalyticsTimelineValidationError(message, code);
}

function validateMetadata(
  source: AnalyticsTimelineEvent["source"],
  metadata: AnalyticsTimelineEvent["event"]["metadata"],
): void {
  if (!metadata) {
    fail("missing_metadata", "Analytics timeline metadata is required.");
  }

  if (metadata.source !== source) {
    fail(
      "missing_metadata",
      `Analytics timeline metadata source must be ${source}.`,
    );
  }

  if (!metadata.correlationId?.trim()) {
    fail(
      "missing_metadata",
      "Analytics timeline metadata correlationId is required.",
    );
  }

  if (!metadata.publishedAt?.trim()) {
    fail(
      "missing_metadata",
      "Analytics timeline metadata publishedAt is required.",
    );
  }
}

function validateEventType(event: AnalyticsTimelineEvent): void {
  const eventType = event.event.eventType;

  switch (event.source) {
    case "workout":
      if (!isWorkoutAnalyticsTimelineEventType(eventType)) {
        fail(
          "unsupported_event_type",
          `Unsupported workout analytics timeline event type: ${eventType}.`,
        );
      }
      return;
    case "nutrition":
      if (!isNutritionAnalyticsTimelineEventType(eventType)) {
        fail(
          "unsupported_event_type",
          `Unsupported nutrition analytics timeline event type: ${eventType}.`,
        );
      }
      return;
    case "recovery":
      if (!isRecoveryAnalyticsTimelineEventType(eventType)) {
        fail(
          "unsupported_event_type",
          `Unsupported recovery analytics timeline event type: ${eventType}.`,
        );
      }
      return;
    case "goal":
      if (!isGoalAnalyticsTimelineEventType(eventType)) {
        fail(
          "unsupported_event_type",
          `Unsupported goal analytics timeline event type: ${eventType}.`,
        );
      }
      return;
  }
}

export function validateAnalyticsTimelineEvent(
  options: ValidateAnalyticsTimelineEventOptions,
): void {
  const { event, projectedEventIds = [] } = options;

  if (!event) {
    fail("missing_event", "Analytics timeline event is required.");
  }

  if (!event.event?.eventId?.trim()) {
    fail("invalid_payload", "Analytics timeline eventId is required.");
  }

  if (projectedEventIds.includes(event.event.eventId)) {
    fail(
      "duplicate_event_id",
      `Duplicate analytics timeline event id: ${event.event.eventId}.`,
    );
  }

  if (!event.event.occurredAt?.trim()) {
    fail("invalid_payload", "Analytics timeline occurredAt is required.");
  }

  validateMetadata(event.source, event.event.metadata);
  validateEventType(event);

  if (!event.event.metadata.athleteId?.trim()) {
    fail("missing_athlete_id", "Analytics timeline athleteId is required.");
  }
}
