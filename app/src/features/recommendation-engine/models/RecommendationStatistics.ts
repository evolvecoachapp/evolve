export interface RecommendationStatistics {
  readonly total: number;
  readonly byCategory: Readonly<Record<string, number>>;
  readonly byIntent: Readonly<Record<string, number>>;
  readonly byType: Readonly<Record<string, number>>;
  readonly conflictCount: number;
  readonly dependencyCount: number;
  readonly groupCount: number;
  readonly averageUrgency: number;
}
