/**
 * Immutable health projection composed from Athlete State and recovery signals.
 */
export interface WorkspaceHealth {
  readonly athleteId: string;
  readonly present: boolean;
  readonly athleteStatus: string | null;
  readonly athleteStatusLabel: string | null;
  readonly recoveryStatus: string | null;
  readonly readinessSummary: string | null;
  readonly fatigueSummary: string | null;
  readonly sleepSummary: string | null;
  readonly details: readonly string[];
  readonly summary: string;
}
