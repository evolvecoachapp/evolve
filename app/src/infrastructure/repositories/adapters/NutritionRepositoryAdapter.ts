import type { NutritionRepository } from "../../../core/persistence/repositories/NutritionRepository";
import type { PersistenceRecord } from "../../../core/persistence/contracts/PersistenceRecord";
import type { SQLiteNutritionRepository } from "../../sqlite/repositories/SQLiteNutritionRepository";

/**
 * Persistence Contract adapter — delegates only to SQLiteNutritionRepository.
 */
export class NutritionRepositoryAdapter implements NutritionRepository {
  readonly repositoryId = "nutrition" as const;

  constructor(private readonly repository: SQLiteNutritionRepository) {}

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
