import type { AdaptationRecommendation } from "../../training-adaptation/models/AdaptationRecommendation";
import type { WorkoutAssemblyRequest } from "../models/WorkoutAssemblyRequest";
import type { WorkoutExercise } from "../models/WorkoutExercise";
import type { WorkoutSession } from "../models/WorkoutSession";
import { validateAdaptationConsistency } from "./validateAdaptationConsistency";
import { validateDuplicatePrevention } from "./validateDuplicatePrevention";
import { validateExerciseOrdering } from "./validateExerciseOrdering";
import { validatePrescriptionConsistency } from "./validatePrescriptionConsistency";
import { validateSessionIntegrity } from "./validateSessionIntegrity";

/**
 * Run the full workout assembly validation suite and return unique issue codes.
 */
export function validateWorkoutAssemblyResult(
  request: WorkoutAssemblyRequest,
  session: WorkoutSession,
  recommendations: readonly AdaptationRecommendation[],
): readonly string[] {
  const issues = [
    ...validatePipelinePresent(request),
    ...validateExerciseOrdering(session.exercises),
    ...validatePrescriptionConsistency(session.exercises),
    ...validateAdaptationConsistency(session.exercises, recommendations),
    ...validateDuplicatePrevention(session.exercises),
    ...validateSessionIntegrity(session),
  ];
  return Object.freeze([...new Set(issues)]);
}

function validatePipelinePresent(
  request: WorkoutAssemblyRequest,
): readonly string[] {
  if (request.programming.prescriptions.length === 0) {
    return Object.freeze(["programming_empty"]);
  }
  if (request.progression.exerciseProgressions.length === 0) {
    return Object.freeze(["progression_empty"]);
  }
  return Object.freeze([]);
}

/**
 * Remap exercises onto the blocks they belong to (fixes recovery regrouping).
 */
export function assignExercisesToBlocks(
  exercises: readonly WorkoutExercise[],
  blockIdByExerciseId: ReadonlyMap<string, string>,
): readonly WorkoutExercise[] {
  return Object.freeze(
    exercises.map((exercise) => {
      const blockId = blockIdByExerciseId.get(exercise.id) ?? exercise.blockId;
      if (blockId === exercise.blockId) {
        return exercise;
      }
      return Object.freeze({
        ...exercise,
        blockId,
      });
    }),
  );
}

export { validateExerciseOrdering } from "./validateExerciseOrdering";
export { validatePrescriptionConsistency } from "./validatePrescriptionConsistency";
export { validateAdaptationConsistency } from "./validateAdaptationConsistency";
export { validateDuplicatePrevention } from "./validateDuplicatePrevention";
export { validateSessionIntegrity } from "./validateSessionIntegrity";
