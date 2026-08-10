export type DashboardProjectionValidationCode =
  | "missing_workspace"
  | "missing_athlete_id"
  | "missing_workspace_id"
  | "duplicate_workspace_id"
  | "invalid_workspace"
  | "missing_identity";

export class DashboardProjectionValidationError extends Error {
  readonly code: DashboardProjectionValidationCode;

  constructor(message: string, code: DashboardProjectionValidationCode) {
    super(message);
    this.name = "DashboardProjectionValidationError";
    this.code = code;
  }
}
