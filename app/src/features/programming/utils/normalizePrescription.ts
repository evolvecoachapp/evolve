import type { CandidateExercise } from "../../exercise-selection/models/CandidateExercise";
import type { ExercisePrescription } from "../models/ExercisePrescription";
import {
  createEmptyPrescriptionExecution,
} from "../models/PrescriptionExecution";
import {
  createEmptyPrescriptionIntensity,
} from "../models/PrescriptionIntensity";
import {
  createEmptyPrescriptionRest,
} from "../models/PrescriptionRest";
import {
  createEmptyPrescriptionVolume,
} from "../models/PrescriptionVolume";
import { createEmptyProgrammingScore } from "../models/ProgrammingScore";

/**
 * Create a blank immutable prescription skeleton from a selected candidate.
 * Strategies fill volume, intensity, rest, tempo, order, and priority.
 */
export function normalizePrescription(
  candidate: CandidateExercise,
): ExercisePrescription {
  return Object.freeze({
    exerciseId: candidate.exerciseId,
    exercise: candidate.exercise,
    role: candidate.role,
    selectionRank: candidate.rank,
    order: 0,
    sets: Object.freeze([]),
    volume: createEmptyPrescriptionVolume(),
    intensity: createEmptyPrescriptionIntensity(),
    rest: createEmptyPrescriptionRest(),
    tempo: null,
    execution: createEmptyPrescriptionExecution(),
    priority: 0,
    fatigueEstimate: 0,
    skillEstimate: 0,
    estimatedDurationSeconds: 0,
    score: createEmptyProgrammingScore(),
    reasons: Object.freeze([]),
  });
}
