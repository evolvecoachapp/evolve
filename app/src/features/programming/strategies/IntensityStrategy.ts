import type { CandidateRole } from "../../exercise-selection/models/CandidateRole";
import type { TrainingPriorityCode } from "../../workout-blueprint/models/TrainingPriority";
import type { SessionGoalCode } from "../../workout-blueprint/models/SessionGoal";
import type { ExercisePrescription } from "../models/ExercisePrescription";
import type { PrescriptionIntensity } from "../models/PrescriptionIntensity";
import type { ProgrammingContext } from "../models/ProgrammingContext";
import type { ProgrammingReason } from "../models/ProgrammingReason";
import { calculateProgrammingScore } from "../utils/calculateProgrammingScore";
import { freezePrescription } from "../utils/freezeProgrammingResult";
import type { ProgrammingStrategy } from "./ProgrammingStrategy";

interface IntensityTemplate {
  readonly metric: "rpe" | "rir";
  readonly targetRpe: number;
  readonly targetRir: number;
}

const ROLE_INTENSITY: Record<
  TrainingPriorityCode,
  Record<CandidateRole, IntensityTemplate>
> = {
  strength: {
    primary: { metric: "rpe", targetRpe: 8, targetRir: 2 },
    secondary: { metric: "rpe", targetRpe: 7, targetRir: 3 },
    accessory: { metric: "rir", targetRpe: 6, targetRir: 3 },
  },
  hypertrophy: {
    primary: { metric: "rpe", targetRpe: 8, targetRir: 2 },
    secondary: { metric: "rpe", targetRpe: 7, targetRir: 3 },
    accessory: { metric: "rir", targetRpe: 7, targetRir: 2 },
  },
  endurance: {
    primary: { metric: "rir", targetRpe: 6, targetRir: 4 },
    secondary: { metric: "rir", targetRpe: 6, targetRir: 4 },
    accessory: { metric: "rir", targetRpe: 5, targetRir: 4 },
  },
  power: {
    primary: { metric: "rpe", targetRpe: 9, targetRir: 1 },
    secondary: { metric: "rpe", targetRpe: 8, targetRir: 2 },
    accessory: { metric: "rpe", targetRpe: 7, targetRir: 3 },
  },
  recovery: {
    primary: { metric: "rir", targetRpe: 5, targetRir: 5 },
    secondary: { metric: "rir", targetRpe: 5, targetRir: 5 },
    accessory: { metric: "rir", targetRpe: 4, targetRir: 5 },
  },
  technique: {
    primary: { metric: "rir", targetRpe: 6, targetRir: 4 },
    secondary: { metric: "rir", targetRpe: 6, targetRir: 4 },
    accessory: { metric: "rir", targetRpe: 5, targetRir: 4 },
  },
  general_fitness: {
    primary: { metric: "rpe", targetRpe: 7, targetRir: 3 },
    secondary: { metric: "rpe", targetRpe: 7, targetRir: 3 },
    accessory: { metric: "rir", targetRpe: 6, targetRir: 3 },
  },
};

/**
 * Assigns target RPE / RIR intensity — never absolute load or %1RM.
 */
export class IntensityStrategy implements ProgrammingStrategy {
  readonly id = "intensity";

  apply(
    prescription: ExercisePrescription,
    context: ProgrammingContext,
  ): ExercisePrescription {
    const base =
      ROLE_INTENSITY[context.priority.primary][prescription.role] ??
      ROLE_INTENSITY.general_fitness[prescription.role];

    const adjusted = applySessionGoalModifier(base, context.sessionGoal);
    const intensity: PrescriptionIntensity = Object.freeze({
      metric: adjusted.metric,
      value:
        adjusted.metric === "rpe" ? adjusted.targetRpe : adjusted.targetRir,
      targetRpe: adjusted.targetRpe,
      targetRir: adjusted.targetRir,
    });

    const sets = Object.freeze(
      prescription.sets.map((set) =>
        Object.freeze({
          ...set,
          targetRpe: intensity.targetRpe,
          targetRir: intensity.targetRir,
        }),
      ),
    );

    const reason: ProgrammingReason = Object.freeze({
      code: "intensity_assigned",
      weight: intensity.value ?? 0,
      detail: `${intensity.metric}:${intensity.value}`,
    });

    const score = calculateProgrammingScore({
      ...prescription.score,
      intensity: intensity.value ?? 0,
    });

    return freezePrescription({
      ...prescription,
      sets,
      intensity,
      score,
      reasons: Object.freeze([...prescription.reasons, reason]),
    });
  }
}

function applySessionGoalModifier(
  template: IntensityTemplate,
  sessionGoal: SessionGoalCode,
): IntensityTemplate {
  switch (sessionGoal) {
    case "technique_practice":
    case "recovery_stimulus":
      return Object.freeze({
        metric: "rir" as const,
        targetRpe: Math.max(4, template.targetRpe - 2),
        targetRir: Math.min(6, template.targetRir + 2),
      });
    case "primary_lift_emphasis":
      return Object.freeze({
        ...template,
        targetRpe: Math.min(10, template.targetRpe + 0),
      });
    default:
      return template;
  }
}
