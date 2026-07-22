export type { ExerciseKnowledgeRepository } from "./ExerciseKnowledgeRepository";
export { InMemoryExerciseKnowledgeRepository } from "./InMemoryExerciseKnowledgeRepository";

import { InMemoryExerciseKnowledgeRepository } from "./InMemoryExerciseKnowledgeRepository";
import { ILLUSTRATIVE_EXERCISE_CATALOG } from "../catalog/illustrativeCatalog";

/** Default in-memory repository seeded with the illustrative catalog. */
export const exerciseKnowledgeRepository =
  new InMemoryExerciseKnowledgeRepository(ILLUSTRATIVE_EXERCISE_CATALOG);
