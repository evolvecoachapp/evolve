/**
 * Immutable structural statistics for a supervisor run.
 */
export interface CoachSupervisorStatistics {
  readonly agentCount: number;
  readonly capabilityCount: number;
  readonly stepCount: number;
  readonly phaseCount: number;
  readonly successCount: number;
  readonly failureCount: number;
  readonly skippedCount: number;
}
