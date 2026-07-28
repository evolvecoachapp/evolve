import type { AthleteWorkspace } from "../../intelligence-workspace/models/AthleteWorkspace";

/**
 * Immutable Athlete Workspace projection without transformation.
 */
export interface SnapshotWorkspace {
  readonly athleteId: string;
  readonly present: boolean;
  readonly workspace: AthleteWorkspace | null;
  readonly workspaceId: string | null;
}
