import { createAppendRequest } from "../../../features/coach-timeline/builders/createAppendRequest";
import { CoachTimelineEventCategories } from "../../../features/coach-timeline/models/CoachTimelineEvent";
import type { AppendTimelineEntryRequest } from "../../../features/coach-timeline/models/AppendTimelineEntryRequest";
import type { GoalProgressIngestDto } from "../../../features/progress-analytics/services/ProgressAnalyticsService";

function isGoalChangedEvent(eventType: GoalProgressIngestDto["eventType"]): boolean {
  return (
    eventType === "GoalTrackingStarted" ||
    eventType === "GoalTargetUpdated" ||
    eventType === "GoalCompleted" ||
    eventType === "GoalDeviationDetected" ||
    eventType === "GoalAchieved"
  );
}

function buildGoalSummary(event: GoalProgressIngestDto): string {
  const title = event.payload.title ?? event.payload.goalId;

  switch (event.eventType) {
    case "GoalTrackingStarted":
      return `Goal tracking started: ${title}`;
    case "GoalProgressUpdated":
      return `Goal progress updated: ${title}`;
    case "GoalMilestoneReached":
      return `Goal milestone reached: ${title}`;
    case "GoalTargetUpdated":
      return `Goal target updated: ${title}`;
    case "GoalCompleted":
      return `Goal completed: ${title}`;
    case "GoalDeviationDetected":
      return `Goal deviation detected: ${title}`;
    case "GoalAdherenceUpdated":
      return `Goal adherence updated: ${title}`;
    case "GoalAchieved":
      return `Goal achieved: ${title}`;
  }
}

function buildGoalExplanation(event: GoalProgressIngestDto): string {
  const completion = event.payload.completionPercent;
  const current = event.payload.currentValue;
  const target = event.payload.targetValue;
  const unit = event.payload.unit ?? "";

  if (completion != null) {
    return `Progress analytics recorded ${completion}% completion (${current ?? "n/a"} / ${target ?? "n/a"} ${unit}).`;
  }

  return `Progress analytics recorded ${event.eventType} for goal ${event.payload.goalId}.`;
}

export function mapGoalProgressIngestToTimelineRequest(
  event: GoalProgressIngestDto,
): AppendTimelineEntryRequest {
  const athleteId = event.metadata.athleteId ?? "unknown-athlete";
  const changed = isGoalChangedEvent(event.eventType);

  return createAppendRequest({
    id: `tl:analytics:goal:${event.eventId}`,
    athleteId,
    category: changed
      ? CoachTimelineEventCategories.GOAL_CHANGED
      : CoachTimelineEventCategories.GOAL_PROGRESS,
    summary: buildGoalSummary(event),
    explanation: buildGoalExplanation(event),
    reason: `Progress analytics projected ${event.eventType}`,
    impact: changed
      ? "Athlete goal state changed"
      : "Athlete goal progress updated",
    expectedOutcome: "Coach continues guiding toward the goal",
    affectedDomain: "goal",
    createdAt: event.occurredAt,
    metadata: Object.freeze({
      analyticsEventId: event.eventId,
      analyticsEventType: event.eventType,
      goalId: event.payload.goalId,
      correlationId: event.metadata.correlationId,
      source: "progress-analytics",
    }),
  });
}
