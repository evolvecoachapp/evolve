import type { CandidateRole } from "../../exercise-selection/models/CandidateRole";
import type { ExercisePrescription } from "../models/ExercisePrescription";
import type { ProgrammingContext } from "../models/ProgrammingContext";
import type { ProgrammingReason } from "../models/ProgrammingReason";
import { calculateProgrammingScore } from "../utils/calculateProgrammingScore";
import { freezePrescription } from "../utils/freezeProgrammingResult";
import type { ProgrammingStrategy } from "./ProgrammingStrategy";

const ROLE_ORDER_BASE: Record<CandidateRole, number> = {
  primary: 100,
  secondary: 200,
  accessory: 300,
};

/**
 * Assigns deterministic execution order from role then selection rank.
 * Lower order executes earlier.
 */
export class ExerciseOrderStrategy implements ProgrammingStrategy {
  readonly id = "exercise_order";

  apply(
    prescription: ExercisePrescription,
    _context: ProgrammingContext,
  ): ExercisePrescription {
    const order =
      ROLE_ORDER_BASE[prescription.role] + prescription.selectionRank;

    const reason: ProgrammingReason = Object.freeze({
      code: "order_assigned",
      weight: order,
      detail: `${prescription.role}:rank${prescription.selectionRank}`,
    });

    const score = calculateProgrammingScore({
      ...prescription.score,
      order: 400 - order,
    });

    return freezePrescription({
      ...prescription,
      order,
      score,
      reasons: Object.freeze([...prescription.reasons, reason]),
    });
  }
}
