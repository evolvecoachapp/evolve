import type { TrainingPriorityCode } from "../../workout-blueprint/models/TrainingPriority";
import type { SessionGoalCode } from "../../workout-blueprint/models/SessionGoal";
import type { ExercisePrescription } from "../models/ExercisePrescription";
import type { PrescriptionTempo } from "../models/PrescriptionTempo";
import type { ProgrammingContext } from "../models/ProgrammingContext";
import type { ProgrammingReason } from "../models/ProgrammingReason";
import { calculateProgrammingScore } from "../utils/calculateProgrammingScore";
import { freezePrescription } from "../utils/freezeProgrammingResult";
import type { ProgrammingStrategy } from "./ProgrammingStrategy";

const PRIORITY_TEMPO: Record<
  TrainingPriorityCode,
  PrescriptionTempo | null
> = {
  strength: Object.freeze({
    eccentricSeconds: 2,
    bottomPauseSeconds: 0,
    concentricSeconds: 1,
    topPauseSeconds: 0,
  }),
  hypertrophy: Object.freeze({
    eccentricSeconds: 3,
    bottomPauseSeconds: 1,
    concentricSeconds: 1,
    topPauseSeconds: 0,
  }),
  endurance: null,
  power: Object.freeze({
    eccentricSeconds: 1,
    bottomPauseSeconds: 0,
    concentricSeconds: 1,
    topPauseSeconds: 0,
  }),
  recovery: Object.freeze({
    eccentricSeconds: 3,
    bottomPauseSeconds: 0,
    concentricSeconds: 2,
    topPauseSeconds: 0,
  }),
  technique: Object.freeze({
    eccentricSeconds: 3,
    bottomPauseSeconds: 1,
    concentricSeconds: 2,
    topPauseSeconds: 1,
  }),
  general_fitness: Object.freeze({
    eccentricSeconds: 2,
    bottomPauseSeconds: 0,
    concentricSeconds: 1,
    topPauseSeconds: 0,
  }),
};

/**
 * Optionally assigns tempo based on priority and session goal.
 */
export class TempoStrategy implements ProgrammingStrategy {
  readonly id = "tempo";

  apply(
    prescription: ExercisePrescription,
    context: ProgrammingContext,
  ): ExercisePrescription {
    const tempo = resolveTempo(
      context.priority.primary,
      context.sessionGoal,
    );

    const reason: ProgrammingReason = Object.freeze({
      code: tempo ? "tempo_assigned" : "tempo_omitted",
      weight: tempo
        ? tempo.eccentricSeconds +
          tempo.bottomPauseSeconds +
          tempo.concentricSeconds +
          tempo.topPauseSeconds
        : 0,
      detail: tempo
        ? `${tempo.eccentricSeconds}-${tempo.bottomPauseSeconds}-${tempo.concentricSeconds}-${tempo.topPauseSeconds}`
        : "none",
    });

    const score = calculateProgrammingScore({
      ...prescription.score,
      tempo: reason.weight,
    });

    const notes = tempo
      ? Object.freeze([
          ...prescription.execution.notes,
          `tempo:${tempo.eccentricSeconds}-${tempo.bottomPauseSeconds}-${tempo.concentricSeconds}-${tempo.topPauseSeconds}`,
        ])
      : prescription.execution.notes;

    return freezePrescription({
      ...prescription,
      tempo,
      execution: Object.freeze({
        notes,
        cues: prescription.execution.cues,
      }),
      score,
      reasons: Object.freeze([...prescription.reasons, reason]),
    });
  }
}

function resolveTempo(
  priority: TrainingPriorityCode,
  sessionGoal: SessionGoalCode,
): PrescriptionTempo | null {
  if (sessionGoal === "technique_practice") {
    return PRIORITY_TEMPO.technique;
  }
  if (sessionGoal === "conditioning") {
    return null;
  }
  return PRIORITY_TEMPO[priority];
}
