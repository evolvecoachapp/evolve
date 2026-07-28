import type { WeeklyCoachReport } from "../../weekly-report/models/WeeklyCoachReport";
import type { WorkspaceWeeklyReport } from "../models/WorkspaceWeeklyReport";

export interface BuildWeeklyProjectionInput {
  readonly weeklyReport?: WeeklyCoachReport | null;
}

/**
 * Projects Weekly Coach Report with no transformation.
 */
export function buildWeeklyProjection(
  input: BuildWeeklyProjectionInput,
): WorkspaceWeeklyReport {
  return Object.freeze({
    present: input.weeklyReport != null,
    report: input.weeklyReport ?? null,
  });
}
