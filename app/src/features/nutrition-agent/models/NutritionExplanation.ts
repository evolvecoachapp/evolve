/**
 * Immutable explanation surface for Nutrition Agent decisions.
 */
export interface NutritionExplanation {
  readonly id: string;
  readonly summary: string;
  readonly bullets: readonly string[];
  readonly strategyRationale: string | null;
  readonly policyNotes: readonly string[];
}
