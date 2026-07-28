/**
 * Immutable summary projection for the Unified Athlete Workspace.
 */
export interface WorkspaceSummary {
  readonly athleteId: string;
  readonly headline: string;
  readonly narrative: string;
  readonly highlights: readonly string[];
  readonly homeAvailable: boolean;
  readonly dailyBriefAvailable: boolean;
  readonly weeklyReportAvailable: boolean;
  readonly snapshotAvailable: boolean;
  readonly generatedAt: string;
}
