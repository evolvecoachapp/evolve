import type { CoachPreparationInput } from "../models/CoachPreparationInput";

/**
 * Soft-validate cross-domain input consistency for preparation.
 */
export function validatePreparationInput(
  input: CoachPreparationInput,
): readonly string[] {
  const issues: string[] = [];
  const insight = input.insightSnapshot;

  if (!insight.id) {
    issues.push("insight_snapshot_missing_id");
  }
  if (!insight.frozenAt) {
    issues.push("insight_snapshot_missing_frozen_at");
  }
  if (insight.collection.count !== insight.collection.insights.length) {
    issues.push("insight_collection_count_mismatch");
  }

  if (
    input.performanceSnapshot &&
    insight.context.performanceSnapshotId &&
    input.performanceSnapshot.id !== insight.context.performanceSnapshotId
  ) {
    issues.push("performance_insight_snapshot_mismatch");
  }

  if (
    input.achievementResult &&
    insight.context.achievementEvaluationId &&
    input.achievementResult.evaluationId !==
      insight.context.achievementEvaluationId
  ) {
    issues.push("achievement_insight_evaluation_mismatch");
  }

  if (
    input.recoverySnapshot &&
    insight.context.recoverySnapshotId &&
    input.recoverySnapshot.id !== insight.context.recoverySnapshotId
  ) {
    issues.push("recovery_insight_snapshot_mismatch");
  }

  if (
    input.athleteHistory &&
    insight.context.historyId &&
    input.athleteHistory.id !== insight.context.historyId
  ) {
    issues.push("history_insight_id_mismatch");
  }

  return issues;
}
