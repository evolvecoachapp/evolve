import { createAppendRequest } from "../../../features/coach-timeline/builders/createAppendRequest";
import { CoachTimelineEventCategories } from "../../../features/coach-timeline/models/CoachTimelineEvent";
import type { AppendTimelineEntryRequest } from "../../../features/coach-timeline/models/AppendTimelineEntryRequest";
import type { NutritionProgressIngestDto } from "../../../features/progress-analytics/services/ProgressAnalyticsService";

function resolveNutritionCategory(
  eventType: NutritionProgressIngestDto["eventType"],
): typeof CoachTimelineEventCategories.NUTRITION_CREATED | typeof CoachTimelineEventCategories.NUTRITION_MODIFIED | typeof CoachTimelineEventCategories.SYSTEM_EVENT {
  switch (eventType) {
    case "NutritionDayStarted":
    case "DailyNutritionCompleted":
    case "NutritionGoalAchieved":
      return CoachTimelineEventCategories.NUTRITION_CREATED;
    case "MealLogged":
    case "MealRemoved":
    case "HydrationLogged":
    case "MacroTargetUpdated":
    case "NutritionAdherenceUpdated":
      return CoachTimelineEventCategories.NUTRITION_MODIFIED;
    default:
      return CoachTimelineEventCategories.SYSTEM_EVENT;
  }
}

function buildNutritionSummary(event: NutritionProgressIngestDto): string {
  switch (event.eventType) {
    case "MealLogged":
      return `Meal logged: ${event.payload.mealName ?? event.payload.dayId}`;
    case "DailyNutritionCompleted":
      return `Daily nutrition completed: ${event.payload.dayId}`;
    case "NutritionGoalAchieved":
      return `Nutrition goal achieved: ${event.payload.dayId}`;
    default:
      return `Nutrition analytics: ${event.eventType}`;
  }
}

function buildNutritionExplanation(event: NutritionProgressIngestDto): string {
  if (event.eventType === "MealLogged") {
    return `Progress analytics recorded meal ${event.payload.mealName ?? event.payload.mealId ?? "entry"}.`;
  }

  return `Progress analytics recorded ${event.eventType} for day ${event.payload.dayId}.`;
}

export function mapNutritionProgressIngestToTimelineRequest(
  event: NutritionProgressIngestDto,
): AppendTimelineEntryRequest {
  const athleteId = event.metadata.athleteId ?? "unknown-athlete";
  const category = resolveNutritionCategory(event.eventType);

  return createAppendRequest({
    id: `tl:analytics:nutrition:${event.eventId}`,
    athleteId,
    category,
    summary: buildNutritionSummary(event),
    explanation: buildNutritionExplanation(event),
    reason: `Progress analytics projected ${event.eventType}`,
    impact:
      category === CoachTimelineEventCategories.NUTRITION_CREATED
        ? "Athlete nutrition activity recorded"
        : "Athlete nutrition metrics updated",
    expectedOutcome: "Coach timeline reflects latest nutrition analytics",
    affectedDomain: "nutrition",
    createdAt: event.occurredAt,
    metadata: Object.freeze({
      analyticsEventId: event.eventId,
      analyticsEventType: event.eventType,
      dayId: event.payload.dayId,
      correlationId: event.metadata.correlationId,
      source: "progress-analytics",
    }),
  });
}
