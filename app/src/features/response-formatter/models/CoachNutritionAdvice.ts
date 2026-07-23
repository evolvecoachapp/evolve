/**
 * Immutable nutrition advice parsed from provider output.
 */
export interface CoachNutritionAdvice {
  readonly id: string;
  readonly text: string;
  readonly timing: string | null;
}
