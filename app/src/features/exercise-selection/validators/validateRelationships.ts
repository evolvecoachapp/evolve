import type { CandidateExercise } from "../models/CandidateExercise";

/**
 * Validate that relationship targets referenced by selected candidates
 * do not create self-referential selection anomalies (self as alternative).
 */
export function validateRelationships(
  candidates: readonly CandidateExercise[],
): readonly string[] {
  const issues: string[] = [];
  const selectedIds = new Set(candidates.map((candidate) => candidate.exerciseId));

  for (const candidate of candidates) {
    for (const edge of candidate.exercise.relationships) {
      if (edge.targetExerciseId === candidate.exerciseId) {
        issues.push(`relationship_self_reference:${candidate.exerciseId}`);
      }
    }

    // Soft informational: primary should not also appear as accessory id clash
    // is handled by duplicate validator; here we only check structural integrity.
    if (
      candidate.role === "primary" &&
      !candidate.exercise.category.isCompound &&
      selectedIds.has(candidate.exerciseId)
    ) {
      issues.push(`primary_not_compound:${candidate.exerciseId}`);
    }
  }

  return Object.freeze([...new Set(issues)]);
}
