import type { WeeklyCoachReport } from "./WeeklyCoachReport";
import type { WeeklyExecutiveSummary } from "./WeeklyExecutiveSummary";

export interface WeeklyReportValidation {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

/**
 * Immutable result of building / querying a Weekly Coach Report.
 */
export interface WeeklyReportResult {
  readonly id: string;
  readonly success: boolean;
  readonly report: WeeklyCoachReport | null;
  readonly executiveSummary: WeeklyExecutiveSummary | null;
  readonly validation: WeeklyReportValidation;
  readonly message: string;
  readonly generatedAt: string;
}
