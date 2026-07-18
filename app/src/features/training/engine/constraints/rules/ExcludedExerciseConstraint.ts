import type { Constraint } from "../contracts/Constraint";
import type { ConstraintContext } from "../models/ConstraintContext";
import type { ConstraintResult } from "../models/ConstraintResult";

const SATISFIED: ConstraintResult = { allowed: true, rejected: false, warnings: [], reasons: [] };

/**
 * Rejects any exercise the athlete has explicitly excluded (e.g. due to
 * injury history, an unsafe movement, or a plain dislike). This is
 * treated as a hard rejection rather than a warning: an explicit exclusion
 * is an athlete-stated boundary, not a mere preference to be weighed
 * against other factors.
 */
export class ExcludedExerciseConstraint implements Constraint {
  readonly id = "excludedExercise";

  evaluate(context: ConstraintContext): ConstraintResult {
    const { exercise, excludedExerciseIds } = context;

    if (!excludedExerciseIds.includes(exercise.id)) {
      return SATISFIED;
    }

    return {
      allowed: false,
      rejected: true,
      warnings: [],
      reasons: [`"${exercise.name}" is explicitly excluded by the athlete.`],
    };
  }
}
