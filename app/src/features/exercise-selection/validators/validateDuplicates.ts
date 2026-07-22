import type { CandidateExercise } from "../models/CandidateExercise";
import { detectDuplicateIds } from "../utils/detectDuplicates";

/**
 * Prevent the same exercise id from appearing more than once in a role group.
 * Cross-role reuse is allowed (same exercise could theoretically be candidate
 * for different roles) but within-role duplicates are invalid.
 */
export function validateDuplicates(
  candidates: readonly CandidateExercise[],
): readonly string[] {
  const issues: string[] = [];
  const byRole = new Map<string, string[]>();

  for (const candidate of candidates) {
    const list = byRole.get(candidate.role) ?? [];
    list.push(candidate.exerciseId);
    byRole.set(candidate.role, list);
  }

  for (const [role, ids] of byRole) {
    for (const duplicateId of detectDuplicateIds(ids)) {
      issues.push(`duplicate_in_role:${role}:${duplicateId}`);
    }
  }

  return Object.freeze(issues);
}
