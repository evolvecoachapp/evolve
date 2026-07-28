/**
 * Immutable athlete status projection for the workspace.
 */
export interface WorkspaceStatus {
  readonly athleteId: string;
  readonly athleteStatus: string | null;
  readonly athleteStatusLabel: string | null;
  readonly recoveryStatus: string | null;
  readonly goalCategory: string | null;
  readonly currentPhase: string | null;
  readonly headline: string;
  readonly details: readonly string[];
}
