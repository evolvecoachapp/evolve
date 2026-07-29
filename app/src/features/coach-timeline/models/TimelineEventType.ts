export const TimelineEventTypes = {
  WORKOUT_COMPLETED: "workout_completed",
  WORKOUT_SKIPPED: "workout_skipped",
  PERSONAL_RECORD: "personal_record",
  GOAL_REACHED: "goal_reached",
  GOAL_UPDATED: "goal_updated",
  WEIGHT_UPDATED: "weight_updated",
  MEASUREMENT_UPDATED: "measurement_updated",
  RECOVERY_COMPLETED: "recovery_completed",
  RECOVERY_MISSED: "recovery_missed",
  NUTRITION_COMPLETED: "nutrition_completed",
  NUTRITION_MISSED: "nutrition_missed",
  COACH_INSIGHT: "coach_insight",
  COACH_RECOMMENDATION: "coach_recommendation",
  REMINDER_CREATED: "reminder_created",
  REMINDER_COMPLETED: "reminder_completed",
  NOTIFICATION_DISMISSED: "notification_dismissed",
  PROFILE_UPDATED: "profile_updated",
  ACHIEVEMENT_UNLOCKED: "achievement_unlocked",
  SYNCHRONIZATION_COMPLETED: "synchronization_completed",
  CUSTOM: "custom",
} as const;

export type TimelineEventType = (typeof TimelineEventTypes)[keyof typeof TimelineEventTypes];
