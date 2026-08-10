import type { HomeDashboard } from "../../features/home/models/HomeDashboard";
import type { DashboardRestorePhase } from "./DashboardRestoreInitialization";

export interface DashboardRestoreResult {
  readonly status: "ready";
  readonly athleteCount: number;
  readonly projectedCount: number;
  readonly emptyCount: number;
  readonly restoredAt: string;
  readonly phases: readonly DashboardRestorePhase[];
  readonly primaryDashboard: HomeDashboard;
}

export interface CreateDashboardRestoreResultInput {
  readonly athleteCount: number;
  readonly projectedCount: number;
  readonly emptyCount: number;
  readonly restoredAt: string;
  readonly phases: readonly DashboardRestorePhase[];
  readonly primaryDashboard: HomeDashboard;
}

export function createDashboardRestoreResult(
  input: CreateDashboardRestoreResultInput,
): DashboardRestoreResult {
  return Object.freeze({
    status: "ready",
    athleteCount: input.athleteCount,
    projectedCount: input.projectedCount,
    emptyCount: input.emptyCount,
    restoredAt: input.restoredAt,
    phases: Object.freeze([...input.phases]),
    primaryDashboard: input.primaryDashboard,
  });
}
