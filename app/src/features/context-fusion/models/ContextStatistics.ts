/**
 * Immutable fusion statistics (counts only — no calculations beyond counting).
 */
export interface ContextStatistics {
  readonly sourceCount: number;
  readonly sectionCount: number;
  readonly dependencyCount: number;
  readonly conflictCount: number;
  readonly resolutionCount: number;
  readonly timelineItemCount: number;
}
