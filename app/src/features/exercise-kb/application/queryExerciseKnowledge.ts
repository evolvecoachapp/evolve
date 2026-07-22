import type { ExerciseKnowledgeResult } from "../models/ExerciseKnowledgeResult";
import {
  createExerciseKnowledgeService,
  type ExerciseKnowledgeService,
} from "../services";

/**
 * Thin application wrapper — query the full knowledge catalog.
 */
export async function queryExerciseKnowledge(
  service: ExerciseKnowledgeService = createExerciseKnowledgeService(),
): Promise<ExerciseKnowledgeResult> {
  return service.queryAll();
}
