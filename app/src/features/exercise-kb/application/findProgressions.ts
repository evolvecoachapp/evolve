import type { ExerciseDefinition } from "../models/ExerciseDefinition";
import {
  createExerciseKnowledgeService,
  type ExerciseKnowledgeService,
} from "../services";

/**
 * Thin application wrapper — resolve progressions.
 */
export async function findProgressions(
  exerciseId: string,
  service: ExerciseKnowledgeService = createExerciseKnowledgeService(),
): Promise<readonly ExerciseDefinition[]> {
  return service.resolveProgressions(exerciseId);
}
