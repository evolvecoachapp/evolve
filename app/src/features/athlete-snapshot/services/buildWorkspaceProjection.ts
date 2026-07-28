import type { AthleteWorkspace } from "../../intelligence-workspace/models/AthleteWorkspace";
import type { SnapshotWorkspace } from "../models/SnapshotWorkspace";

export interface BuildWorkspaceProjectionInput {
  readonly athleteId: string;
  readonly workspace?: AthleteWorkspace | null;
}

/**
 * Projects Athlete Workspace into the snapshot without transformation.
 */
export function buildWorkspaceProjection(
  input: BuildWorkspaceProjectionInput,
): SnapshotWorkspace {
  const workspace = input.workspace ?? null;

  return Object.freeze({
    athleteId: input.athleteId,
    present: workspace != null,
    workspace,
    workspaceId: workspace?.id ?? null,
  });
}
