import type { AchievementResult } from "../../achievement-engine/models/AchievementResult";
import type { AthleteHistory } from "../../athlete-history/models/AthleteHistory";
import type { PerformanceSnapshot } from "../../performance-engine/models/PerformanceSnapshot";
import type { RecoverySnapshot } from "../../recovery-intelligence/models/RecoverySnapshot";

/**
 * Inputs for deterministic insight generation.
 * Upstream engines are never mutated.
 */
export interface InsightAnalysisInput {
  readonly performanceSnapshot: PerformanceSnapshot;
  readonly achievementResult: AchievementResult;
  readonly recoverySnapshot: RecoverySnapshot;
  readonly athleteHistory: AthleteHistory;
  readonly generatedAt?: string;
  readonly snapshotId?: string;
}
