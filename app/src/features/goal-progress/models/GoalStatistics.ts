export interface GoalStatistics {
  readonly totalDecisions: number;
  readonly totalTriggers: number;
  readonly totalOpportunities: number;
  readonly byCategory: Readonly<Record<string, number>>;
  readonly bySeverity: Readonly<Record<string, number>>;
  readonly signalCount: number;
}
