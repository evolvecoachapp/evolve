import type { AthleteRepository } from "../../../core/persistence/repositories/AthleteRepository";
import type { PersistenceRecord } from "../../../core/persistence/contracts/PersistenceRecord";
import type { SQLiteAthleteRepository } from "../../sqlite/repositories/SQLiteAthleteRepository";

/**
 * Persistence Contract adapter — delegates only to SQLiteAthleteRepository.
 */
export class AthleteRepositoryAdapter implements AthleteRepository {
  readonly repositoryId = "athlete" as const;

  constructor(private readonly repository: SQLiteAthleteRepository) {}

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
