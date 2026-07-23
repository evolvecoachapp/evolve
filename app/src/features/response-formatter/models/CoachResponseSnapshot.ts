import type { CoachResponse } from "./CoachResponse";
import type { CoachResponseStatistics } from "./CoachResponseStatistics";
import type { CoachSummary } from "./CoachSummary";

/**
 * Immutable snapshot bundling response + summary + statistics.
 */
export interface CoachResponseSnapshot {
  readonly response: CoachResponse;
  readonly summary: CoachSummary;
  readonly statistics: CoachResponseStatistics;
  readonly capturedAt: string;
}
