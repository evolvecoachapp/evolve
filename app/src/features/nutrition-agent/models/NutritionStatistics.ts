/**
 * Immutable agent statistics for a Nutrition Agent run.
 */
export interface NutritionAgentStatistics {
  readonly reasonerCount: number;
  readonly plannerCount: number;
  readonly recommendationCount: number;
  readonly issueCount: number;
  readonly targetCalories: number;
  readonly proteinG: number;
  readonly durationMs: number;
}

/** Alias matching sprint naming. */
export type NutritionStatistics = NutritionAgentStatistics;
