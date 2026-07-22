import type { CandidateExercise } from "../models/CandidateExercise";
import type { SelectionContext } from "../models/SelectionContext";

/**
 * Validate that selected candidates are internally consistent with context.
 */
export function validateCandidateConsistency(
  candidates: readonly CandidateExercise[],
  context: SelectionContext,
): readonly string[] {
  const issues: string[] = [];

  for (const candidate of candidates) {
    if (candidate.exerciseId !== candidate.exercise.id) {
      issues.push(`candidate_id_mismatch:${candidate.exerciseId}`);
    }

    if (candidate.rank < 1) {
      issues.push(`candidate_invalid_rank:${candidate.exerciseId}`);
    }

    if (
      context.excludedExerciseIds.includes(candidate.exerciseId)
    ) {
      issues.push(`candidate_was_excluded:${candidate.exerciseId}`);
    }

    if (
      !Number.isFinite(candidate.score.total) ||
      Number.isNaN(candidate.score.total)
    ) {
      issues.push(`candidate_invalid_score:${candidate.exerciseId}`);
    }
  }

  return Object.freeze(issues);
}
