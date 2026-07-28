import type { WorkoutRepository } from "../../../core/persistence/repositories/WorkoutRepository";
import type { PersistenceRecord } from "../../../core/persistence/contracts/PersistenceRecord";
import type { SQLiteWorkoutRepository } from "../../sqlite/repositories/SQLiteWorkoutRepository";

/**
 * Persistence Contract adapter — delegates only to SQLiteWorkoutRepository.
 */
export class WorkoutRepositoryAdapter implements WorkoutRepository {
  readonly repositoryId = "workout" as const;

  constructor(private readonly repository: SQLiteWorkoutRepository) {}

  findById(id: string): PersistenceRecord | null {
    return this.repository.findById(id);
  }

  save(record: PersistenceRecord): void {
    this.repository.save(record);
  }

  delete(id: string): void {
    this.repository.delete(id);
  }

  list(): readonly PersistenceRecord[] {
    return this.repository.list();
  }

  exists(id: string): boolean {
    return this.repository.exists(id);
  }
}
