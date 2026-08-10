/**
 * Ordered phases recorded when dashboard restore completes successfully.
 */
export type DashboardRestorePhase =
  | "hydration_ready_validated"
  | "workspace_resolved"
  | "dashboard_projected"
  | "viewmodel_restored"
  | "restore_frozen";

export const DASHBOARD_RESTORE_PHASES = [
  "hydration_ready_validated",
  "workspace_resolved",
  "dashboard_projected",
  "viewmodel_restored",
  "restore_frozen",
] as const satisfies readonly DashboardRestorePhase[];
