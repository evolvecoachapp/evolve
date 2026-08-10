import { createAppendRequest } from "../../../features/coach-timeline/builders/createAppendRequest";
import { CoachTimelineEventCategories } from "../../../features/coach-timeline/models/CoachTimelineEvent";
import type { AppendTimelineEntryRequest } from "../../../features/coach-timeline/models/AppendTimelineEntryRequest";
import type { RecoveryProgressIngestDto } from "../../../features/progress-analytics/services/ProgressAnalyticsService";

function resolveRecoveryCategory(
  eventType: RecoveryProgressIngestDto["eventType"],
): typeof CoachTimelineEventCategories.RECOVERY_ADJUSTMENT | typeof CoachTimelineEventCategories.FATIGUE_DETECTED | typeof CoachTimelineEventCategories.SYSTEM_EVENT {
  switch (eventType) {
    case "FatigueUpdated":
      return CoachTimelineEventCategories.FATIGUE_DETECTED;
    case "RecoveryAssessed":
    case "ReadinessUpdated":
    case "SleepLogged":
    case "StressUpdated":
    case "HRVLogged":
    case "RecoveryGoalAchieved":
      return CoachTimelineEventCategories.RECOVERY_ADJUSTMENT;
    default:
      return CoachTimelineEventCategories.SYSTEM_EVENT;
  }
}

function buildRecoverySummary(event: RecoveryProgressIngestDto): string {
  switch (event.eventType) {
    case "RecoveryAssessed":
      return `Recovery assessed: ${event.payload.dayId}`;
    case "ReadinessUpdated":
      return `Readiness updated: ${event.payload.readinessLabel ?? event.payload.dayId}`;
    case "FatigueUpdated":
      return `Fatigue updated: ${event.payload.fatigueLabel ?? event.payload.dayId}`;
    case "SleepLogged":
      return `Sleep logged: ${event.payload.dayId}`;
    default:
      return `Recovery analytics: ${event.eventType}`;
  }
}

function buildRecoveryExplanation(event: RecoveryProgressIngestDto): string {
  if (event.payload.recoveryScore != null) {
    return `Progress analytics recorded recovery score ${event.payload.recoveryScore}.`;
  }

  return `Progress analytics recorded ${event.eventType} for day ${event.payload.dayId}.`;
}

export function mapRecoveryProgressIngestToTimelineRequest(
  event: RecoveryProgressIngestDto,
): AppendTimelineEntryRequest {
  const athleteId = event.metadata.athleteId ?? "unknown-athlete";
  const category = resolveRecoveryCategory(event.eventType);

  return createAppendRequest({
    id: `tl:analytics:recovery:${event.eventId}`,
    athleteId,
    category,
    summary: buildRecoverySummary(event),
    explanation: buildRecoveryExplanation(event),
    reason: `Progress analytics projected ${event.eventType}`,
    impact:
      category === CoachTimelineEventCategories.FATIGUE_DETECTED
        ? "Athlete fatigue signal recorded"
        : "Athlete recovery metrics updated",
    expectedOutcome: "Coach timeline reflects latest recovery analytics",
    affectedDomain: "recovery",
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
