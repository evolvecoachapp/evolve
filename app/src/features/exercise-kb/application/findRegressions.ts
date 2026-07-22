import type { ExerciseDefinition } from "../models/ExerciseDefinition";
import {
  createExerciseKnowledgeService,
  type ExerciseKnowledgeService,
} from "../services";

/**
 * Thin application wrapper — resolve regressions.
 */
export async function findRegressions(
  exerciseId: string,
  service: ExerciseKnowledgeService = createExerciseKnowledgeService(),
): Promise<readonly ExerciseDefinition[]> {
  return service.resolveRegressions(exerciseId);
}
