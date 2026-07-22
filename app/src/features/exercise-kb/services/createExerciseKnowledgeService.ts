import {
  InMemoryExerciseKnowledgeRepository,
  type ExerciseKnowledgeRepository,
  exerciseKnowledgeRepository,
} from "../repository";
import { ExerciseKnowledgeService } from "./ExerciseKnowledgeService";

/**
 * Compose ExerciseKnowledgeService with the default in-memory catalog.
 */
export function createExerciseKnowledgeService(
  repository: ExerciseKnowledgeRepository = exerciseKnowledgeRepository,
): ExerciseKnowledgeService {
  return new ExerciseKnowledgeService(repository);
}

export function createEmptyExerciseKnowledgeService(): ExerciseKnowledgeService {
  return new ExerciseKnowledgeService(new InMemoryExerciseKnowledgeRepository());
}
