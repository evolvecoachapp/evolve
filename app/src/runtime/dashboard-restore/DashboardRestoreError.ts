export type DashboardRestoreErrorCode =
  | "restore_already_started"
  | "hydration_not_ready"
  | "projection_failed"
  | "invalid_restore_state";

export class DashboardRestoreError extends Error {
  constructor(
    message: string,
    readonly code: DashboardRestoreErrorCode,
  ) {
    super(message);
    this.name = "DashboardRestoreError";
  }
}
