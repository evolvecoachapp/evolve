import type { AchievementResult } from "./AchievementResult";
import type { AchievementSummary } from "./AchievementSummary";

/**
 * Public result of the Achievement Engine.
 */
export interface AchievementEngineResult {
  readonly result: AchievementResult;
  readonly summary: AchievementSummary;
  readonly validationIssues: readonly string[];
}
