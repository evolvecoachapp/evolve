import type { Workspace } from "../../../features/unified-workspace/models/Workspace";
import type { DashboardProjectionIdentity } from "../models";
import {
  DashboardProjectionValidationError,
  type DashboardProjectionValidationCode,
} from "./DashboardProjectionValidationError";

export interface ValidateDashboardProjectionInputOptions {
  readonly workspace: Workspace | null | undefined;
  readonly identity: DashboardProjectionIdentity | null | undefined;
  readonly projectedWorkspaceIds?: readonly string[];
}

function fail(
  code: DashboardProjectionValidationCode,
  message: string,
): never {
  throw new DashboardProjectionValidationError(message, code);
}

export function validateDashboardProjectionInput(
  options: ValidateDashboardProjectionInputOptions,
): void {
  const { workspace, identity, projectedWorkspaceIds = [] } = options;

  if (!workspace) {
    fail("missing_workspace", "Dashboard projection workspace is required.");
  }

  if (!workspace.id?.trim()) {
    fail("missing_workspace_id", "Dashboard projection workspace id is required.");
  }

  if (!workspace.athleteId?.trim()) {
    fail("missing_athlete_id", "Dashboard projection athleteId is required.");
  }

  if (!workspace.header?.headline?.trim()) {
    fail("invalid_workspace", "Dashboard projection workspace header headline is required.");
  }

  if (!workspace.metadata?.generatedAt?.trim()) {
    fail("invalid_workspace", "Dashboard projection workspace metadata generatedAt is required.");
  }

  if (projectedWorkspaceIds.includes(workspace.id)) {
    fail(
      "duplicate_workspace_id",
      `Duplicate dashboard projection workspace id: ${workspace.id}.`,
    );
  }

  if (!identity) {
    fail("missing_identity", "Dashboard projection identity is required.");
  }

  if (!identity.displayName?.trim()) {
    fail("missing_identity", "Dashboard projection displayName is required.");
  }

  if (!identity.initials?.trim()) {
    fail("missing_identity", "Dashboard projection initials is required.");
  }
}
