import type { ExerciseDefinition } from "../../models/ExerciseDefinition";
import type { ExerciseId } from "../../types/ids";

/**
 * Storage-agnostic access to the raw `ExerciseDefinition` catalogue data.
 * This is the seam between the training domain and wherever exercise data
 * actually lives — it defines only how exercises are fetched, never how
 * they are filtered, scored, or selected (that belongs to `ExerciseCatalog`
 * and the Programming Engine, respectively).
 *
 * Every method returns a `Promise` so an implementation can be backed by a
 * REST API, a database, local device storage, or a cloud-synced store
 * without changing this contract or anything that depends on it. The first
 * implementation, `InMemoryExerciseRepository`, happens to resolve
 * synchronously, but callers must never rely on that.
 */
export interface ExerciseRepository {
  /** Resolves the exercise with `id`, or `undefined` if the catalogue has none. */
  getById(id: ExerciseId): Promise<ExerciseDefinition | undefined>;

  /** Resolves every exercise currently available in the catalogue. */
  getAll(): Promise<readonly ExerciseDefinition[]>;
}
