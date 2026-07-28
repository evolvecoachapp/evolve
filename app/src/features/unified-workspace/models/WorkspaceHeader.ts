/**
 * Immutable header for the Unified Athlete Workspace.
 */
export interface WorkspaceHeader {
  readonly athleteId: string;
  readonly headline: string;
  readonly statusLabel: string | null;
  readonly currentPhase: string | null;
  readonly goalCategory: string | null;
  readonly recoveryStatus: string | null;
  readonly generatedAt: string;
}
