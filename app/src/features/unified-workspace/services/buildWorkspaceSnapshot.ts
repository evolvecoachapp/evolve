import type { AthleteSnapshot } from "../../athlete-snapshot/models/AthleteSnapshot";
import type { WorkspaceSnapshot } from "../models/WorkspaceSnapshot";

export interface BuildWorkspaceSnapshotInput {
  readonly athleteId: string;
  readonly snapshot?: AthleteSnapshot | null;
}

/**
 * Projects Athlete Snapshot without transformation.
 */
export function buildWorkspaceSnapshot(
  input: BuildWorkspaceSnapshotInput,
): WorkspaceSnapshot {
  const snapshot = input.snapshot ?? null;

  return Object.freeze({
    athleteId: input.athleteId,
    present: snapshot != null,
    snapshot,
    snapshotId: snapshot?.id ?? null,
  });
}
