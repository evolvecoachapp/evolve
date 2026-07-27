/**
 * Athlete Daily Brief composition (Sprint 27.2).
 *
 * Deterministic composition of existing coaching knowledge.
 * Not a chat response. Not a notification. Not an LLM summary.
 * Compose only — no new engines, no LLM, no persistence.
 */

export * from "./models";
export * from "./services";
export {
  composeDailyBrief,
  getDailyBrief,
  getCoachMessage,
  getWorkoutSection,
  getNutritionSection,
  getRecoverySection,
  getGoalSection,
  getInsightSection,
  validateDailyBriefForAthlete,
} from "./application";
