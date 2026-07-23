/**
 * Human-readable explanation of agent decisions.
 */
export interface WorkoutExplanation {
  readonly id: string;
  readonly summary: string;
  readonly bullets: readonly string[];
  readonly strategyRationale: string | null;
  readonly policyNotes: readonly string[];
}
