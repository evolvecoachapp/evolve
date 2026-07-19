import type { EquipmentType } from "../../enums/EquipmentType";
import type { ExerciseCategory } from "../../enums/ExerciseCategory";
import type { MovementPattern } from "../../enums/MovementPattern";
import type { MuscleGroup } from "../../enums/MuscleGroup";
import type { ExerciseDefinition } from "../../models/ExerciseDefinition";
import type { ExerciseId } from "../../types/ids";
import type { ExerciseRepository } from "../contracts/ExerciseRepository";

/**
 * Reusable, storage-agnostic API for querying the exercise catalogue.
 *
 * `ExerciseCatalog` is the only thing the rest of the training domain
 * (selectors, constraints, planners) needs to know about to read exercise
 * data — it depends on the `ExerciseRepository` contract rather than any
 * concrete backing store (Dependency Inversion), so swapping
 * `InMemoryExerciseRepository` for a REST-, database-, local-storage-, or
 * cloud-sync-backed repository later requires no change here or in any
 * caller.
 *
 * This class deliberately provides *access* only: plain attribute lookups
 * (by id, muscle, equipment, category, movement pattern) with no scoring,
 * eligibility, or selection logic. Those business rules belong to the
 * Programming Engine (`ExerciseSelector`, `Constraint`), which consumes the
 * catalogue rather than the other way around.
 */
export class ExerciseCatalog {
  private readonly repository: ExerciseRepository;

  constructor(repository: ExerciseRepository) {
    this.repository = repository;
  }

  /** Resolves the exercise with `id`, or `undefined` if the catalogue has none. */
  getById(id: ExerciseId): Promise<ExerciseDefinition | undefined> {
    return this.repository.getById(id);
  }

  /** Resolves every exercise currently available in the catalogue. */
  getAll(): Promise<readonly ExerciseDefinition[]> {
    return this.repository.getAll();
  }

  /** Resolves every exercise that targets `muscle`, as a primary or secondary mover. */
  async findByMuscle(muscle: MuscleGroup): Promise<readonly ExerciseDefinition[]> {
    const exercises = await this.repository.getAll();
    return exercises.filter(
      (exercise) => exercise.primaryMuscles.includes(muscle) || exercise.secondaryMuscles.includes(muscle),
    );
  }

  /** Resolves every exercise that requires `equipment`. */
  async findByEquipment(equipment: EquipmentType): Promise<readonly ExerciseDefinition[]> {
    const exercises = await this.repository.getAll();
    return exercises.filter((exercise) => exercise.equipment.includes(equipment));
  }

  /** Resolves every exercise classified under `category`. */
  async findByCategory(category: ExerciseCategory): Promise<readonly ExerciseDefinition[]> {
    const exercises = await this.repository.getAll();
    return exercises.filter((exercise) => exercise.category === category);
  }

  /** Resolves every exercise that expresses `pattern`. */
  async findByMovementPattern(pattern: MovementPattern): Promise<readonly ExerciseDefinition[]> {
    const exercises = await this.repository.getAll();
    return exercises.filter((exercise) => exercise.movementPattern === pattern);
  }
}
