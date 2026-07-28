import type { WeeklyCoachReport } from "../../weekly-report/models/WeeklyCoachReport";

/**
 * Weekly Coach Report projection with no transformation.
 */
export interface WorkspaceWeeklyReport {
  readonly present: boolean;
  readonly report: WeeklyCoachReport | null;
}
