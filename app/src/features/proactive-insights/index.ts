/**
 * Proactive Coach Insights (Sprint 25.5).
 *
 * Deterministic analysis of existing coaching knowledge.
 * No LLM. No hallucinations. No persistence. No event bus. No scheduler.
 */

export * from "./models";
export * from "./services";
export * from "./builders";
export {
  analyzeProactiveInsights,
  queryProactiveInsights,
  getTopInsights,
  getLatestInsights,
  getCriticalInsights,
  getRecoveryInsights,
  getGoalInsights,
  getWorkoutInsights,
  getNutritionInsights,
  filterProactiveInsights,
  createInsightSnapshot,
  validateProactiveInsights,
} from "./application";
