import type { DailyBrief } from "../../daily-brief/models/DailyBrief";

/**
 * Daily Brief projection with no transformation.
 */
export interface WorkspaceDailyBrief {
  readonly present: boolean;
  readonly brief: DailyBrief | null;
}
