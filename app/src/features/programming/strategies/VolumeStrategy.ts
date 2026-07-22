import type { CandidateRole } from "../../exercise-selection/models/CandidateRole";
import type { TrainingPriorityCode } from "../../workout-blueprint/models/TrainingPriority";
import type { SessionGoalCode } from "../../workout-blueprint/models/SessionGoal";
import type { ExercisePrescription } from "../models/ExercisePrescription";
import type { PrescriptionSet } from "../models/PrescriptionSet";
import type { ProgrammingContext } from "../models/ProgrammingContext";
import type { ProgrammingReason } from "../models/ProgrammingReason";
import { calculateProgrammingScore } from "../utils/calculateProgrammingScore";
import { freezePrescription } from "../utils/freezeProgrammingResult";
import type { ProgrammingStrategy } from "./ProgrammingStrategy";

interface VolumeTemplate {
  readonly sets: number;
  readonly repMin: number;
  readonly repMax: number;
}

const ROLE_VOLUME: Record<
  TrainingPriorityCode,
  Record<CandidateRole, VolumeTemplate>
> = {
  strength: {
    primary: { sets: 5, repMin: 3, repMax: 5 },
    secondary: { sets: 4, repMin: 4, repMax: 6 },
    accessory: { sets: 3, repMin: 6, repMax: 10 },
  },
  hypertrophy: {
    primary: { sets: 4, repMin: 6, repMax: 10 },
    secondary: { sets: 3, repMin: 8, repMax: 12 },
    accessory: { sets: 3, repMin: 10, repMax: 15 },
  },
  endurance: {
    primary: { sets: 3, repMin: 12, repMax: 20 },
    secondary: { sets: 3, repMin: 12, repMax: 20 },
    accessory: { sets: 2, repMin: 15, repMax: 25 },
  },
  power: {
    primary: { sets: 5, repMin: 1, repMax: 3 },
    secondary: { sets: 4, repMin: 3, repMax: 5 },
    accessory: { sets: 3, repMin: 5, repMax: 8 },
  },
  recovery: {
    primary: { sets: 2, repMin: 8, repMax: 12 },
    secondary: { sets: 2, repMin: 8, repMax: 12 },
    accessory: { sets: 2, repMin: 10, repMax: 15 },
  },
  technique: {
    primary: { sets: 4, repMin: 3, repMax: 5 },
    secondary: { sets: 3, repMin: 5, repMax: 8 },
    accessory: { sets: 2, repMin: 8, repMax: 12 },
  },
  general_fitness: {
    primary: { sets: 3, repMin: 8, repMax: 12 },
    secondary: { sets: 3, repMin: 8, repMax: 12 },
    accessory: { sets: 2, repMin: 10, repMax: 15 },
  },
};

/**
 * Assigns sets and rep ranges from role + priority + session goal.
 */
export class VolumeStrategy implements ProgrammingStrategy {
  readonly id = "volume";

  apply(
    prescription: ExercisePrescription,
    context: ProgrammingContext,
  ): ExercisePrescription {
    const base =
      ROLE_VOLUME[context.priority.primary][prescription.role] ??
      ROLE_VOLUME.general_fitness[prescription.role];

    const adjusted = applySessionGoalModifier(base, context.sessionGoal);
    const sets = buildSets(
      adjusted.sets,
      adjusted.repMin,
      adjusted.repMax,
      prescription.intensity.targetRpe,
      prescription.intensity.targetRir,
    );

    const reason: ProgrammingReason = Object.freeze({
      code: "volume_assigned",
      weight: adjusted.sets,
      detail: `${prescription.role}:${context.priority.primary}:${adjusted.sets}x${adjusted.repMin}-${adjusted.repMax}`,
    });

    const score = calculateProgrammingScore({
      ...prescription.score,
      volume: adjusted.sets + (adjusted.repMax - adjusted.repMin) * 0.1,
    });

    return freezePrescription({
      ...prescription,
      sets,
      volume: Object.freeze({
        sets: adjusted.sets,
        repMin: adjusted.repMin,
        repMax: adjusted.repMax,
        totalRepsMin: adjusted.sets * adjusted.repMin,
        totalRepsMax: adjusted.sets * adjusted.repMax,
      }),
      score,
      reasons: Object.freeze([...prescription.reasons, reason]),
    });
  }
}

function applySessionGoalModifier(
  template: VolumeTemplate,
  sessionGoal: SessionGoalCode,
): VolumeTemplate {
  switch (sessionGoal) {
    case "volume_accumulation":
      return Object.freeze({
        sets: template.sets + 1,
        repMin: template.repMin,
        repMax: Math.min(30, template.repMax + 2),
      });
    case "technique_practice":
      return Object.freeze({
        sets: Math.max(2, template.sets - 1),
        repMin: template.repMin,
        repMax: template.repMax,
      });
    case "recovery_stimulus":
      return Object.freeze({
        sets: Math.max(2, template.sets - 1),
        repMin: Math.max(5, template.repMin),
        repMax: Math.max(template.repMax, template.repMin + 4),
      });
    case "conditioning":
      return Object.freeze({
        sets: template.sets,
        repMin: Math.max(template.repMin, 10),
        repMax: Math.max(template.repMax, 15),
      });
    case "primary_lift_emphasis":
    case "balanced_development":
    case "rest":
    default:
      return template;
  }
}

function buildSets(
  setCount: number,
  repMin: number,
  repMax: number,
  targetRpe: number | null,
  targetRir: number | null,
): readonly PrescriptionSet[] {
  const sets: PrescriptionSet[] = [];
  for (let index = 1; index <= setCount; index += 1) {
    sets.push(
      Object.freeze({
        setIndex: index,
        repMin,
        repMax,
        targetRpe,
        targetRir,
      }),
    );
  }
  return Object.freeze(sets);
}
