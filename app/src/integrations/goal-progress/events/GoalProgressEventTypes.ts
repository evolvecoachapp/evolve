/** Supported goal progress integration event types — represent only. */
export type GoalProgressEventType =
  | "GoalTrackingStarted"
  | "GoalProgressUpdated"
  | "GoalMilestoneReached"
  | "GoalTargetUpdated"
  | "GoalCompleted"
  | "GoalDeviationDetected"
  | "GoalAdherenceUpdated"
  | "GoalAchieved";

export const GOAL_PROGRESS_EVENT_TYPES: readonly GoalProgressEventType[] =
  Object.freeze([
    "GoalTrackingStarted",
    "GoalProgressUpdated",
    "GoalMilestoneReached",
    "GoalTargetUpdated",
    "GoalCompleted",
    "GoalDeviationDetected",
    "GoalAdherenceUpdated",
    "GoalAchieved",
  ]);

export function isGoalProgressEventType(
  value: string,
): value is GoalProgressEventType {
  return (GOAL_PROGRESS_EVENT_TYPES as readonly string[]).includes(value);
}
