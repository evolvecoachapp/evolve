/**
 * Aggregate immutable statistics for an ActionPlan.
 */
export interface ActionStatistics {
  readonly stepCount: number;
  readonly dependencyCount: number;
  readonly constraintCount: number;
  readonly candidateCount: number;
  readonly stepsByType: Readonly<Record<string, number>>;
  readonly stepsByPriority: Readonly<Record<string, number>>;
  readonly stepsByStatus: Readonly<Record<string, number>>;
  readonly averagePriorityRank: number;
  readonly maxOrder: number;
}
