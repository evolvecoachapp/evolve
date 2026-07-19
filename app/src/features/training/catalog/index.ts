/**
 * Public surface of the training Exercise Catalog: the reusable layer
 * responsible for providing `ExerciseDefinition` catalogue entries to the
 * rest of the training domain, independent of where that data actually
 * lives. Contains the `ExerciseRepository` contract, its first
 * (in-memory) implementation, and the `ExerciseCatalog` query service.
 * No business rules, React, AI, persistence, or networking live here.
 */
export type { ExerciseRepository } from "./contracts/ExerciseRepository";
export { InMemoryExerciseRepository } from "./providers/InMemoryExerciseRepository";
export { ExerciseCatalog } from "./services/ExerciseCatalog";
