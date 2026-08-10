import { createAppendRequest } from "../../../features/coach-timeline/builders/createAppendRequest";
import { CoachTimelineEventCategories } from "../../../features/coach-timeline/models/CoachTimelineEvent";
import type { AppendTimelineEntryRequest } from "../../../features/coach-timeline/models/AppendTimelineEntryRequest";
import type { WorkoutProgressIngestDto } from "../../../features/progress-analytics/services/ProgressAnalyticsService";

function resolveWorkoutCategory(
  eventType: WorkoutProgressIngestDto["eventType"],
): typeof CoachTimelineEventCategories.WORKOUT_CREATED | typeof CoachTimelineEventCategories.WORKOUT_MODIFIED | typeof CoachTimelineEventCategories.SYSTEM_EVENT {
  switch (eventType) {
    case "WorkoutCompleted":
    case "WorkoutStarted":
    case "PersonalRecordAchieved":
      return CoachTimelineEventCategories.WORKOUT_CREATED;
    case "WorkoutVolumeUpdated":
    case "ExerciseCompleted":
    case "SetCompleted":
      return CoachTimelineEventCategories.WORKOUT_MODIFIED;
    default:
      return CoachTimelineEventCategories.SYSTEM_EVENT;
  }
}

function buildWorkoutSummary(event: WorkoutProgressIngestDto): string {
  const title = event.payload.workoutTitle ?? event.payload.sessionId;

  switch (event.eventType) {
    case "WorkoutCompleted":
      return `Workout completed: ${title}`;
    case "PersonalRecordAchieved":
      return `Personal record achieved: ${event.payload.exerciseName ?? title}`;
    case "WorkoutVolumeUpdated":
      return `Workout volume updated: ${title}`;
    default:
      return `Workout analytics: ${event.eventType}`;
  }
}

function buildWorkoutExplanation(event: WorkoutProgressIngestDto): string {
  if (event.eventType === "PersonalRecordAchieved") {
    return `Progress analytics recorded a personal record for ${event.payload.exerciseName ?? "exercise"}.`;
  }

  if (event.eventType === "WorkoutCompleted") {
    const duration = event.payload.durationMinutes;
    const volume = event.payload.volumeKg;
    return `Progress analytics recorded workout completion (${duration ?? "n/a"} min, ${volume ?? "n/a"} kg volume).`;
  }

  return `Progress analytics recorded ${event.eventType} for session ${event.payload.sessionId}.`;
}

export function mapWorkoutProgressIngestToTimelineRequest(
  event: WorkoutProgressIngestDto,
): AppendTimelineEntryRequest {
  const athleteId = event.metadata.athleteId ?? "unknown-athlete";
  const category = resolveWorkoutCategory(event.eventType);

  return createAppendRequest({
    id: `tl:analytics:workout:${event.eventId}`,
    athleteId,
    category,
    summary: buildWorkoutSummary(event),
    explanation: buildWorkoutExplanation(event),
    reason: `Progress analytics projected ${event.eventType}`,
    impact:
      category === CoachTimelineEventCategories.WORKOUT_CREATED
        ? "Athlete workout activity recorded"
        : "Athlete workout metrics updated",
    expectedOutcome: "Coach timeline reflects latest workout analytics",
    affectedDomain: "workout",
    sessionId: event.payload.sessionId,
    createdAt: event.occurredAt,
    metadata: Object.freeze({
      analyticsEventId: event.eventId,
      analyticsEventType: event.eventType,
      sessionId: event.payload.sessionId,
      correlationId: event.metadata.correlationId,
      source: "progress-analytics",
    }),
  });
}
