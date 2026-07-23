/**
 * Aggregate statistics for a Tool Runtime execution plan / result.
 */
export interface ToolExecutionStatistics {
  readonly stepCount: number;
  readonly resolvedAdapterCount: number;
  readonly unresolvedToolCount: number;
  readonly dependencyCount: number;
  readonly stepsByStatus: Readonly<Record<string, number>>;
  readonly stepsByActionType: Readonly<Record<string, number>>;
  readonly averageOrder: number;
  readonly maxOrder: number;
}
