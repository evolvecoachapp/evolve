import type { CandidateExercise } from "../models/CandidateExercise";
import type { SelectionContext } from "../models/SelectionContext";

/**
 * Validate hard constraint violations on final candidates.
 */
export function validateConstraintViolations(
  candidates: readonly CandidateExercise[],
  context: SelectionContext,
): readonly string[] {
  const issues: string[] = [];
  const hardCodes = new Set(
    context.constraints
      .filter((constraint) => constraint.severity === "hard")
      .map((constraint) => constraint.code),
  );

  for (const candidate of candidates) {
    const codes = new Set([
      ...candidate.exercise.contraindications,
      ...candidate.exercise.constraints.map((constraint) => constraint.code),
    ]);

    for (const hardCode of hardCodes) {
      if (codes.has(hardCode)) {
        issues.push(
          `hard_constraint_on_candidate:${candidate.exerciseId}:${hardCode}`,
        );
      }
    }

    if (
      context.availableEquipment &&
      candidate.exercise.equipment.some(
        (entry) =>
          entry.required && !context.availableEquipment!.includes(entry.equipment),
      )
    ) {
      issues.push(`equipment_constraint_on_candidate:${candidate.exerciseId}`);
    }
  }

  return Object.freeze(issues);
}
