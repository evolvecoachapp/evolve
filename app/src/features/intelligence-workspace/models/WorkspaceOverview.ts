/**
 * Immutable overview of the premium coaching artifact stack.
 */
export interface WorkspaceOverview {
  readonly athleteId: string;
  readonly headline: string;
  readonly summary: string;
  readonly highlights: readonly string[];
  readonly homeAvailable: boolean;
  readonly dailyBriefAvailable: boolean;
  readonly weeklyReportAvailable: boolean;
  readonly generatedAt: string;
}
