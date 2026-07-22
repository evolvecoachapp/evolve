/**
 * Deterministic insight types.
 * Future types (nutrition, sleep, bodyweight, goal, coach) are reserved
 * so generators can register without redesigning the model.
 */
export const InsightTypes = {
  PERFORMANCE: "performance",
  ACHIEVEMENT: "achievement",
  RECOVERY: "recovery",
  HISTORY: "history",
  SUMMARY: "summary",
  NUTRITION: "nutrition",
  SLEEP: "sleep",
  BODYWEIGHT: "bodyweight",
  GOAL: "goal",
  COACH: "coach",
} as const;

export type InsightType = (typeof InsightTypes)[keyof typeof InsightTypes];

/** Types produced by Sprint 18.7 generators. */
export const ActiveInsightTypes = [
  InsightTypes.PERFORMANCE,
  InsightTypes.ACHIEVEMENT,
  InsightTypes.RECOVERY,
  InsightTypes.HISTORY,
  InsightTypes.SUMMARY,
] as const;

export type ActiveInsightType = (typeof ActiveInsightTypes)[number];
