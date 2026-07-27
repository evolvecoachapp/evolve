/**
 * Home Experience composition (Sprint 27.1).
 *
 * Deterministic composition of existing coaching knowledge for the Home
 * dashboard. Compose only — no new engines, no LLM, no persistence.
 */

export * from "./models";
export * from "./services";
export {
  composeHomeExperience,
  getHomeExperience,
  getHomeSummary,
  getQuickActions,
  getCoachCard,
  getInsightCards,
  validateHomeExperienceForAthlete,
} from "./application";
