import type { AppendTimelineEntryRequest } from "../../../features/coach-timeline/models/AppendTimelineEntryRequest";
import type { AnalyticsTimelineEvent } from "../models";
import { mapGoalProgressIngestToTimelineRequest } from "./mapGoalProgressIngestToTimelineRequest";
import { mapNutritionProgressIngestToTimelineRequest } from "./mapNutritionProgressIngestToTimelineRequest";
import { mapRecoveryProgressIngestToTimelineRequest } from "./mapRecoveryProgressIngestToTimelineRequest";
import { mapWorkoutProgressIngestToTimelineRequest } from "./mapWorkoutProgressIngestToTimelineRequest";

/** Routes immutable analytics events to domain-specific timeline mappers. */
export function mapAnalyticsEventToTimelineRequest(
  analyticsEvent: AnalyticsTimelineEvent,
): AppendTimelineEntryRequest {
  switch (analyticsEvent.source) {
    case "workout":
      return mapWorkoutProgressIngestToTimelineRequest(analyticsEvent.event);
    case "nutrition":
      return mapNutritionProgressIngestToTimelineRequest(analyticsEvent.event);
    case "recovery":
      return mapRecoveryProgressIngestToTimelineRequest(analyticsEvent.event);
    case "goal":
      return mapGoalProgressIngestToTimelineRequest(analyticsEvent.event);
  }
}
