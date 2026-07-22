import { ALL_COACH_INTENTS } from "../models/CoachIntent";
import type { CoachObjective } from "../models/CoachObjective";

/**
 * Soft-validate coaching objectives.
 */
export function validateObjectives(
  objectives: readonly CoachObjective[],
): readonly string[] {
  const issues: string[] = [];
  const seen = new Set<string>();

  for (const objective of objectives) {
    if (!objective.id) {
      issues.push("objective_missing_id");
      continue;
    }
    if (seen.has(objective.id)) {
      issues.push(`objective_duplicate_id:${objective.id}`);
    }
    seen.add(objective.id);

    if (!objective.title) {
      issues.push(`objective_missing_title:${objective.id}`);
    }
    if (!objective.statement) {
      issues.push(`objective_missing_statement:${objective.id}`);
    }
    if (!ALL_COACH_INTENTS.includes(objective.intent)) {
      issues.push(`objective_invalid_intent:${objective.id}`);
    }
    if (!objective.reason?.code) {
      issues.push(`objective_missing_reason:${objective.id}`);
    }
  }

  return issues;
}
