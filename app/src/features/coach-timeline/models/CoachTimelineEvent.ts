/**
 * Categories for Coach Timeline decision-journal events.
 * Not chat history. Not analytics. Coaching reasoning only.
 */
export const CoachTimelineEventCategories = {
  WORKOUT_CREATED: "WORKOUT_CREATED",
  WORKOUT_MODIFIED: "WORKOUT_MODIFIED",
  WORKOUT_RESTORED: "WORKOUT_RESTORED",
  NUTRITION_CREATED: "NUTRITION_CREATED",
  NUTRITION_MODIFIED: "NUTRITION_MODIFIED",
  NUTRITION_RESTORED: "NUTRITION_RESTORED",
  GOAL_CHANGED: "GOAL_CHANGED",
  GOAL_PROGRESS: "GOAL_PROGRESS",
  RECOVERY_ADJUSTMENT: "RECOVERY_ADJUSTMENT",
  FATIGUE_DETECTED: "FATIGUE_DETECTED",
  INJURY_REPORTED: "INJURY_REPORTED",
  PROGRAM_PHASE_CHANGED: "PROGRAM_PHASE_CHANGED",
  COACH_DECISION: "COACH_DECISION",
  USER_REQUEST: "USER_REQUEST",
  SYSTEM_EVENT: "SYSTEM_EVENT",
  UNKNOWN: "UNKNOWN",
} as const;

export type CoachTimelineEventCategory =
  (typeof CoachTimelineEventCategories)[keyof typeof CoachTimelineEventCategories];

export const ALL_COACH_TIMELINE_EVENT_CATEGORIES: readonly CoachTimelineEventCategory[] =
  Object.freeze(Object.values(CoachTimelineEventCategories));

/**
 * Immutable event descriptor embedded in a timeline entry.
 */
export interface CoachTimelineEvent {
  readonly category: CoachTimelineEventCategory;
  readonly label: string;
}
