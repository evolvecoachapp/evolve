import type { CandidateRole } from "../../exercise-selection/models/CandidateRole";
import type { TrainingPriorityCode } from "../../workout-blueprint/models/TrainingPriority";
import type { SessionGoalCode } from "../../workout-blueprint/models/SessionGoal";
import type { ExercisePrescription } from "../models/ExercisePrescription";
import type { ProgrammingContext } from "../models/ProgrammingContext";
import type { ProgrammingReason } from "../models/ProgrammingReason";
import { calculateProgrammingScore } from "../utils/calculateProgrammingScore";
import { freezePrescription } from "../utils/freezeProgrammingResult";
import type { ProgrammingStrategy } from "./ProgrammingStrategy";

const ROLE_REST_SECONDS: Record<
  TrainingPriorityCode,
  Record<CandidateRole, number>
> = {
  strength: { primary: 210, secondary: 150, accessory: 90 },
  hypertrophy: { primary: 120, secondary: 90, accessory: 60 },
  endurance: { primary: 60, secondary: 45, accessory: 30 },
  power: { primary: 240, secondary: 180, accessory: 120 },
  recovery: { primary: 90, secondary: 75, accessory: 60 },
  technique: { primary: 150, secondary: 120, accessory: 90 },
  general_fitness: { primary: 90, secondary: 75, accessory: 60 },
};

/**
 * Assigns between-set rest intervals from role + priority + session goal.
 */
export class RestStrategy implements ProgrammingStrategy {
  readonly id = "rest";

  apply(
    prescription: ExercisePrescription,
    context: ProgrammingContext,
  ): ExercisePrescription {
    const base =
      ROLE_REST_SECONDS[context.priority.primary][prescription.role] ??
      ROLE_REST_SECONDS.general_fitness[prescription.role];

    const seconds = applySessionGoalModifier(base, context.sessionGoal);

    const reason: ProgrammingReason = Object.freeze({
      code: "rest_assigned",
      weight: seconds,
      detail: `${seconds}s`,
    });

    const score = calculateProgrammingScore({
      ...prescription.score,
      rest: seconds / 60,
    });

    return freezePrescription({
      ...prescription,
      rest: Object.freeze({
        seconds,
        betweenSetsSeconds: seconds,
      }),
      score,
      reasons: Object.freeze([...prescription.reasons, reason]),
    });
  }
}

function applySessionGoalModifier(
  seconds: number,
  sessionGoal: SessionGoalCode,
): number {
  switch (sessionGoal) {
    case "conditioning":
      return Math.max(20, Math.round(seconds * 0.6));
    case "primary_lift_emphasis":
      return Math.round(seconds * 1.1);
    case "recovery_stimulus":
      return Math.max(30, Math.round(seconds * 0.8));
    default:
      return seconds;
  }
}
