import type { CoachConstraint } from "../models/CoachConstraint";

/**
 * Soft-validate coaching constraints.
 */
export function validateConstraints(
  constraints: readonly CoachConstraint[],
): readonly string[] {
  const issues: string[] = [];
  const seen = new Set<string>();

  for (const constraint of constraints) {
    if (!constraint.id) {
      issues.push("constraint_missing_id");
      continue;
    }
    if (seen.has(constraint.id)) {
      issues.push(`constraint_duplicate_id:${constraint.id}`);
    }
    seen.add(constraint.id);

    if (!constraint.code) {
      issues.push(`constraint_missing_code:${constraint.id}`);
    }
    if (!constraint.statement) {
      issues.push(`constraint_missing_statement:${constraint.id}`);
    }
    if (!constraint.sourceType || !constraint.sourceId) {
      issues.push(`constraint_incomplete_source:${constraint.id}`);
    }
  }

  return issues;
}
