import type { CoachPreparationInput } from "../models/CoachPreparationInput";

/**
 * Soft-validate missing optional upstream references.
 */
export function validateMissingInformation(
  input: CoachPreparationInput,
): readonly string[] {
  const issues: string[] = [];

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
