import type { Constraint } from "../contracts/Constraint";
import type { ConstraintContext } from "../models/ConstraintContext";
import type { ConstraintResult } from "../models/ConstraintResult";

const SATISFIED: ConstraintResult = { allowed: true, rejected: false, warnings: [], reasons: [] };

/**
 * Flags an exercise that does not target any of the athlete's requested
 * muscle groups. When no target muscle groups are specified, every
 * exercise is considered relevant, since there is nothing to narrow
 * against.
 *
 * Unlike `EquipmentConstraint` and `ExcludedExerciseConstraint`, an
 * irrelevant muscle target does not make an exercise unsafe or impossible
 * to perform — it only makes it a poor fit for the current goal — so this
 * constraint warns rather than rejects, leaving the final allow/reject
 * decision to constraints (or planners) with harder requirements.
 */
export class TargetMuscleConstraint implements Constraint {
  readonly id = "targetMuscle";

  evaluate(context: ConstraintContext): ConstraintResult {
    const { exercise, targetMuscleGroups } = context;

    if (targetMuscleGroups.length === 0) {
      return SATISFIED;
    }

    const targetsRequestedMuscle = [...exercise.primaryMuscles, ...exercise.secondaryMuscles].some((muscle) =>
      targetMuscleGroups.includes(muscle),
    );

    if (targetsRequestedMuscle) {
      return SATISFIED;
    }

    return {
      allowed: true,
      rejected: false,
      warnings: [`"${exercise.name}" does not target any of the requested muscle groups.`],
      reasons: [],
    };
  }
}
