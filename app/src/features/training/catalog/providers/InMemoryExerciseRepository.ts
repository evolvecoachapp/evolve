import type { ExerciseDefinition } from "../../models/ExerciseDefinition";
import type { ExerciseId } from "../../types/ids";
import type { ExerciseRepository } from "../contracts/ExerciseRepository";

/**
 * First, minimal `ExerciseRepository` implementation. Holds a fixed list of
 * `ExerciseDefinition`s supplied by the caller at construction time —
 * dependency injection rather than a hard-coded or globally shared dataset —
 * and never mutates it or reaches outside the process for data.
 *
 * This is intentionally the simplest possible backing store: no
 * persistence, no networking, no singleton, no static state. It exists so
 * the rest of the training domain can depend on `ExerciseRepository` today
 * and swap in a REST-, database-, local-storage-, or cloud-sync-backed
 * implementation later without any caller-visible change.
 */
export class InMemoryExerciseRepository implements ExerciseRepository {
  private readonly exercisesById: ReadonlyMap<ExerciseId, ExerciseDefinition>;
  private readonly exercises: readonly ExerciseDefinition[];

  constructor(exercises: readonly ExerciseDefinition[]) {
    this.exercises = exercises;
    this.exercisesById = new Map(exercises.map((exercise) => [exercise.id, exercise]));
  }

  async getById(id: ExerciseId): Promise<ExerciseDefinition | undefined> {
    return this.exercisesById.get(id);
  }

  async getAll(): Promise<readonly ExerciseDefinition[]> {
    return this.exercises;
  }
}
