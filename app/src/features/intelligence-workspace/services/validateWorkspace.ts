import type { AthleteWorkspace } from "../models/AthleteWorkspace";
import type { WorkspaceValidation } from "../models/WorkspaceResult";

function isFrozen(value: unknown): boolean {
  return typeof value === "object" && value !== null && Object.isFrozen(value);
}

/**
 * Validates the immutable Athlete Intelligence Workspace.
 */
export function validateWorkspace(
  workspace: AthleteWorkspace | null | undefined,
): WorkspaceValidation {
  const errors: string[] = [];

  if (!workspace) {
    return Object.freeze({
      valid: false,
      errors: Object.freeze(["Athlete workspace is missing"]),
    });
  }

  if (!workspace.id) errors.push("Workspace id is required");
  if (!workspace.athleteId) errors.push("Workspace athleteId is required");
  if (!workspace.overview) errors.push("Workspace overview is required");
  if (!workspace.status) errors.push("Workspace status is required");
  if (!workspace.home) errors.push("Workspace home projection is required");
  if (!workspace.dailyBrief) errors.push("Workspace dailyBrief projection is required");
  if (!workspace.weeklyReport) errors.push("Workspace weeklyReport projection is required");
  if (!workspace.timeline) errors.push("Workspace timeline projection is required");
  if (!workspace.insights) errors.push("Workspace insights projection is required");
  if (!workspace.coach) errors.push("Workspace coach projection is required");
  if (!workspace.metadata) errors.push("Workspace metadata is required");

  if (workspace.overview?.athleteId !== workspace.athleteId) {
    errors.push("Overview athleteId must match workspace athleteId");
  }
  if (workspace.status?.athleteId !== workspace.athleteId) {
    errors.push("Status athleteId must match workspace athleteId");
  }
  if (workspace.timeline?.athleteId !== workspace.athleteId) {
    errors.push("Timeline athleteId must match workspace athleteId");
  }
  if (workspace.insights?.athleteId !== workspace.athleteId) {
    errors.push("Insights athleteId must match workspace athleteId");
  }
  if (workspace.coach?.athleteId !== workspace.athleteId) {
    errors.push("Coach athleteId must match workspace athleteId");
  }
  if (workspace.metadata?.workspaceId !== workspace.id) {
    errors.push("Metadata workspaceId must match workspace id");
  }

  if (!isFrozen(workspace.overview)) errors.push("overview must be immutable");
  if (!isFrozen(workspace.status)) errors.push("status must be immutable");
  if (!isFrozen(workspace.home)) errors.push("home must be immutable");
  if (!isFrozen(workspace.dailyBrief)) errors.push("dailyBrief must be immutable");
  if (!isFrozen(workspace.weeklyReport)) errors.push("weeklyReport must be immutable");
  if (!isFrozen(workspace.timeline)) errors.push("timeline must be immutable");
  if (!isFrozen(workspace.insights)) errors.push("insights must be immutable");
  if (!isFrozen(workspace.coach)) errors.push("coach must be immutable");
  if (!isFrozen(workspace.metadata)) errors.push("metadata must be immutable");
  if (!isFrozen(workspace)) errors.push("Workspace must be immutable (Object.freeze)");

  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze(errors),
  });
}

export function assertWorkspaceImmutable(workspace: AthleteWorkspace): void {
  if (!Object.isFrozen(workspace)) {
    throw new Error("AthleteWorkspace must be frozen");
  }
}
