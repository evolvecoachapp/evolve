/**
 * Observational insight categories (domain facts only).
 */
export const InsightCategories = {
  SESSION: "session",
  VOLUME: "volume",
  INTENSITY: "intensity",
  DENSITY: "density",
  COMPLETION: "completion",
  GRADE: "grade",
  PERSONAL_RECORD: "personal_record",
  ACHIEVEMENT_COUNT: "achievement_count",
  FATIGUE: "fatigue",
  LOAD: "load",
  FREQUENCY: "frequency",
  RECOVERY_STATUS: "recovery_status",
  RECOVERY_WINDOW: "recovery_window",
  HISTORY_VOLUME: "history_volume",
  HISTORY_COMPOSITION: "history_composition",
  AGGREGATE: "aggregate",
  NUTRITION: "nutrition",
  SLEEP: "sleep",
  BODYWEIGHT: "bodyweight",
  GOAL: "goal",
  COACH: "coach",
} as const;

export type InsightCategory =
  (typeof InsightCategories)[keyof typeof InsightCategories];
