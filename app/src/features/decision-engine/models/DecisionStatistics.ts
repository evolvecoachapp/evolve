/**
 * Immutable structural statistics for a decision package.
 */
export interface DecisionStatistics {
  readonly decisionCount: number;
  readonly candidateCount: number;
  readonly conflictCount: number;
  readonly resolutionCount: number;
  readonly constraintCount: number;
  readonly dependencyCount: number;
  readonly stepCount: number;
  readonly graphNodeCount: number;
  readonly graphEdgeCount: number;
}
