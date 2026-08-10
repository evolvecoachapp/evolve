import { projectAnalyticsEventToTimeline } from "../../../integrations/analytics-timeline/application";
import {
  createAnalyticsTimelineEvent,
  getAnalyticsTimelineEventId,
} from "../../../integrations/analytics-timeline/models";
import type { AnalyticsTimelineProjector } from "../../../integrations/analytics-timeline/projector/AnalyticsTimelineProjector";
import {
  getIngestedGoalProgressEvents,
  getIngestedNutritionProgressEvents,
  getIngestedRecoveryProgressEvents,
  getIngestedWorkoutProgressEvents,
} from "../../progress-analytics/providers/MockProgressAnalyticsService";

export interface ReprojectPendingAnalyticsTimelineOptions {
  readonly athleteId: string;
  readonly projector: AnalyticsTimelineProjector;
}

/** Projects unprojected Progress Analytics ingest events into Coach Timeline. */
export function reprojectPendingAnalyticsTimeline({
  athleteId,
  projector,
}: ReprojectPendingAnalyticsTimelineOptions): void {
  const projectedIds = new Set(projector.getProjectedEventIds());

  const pendingEvents = [
    ...getIngestedWorkoutProgressEvents()
      .filter((event) => event.metadata.athleteId === athleteId)
      .map((event) => createAnalyticsTimelineEvent({ source: "workout", event })),
    ...getIngestedNutritionProgressEvents()
      .filter((event) => event.metadata.athleteId === athleteId)
      .map((event) => createAnalyticsTimelineEvent({ source: "nutrition", event })),
    ...getIngestedRecoveryProgressEvents()
      .filter((event) => event.metadata.athleteId === athleteId)
      .map((event) => createAnalyticsTimelineEvent({ source: "recovery", event })),
    ...getIngestedGoalProgressEvents()
      .filter((event) => event.metadata.athleteId === athleteId)
      .map((event) => createAnalyticsTimelineEvent({ source: "goal", event })),
  ];

  for (const event of pendingEvents) {
    const eventId = getAnalyticsTimelineEventId(event);
    if (projectedIds.has(eventId)) {
      continue;
    }

    try {
      projectAnalyticsEventToTimeline({ projector, event });
      projectedIds.add(eventId);
    } catch {
      // Duplicate or invalid events are ignored during refresh reprojection.
    }
  }
}
