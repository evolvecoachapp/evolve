/**
 * Immutable progress representation (no calculations).
 */
export interface ProgressState {
  readonly milestones: readonly string[];
  readonly recentWins: readonly string[];
  readonly blockers: readonly string[];
  readonly notes: readonly string[];
  readonly sourceAgentIds: readonly string[];
}
