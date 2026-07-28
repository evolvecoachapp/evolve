import type { AthleteSnapshot } from "../../athlete-snapshot/models/AthleteSnapshot";

/**
 * Athlete Snapshot projection with no transformation.
 */
export interface WorkspaceSnapshot {
  readonly athleteId: string;
  readonly present: boolean;
  readonly snapshot: AthleteSnapshot | null;
  readonly snapshotId: string | null;
}
