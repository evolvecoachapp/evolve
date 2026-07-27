/**
 * Weekly Coach Report composition (Sprint 27.3).
 *
 * Deterministic composition of the athlete's week.
 * Not a PDF. Not a UI. Not an LLM summary.
 * Compose only — no new engines, no LLM, no persistence.
 */

export * from "./models";
export * from "./services";
export {
  composeWeeklyCoachReport,
  getWeeklyCoachReport,
  getExecutiveSummary,
  getWorkoutReport,
  getNutritionReport,
  getRecoveryReport,
  getGoalReport,
  getDecisionReport,
  getRecommendationReport,
  validateWeeklyCoachReportForAthlete,
} from "./application";
