import type { ExerciseDefinition } from "../models/ExerciseDefinition";
import {
  createExerciseKnowledgeService,
  type ExerciseKnowledgeService,
} from "../services";

/**
 * Thin application wrapper — resolve alternative exercises.
 */
export async function findAlternativeExercises(
  exerciseId: string,
  service: ExerciseKnowledgeService = createExerciseKnowledgeService(),
): Promise<readonly ExerciseDefinition[]> {
  return service.resolveAlternatives(exerciseId);
}
