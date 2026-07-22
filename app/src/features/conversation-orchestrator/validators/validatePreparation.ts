import type { ConversationPreparationInput } from "../models/ConversationPreparationInput";

/**
 * Soft-validate cross-domain input consistency for preparation.
 */
export function validatePreparationInput(
  input: ConversationPreparationInput,
): readonly string[] {
  const issues: string[] = [];
  const coaching = input.coachingContext;

  if (!coaching.id) {
    issues.push("coaching_context_missing_id");
  }
  if (!coaching.frozenAt) {
    issues.push("coaching_context_missing_frozen_at");
  }
  if (!coaching.session.insightSnapshotId) {
    issues.push("coaching_context_missing_insight_reference");
  }

  if (
    input.insightSnapshot &&
    coaching.session.insightSnapshotId &&
    input.insightSnapshot.id !== coaching.session.insightSnapshotId
  ) {
    issues.push("insight_coaching_snapshot_mismatch");
  }

  if (
    input.performanceSnapshot &&
    coaching.session.performanceSnapshotId &&
    input.performanceSnapshot.id !== coaching.session.performanceSnapshotId
  ) {
    issues.push("performance_coaching_snapshot_mismatch");
  }

  if (
    input.achievementResult &&
    coaching.session.achievementEvaluationId &&
    input.achievementResult.evaluationId !==
      coaching.session.achievementEvaluationId
  ) {
    issues.push("achievement_coaching_evaluation_mismatch");
  }

  if (
    input.recoverySnapshot &&
    coaching.session.recoverySnapshotId &&
    input.recoverySnapshot.id !== coaching.session.recoverySnapshotId
  ) {
    issues.push("recovery_coaching_snapshot_mismatch");
  }

  if (
    input.athleteHistory &&
    coaching.session.historyId &&
    input.athleteHistory.id !== coaching.session.historyId
  ) {
    issues.push("history_coaching_id_mismatch");
  }

  return issues;
}
