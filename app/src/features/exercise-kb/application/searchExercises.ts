import type { ExerciseKnowledgeResult } from "../models/ExerciseKnowledgeResult";
import {
  createExerciseKnowledgeService,
  type ExerciseKnowledgeService,
  type ExerciseSearchCriteria,
} from "../services";

/**
 * Thin application wrapper — search exercise knowledge.
 */
export async function searchExercises(
  criteria: ExerciseSearchCriteria = {},
  service: ExerciseKnowledgeService = createExerciseKnowledgeService(),
): Promise<ExerciseKnowledgeResult> {
  return service.search(criteria);
}
