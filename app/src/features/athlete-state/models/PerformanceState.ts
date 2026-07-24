/**
 * Immutable performance state slice.
 */
export interface PerformanceState {
  readonly lastSnapshotId: string | null;
  readonly trendLabel: string | null;
  readonly highlights: readonly string[];
  readonly notes: readonly string[];
  readonly sourceAgentIds: readonly string[];
}
