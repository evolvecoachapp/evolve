import type { DashboardProjection } from "./DashboardProjection";

/** Result returned when a Unified Workspace is projected into the Dashboard read model. */
export interface DashboardProjectionResult {
  readonly workspaceId: string;
  readonly athleteId: string;
  readonly accepted: boolean;
  readonly projectedAt: string;
  readonly projection: DashboardProjection | null;
}

export function createDashboardProjectionResult(
  input: DashboardProjectionResult,
): DashboardProjectionResult {
  return Object.freeze({ ...input });
}
