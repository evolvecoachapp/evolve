import type {
  GoalProgressIngestEventType,
  NutritionProgressIngestEventType,
  RecoveryProgressIngestEventType,
  WorkoutProgressIngestEventType,
} from "../../../features/progress-analytics/services/ProgressAnalyticsService";

export type AnalyticsTimelineSource =
  | "workout"
  | "nutrition"
  | "recovery"
  | "goal";

export type AnalyticsTimelineEventType =
  | WorkoutProgressIngestEventType
  | NutritionProgressIngestEventType
  | RecoveryProgressIngestEventType
  | GoalProgressIngestEventType;

export const WORKOUT_ANALYTICS_TIMELINE_EVENT_TYPES = Object.freeze([
  "WorkoutStarted",
  "WorkoutCompleted",
  "WorkoutCancelled",
  "WorkoutSkipped",
  "ExerciseCompleted",
  "SetCompleted",
  "PersonalRecordAchieved",
  "WorkoutVolumeUpdated",
] as const satisfies readonly WorkoutProgressIngestEventType[]);

export const NUTRITION_ANALYTICS_TIMELINE_EVENT_TYPES = Object.freeze([
  "NutritionDayStarted",
  "MealLogged",
  "MealRemoved",
  "DailyNutritionCompleted",
  "HydrationLogged",
  "MacroTargetUpdated",
  "NutritionGoalAchieved",
  "NutritionAdherenceUpdated",
] as const satisfies readonly NutritionProgressIngestEventType[]);

export const RECOVERY_ANALYTICS_TIMELINE_EVENT_TYPES = Object.freeze([
  "RecoveryDayStarted",
  "RecoveryAssessed",
  "SleepLogged",
  "StressUpdated",
  "ReadinessUpdated",
  "HRVLogged",
  "FatigueUpdated",
  "RecoveryGoalAchieved",
] as const satisfies readonly RecoveryProgressIngestEventType[]);

export const GOAL_ANALYTICS_TIMELINE_EVENT_TYPES = Object.freeze([
  "GoalTrackingStarted",
  "GoalProgressUpdated",
  "GoalMilestoneReached",
  "GoalTargetUpdated",
  "GoalCompleted",
  "GoalDeviationDetected",
  "GoalAdherenceUpdated",
  "GoalAchieved",
] as const satisfies readonly GoalProgressIngestEventType[]);

export const ALL_ANALYTICS_TIMELINE_EVENT_TYPES = Object.freeze([
  ...WORKOUT_ANALYTICS_TIMELINE_EVENT_TYPES,
  ...NUTRITION_ANALYTICS_TIMELINE_EVENT_TYPES,
  ...RECOVERY_ANALYTICS_TIMELINE_EVENT_TYPES,
  ...GOAL_ANALYTICS_TIMELINE_EVENT_TYPES,
] as const);

export function isAnalyticsTimelineSource(
  value: string,
): value is AnalyticsTimelineSource {
  return (
    value === "workout" ||
    value === "nutrition" ||
    value === "recovery" ||
    value === "goal"
  );
}

export function isWorkoutAnalyticsTimelineEventType(
  value: string,
): value is WorkoutProgressIngestEventType {
  return (WORKOUT_ANALYTICS_TIMELINE_EVENT_TYPES as readonly string[]).includes(
    value,
  );
}

export function isNutritionAnalyticsTimelineEventType(
  value: string,
): value is NutritionProgressIngestEventType {
  return (
    NUTRITION_ANALYTICS_TIMELINE_EVENT_TYPES as readonly string[]
  ).includes(value);
}

export function isRecoveryAnalyticsTimelineEventType(
  value: string,
): value is RecoveryProgressIngestEventType {
  return (
    RECOVERY_ANALYTICS_TIMELINE_EVENT_TYPES as readonly string[]
  ).includes(value);
}

export function isGoalAnalyticsTimelineEventType(
  value: string,
): value is GoalProgressIngestEventType {
  return (GOAL_ANALYTICS_TIMELINE_EVENT_TYPES as readonly string[]).includes(
    value,
  );
}
