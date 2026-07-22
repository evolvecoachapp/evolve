import type { ConversationPreparationInput } from "../models/ConversationPreparationInput";

/**
 * Soft-validate missing optional upstream references.
 */
export function validateMissingInformation(
  input: ConversationPreparationInput,
): readonly string[] {
  const issues: string[] = [];

  if (!input.insightSnapshot) {
    issues.push("missing_insight_snapshot");
  }
  if (!input.recoverySnapshot) {
    issues.push("missing_recovery_snapshot");
  }
  if (!input.athleteHistory) {
    issues.push("missing_athlete_history");
  }
  if (!input.performanceSnapshot) {
    issues.push("missing_performance_snapshot");
  }
  if (!input.achievementResult) {
    issues.push("missing_achievement_result");
  }

  return issues;
}
