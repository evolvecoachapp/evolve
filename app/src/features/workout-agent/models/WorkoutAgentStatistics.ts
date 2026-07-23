/**
 * Aggregate statistics for a Workout Agent run.
 */
export interface WorkoutAgentStatistics {
  readonly reasoningCount: number;
  readonly plannerCount: number;
  readonly recommendationCount: number;
  readonly policyViolationCount: number;
  readonly primaryLiftCount: number;
  readonly accessoryCount: number;
  readonly durationMs: number | null;
}
