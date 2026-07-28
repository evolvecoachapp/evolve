import type { IdentityRepository } from "../../../core/persistence/repositories/IdentityRepository";
import type { PersistenceRecord } from "../../../core/persistence/contracts/PersistenceRecord";
import type { SQLiteIdentityRepository } from "../../sqlite/repositories/SQLiteIdentityRepository";

/**
 * Persistence Contract adapter — delegates only to SQLiteIdentityRepository.
 */
export class IdentityRepositoryAdapter implements IdentityRepository {
  readonly repositoryId = "identity" as const;

  constructor(private readonly repository: SQLiteIdentityRepository) {}

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
