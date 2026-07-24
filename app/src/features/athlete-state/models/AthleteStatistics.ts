/**
 * Immutable counts derived by aggregation structure only (no domain math).
 */
export interface AthleteStatistics {
  readonly updateCount: number;
  readonly snapshotCount: number;
  readonly historyEntryCount: number;
  readonly timelineItemCount: number;
  readonly goalCount: number;
  readonly sourceAgentCount: number;
}
