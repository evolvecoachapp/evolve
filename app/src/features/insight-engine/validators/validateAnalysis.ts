import type { AchievementResult } from "../../achievement-engine/models/AchievementResult";
import type { AthleteHistory } from "../../athlete-history/models/AthleteHistory";
import type { PerformanceSnapshot } from "../../performance-engine/models/PerformanceSnapshot";
import type { RecoverySnapshot } from "../../recovery-intelligence/models/RecoverySnapshot";

/**
 * Soft-validate cross-domain input consistency.
 */
export function validateAnalysisInput(
  performanceSnapshot: PerformanceSnapshot,
  achievementResult: AchievementResult,
  recoverySnapshot: RecoverySnapshot,
  athleteHistory: AthleteHistory,
): readonly string[] {
  const issues: string[] = [];

  if (achievementResult.performanceSnapshotId !== performanceSnapshot.id) {
    issues.push("achievement_performance_snapshot_mismatch");
  }

  if (
    recoverySnapshot.context.performanceSnapshotId !== null &&
    recoverySnapshot.context.performanceSnapshotId !== performanceSnapshot.id
  ) {
    issues.push("recovery_performance_snapshot_mismatch");
  }

  if (
    athleteHistory.context.performanceSnapshotId !== null &&
    athleteHistory.context.performanceSnapshotId !== performanceSnapshot.id
  ) {
    issues.push("history_performance_snapshot_mismatch");
  }

  if (
    recoverySnapshot.context.historyId !== null &&
    recoverySnapshot.context.historyId !== athleteHistory.id
  ) {
    issues.push("recovery_history_id_mismatch");
  }

  if (
    achievementResult.sessionId &&
    performanceSnapshot.session.sessionId &&
    achievementResult.sessionId !== performanceSnapshot.session.sessionId
  ) {
    issues.push("achievement_session_mismatch");
  }

  return issues;
}
