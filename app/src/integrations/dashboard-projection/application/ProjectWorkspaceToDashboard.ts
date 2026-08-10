import type { Workspace } from "../../../features/unified-workspace/models/Workspace";
import {
  createDashboardProjectionIdentity,
  type DashboardProjectionIdentity,
  type DashboardProjectionResult,
} from "../models";
import type { DashboardProjector } from "../projector";

export interface ProjectWorkspaceToDashboardOptions {
  readonly projector: DashboardProjector;
  readonly workspace: Workspace;
  readonly identity: DashboardProjectionIdentity;
}

/** Projects an immutable Unified Workspace into the Dashboard read model. */
export function projectWorkspaceToDashboard(
  options: ProjectWorkspaceToDashboardOptions,
): DashboardProjectionResult {
  return options.projector.project({
    workspace: options.workspace,
    identity: createDashboardProjectionIdentity(options.identity),
  });
}

export interface ProjectAthleteWorkspaceToDashboardOptions {
  readonly projector: DashboardProjector;
  readonly athleteId: string;
  readonly identity: DashboardProjectionIdentity;
}

/** Projects the latest Unified Workspace for an athlete into the Dashboard read model. */
export function projectAthleteWorkspaceToDashboard(
  options: ProjectAthleteWorkspaceToDashboardOptions,
): DashboardProjectionResult | null {
  return options.projector.projectForAthlete(
    options.athleteId,
    createDashboardProjectionIdentity(options.identity),
  );
}
