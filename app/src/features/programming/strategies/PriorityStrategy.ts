import type { CandidateRole } from "../../exercise-selection/models/CandidateRole";
import type { ExercisePrescription } from "../models/ExercisePrescription";
import type { ProgrammingContext } from "../models/ProgrammingContext";
import type { ProgrammingReason } from "../models/ProgrammingReason";
import { calculateProgrammingScore } from "../utils/calculateProgrammingScore";
import { freezePrescription } from "../utils/freezeProgrammingResult";
import type { ProgrammingStrategy } from "./ProgrammingStrategy";

const ROLE_PRIORITY: Record<CandidateRole, number> = {
  primary: 100,
  secondary: 60,
  accessory: 30,
};

/**
 * Assigns relative session priority from role and selection rank.
 * Higher priority = more important within the session.
 */
export class PriorityStrategy implements ProgrammingStrategy {
  readonly id = "priority";

  apply(
    prescription: ExercisePrescription,
    context: ProgrammingContext,
  ): ExercisePrescription {
    const rankPenalty = (prescription.selectionRank - 1) * 5;
    const sessionBoost =
      context.sessionGoal === "primary_lift_emphasis" &&
      prescription.role === "primary"
        ? 10
        : 0;
    const priority = Math.max(
      1,
      ROLE_PRIORITY[prescription.role] - rankPenalty + sessionBoost,
    );

    const reason: ProgrammingReason = Object.freeze({
      code: "priority_assigned",
      weight: priority,
      detail: `${prescription.role}:p${priority}`,
    });

    const cues = Object.freeze([
      ...prescription.execution.cues,
      `priority:${priority}`,
      `role:${prescription.role}`,
    ]);

    const score = calculateProgrammingScore({
      ...prescription.score,
      priority,
    });

    return freezePrescription({
      ...prescription,
      priority,
      execution: Object.freeze({
        notes: prescription.execution.notes,
        cues,
      }),
      score,
      reasons: Object.freeze([...prescription.reasons, reason]),
    });
  }
}
