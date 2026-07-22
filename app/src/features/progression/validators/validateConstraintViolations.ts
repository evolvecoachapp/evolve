import type { ProgressionConstraint } from "../models/ProgressionConstraint";
import type { ExerciseProgression } from "../models/ExerciseProgression";

/**
 * Validate hard constraints are not violated by the progression plan.
 * Soft constraints are recorded but do not fail validation here.
 */
export function validateConstraintViolations(
  progressions: readonly ExerciseProgression[],
  constraints: readonly ProgressionConstraint[],
): readonly string[] {
  const issues: string[] = [];
  const hard = constraints.filter((constraint) => constraint.severity === "hard");

  for (const constraint of hard) {
    if (constraint.kind === "max_sets") {
      const maxSets = Number.parseInt(constraint.code.replace(/\D/g, ""), 10);
      if (!Number.isFinite(maxSets) || maxSets <= 0) {
        continue;
      }
      for (const progression of progressions) {
        for (const step of progression.steps) {
          if (step.target.volumeSets > maxSets) {
            issues.push(
              `constraint_violation:${constraint.code}:${progression.exerciseId}:week_${step.weekNumber}`,
            );
          }
        }
      }
    }

    if (constraint.kind === "max_weeks") {
      const maxWeeks = Number.parseInt(constraint.code.replace(/\D/g, ""), 10);
      if (!Number.isFinite(maxWeeks) || maxWeeks <= 0) {
        continue;
      }
      for (const progression of progressions) {
        if (progression.steps.length > maxWeeks) {
          issues.push(
            `constraint_violation:${constraint.code}:${progression.exerciseId}:weeks_${progression.steps.length}`,
          );
        }
      }
    }
  }

  return Object.freeze(issues);
}
