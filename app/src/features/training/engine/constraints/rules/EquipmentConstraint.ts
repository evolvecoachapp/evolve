import type { Constraint } from "../contracts/Constraint";
import type { ConstraintContext } from "../models/ConstraintContext";
import type { ConstraintResult } from "../models/ConstraintResult";

const SATISFIED: ConstraintResult = { allowed: true, rejected: false, warnings: [], reasons: [] };

/**
 * Rejects an exercise the athlete cannot actually perform with their
 * available equipment. An exercise with no equipment requirement (e.g.
 * pure bodyweight work) always satisfies this constraint; otherwise at
 * least one of the exercise's required equipment types must be available.
 *
 * A failure here is a hard rejection rather than a warning: an exercise
 * that cannot physically be performed with what the athlete has on hand is
 * never an acceptable recommendation, regardless of how well it otherwise
 * fits the athlete's goals.
 */
export class EquipmentConstraint implements Constraint {
  readonly id = "equipment";

  evaluate(context: ConstraintContext): ConstraintResult {
    const { exercise, availableEquipment } = context;

    const satisfied =
      exercise.equipment.length === 0 ||
      exercise.equipment.some((equipment) => availableEquipment.includes(equipment));

    if (satisfied) {
      return SATISFIED;
    }

    return {
      allowed: false,
      rejected: true,
      warnings: [],
      reasons: [
        `"${exercise.name}" requires equipment that is not available: ${exercise.equipment.join(", ")}.`,
      ],
    };
  }
}
