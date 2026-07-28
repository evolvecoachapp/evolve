import type { DailyBrief } from "../../daily-brief/models/DailyBrief";
import type { WorkspaceDailyBrief } from "../models/WorkspaceDailyBrief";

export interface BuildDailyProjectionInput {
  readonly dailyBrief?: DailyBrief | null;
}

/**
 * Projects Daily Brief with no transformation.
 */
export function buildDailyProjection(
  input: BuildDailyProjectionInput,
): WorkspaceDailyBrief {
  return Object.freeze({
    present: input.dailyBrief != null,
    brief: input.dailyBrief ?? null,
  });
}
