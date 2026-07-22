import type { AchievementResult } from "../../achievement-engine/models/AchievementResult";
import type { AthleteHistory } from "../../athlete-history/models/AthleteHistory";
import type { PerformanceSnapshot } from "../../performance-engine/models/PerformanceSnapshot";
import type { WorkoutResult } from "../../workout-runtime/models/WorkoutResult";

/**
 * Input contract for Recovery Intelligence analysis.
 * AchievementResult is reference metadata only.
 */
export interface RecoveryAnalysisInput {
  readonly athleteHistory: AthleteHistory;
  readonly performanceSnapshot: PerformanceSnapshot;
  readonly workoutResult?: WorkoutResult | null;
  readonly achievementResult?: AchievementResult | null;
  readonly analyzedAt?: string;
  readonly snapshotId?: string;
  /** Lookback window in days for frequency / cumulative load (default 7). */
  readonly frequencyWindowDays?: number;
}
