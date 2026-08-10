import type {
  GoalProgressIngestDto,
  NutritionProgressIngestDto,
  RecoveryProgressIngestDto,
  WorkoutProgressIngestDto,
} from "../../../features/progress-analytics/services/ProgressAnalyticsService";
import type { AnalyticsTimelineSource } from "../events";

/** Immutable Progress Analytics event projected into Coach Timeline. */
export type AnalyticsTimelineEvent =
  | {
      readonly source: "workout";
      readonly event: WorkoutProgressIngestDto;
    }
  | {
      readonly source: "nutrition";
      readonly event: NutritionProgressIngestDto;
    }
  | {
      readonly source: "recovery";
      readonly event: RecoveryProgressIngestDto;
    }
  | {
      readonly source: "goal";
      readonly event: GoalProgressIngestDto;
    };

export function createAnalyticsTimelineEvent(
  input: AnalyticsTimelineEvent,
): AnalyticsTimelineEvent {
  const frozenEvent = Object.freeze({
    ...input.event,
    metadata: Object.freeze({ ...input.event.metadata }),
    payload: Object.freeze({
      ...input.event.payload,
      metrics: Object.freeze([...input.event.payload.metrics]),
    }),
  });

  return Object.freeze({
    source: input.source,
    event: frozenEvent,
  }) as AnalyticsTimelineEvent;
}

export function getAnalyticsTimelineEventId(
  analyticsEvent: AnalyticsTimelineEvent,
): string {
  return analyticsEvent.event.eventId;
}

export function getAnalyticsTimelineEventType(
  analyticsEvent: AnalyticsTimelineEvent,
): string {
  return analyticsEvent.event.eventType;
}

export function getAnalyticsTimelineAthleteId(
  analyticsEvent: AnalyticsTimelineEvent,
): string | null {
  return analyticsEvent.event.metadata.athleteId;
}

export function resolveAnalyticsTimelineSource(
  source: AnalyticsTimelineSource,
  event:
    | WorkoutProgressIngestDto
    | NutritionProgressIngestDto
    | RecoveryProgressIngestDto
    | GoalProgressIngestDto,
): AnalyticsTimelineEvent {
  switch (source) {
    case "workout":
      return createAnalyticsTimelineEvent({
        source: "workout",
        event: event as WorkoutProgressIngestDto,
      });
    case "nutrition":
      return createAnalyticsTimelineEvent({
        source: "nutrition",
        event: event as NutritionProgressIngestDto,
      });
    case "recovery":
      return createAnalyticsTimelineEvent({
        source: "recovery",
        event: event as RecoveryProgressIngestDto,
      });
    case "goal":
      return createAnalyticsTimelineEvent({
        source: "goal",
        event: event as GoalProgressIngestDto,
      });
  }
}
