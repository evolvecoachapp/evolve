/**
 * Lifecycle status for the Dashboard Restore pipeline.
 */
export type DashboardRestoreStatus =
  | "idle"
  | "restoring"
  | "ready"
  | "failed";

export const DASHBOARD_RESTORE_STATUS = {
  idle: "idle",
  restoring: "restoring",
  ready: "ready",
  failed: "failed",
} as const satisfies Record<string, DashboardRestoreStatus>;
